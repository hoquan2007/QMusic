export type ProviderId = "audius" | "jamendo";

/** Ảnh đã chuẩn hóa, giữ mirrors để retry như khuyến nghị của Audius. */
export interface RemoteImage {
  url: string;
  mirrors: string[];
}

export interface MusicLicenseInfo {
  name: string;
  url?: string;
  attribution?: string;
}

export interface MusicArtist {
  id: string;
  remoteId: string;
  provider: ProviderId;
  name: string;
  handle?: string;
  bio?: string;
  avatar?: RemoteImage;
  cover?: RemoteImage;
  followers?: number;
  verified?: boolean;
  sourceUrl?: string;
}

export interface MusicAlbum {
  id: string;
  remoteId: string;
  provider: ProviderId;
  title: string;
  artist?: MusicArtist;
  artwork?: RemoteImage;
  trackCount?: number;
  releaseDate?: string;
  sourceUrl?: string;
}

export interface MusicTrack {
  id: string;
  remoteId: string;
  provider: ProviderId;
  title: string;
  artist: MusicArtist;
  album?: MusicAlbum;
  artwork?: RemoteImage;
  duration: number;
  genre?: string;
  mood?: string;
  description?: string;
  playCount?: number;
  favoriteCount?: number;
  releaseDate?: string;
  streamable: boolean;
  streamUrl?: string;
  sourceUrl?: string;
  license?: MusicLicenseInfo;
}

export interface MusicPlaylist {
  id: string;
  remoteId: string;
  provider: ProviderId;
  title: string;
  description?: string;
  artwork?: RemoteImage;
  owner?: MusicArtist;
  trackCount?: number;
  playCount?: number;
  isAlbum: boolean;
  releaseDate?: string;
  sourceUrl?: string;
}

export interface MusicGenre {
  name: string;
  count: number;
}

export interface PlaybackSource {
  url: string;
  mimeType?: string;
  provider: ProviderId;
}

export interface SearchResult {
  tracks: MusicTrack[];
  artists: MusicArtist[];
  playlists: MusicPlaylist[];
  albums: MusicPlaylist[];
}

export interface PageOptions {
  limit?: number;
  offset?: number;
}

export interface TrendingOptions extends PageOptions {
  genre?: string;
  time?: "week" | "month" | "year" | "allTime";
}

export interface MusicProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly enabled: boolean;
  getTrendingTracks(options?: TrendingOptions): Promise<MusicTrack[]>;
  getLatestTracks(options?: PageOptions & { genre?: string }): Promise<MusicTrack[]>;
  searchTracks(query: string, options?: PageOptions): Promise<MusicTrack[]>;
  searchArtists(query: string, options?: PageOptions): Promise<MusicArtist[]>;
  searchPlaylists(query: string, options?: PageOptions): Promise<MusicPlaylist[]>;
  getTrack(id: string): Promise<MusicTrack | null>;
  getArtist(id: string): Promise<MusicArtist | null>;
  getArtistTracks(id: string, options?: PageOptions): Promise<MusicTrack[]>;
  getPlaylist(id: string): Promise<MusicPlaylist | null>;
  getPlaylistTracks(id: string): Promise<MusicTrack[]>;
  getAlbum?(id: string): Promise<MusicPlaylist | null>;
  getAlbumTracks?(id: string): Promise<MusicTrack[]>;
  getPlaylists(options?: PageOptions & { time?: string }): Promise<MusicPlaylist[]>;
  getAlbums(options?: PageOptions): Promise<MusicPlaylist[]>;
  getGenres(): Promise<MusicGenre[]>;
  getPlaybackSource(track: MusicTrack): Promise<PlaybackSource>;
}

export interface HomeData {
  trending: MusicTrack[];
  latest: MusicTrack[];
  playlists: MusicPlaylist[];
  albums: MusicPlaylist[];
  genres: MusicGenre[];
  providers: { id: ProviderId; name: string; enabled: boolean }[];
}

export interface LyricsLine {
  time: number;
  text: string;
}

export interface LyricsResult {
  found: boolean;
  synced: boolean;
  instrumental: boolean;
  lines: LyricsLine[];
  plain?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  source: "LRCLIB";
}
