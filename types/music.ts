export type ProviderId = "audius" | "jamendo" | "itunes" | "youtube";

/** Bài hát phát bằng audio, hoặc video phát bằng trình phát nhúng chính thức của YouTube. */
export type PlaybackMode = "audio" | "video";

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
  /** Mặc định là audio; video dùng iframe YouTube và không đi vào hàng đợi âm thanh. */
  playbackMode?: PlaybackMode;
  /** ID video YouTube 11 ký tự khi playbackMode là "video". */
  videoId?: string;
  license?: MusicLicenseInfo;
  /** Bản phát là đoạn nghe thử có giới hạn thời lượng (ví dụ iTunes 30 giây). */
  isPreview?: boolean;
  /** Độ dài đoạn nghe thử, tính bằng giây. */
  previewSeconds?: number;
  /** Liên kết tới cửa hàng để mua / nghe bản đầy đủ. */
  storeUrl?: string;
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
  /** Bảng xếp hạng nhạc Việt chính thức từ iTunes Việt Nam. */
  vietnamese: MusicTrack[];
  vietnameseAlbums: MusicPlaylist[];
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
