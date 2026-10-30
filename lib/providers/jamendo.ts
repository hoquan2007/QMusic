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
  TrendingOptions,
} from "@/types/music";

const API_BASE = "https://api.jamendo.com/v3.0";
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID?.trim() ?? "";

const imageSchema = z.string().nullish();

const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(),
  artist_id: z.string().nullish(),
  artist_name: z.string().nullish(),
  artist_idstr: z.string().nullish(),
  album_id: z.string().nullish(),
  album_name: z.string().nullish(),
  album_image: imageSchema,
  image: imageSchema,
  audio: z.string(),
  audiodownload: z.string().nullish(),
  audiodownload_allowed: z.boolean().nullish(),
  license_ccurl: z.string().nullish(),
  license_name: z.string().nullish(),
  releasedate: z.string().nullish(),
  shareurl: z.string().nullish(),
  musicinfo: z
    .object({
      tags: z
        .object({
          genres: z.array(z.string()).nullish(),
          instruments: z.array(z.string()).nullish(),
          vartags: z.array(z.string()).nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

const artistSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: imageSchema,
  website: z.string().nullish(),
  shareurl: z.string().nullish(),
  joindate: z.string().nullish(),
  shorturl: z.string().nullish(),
});

const playlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  image: imageSchema,
  user_id: z.string().nullish(),
  user_name: z.string().nullish(),
  trackcount: z.number().nullish(),
  track_count: z.number().nullish(),
  creationdate: z.string().nullish(),
  shareurl: z.string().nullish(),
});

const albumSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: imageSchema,
  artist_id: z.string().nullish(),
  artist_name: z.string().nullish(),
  releasedate: z.string().nullish(),
  shareurl: z.string().nullish(),
});

const listResponse = <S extends z.ZodTypeAny>(schema: S) =>
  z.object({
    headers: z.object({
      status: z.string(),
      code: z.number(),
      error_message: z.string().nullish(),
      results_count: z.number().nullish(),
    }),
    results: z.array(schema),
  });

type JamendoTrack = z.infer<typeof trackSchema>;
type JamendoArtist = z.infer<typeof artistSchema>;
type JamendoPlaylist = z.infer<typeof playlistSchema>;
type JamendoAlbum = z.infer<typeof albumSchema>;

function trackArtwork(track: JamendoTrack) {
  const url = track.image || track.album_image;
  return url ? { url, mirrors: [] } : undefined;
}

export function normalizeJamendoTrack(track: JamendoTrack): MusicTrack {
  const artist: MusicArtist = {
    id: `jamendo:${track.artist_id ?? track.artist_idstr ?? track.artist_name ?? "unknown"}`,
    remoteId: track.artist_id ?? track.artist_idstr ?? "",
    provider: "jamendo",
    name: track.artist_name ?? "Nghệ sĩ Jamendo",
    handle: track.artist_idstr ?? undefined,
    sourceUrl: track.artist_id ? `https://www.jamendo.com/artist/${track.artist_id}` : undefined,
  };

  const license = track.license_ccurl
    ? {
        name: track.license_name || "Creative Commons",
        url: track.license_ccurl,
        attribution: `Âm nhạc: ${track.artist_name ?? "nghệ sĩ"} — nguồn: Jamendo`,
      }
    : {
        name: "Jamendo",
        url: "https://www.jamendo.com",
        attribution: `Âm nhạc: ${track.artist_name ?? "nghệ sĩ"} — nguồn: Jamendo`,
      };

  return {
    id: `jamendo:${track.id}`,
    remoteId: track.id,
    provider: "jamendo",
    title: track.name,
    artist,
    album: track.album_name
      ? {
          id: `jamendo:${track.album_id ?? "single"}`,
          remoteId: track.album_id ?? "",
          provider: "jamendo",
          title: track.album_name,
          artist,
          artwork: track.album_image ? { url: track.album_image, mirrors: [] } : undefined,
        }
      : undefined,
    artwork: trackArtwork(track),
    duration: track.duration,
    genre: track.musicinfo?.tags?.genres?.[0],
    releaseDate: track.releasedate ?? undefined,
    streamable: Boolean(track.audio),
    streamUrl: track.audio || undefined,
    sourceUrl: track.shareurl || `https://www.jamendo.com/track/${track.id}`,
    license,
  };
}

function normalizeJamendoArtist(artist: JamendoArtist): MusicArtist {
  return {
    id: `jamendo:${artist.id}`,
    remoteId: artist.id,
    provider: "jamendo",
    name: artist.name,
    avatar: artist.image ? { url: artist.image, mirrors: [] } : undefined,
    sourceUrl: artist.shareurl || `https://www.jamendo.com/artist/${artist.id}`,
  };
}

function normalizeJamendoPlaylist(playlist: JamendoPlaylist): MusicPlaylist {
  return {
    id: `jamendo:${playlist.id}`,
    remoteId: playlist.id,
    provider: "jamendo",
    title: playlist.name,
    description: playlist.description ?? undefined,
    artwork: playlist.image ? { url: playlist.image, mirrors: [] } : undefined,
    owner: playlist.user_name
      ? {
          id: `jamendo:user-${playlist.user_id ?? "unknown"}`,
          remoteId: playlist.user_id ?? "",
          provider: "jamendo",
          name: playlist.user_name,
        }
      : undefined,
    trackCount: playlist.trackcount ?? playlist.track_count ?? undefined,
    isAlbum: false,
    sourceUrl: playlist.shareurl ?? undefined,
  };
}

function normalizeJamendoAlbum(album: JamendoAlbum): MusicPlaylist {
  const artist: MusicArtist | undefined = album.artist_name
    ? {
        id: `jamendo:${album.artist_id ?? "unknown"}`,
        remoteId: album.artist_id ?? "",
        provider: "jamendo",
        name: album.artist_name,
        sourceUrl: album.artist_id ? `https://www.jamendo.com/artist/${album.artist_id}` : undefined,
      }
    : undefined;
  return {
    id: `jamendo:${album.id}`,
    remoteId: album.id,
    provider: "jamendo",
    title: album.name,
    artwork: album.image ? { url: album.image, mirrors: [] } : undefined,
    owner: artist,
    isAlbum: true,
    releaseDate: album.releasedate ?? undefined,
    sourceUrl: album.shareurl ?? undefined,
  };
}

async function jamendoGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  schema: z.ZodType<T>,
  revalidate = 180,
): Promise<T> {
  if (!CLIENT_ID) {
    throw new ApiError("Jamendo chưa được cấu hình. Thêm JAMENDO_CLIENT_ID vào .env.local.", 503, "PROVIDER_DISABLED");
  }
  const url = buildUrl(`${API_BASE}${path}`, {
    client_id: CLIENT_ID,
    format: "json",
    audioformat: "mp32",
    imagesize: 500,
    include: "licenses,musicinfo",
    ...params,
  });
  return fetchJson<T>(url, { schema, revalidate });
}

export class JamendoProvider implements MusicProvider {
  readonly id = "jamendo" as const;
  readonly name = "Jamendo";
  readonly enabled = Boolean(CLIENT_ID);

  async getTrendingTracks(options: TrendingOptions = {}): Promise<MusicTrack[]> {
    const data = await jamendoGet(
      "/tracks/",
      {
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        order: "popularity_month",
        type: "single albumtrack",
        tags: options.genre,
      },
      listResponse(trackSchema),
    );
    return data.results.map(normalizeJamendoTrack);
  }

  async getLatestTracks(options: PageOptions & { genre?: string } = {}): Promise<MusicTrack[]> {
    const data = await jamendoGet(
      "/tracks/",
      {
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        order: "releasedate_desc",
        type: "single albumtrack",
        tags: options.genre,
      },
      listResponse(trackSchema),
    );
    return data.results.map(normalizeJamendoTrack);
  }

  async searchTracks(query: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const data = await jamendoGet(
      "/tracks/",
      {
        search: query,
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        type: "single albumtrack",
      },
      listResponse(trackSchema),
      60,
    );
    return data.results.map(normalizeJamendoTrack);
  }

  async searchArtists(query: string, options: PageOptions = {}): Promise<MusicArtist[]> {
    const data = await jamendoGet(
      "/artists/",
      { search: query, limit: options.limit ?? 20, offset: options.offset ?? 0 },
      listResponse(artistSchema),
      60,
    );
    return data.results.map(normalizeJamendoArtist);
  }

  async searchPlaylists(query: string, options: PageOptions = {}): Promise<MusicPlaylist[]> {
    const data = await jamendoGet(
      "/playlists/",
      { search: query, limit: options.limit ?? 20, offset: options.offset ?? 0 },
      listResponse(playlistSchema),
      60,
    );
    return data.results.map(normalizeJamendoPlaylist);
  }

  async getTrack(id: string): Promise<MusicTrack | null> {
    const data = await jamendoGet("/tracks/", { id, limit: 1 }, listResponse(trackSchema));
    const track = data.results[0];
    return track ? normalizeJamendoTrack(track) : null;
  }

  async getArtist(id: string): Promise<MusicArtist | null> {
    const data = await jamendoGet("/artists/", { id, limit: 1 }, listResponse(artistSchema));
    const artist = data.results[0];
    return artist ? normalizeJamendoArtist(artist) : null;
  }

  async getArtistTracks(id: string, options: PageOptions = {}): Promise<MusicTrack[]> {
    const data = await jamendoGet(
      "/artists/tracks/",
      { id, limit: options.limit ?? 20, offset: options.offset ?? 0, order: "popularity_total" },
      listResponse(trackSchema),
    );
    return data.results.map(normalizeJamendoTrack);
  }

  async getPlaylist(id: string): Promise<MusicPlaylist | null> {
    const data = await jamendoGet("/playlists/", { id, limit: 1 }, listResponse(playlistSchema));
    const playlist = data.results[0];
    return playlist ? normalizeJamendoPlaylist(playlist) : null;
  }

  async getPlaylistTracks(id: string): Promise<MusicTrack[]> {
    const data = await jamendoGet(
      "/playlists/tracks/",
      { id, limit: 200 },
      listResponse(trackSchema),
    );
    return data.results.map(normalizeJamendoTrack);
  }

  async getPlaylists(options: PageOptions & { time?: string } = {}): Promise<MusicPlaylist[]> {
    const data = await jamendoGet(
      "/playlists/",
      { limit: options.limit ?? 12, offset: options.offset ?? 0, order: "popularity_month" },
      listResponse(playlistSchema),
    );
    return data.results.map(normalizeJamendoPlaylist);
  }

  async getAlbums(options: PageOptions = {}): Promise<MusicPlaylist[]> {
    const data = await jamendoGet(
      "/albums/",
      { limit: options.limit ?? 12, offset: options.offset ?? 0, order: "popularity_month" },
      listResponse(albumSchema),
    );
    return data.results.map(normalizeJamendoAlbum);
  }

  async getGenres(): Promise<MusicGenre[]> {
    const names = [
      "electronic",
      "rock",
      "pop",
      "jazz",
      "hiphop",
      "classical",
      "lounge",
      "world",
      "soundtrack",
      "metal",
      "folk",
      "ambient",
    ];
    return names.map((name) => ({ name, count: 0 }));
  }

  async getAlbumTracks(id: string): Promise<MusicTrack[]> {
    const data = await jamendoGet("/albums/tracks/", { id, limit: 200 }, listResponse(trackSchema));
    return data.results.map(normalizeJamendoTrack);
  }

  async getAlbum(id: string): Promise<MusicPlaylist | null> {
    const data = await jamendoGet("/albums/", { id, limit: 1 }, listResponse(albumSchema));
    const album = data.results[0];
    return album ? normalizeJamendoAlbum(album) : null;
  }

  async getPlaybackSource(track: MusicTrack): Promise<PlaybackSource> {
    if (!track.streamUrl) {
      throw new ApiError("Bài hát này hiện không thể phát.", 409, "TRACK_UNAVAILABLE");
    }
    return { url: track.streamUrl, mimeType: "audio/mpeg", provider: "jamendo" };
  }
}

export const jamendoProvider = new JamendoProvider();
