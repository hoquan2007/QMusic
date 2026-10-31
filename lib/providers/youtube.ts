import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { buildUrl, fetchJson } from "@/lib/api/server";
import {
  extractYouTubeVideoId,
  parseYouTubeDuration,
  youTubeThumbnailUrl,
  youTubeWatchUrl,
} from "@/lib/youtube";
import type {
  MusicArtist,
  MusicGenre,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
  PageOptions,
  PlaybackSource,
  TrendingOptions,
} from "@/types/music";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const OEMBED_URL = "https://www.youtube.com/oembed";
const API_KEY = process.env.YOUTUBE_API_KEY?.trim() ?? "";
const MUSIC_CATEGORY_ID = "10";
const MAX_RESULTS = 50;

const thumbnailSchema = z
  .object({
    default: z.object({ url: z.string() }).nullish(),
    medium: z.object({ url: z.string() }).nullish(),
    high: z.object({ url: z.string() }).nullish(),
    standard: z.object({ url: z.string() }).nullish(),
    maxres: z.object({ url: z.string() }).nullish(),
  })
  .nullish();

const snippetSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  channelId: z.string().nullish(),
  channelTitle: z.string().nullish(),
  publishedAt: z.string().nullish(),
  thumbnails: thumbnailSchema,
  tags: z.array(z.string()).nullish(),
  categoryId: z.string().nullish(),
});

const videoSchema = z.object({
  id: z.string(),
  snippet: snippetSchema,
  contentDetails: z
    .object({
      duration: z.string().nullish(),
    })
    .nullish(),
  statistics: z
    .object({
      viewCount: z.string().nullish(),
      likeCount: z.string().nullish(),
    })
    .nullish(),
  status: z
    .object({
      embeddable: z.boolean().nullish(),
      privacyStatus: z.string().nullish(),
    })
    .nullish(),
});

const videoListSchema = z.object({
  items: z.array(videoSchema),
});

const searchListSchema = z.object({
  items: z.array(
    z.object({
      id: z.object({ videoId: z.string().nullish() }).nullish(),
    }),
  ),
});

const oembedSchema = z.object({
  title: z.string(),
  author_name: z.string(),
  author_url: z.string().nullish(),
  thumbnail_url: z.string().nullish(),
});

export type YouTubeVideo = z.infer<typeof videoSchema>;
type YouTubeVideoList = z.infer<typeof videoListSchema>;

const cache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>;

  const value = loader().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });

  if (cache.size > 120) {
    const now = Date.now();
    for (const [cacheKey, entry] of cache) {
      if (entry.expiresAt <= now) cache.delete(cacheKey);
    }
    if (cache.size > 120) cache.clear();
  }

  return value;
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function artwork(video: YouTubeVideo) {
  const url =
    video.snippet.thumbnails?.maxres?.url ??
    video.snippet.thumbnails?.high?.url ??
    video.snippet.thumbnails?.medium?.url ??
    video.snippet.thumbnails?.default?.url ??
    youTubeThumbnailUrl(video.id);
  return { url, mirrors: [] };
}

function artist(video: YouTubeVideo): MusicArtist {
  const channelId = video.snippet.channelId?.trim() || "youtube";
  return {
    id: `youtube:${channelId}`,
    remoteId: channelId,
    provider: "youtube",
    name: decodeHtml(video.snippet.channelTitle?.trim() || "YouTube"),
    sourceUrl: video.snippet.channelId
      ? `https://www.youtube.com/channel/${video.snippet.channelId}`
      : undefined,
  };
}

/** Chuẩn hóa video YouTube thành track video, không bao giờ tạo stream audio. */
export function normalizeYouTubeVideo(video: YouTubeVideo): MusicTrack {
  const videoId = video.id;
  const watchUrl = youTubeWatchUrl(videoId);
  const title = decodeHtml(video.snippet.title.trim()) || "Video YouTube";

  return {
    id: `youtube:${videoId}`,
    remoteId: videoId,
    provider: "youtube",
    title,
    artist: artist(video),
    artwork: artwork(video),
    duration: parseYouTubeDuration(video.contentDetails?.duration),
    genre: video.snippet.categoryId === MUSIC_CATEGORY_ID ? "Âm nhạc" : undefined,
    description: video.snippet.description?.trim() || undefined,
    playCount: video.statistics?.viewCount ? Number(video.statistics.viewCount) : undefined,
    releaseDate: video.snippet.publishedAt ?? undefined,
    streamable: false,
    sourceUrl: watchUrl,
    playbackMode: "video",
    videoId,
    license: {
      name: "YouTube",
      url: watchUrl,
      attribution:
        "Video được phát bằng trình phát nhúng chính thức của YouTube. Quảng cáo được giữ nguyên.",
    },
  };
}

function isUsableVideo(video: YouTubeVideo): boolean {
  if (!extractYouTubeVideoId(video.id)) return false;
  if (video.status?.privacyStatus && video.status.privacyStatus !== "public") return false;
  return video.status?.embeddable !== false;
}

function parseVideoList(data: YouTubeVideoList): YouTubeVideo[] {
  return data.items.filter(isUsableVideo);
}

async function videosByIds(ids: string[]): Promise<YouTubeVideo[]> {
  const unique = [...new Set(ids.filter((id) => extractYouTubeVideoId(id)))].slice(0, MAX_RESULTS);
  if (unique.length === 0) return [];

  const key = `videos:${unique.join(",")}`;
  return cached(key, 300_000, async () => {
    const data = await fetchJson<YouTubeVideoList>(
      buildUrl(`${API_BASE}/videos`, {
        part: "snippet,contentDetails,statistics,status",
        id: unique.join(","),
        maxResults: unique.length,
        key: API_KEY,
      }),
      { schema: videoListSchema, revalidate: 600, timeoutMs: 10_000 },
    );
    return parseVideoList(data);
  });
}

async function searchVideoIds(query: string, limit: number, offset: number): Promise<string[]> {
  if (offset >= MAX_RESULTS) return [];
  const maxResults = Math.min(MAX_RESULTS, Math.max(limit, offset + limit));

  const data = await cached(`search:${query}:${maxResults}`, 300_000, () =>
    fetchJson(
      buildUrl(`${API_BASE}/search`, {
        part: "snippet",
        type: "video",
        videoCategoryId: MUSIC_CATEGORY_ID,
        q: query,
        maxResults,
        regionCode: "VN",
        safeSearch: "moderate",
        videoEmbeddable: "true",
        key: API_KEY,
      }),
      { schema: searchListSchema, revalidate: 600, timeoutMs: 10_000 },
    ),
  );

  return data.items
    .map((item) => item.id?.videoId?.trim())
    .filter((id): id is string => Boolean(id && extractYouTubeVideoId(id)))
    .slice(offset, offset + limit);
}

async function searchVideos(query: string, limit: number, offset: number): Promise<MusicTrack[]> {
  const ids = await searchVideoIds(query, limit, offset);
  if (ids.length === 0) return [];
  const videos = await videosByIds(ids);
  const byId = new Map(videos.map((video) => [video.id, video]));
  return ids.map((id) => byId.get(id)).filter((video): video is YouTubeVideo => Boolean(video)).map(normalizeYouTubeVideo);
}

async function trendingVideos(limit: number, offset: number): Promise<MusicTrack[]> {
  if (offset >= MAX_RESULTS) return [];
  const maxResults = Math.min(MAX_RESULTS, Math.max(limit, offset + limit));
  const data = await cached(`trending:${maxResults}`, 600_000, () =>
    fetchJson<YouTubeVideoList>(
      buildUrl(`${API_BASE}/videos`, {
        part: "snippet,contentDetails,statistics,status",
        chart: "mostPopular",
        regionCode: "VN",
        videoCategoryId: MUSIC_CATEGORY_ID,
        maxResults,
        key: API_KEY,
      }),
      { schema: videoListSchema, revalidate: 900, timeoutMs: 10_000 },
    ),
  );
  return data.items
    .filter(isUsableVideo)
    .slice(offset, offset + limit)
    .map(normalizeYouTubeVideo);
}

async function keylessVideo(videoId: string): Promise<MusicTrack | null> {
  try {
    const data = await fetchJson(
      buildUrl(OEMBED_URL, { url: youTubeWatchUrl(videoId), format: "json" }),
      { schema: oembedSchema, revalidate: 3600, timeoutMs: 10_000, retries: 1 },
    );

    const thumbnail = data.thumbnail_url?.trim() || youTubeThumbnailUrl(videoId);
    const artistUrl = data.author_url?.trim();
    return {
      id: `youtube:${videoId}`,
      remoteId: videoId,
      provider: "youtube",
      title: decodeHtml(data.title.trim()) || "Video YouTube",
      artist: {
        id: `youtube:${artistUrl ?? data.author_name}`,
        remoteId: artistUrl ?? data.author_name,
        provider: "youtube",
        name: decodeHtml(data.author_name.trim()) || "YouTube",
        avatar: { url: thumbnail, mirrors: [] },
        sourceUrl: artistUrl,
      },
      artwork: { url: thumbnail, mirrors: [] },
      duration: 0,
      streamable: false,
      sourceUrl: youTubeWatchUrl(videoId),
      playbackMode: "video",
      videoId,
      license: {
        name: "YouTube",
        url: youTubeWatchUrl(videoId),
        attribution:
          "Video được phát bằng trình phát nhúng chính thức của YouTube. Quảng cáo được giữ nguyên.",
      },
    };
  } catch {
    return null;
  }
}

/**
 * Video liên quan dùng tìm kiếm theo tên kênh. Chỉ chạy khi có API key;
 * nếu không có key, trang video vẫn hoạt động với trình phát nhúng trực tiếp.
 * Cache riêng 1 giờ vì mỗi lần tìm kiếm tốn 100 đơn vị quota.
 */
export async function getRelatedYouTubeVideos(track: MusicTrack, limit = 8): Promise<MusicTrack[]> {
  if (!API_KEY || !track.artist.name) return [];
  const key = `related:${track.artist.name}:${limit}`;
  return cached(key, 3_600_000, async () => {
    const results = await searchVideos(track.artist.name, limit + 4, 0);
    return results.filter((item) => item.videoId !== track.videoId).slice(0, limit);
  });
}

export class YouTubeProvider implements MusicProvider {
  readonly id = "youtube" as const;
  readonly name = "YouTube";
  readonly enabled = Boolean(API_KEY);

  async getTrendingTracks(options: TrendingOptions = {}): Promise<MusicTrack[]> {
    if (!this.enabled) return [];
    return trendingVideos(options.limit ?? 24, options.offset ?? 0);
  }

  async getLatestTracks(): Promise<MusicTrack[]> {
    // Bảng xếp hạng nhạc mới của YouTube không có endpoint chính thức miễn phí.
    return [];
  }

  async searchTracks(query: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    // Mỗi lần search.list tốn 100 đơn vị quota; bỏ qua truy vấn quá ngắn.
    if (!this.enabled || query.trim().length < 2) return [];
    return searchVideos(query.trim(), options.limit ?? 24, options.offset ?? 0);
  }

  async searchArtists(): Promise<MusicArtist[]> {
    return [];
  }

  async searchPlaylists(): Promise<MusicPlaylist[]> {
    return [];
  }

  async getTrack(id: string): Promise<MusicTrack | null> {
    const videoId = extractYouTubeVideoId(id);
    if (!videoId) return null;

    if (!this.enabled) return keylessVideo(videoId);

    const videos = await videosByIds([videoId]);
    const video = videos[0];
    return video ? normalizeYouTubeVideo(video) : null;
  }

  async getArtist(): Promise<MusicArtist | null> {
    return null;
  }

  async getArtistTracks(): Promise<MusicTrack[]> {
    return [];
  }

  async getPlaylist(): Promise<MusicPlaylist | null> {
    return null;
  }

  async getPlaylistTracks(): Promise<MusicTrack[]> {
    return [];
  }

  async getPlaylists(): Promise<MusicPlaylist[]> {
    return [];
  }

  async getAlbums(): Promise<MusicPlaylist[]> {
    return [];
  }

  async getGenres(): Promise<MusicGenre[]> {
    return [];
  }

  async getPlaybackSource(): Promise<PlaybackSource> {
    throw new ApiError(
      "Video YouTube chỉ phát trong trình phát nhúng chính thức, không tách âm thanh.",
      405,
      "VIDEO_ONLY",
    );
  }
}

export const youtubeProvider = new YouTubeProvider();
