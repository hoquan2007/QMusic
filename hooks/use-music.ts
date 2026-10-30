"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type {
  HomeData,
  LyricsResult,
  MusicArtist,
  MusicPlaylist,
  MusicTrack,
  SearchResult,
} from "@/types/music";

export interface SearchResponse extends SearchResult {
  warnings: string[];
}

const params = (values: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const queryKeys = {
  home: ["music", "home"] as const,
  trending: (options: Record<string, string | number | undefined>) => ["music", "trending", options] as const,
  latest: (genre?: string) => ["music", "latest", genre ?? "all"] as const,
  search: (query: string, type: string, offset: number) => ["music", "search", query, type, offset] as const,
  track: (provider: string, id: string) => ["music", "track", provider, id] as const,
  artist: (provider: string, id: string) => ["music", "artist", provider, id] as const,
  artistTracks: (provider: string, id: string) => ["music", "artist-tracks", provider, id] as const,
  playlist: (provider: string, id: string) => ["music", "playlist", provider, id] as const,
  playlistTracks: (provider: string, id: string) => ["music", "playlist-tracks", provider, id] as const,
  album: (provider: string, id: string) => ["music", "album", provider, id] as const,
  albumTracks: (provider: string, id: string) => ["music", "album-tracks", provider, id] as const,
  lyrics: (key: string) => ["lyrics", key] as const,
};

export function useHomeQuery() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: ({ signal }) => apiGet<HomeData>("/api/music/home", signal),
  });
}

export function useTrendingQuery(options: {
  genre?: string;
  time?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const query = {
    genre: options.genre,
    time: options.time,
    limit: options.limit ?? 24,
    offset: options.offset ?? 0,
  };
  return useQuery({
    queryKey: queryKeys.trending(query),
    queryFn: ({ signal }) =>
      apiGet<{ tracks: MusicTrack[]; warnings: string[] }>(`/api/music/trending${params(query)}`, signal),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useLatestQuery(genre?: string) {
  return useQuery({
    queryKey: queryKeys.latest(genre),
    queryFn: ({ signal }) =>
      apiGet<{ tracks: MusicTrack[] }>(`/api/music/latest${params({ genre, limit: 18 })}`, signal),
  });
}

export function useLatestInfiniteQuery(genre?: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.latest(genre), "infinite"],
    initialPageParam: 0,
    queryFn: ({ signal, pageParam }) =>
      apiGet<{ tracks: MusicTrack[] }>(
        `/api/music/latest${params({ genre, limit: 18, offset: pageParam })}`,
        signal,
      ),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.tracks.length >= 18 ? lastPageParam + 18 : undefined,
  });
}

export function useGenresQuery() {
  return useQuery({
    queryKey: ["music", "genres"] as const,
    queryFn: ({ signal }) =>
      apiGet<{ genres: { name: string; count: number }[]; providers: { id: string; name: string; enabled: boolean }[] }>(
        "/api/music/genres",
        signal,
      ),
    staleTime: 60 * 60_000,
  });
}

export function useSearchQuery(query: string, type: "all" | "tracks" | "artists" | "playlists", offset = 0) {
  return useQuery({
    queryKey: queryKeys.search(query, type, offset),
    queryFn: ({ signal }) =>
      apiGet<SearchResponse>(`/api/music/search${params({ q: query, type, offset, limit: 24 })}`, signal),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useSearchInfiniteQuery(
  query: string,
  type: "all" | "tracks" | "artists" | "playlists",
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.search(query, type, 0), "infinite"],
    initialPageParam: 0,
    queryFn: ({ signal, pageParam }) =>
      apiGet<SearchResponse>(
        `/api/music/search${params({ q: query, type, offset: pageParam, limit: 24 })}`,
        signal,
      ),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const count =
        lastPage.tracks.length +
        lastPage.artists.length +
        lastPage.playlists.length +
        lastPage.albums.length;
      return count >= 24 ? lastPageParam + 24 : undefined;
    },
    enabled: query.trim().length > 0,
  });
}

export function useTrackQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.track(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ track: MusicTrack }>(
        `/api/music/track/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function useArtistQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.artist(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ artist: MusicArtist }>(
        `/api/music/artist/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function useArtistTracksQuery(provider: string, id: string, limit = 30) {
  return useQuery({
    queryKey: queryKeys.artistTracks(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ tracks: MusicTrack[] }>(
        `/api/music/artist/${encodeURIComponent(provider)}/${encodeURIComponent(id)}/tracks${params({ limit })}`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function usePlaylistQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.playlist(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ playlist: MusicPlaylist }>(
        `/api/music/playlist/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function usePlaylistTracksQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.playlistTracks(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ tracks: MusicTrack[] }>(
        `/api/music/playlist/${encodeURIComponent(provider)}/${encodeURIComponent(id)}/tracks`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function useAlbumQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.album(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ album: MusicPlaylist }>(
        `/api/music/album/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function useAlbumTracksQuery(provider: string, id: string) {
  return useQuery({
    queryKey: queryKeys.albumTracks(provider, id),
    queryFn: ({ signal }) =>
      apiGet<{ tracks: MusicTrack[] }>(
        `/api/music/album/${encodeURIComponent(provider)}/${encodeURIComponent(id)}/tracks`,
        signal,
      ),
    enabled: Boolean(provider && id),
  });
}

export function useLyricsQuery(track: MusicTrack | null | undefined, enabled: boolean) {
  const key = track ? `${track.id}:${track.duration}` : "none";
  return useQuery({
    queryKey: queryKeys.lyrics(key),
    queryFn: ({ signal }) =>
      apiGet<LyricsResult>(
        `/api/lyrics${params({
          track: track?.title,
          artist: track?.artist.name,
          album: track?.album?.title,
          duration: track?.duration ? Math.round(track.duration) : undefined,
        })}`,
        signal,
      ),
    enabled: Boolean(enabled && track),
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
