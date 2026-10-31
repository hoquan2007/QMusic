import { ApiError } from "@/lib/api/errors";
import { audiusProvider } from "@/lib/providers/audius";
import { itunesProvider } from "@/lib/providers/itunes";
import { jamendoProvider } from "@/lib/providers/jamendo";
import { youtubeProvider } from "@/lib/providers/youtube";
import type {
  HomeData,
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
  PageOptions,
  ProviderId,
  SearchResult,
} from "@/types/music";

export const providers: MusicProvider[] = [
  audiusProvider,
  jamendoProvider,
  itunesProvider,
  youtubeProvider,
];

export function isProviderId(value: string): value is ProviderId {
  return value === "audius" || value === "jamendo" || value === "itunes" || value === "youtube";
}

export function getProvider(id: string): MusicProvider {
  if (!isProviderId(id)) {
    throw new ApiError("Nguồn nhạc không được hỗ trợ.", 404, "PROVIDER_NOT_FOUND");
  }
  const provider = providers.find((item) => item.id === id);
  if (!provider) throw new ApiError("Không tìm thấy nguồn nhạc.", 404, "PROVIDER_NOT_FOUND");
  if (!provider.enabled) {
    throw new ApiError(`${provider.name} chưa được cấu hình trên máy chủ.`, 503, "PROVIDER_DISABLED");
  }
  return provider;
}

/**
 * Các provider phát audio. YouTube là chế độ video riêng nên không tham gia
 * trending, latest, genres, tìm kiếm hợp nhất hoặc hàng đợi âm thanh.
 */
export function audioProviders(): MusicProvider[] {
  return providers.filter((provider) => provider.enabled && provider.id !== "youtube");
}

/**
 * Đọc trực tiếp một nội dung. YouTube được phép đọc khi chưa cấu hình API key
 * để trang xem video vẫn hoạt động qua oEmbed và trình phát nhúng chính thức.
 */
export function getProviderForRead(id: string): MusicProvider {
  if (!isProviderId(id)) {
    throw new ApiError("Nguồn nhạc không được hỗ trợ.", 404, "PROVIDER_NOT_FOUND");
  }
  const provider = providers.find((item) => item.id === id);
  if (!provider) throw new ApiError("Không tìm thấy nguồn nhạc.", 404, "PROVIDER_NOT_FOUND");
  if (!provider.enabled && provider.id !== "youtube") {
    throw new ApiError(`${provider.name} chưa được cấu hình trên máy chủ.`, 503, "PROVIDER_DISABLED");
  }
  return provider;
}

export function providerSummary() {
  return providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    enabled: provider.enabled,
  }));
}

function dedupeBy<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function searchEverything(
  query: string,
  options: PageOptions = {},
): Promise<{ result: SearchResult; warnings: string[] }> {
  const empty: SearchResult = { tracks: [], artists: [], playlists: [], albums: [] };
  if (!query.trim()) return { result: empty, warnings: [] };

  const active = audioProviders();
  const tasks = active.flatMap((provider) => [
    provider.searchTracks(query, options),
    provider.searchArtists(query, options),
    provider.searchPlaylists(query, options),
  ]);

  const settled = await Promise.allSettled(tasks);
  const warnings: string[] = [];
  const tracks: MusicTrack[] = [];
  const artists: MusicArtist[] = [];
  const allPlaylists: MusicPlaylist[] = [];

  settled.forEach((outcome, index) => {
    const provider = active[Math.floor(index / 3)];
    if (outcome.status === "rejected") {
      warnings.push(`${provider?.name ?? "Nguồn nhạc"}: ${outcome.reason instanceof Error ? outcome.reason.message : "không phản hồi"}`);
      return;
    }
    const kind = index % 3;
    if (kind === 0) tracks.push(...(outcome.value as MusicTrack[]));
    if (kind === 1) artists.push(...(outcome.value as MusicArtist[]));
    if (kind === 2) allPlaylists.push(...(outcome.value as MusicPlaylist[]));
  });

  if (tracks.length === 0 && artists.length === 0 && allPlaylists.length === 0 && warnings.length > 0) {
    throw new ApiError(warnings[0] ?? "Không thể tìm kiếm lúc này.", 502, "SEARCH_FAILED");
  }

  return {
    result: {
      tracks: dedupeBy(tracks),
      artists: dedupeBy(artists),
      albums: dedupeBy(allPlaylists.filter((playlist) => playlist.isAlbum)),
      playlists: dedupeBy(allPlaylists.filter((playlist) => !playlist.isAlbum)),
    },
    warnings,
  };
}

export async function getHomeData(): Promise<HomeData> {
  const active = audioProviders();
  const primary = active[0] ?? audiusProvider;

  const [trending, latest, playlists, albums, genres] = await Promise.allSettled([
    Promise.all(active.map((provider) => provider.getTrendingTracks({ limit: 18, time: "week" }))),
    Promise.all(active.map((provider) => provider.getLatestTracks({ limit: 12 }))),
    Promise.all(active.map((provider) => provider.getPlaylists({ limit: 10 }))),
    Promise.all(active.map((provider) => provider.getAlbums({ limit: 10 }))),
    primary.getGenres(),
  ]);

  const flatten = <T extends { id: string }>(outcome: PromiseSettledResult<T[][]>): T[] => {
    if (outcome.status !== "fulfilled") return [];
    return dedupeBy(outcome.value.flat());
  };

  const trendingTracks = flatten(trending);
  const latestTracks = flatten(latest);
  const featuredPlaylists = flatten(playlists);
  const featuredAlbums = flatten(albums);

  if (trendingTracks.length === 0) {
    throw new ApiError("Không thể tải nhạc thịnh hành từ nguồn âm nhạc.", 502, "HOME_UNAVAILABLE");
  }

  return {
    trending: trendingTracks,
    latest: latestTracks,
    playlists: featuredPlaylists,
    albums: featuredAlbums,
    genres: genres.status === "fulfilled" ? genres.value : [],
    vietnamese: trendingTracks.filter((track) => track.provider === "itunes").slice(0, 12),
    vietnameseAlbums: featuredAlbums.filter((album) => album.provider === "itunes").slice(0, 8),
    providers: providerSummary(),
  };
}
