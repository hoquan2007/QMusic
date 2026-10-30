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

const API_BASE = "https://api.audius.co/v1";
const APP_NAME = process.env.AUDIUS_APP_NAME || "QMusic";
const API_KEY = process.env.AUDIUS_API_KEY || "";

const artworkSchema = z.object({
  "150x150": z.string().nullish(),
  "480x480": z.string().nullish(),
  "1000x1000": z.string().nullish(),
  mirrors: z.array(z.string()).nullish(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().nullish(),
  bio: z.string().nullish(),
  profile_picture: artworkSchema.nullish(),
  cover_photo: artworkSchema.nullish(),
  follower_count: z.number().nullish(),
  is_verified: z.boolean().nullish(),
});

const trackSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  user: userSchema,
  artwork: artworkSchema.nullish(),
  genre: z.string().nullish(),
  mood: z.string().nullish(),
  description: z.string().nullish(),
  play_count: z.number().nullish(),
  favorite_count: z.number().nullish(),
  release_date: z.string().nullish(),
  permalink: z.string().nullish(),
  is_streamable: z.boolean().nullish(),
  is_stream_gated: z.boolean().nullish(),
  is_delete: z.boolean().nullish(),
  is_available: z.boolean().nullish(),
});

const playlistSchema = z.object({
  id: z.string(),
  playlist_name: z.string(),
  description: z.string().nullish(),
  artwork: artworkSchema.nullish(),
  is_album: z.boolean().nullish(),
  track_count: z.number().nullish(),
  total_play_count: z.number().nullish(),
  user: userSchema,
  permalink: z.string().nullish(),
  is_private: z.boolean().nullish(),
  is_delete: z.boolean().nullish(),
  release_date: z.string().nullish(),
});

const tracksResponse = z.object({ data: z.array(trackSchema) });
const usersResponse = z.object({ data: z.array(userSchema) });
const playlistsResponse = z.object({ data: z.array(playlistSchema) });
const genresResponse = z.object({
  data: z.array(z.object({ name: z.string(), count: z.number() })),
});

type AudiusUser = z.infer<typeof userSchema>;
type AudiusTrack = z.infer<typeof trackSchema>;
type AudiusPlaylist = z.infer<typeof playlistSchema>;

function image(raw: z.infer<typeof artworkSchema> | null | undefined): RemoteImage | undefined {
  if (!raw) return undefined;
  const url = raw["1000x1000"] || raw["480x480"] || raw["150x150"];
  if (!url) return undefined;
  return { url, mirrors: raw.mirrors ?? [] };
}

function profileImage(raw: z.infer<typeof artworkSchema> | null | undefined): RemoteImage | undefined {
  if (!raw) return undefined;
  const url = raw["480x480"] || raw["1000x1000"] || raw["150x150"];
  if (!url) return undefined;
  return { url, mirrors: raw.mirrors ?? [] };
}

export function normalizeAudiusArtist(user: AudiusUser): MusicArtist {
  return {
    id: `audius:${user.id}`,
    remoteId: user.id,
    provider: "audius",
    name: user.name,
    handle: user.handle ?? undefined,
    bio: user.bio ?? undefined,
    avatar: profileImage(user.profile_picture),
    cover: image(user.cover_photo),
    followers: user.follower_count ?? undefined,
    verified: user.is_verified ?? false,
    sourceUrl: user.handle ? `https://audius.co/${user.handle}` : undefined,
  };
}

export function normalizeAudiusTrack(track: AudiusTrack): MusicTrack {
  const streamable =
    track.is_streamable !== false &&
    track.is_stream_gated !== true &&
    track.is_delete !== true &&
    track.is_available !== false;

  return {
    id: `audius:${track.id}`,
    remoteId: track.id,
    provider: "audius",
    title: track.title,
    artist: normalizeAudiusArtist(track.user),
    artwork: image(track.artwork),
    duration: track.duration,
    genre: track.genre ?? undefined,
    mood: track.mood ?? undefined,
    description: track.description ?? undefined,
    playCount: track.play_count ?? undefined,
    favoriteCount: track.favorite_count ?? undefined,
    releaseDate: track.release_date ?? undefined,
    streamable,
    streamUrl: streamable ? audiusStreamUrl(track.id) : undefined,
    sourceUrl: track.permalink ? `https://audius.co${track.permalink}` : `https://audius.co/tracks/${track.id}`,
  };
}

export function normalizeAudiusPlaylist(playlist: AudiusPlaylist): MusicPlaylist {
  return {
    id: `audius:${playlist.id}`,
    remoteId: playlist.id,
    provider: "audius",
    title: playlist.playlist_name,
    description: playlist.description ?? undefined,
    artwork: image(playlist.artwork),
    owner: normalizeAudiusArtist(playlist.user),
    trackCount: playlist.track_count ?? undefined,
    playCount: playlist.total_play_count ?? undefined,
    isAlbum: playlist.is_album === true,
    sourceUrl: playlist.permalink ? `https://audius.co${playlist.permalink}` : undefined,
  };
}

export function audiusStreamUrl(trackId: string): string {
  return buildUrl(`${API_BASE}/tracks/${encodeURIComponent(trackId)}/stream`, {
    app_name: APP_NAME,
  });
}

async function audiusGet<T>(path: string, params: Record<string, string | number | undefined>, schema: z.ZodType<T>, revalidate = 120) {
  const url = buildUrl(`${API_BASE}${path}`, { app_name: APP_NAME, ...params });
  return fetchJson<T>(url, {
    schema,
    revalidate,
    headers: API_KEY ? { "x-api-key": API_KEY } : undefined,
  });
}

function onlyPlayable(track: MusicTrack) {
  return track.streamable;
}

export class AudiusProvider implements MusicProvider {
  readonly id = "audius" as const;
  readonly name = "Audius";
  readonly enabled = true;

  async getTrendingTracks(options: TrendingOptions = {}): Promise<MusicTrack[]> {
    const data = await audiusGet(
      "/tracks/trending",
      {
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        genre: options.genre,
        time: options.time ?? "week",
      },
      tracksResponse,
    );
    return data.data.map(normalizeAudiusTrack).filter(onlyPlayable);
  }

  async getLatestTracks(options: PageOptions & { genre?: string } = {}): Promise<MusicTrack[]> {
    const data = await audiusGet(
      "/tracks/latest",
      { limit: options.limit ?? 20, offset: options.offset ?? 0, genre: options.genre },
      tracksResponse,
    );
    return data.data.map(normalizeAudiusTrack).filter(onlyPlayable);
  }

  async searchTracks(query: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const data = await audiusGet(
      "/tracks/search",
      { query, limit: options.limit ?? 20, offset: options.offset ?? 0 },
      tracksResponse,
      30,
    );
    return data.data.map(normalizeAudiusTrack).filter(onlyPlayable);
  }

  async searchArtists(query: string, options: PageOptions = {}): Promise<MusicArtist[]> {
    const data = await audiusGet(
      "/users/search",
      { query, limit: options.limit ?? 20, offset: options.offset ?? 0 },
      usersResponse,
      30,
    );
    return data.data.map(normalizeAudiusArtist);
  }

  async searchPlaylists(query: string, options: PageOptions = {}): Promise<MusicPlaylist[]> {
    const data = await audiusGet(
      "/playlists/search",
      { query, limit: options.limit ?? 20, offset: options.offset ?? 0 },
      playlistsResponse,
      30,
    );
    return data.data
      .filter((item) => item.is_private !== true && item.is_delete !== true)
      .map(normalizeAudiusPlaylist);
  }

  async getTrack(id: string): Promise<MusicTrack | null> {
    const data = await audiusGet(`/tracks/${encodeURIComponent(id)}`, {}, z.object({ data: trackSchema }));
    return normalizeAudiusTrack(data.data);
  }

  async getArtist(id: string): Promise<MusicArtist | null> {
    const data = await audiusGet(`/users/${encodeURIComponent(id)}`, {}, z.object({ data: userSchema }));
    return normalizeAudiusArtist(data.data);
  }

  async getArtistTracks(id: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const data = await audiusGet(
      `/users/${encodeURIComponent(id)}/tracks`,
      {
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        sort_method: "plays",
        sort_direction: "desc",
      },
      tracksResponse,
    );
    return data.data.map(normalizeAudiusTrack).filter(onlyPlayable);
  }

  async getPlaylist(id: string): Promise<MusicPlaylist | null> {
    const data = await audiusGet(
      `/playlists/${encodeURIComponent(id)}`,
      {},
      z.object({ data: z.array(playlistSchema).min(1) }),
    );
    const playlist = data.data[0];
    return playlist ? normalizeAudiusPlaylist(playlist) : null;
  }

  async getPlaylistTracks(id: string): Promise<MusicTrack[]> {
    const data = await audiusGet(
      `/playlists/${encodeURIComponent(id)}/tracks`,
      {},
      tracksResponse,
    );
    return data.data.map(normalizeAudiusTrack).filter(onlyPlayable);
  }

  async getAlbumTracks(id: string): Promise<MusicTrack[]> {
    return this.getPlaylistTracks(id);
  }

  async getAlbum(id: string): Promise<MusicPlaylist | null> {
    return this.getPlaylist(id);
  }

  async getPlaylists(options: PageOptions & { time?: string } = {}): Promise<MusicPlaylist[]> {
    const data = await audiusGet(
      "/playlists/trending",
      {
        limit: options.limit ?? 12,
        offset: options.offset ?? 0,
        time: options.time ?? "week",
        type: "playlist",
      },
      playlistsResponse,
    );
    return data.data.map(normalizeAudiusPlaylist);
  }

  async getAlbums(options: PageOptions = {}): Promise<MusicPlaylist[]> {
    const data = await audiusGet(
      "/playlists/trending",
      { limit: options.limit ?? 12, offset: options.offset ?? 0, time: "month", type: "album" },
      playlistsResponse,
    );
    return data.data.map(normalizeAudiusPlaylist);
  }

  async getGenres(): Promise<MusicGenre[]> {
    const data = await audiusGet("/genres/popular", { limit: 18 }, genresResponse, 3600);
    return data.data;
  }

  async getPlaybackSource(track: MusicTrack): Promise<PlaybackSource> {
    if (!track.streamable) {
      throw new ApiError("Bài hát này hiện không thể phát.", 409, "TRACK_UNAVAILABLE");
    }
    return {
      url: audiusStreamUrl(track.remoteId),
      mimeType: "audio/mpeg",
      provider: "audius",
    };
  }
}

export const audiusProvider = new AudiusProvider();
