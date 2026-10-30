import { z } from "zod";
import { USER_AGENT } from "@/lib/api/server";
import { parseLrc } from "@/lib/lyrics/lrc";
import type { LyricsResult } from "@/types/music";

const LRCLIB_BASE = "https://lrclib.net";
const APP_ID = process.env.LRCLIB_APP_ID?.trim() ?? "";

const recordSchema = z.object({
  id: z.number(),
  trackName: z.string(),
  artistName: z.string(),
  albumName: z.string().nullish(),
  duration: z.number(),
  instrumental: z.boolean().nullish(),
  plainLyrics: z.string().nullish(),
  syncedLyrics: z.string().nullish(),
});

type LyricsRecord = z.infer<typeof recordSchema>;

export interface LyricsQuery {
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
}

function headers() {
  const result: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": USER_AGENT,
    "X-User-Agent": USER_AGENT,
  };
  if (APP_ID) result["Lrclib-App-Id"] = APP_ID;
  return result;
}

async function request(path: string, params: Record<string, string | number | undefined>): Promise<Response> {
  const url = new URL(`${LRCLIB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: headers(),
      signal: AbortSignal.timeout(9000),
      cache: "no-store",
    });
    if (response.status !== 429 && response.status !== 503) return response;
    if (attempt === 2) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 3000)));
  }
  throw new Error("LRCLIB không phản hồi.");
}

function toResult(record: LyricsRecord): LyricsResult {
  const lines = record.syncedLyrics ? parseLrc(record.syncedLyrics) : [];
  return {
    found: Boolean(record.plainLyrics || lines.length > 0),
    synced: lines.length > 0,
    instrumental: record.instrumental === true,
    lines,
    plain: record.plainLyrics ?? undefined,
    trackName: record.trackName,
    artistName: record.artistName,
    albumName: record.albumName ?? undefined,
    source: "LRCLIB",
  };
}

const empty: LyricsResult = {
  found: false,
  synced: false,
  instrumental: false,
  lines: [],
  source: "LRCLIB",
};

/**
 * Tra cứu LRCLIB: ưu tiên /api/get với album + duration, sau đó fallback search
 * và chọn bản ghi có thời lượng gần nhất. Không bao giờ ném lỗi làm hỏng player.
 */
export async function getLyrics(query: LyricsQuery): Promise<LyricsResult> {
  const trackName = query.trackName.trim();
  const artistName = query.artistName.trim();
  if (!trackName) return empty;

  try {
    if (query.duration && query.duration > 0) {
      const exactResponse = await request("/api/get", {
        track_name: trackName,
        artist_name: artistName,
        album_name: query.albumName,
        duration: Math.round(query.duration),
      });
      if (exactResponse.ok) {
        const parsed = recordSchema.safeParse(await exactResponse.json());
        if (parsed.success) return toResult(parsed.data);
      }
    }

    const searchResponse = await request("/api/search", {
      track_name: trackName,
      artist_name: artistName,
    });
    if (!searchResponse.ok) return empty;

    const parsed = z.array(recordSchema).safeParse(await searchResponse.json());
    if (!parsed.success || parsed.data.length === 0) return empty;

    const candidates = parsed.data.filter((record) => {
      const titleMatch = record.trackName.toLowerCase().trim() === trackName.toLowerCase();
      const artistMatch =
        !artistName || record.artistName.toLowerCase().includes(artistName.toLowerCase());
      return titleMatch || artistMatch;
    });
    const pool = candidates.length > 0 ? candidates : parsed.data;
    const selected = query.duration
      ? [...pool].sort(
          (a, b) => Math.abs(a.duration - query.duration!) - Math.abs(b.duration - query.duration!),
        )[0]
      : (pool.find((record) => record.syncedLyrics) ?? pool[0]);

    if (!selected) return empty;
    if (query.duration && Math.abs(selected.duration - query.duration) > 8) {
      return empty;
    }
    return toResult(selected);
  } catch {
    return empty;
  }
}
