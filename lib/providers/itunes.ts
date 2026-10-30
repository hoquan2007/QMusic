import { z } from "zod";
import { buildUrl, fetchJson } from "@/lib/api/server";
import { ApiError } from "@/lib/api/errors";
import type {
  MusicArtist,
  MusicGenre,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
  PageOptions,
  PlaybackSource,
  RemoteImage,
  TrendingOptions,
} from "@/types/music";

const SEARCH_BASE = "https://itunes.apple.com";
const RSS_BASE = "https://rss.marketingtools.apple.com/api/v2";
const COUNTRY = "vn";
const MAX_LIMIT = 200;
const CHART_LIMIT = 100;
const LOOKUP_CHUNK = 50;

export const ITUNES_PREVIEW_SECONDS = 30;

const itemSchema = z.object({
  wrapperType: z.string().nullish(),
  kind: z.string().nullish(),
  collectionType: z.string().nullish(),
  trackId: z.number().nullish(),
  artistId: z.number().nullish(),
  collectionId: z.number().nullish(),
  artistName: z.string().nullish(),
  collectionName: z.string().nullish(),
  trackName: z.string().nullish(),
  previewUrl: z.string().nullish(),
  artworkUrl100: z.string().nullish(),
  collectionViewUrl: z.string().nullish(),
  trackViewUrl: z.string().nullish(),
  artistViewUrl: z.string().nullish(),
  releaseDate: z.string().nullish(),
  trackTimeMillis: z.number().nullish(),
  trackCount: z.number().nullish(),
  trackNumber: z.number().nullish(),
  discNumber: z.number().nullish(),
  primaryGenreName: z.string().nullish(),
  country: z.string().nullish(),
  currency: z.string().nullish(),
  isStreamable: z.boolean().nullish(),
});

export type ItunesItem = z.infer<typeof itemSchema>;

const searchResponseSchema = z.object({
  resultCount: z.number().optional(),
  results: z.array(itemSchema),
});

const rssItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  artistName: z.string(),
  artistId: z.string().nullish(),
  artworkUrl100: z.string().nullish(),
  url: z.string().nullish(),
  releaseDate: z.string().nullish(),
  genres: z.array(z.object({ name: z.string() })).nullish(),
});

const rssResponseSchema = z.object({
  feed: z.object({
    results: z.array(rssItemSchema),
  }),
});

type ItunesSearchResponse = z.infer<typeof searchResponseSchema>;
type RssItem = z.infer<typeof rssItemSchema>;

const cache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>;

  const value = loader().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });

  if (cache.size > 150) {
    const now = Date.now();
    for (const [cacheKey, entry] of cache) {
      if (entry.expiresAt <= now) cache.delete(cacheKey);
    }
    if (cache.size > 150) cache.clear();
  }

  return value;
}

export function upgradeItunesArtwork(url: string): string {
  return url.replace(/\/\d+x\d+bb\.(jpg|jpeg|png|webp)$/i, "/600x600bb.$1");
}

function image(url: string | null | undefined): RemoteImage | undefined {
  if (!url) return undefined;
  return { url: upgradeItunesArtwork(url), mirrors: [] };
}

function isSongItem(item: ItunesItem): boolean {
  return item.wrapperType === "track" && Boolean(item.trackId);
}

function isAlbumItem(item: ItunesItem): boolean {
  return item.wrapperType === "collection" && Boolean(item.collectionId);
}

export function normalizeItunesArtist(item: ItunesItem): MusicArtist {
  const remoteId = item.artistId ? String(item.artistId) : "";
  return {
    id: `itunes:${remoteId}`,
    remoteId,
    provider: "itunes",
    name: item.artistName?.trim() || "Nghệ sĩ iTunes",
    avatar: image(item.artworkUrl100),
    sourceUrl: item.artistViewUrl ?? undefined,
  };
}

export function normalizeItunesAlbum(item: ItunesItem): MusicPlaylist {
  const remoteId = item.collectionId ? String(item.collectionId) : "";
  return {
    id: `itunes:${remoteId}`,
    remoteId,
    provider: "itunes",
    title: item.collectionName?.trim() || "Album",
    artwork: image(item.artworkUrl100),
    owner: item.artistName ? normalizeItunesArtist(item) : undefined,
    trackCount: item.trackCount ?? undefined,
    isAlbum: true,
    releaseDate: item.releaseDate ?? undefined,
    sourceUrl: item.collectionViewUrl ?? item.trackViewUrl ?? undefined,
  };
}

export function normalizeItunesTrack(item: ItunesItem): MusicTrack {
  const remoteId = item.trackId ? String(item.trackId) : "";
  const previewUrl = item.previewUrl?.trim() || undefined;
  const storeUrl = item.trackViewUrl ?? item.collectionViewUrl ?? undefined;
  const album = item.collectionId && item.collectionName ? normalizeItunesAlbum(item) : undefined;

  return {
    id: `itunes:${remoteId}`,
    remoteId,
    provider: "itunes",
    title: item.trackName?.trim() || "Bài hát",
    artist: normalizeItunesArtist(item),
    album,
    artwork: image(item.artworkUrl100),
    duration: item.trackTimeMillis ? Math.max(1, Math.round(item.trackTimeMillis / 1000)) : 0,
    genre: item.primaryGenreName ?? undefined,
    releaseDate: item.releaseDate ?? undefined,
    streamable: Boolean(previewUrl),
    streamUrl: previewUrl,
    sourceUrl: storeUrl,
    storeUrl,
    isPreview: Boolean(previewUrl),
    previewSeconds: previewUrl ? ITUNES_PREVIEW_SECONDS : undefined,
    license: {
      name: "Nghe thử 30 giây",
      url: storeUrl,
      attribution:
        "Bản nghe thử 30 giây được cung cấp bởi iTunes. Mua bài hát trên Apple Music để nghe đầy đủ.",
    },
  };
}

function rssToAlbumItem(item: RssItem): ItunesItem {
  return {
    wrapperType: "collection",
    collectionType: "Album",
    collectionId: Number(item.id),
    artistId: item.artistId ? Number(item.artistId) : undefined,
    artistName: item.artistName,
    collectionName: item.name,
    artworkUrl100: item.artworkUrl100,
    collectionViewUrl: item.url,
    releaseDate: item.releaseDate,
    primaryGenreName: item.genres?.[0]?.name,
  };
}

function searchRaw(query: string, entity: "song" | "album", limit: number): Promise<ItunesSearchResponse> {
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
  const key = `search:${entity}:${safeLimit}:${query}`;
  return cached(key, 60_000, () =>
    fetchJson<ItunesSearchResponse>(
      buildUrl(`${SEARCH_BASE}/search`, {
        term: query,
        country: COUNTRY,
        media: "music",
        entity,
        limit: safeLimit,
      }),
      { schema: searchResponseSchema, revalidate: 120 },
    ),
  );
}

function lookupRaw(
  id: string,
  params: Record<string, string | number | undefined> = {},
): Promise<ItunesSearchResponse> {
  const key = `lookup:${id}:${JSON.stringify(params)}`;
  return cached(key, 300_000, () =>
    fetchJson<ItunesSearchResponse>(
      buildUrl(`${SEARCH_BASE}/lookup`, { id, country: COUNTRY, ...params }),
      { schema: searchResponseSchema, revalidate: 600 },
    ),
  );
}

function chartRaw(kind: "songs" | "albums", limit: number): Promise<RssItem[]> {
  const safeLimit = Math.min(CHART_LIMIT, Math.max(1, limit));
  const key = `chart:${kind}:${safeLimit}`;
  return cached(key, 300_000, () =>
    fetchJson<{ feed: { results: RssItem[] } }>(
      `${RSS_BASE}/${COUNTRY}/music/most-played/${safeLimit}/${kind}.json`,
      { schema: rssResponseSchema, revalidate: 600, timeoutMs: 10_000 },
    ).then((data) => data.feed.results),
  );
}

async function lookupTracksByIds(ids: string[]): Promise<ItunesItem[]> {
  const numericIds = ids.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  if (numericIds.length === 0) return [];

  const chunks: number[][] = [];
  for (let index = 0; index < numericIds.length; index += LOOKUP_CHUNK) {
    chunks.push(numericIds.slice(index, index + LOOKUP_CHUNK));
  }

  const settled = await Promise.allSettled(chunks.map((chunk) => lookupRaw(chunk.join(","))));
  if (settled.length > 0 && settled.every((outcome) => outcome.status === "rejected")) {
    const first = settled[0];
    const reason = first?.status === "rejected" ? first.reason : undefined;
    throw reason instanceof Error
      ? reason
      : new ApiError("Không thể tải dữ liệu iTunes.", 502, "ITUNES_UNAVAILABLE");
  }

  const byId = new Map<number, ItunesItem>();
  for (const outcome of settled) {
    if (outcome.status !== "fulfilled") continue;
    for (const item of outcome.value.results) {
      if (isSongItem(item) && item.trackId) byId.set(item.trackId, item);
    }
  }

  return numericIds.map((id) => byId.get(id)).filter((item): item is ItunesItem => Boolean(item));
}

async function chartTracks(limit: number, offset: number): Promise<MusicTrack[]> {
  if (offset >= CHART_LIMIT) return [];
  const fetchLimit = Math.min(CHART_LIMIT, offset + limit);
  const chart = await chartRaw("songs", fetchLimit);
  const selected = chart.slice(offset, offset + limit);
  const items = await lookupTracksByIds(selected.map((item) => item.id));
  return items.map(normalizeItunesTrack).filter((track) => track.streamable);
}

async function chartAlbums(limit: number, offset: number): Promise<MusicPlaylist[]> {
  if (offset >= CHART_LIMIT) return [];
  const fetchLimit = Math.min(CHART_LIMIT, offset + limit);
  const chart = await chartRaw("albums", fetchLimit);
  return chart.slice(offset, offset + limit).map(rssToAlbumItem).map(normalizeItunesAlbum);
}

async function searchSongs(query: string, limit: number, offset: number): Promise<ItunesItem[]> {
  if (offset >= MAX_LIMIT) return [];
  const fetchLimit = Math.min(MAX_LIMIT, offset + limit);
  const data = await searchRaw(query, "song", fetchLimit);
  return data.results.filter(isSongItem).slice(offset, offset + limit);
}

async function searchAlbums(query: string, limit: number, offset: number): Promise<ItunesItem[]> {
  if (offset >= MAX_LIMIT) return [];
  const fetchLimit = Math.min(MAX_LIMIT, offset + limit);
  const data = await searchRaw(query, "album", fetchLimit);
  return data.results.filter(isAlbumItem).slice(offset, offset + limit);
}

export class ItunesProvider implements MusicProvider {
  readonly id = "itunes" as const;
  readonly name = "iTunes Việt Nam";
  readonly enabled = process.env.ITUNES_VN_ENABLED !== "false";

  async getTrendingTracks(options: TrendingOptions = {}): Promise<MusicTrack[]> {
    const tracks = await chartTracks(options.limit ?? 20, options.offset ?? 0);
    const genre = options.genre?.trim().toLowerCase();
    if (!genre) return tracks;
    return tracks.filter((track) => track.genre?.toLowerCase().includes(genre));
  }

  async getLatestTracks(): Promise<MusicTrack[]> {
    // iTunes Search API không cung cấp bảng xếp hạng "mới phát hành" chính thức.
    return [];
  }

  async searchTracks(query: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const items = await searchSongs(query, options.limit ?? 20, options.offset ?? 0);
    return items.map(normalizeItunesTrack).filter((track) => track.streamable);
  }

  async searchArtists(query: string, options: PageOptions = {}): Promise<MusicArtist[]> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    if (offset >= MAX_LIMIT) return [];

    const data = await searchRaw(query, "song", Math.min(MAX_LIMIT, Math.max(100, offset + limit)));
    const seen = new Set<number>();
    const artists: MusicArtist[] = [];
    for (const item of data.results) {
      if (!isSongItem(item) || !item.artistId || seen.has(item.artistId)) continue;
      seen.add(item.artistId);
      artists.push(normalizeItunesArtist(item));
      if (artists.length >= offset + limit) break;
    }
    return artists.slice(offset, offset + limit);
  }

  async searchPlaylists(query: string, options: PageOptions = {}): Promise<MusicPlaylist[]> {
    const items = await searchAlbums(query, options.limit ?? 20, options.offset ?? 0);
    return items.map(normalizeItunesAlbum);
  }

  async getTrack(id: string): Promise<MusicTrack | null> {
    const data = await lookupRaw(id);
    const item = data.results.find(isSongItem);
    return item ? normalizeItunesTrack(item) : null;
  }

  async getArtist(id: string): Promise<MusicArtist | null> {
    const data = await lookupRaw(id, { entity: "song", limit: 1 });
    const artistItem = data.results.find((item) => item.wrapperType === "artist");
    const songItem = data.results.find(isSongItem);
    const source = artistItem ?? songItem;
    if (!source) return null;
    return normalizeItunesArtist({
      ...source,
      artworkUrl100: source.artworkUrl100 ?? songItem?.artworkUrl100,
      primaryGenreName: source.primaryGenreName ?? songItem?.primaryGenreName,
    });
  }

  async getArtistTracks(id: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    if (offset >= MAX_LIMIT) return [];

    const data = await lookupRaw(id, {
      entity: "song",
      limit: Math.min(MAX_LIMIT, offset + limit),
    });
    const tracks = data.results
      .filter(isSongItem)
      .map(normalizeItunesTrack)
      .filter((track) => track.streamable);

    tracks.sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
    return tracks.slice(offset, offset + limit);
  }

  async getPlaylist(id: string): Promise<MusicPlaylist | null> {
    return this.getAlbum(id);
  }

  async getPlaylistTracks(id: string): Promise<MusicTrack[]> {
    return this.getAlbumTracks(id);
  }

  async getAlbum(id: string): Promise<MusicPlaylist | null> {
    const data = await lookupRaw(id);
    const item =
      data.results.find(isAlbumItem) ??
      data.results.find((entry) => entry.wrapperType === "collection");
    return item ? normalizeItunesAlbum(item) : null;
  }

  async getAlbumTracks(id: string): Promise<MusicTrack[]> {
    const data = await lookupRaw(id, { entity: "song", limit: MAX_LIMIT });
    const collectionId = Number(id);
    const items = data.results
      .filter(isSongItem)
      .filter((item) => !item.collectionId || item.collectionId === collectionId);

    items.sort(
      (a, b) =>
        (a.discNumber ?? 1) - (b.discNumber ?? 1) ||
        (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
    );
    return items.map(normalizeItunesTrack).filter((track) => track.streamable);
  }

  async getPlaylists(): Promise<MusicPlaylist[]> {
    // Apple Music không có endpoint playlist công khai qua iTunes Search API.
    return [];
  }

  async getAlbums(options: PageOptions = {}): Promise<MusicPlaylist[]> {
    return chartAlbums(options.limit ?? 12, options.offset ?? 0);
  }

  async getGenres(): Promise<MusicGenre[]> {
    // Lấy thể loại thật từ bảng xếp hạng để bộ lọc không trả về rỗng.
    const tracks = await chartTracks(50, 0).catch((): MusicTrack[] => []);
    const counts = new Map<string, number>();
    for (const track of tracks) {
      if (!track.genre) continue;
      counts.set(track.genre, (counts.get(track.genre) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getPlaybackSource(track: MusicTrack): Promise<PlaybackSource> {
    if (!track.streamable || !track.streamUrl) {
      throw new ApiError("Bản nghe thử này hiện không thể phát.", 409, "TRACK_UNAVAILABLE");
    }
    return {
      url: track.streamUrl,
      mimeType: "audio/mp4",
      provider: "itunes",
    };
  }
}

export const itunesProvider = new ItunesProvider();
