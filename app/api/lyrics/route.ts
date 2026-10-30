import { getLyrics } from "@/lib/providers/lyrics";
import { jsonError, jsonOk, textParam } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackName = textParam(searchParams, "track", 180);
    const artistName = textParam(searchParams, "artist", 180);
    const albumName = textParam(searchParams, "album", 180);
    const durationRaw = Number(searchParams.get("duration"));
    const duration = Number.isFinite(durationRaw) && durationRaw > 0 && durationRaw < 7200 ? durationRaw : undefined;

    if (!trackName) {
      return jsonOk(
        {
          found: false,
          synced: false,
          instrumental: false,
          lines: [],
          source: "LRCLIB",
        },
        0,
      );
    }

    const result = await getLyrics({
      trackName,
      artistName,
      albumName: albumName || undefined,
      duration,
    });
    return jsonOk(result, result.found ? 600 : 60);
  } catch (error) {
    return jsonError(error);
  }
}
