import { describe, expect, it } from "vitest";
import {
  audiusStreamUrl,
  normalizeAudiusArtist,
  normalizeAudiusPlaylist,
  normalizeAudiusTrack,
} from "@/lib/providers/audius";

type RawTrack = Parameters<typeof normalizeAudiusTrack>[0];
type RawUser = Parameters<typeof normalizeAudiusArtist>[0];
type RawPlaylist = Parameters<typeof normalizeAudiusPlaylist>[0];

const user: RawUser = {
  id: "user-1",
  name: "Nghệ sĩ thử",
  handle: "nghe-si-thu",
  bio: null,
  profile_picture: {
    "150x150": "https://cdn.example.com/150.jpg",
    "480x480": "https://cdn.example.com/480.jpg",
    "1000x1000": "https://cdn.example.com/1000.jpg",
    mirrors: ["https://mirror.example.com"],
  },
  cover_photo: null,
  follower_count: 1200,
  is_verified: true,
};

const track: RawTrack = {
  id: "W08NKdZ",
  title: "Bài hát thử",
  duration: 185,
  user,
  artwork: {
    "150x150": "https://cdn.example.com/150.jpg",
    "480x480": "https://cdn.example.com/480.jpg",
    "1000x1000": "https://cdn.example.com/1000.jpg",
    mirrors: [],
  },
  genre: "Electronic",
  mood: "Chill",
  description: "Mô tả",
  play_count: 42,
  favorite_count: 7,
  release_date: "2024-01-01T00:00:00Z",
  permalink: "/nghe-si-thu/bai-hat-thu",
  is_streamable: true,
  is_stream_gated: false,
  is_delete: false,
  is_available: true,
};

describe("normalizeAudiusArtist", () => {
  it("creates a normalized id, avatar and source URL", () => {
    const artist = normalizeAudiusArtist(user);
    expect(artist.id).toBe("audius:user-1");
    expect(artist.provider).toBe("audius");
    expect(artist.name).toBe("Nghệ sĩ thử");
    expect(artist.avatar?.url).toBe("https://cdn.example.com/480.jpg");
    expect(artist.followers).toBe(1200);
    expect(artist.verified).toBe(true);
    expect(artist.sourceUrl).toBe("https://audius.co/nghe-si-thu");
  });
});

describe("normalizeAudiusTrack", () => {
  it("maps API fields to the normalized track shape", () => {
    const normalized = normalizeAudiusTrack(track);
    expect(normalized.id).toBe("audius:W08NKdZ");
    expect(normalized.remoteId).toBe("W08NKdZ");
    expect(normalized.title).toBe("Bài hát thử");
    expect(normalized.duration).toBe(185);
    expect(normalized.genre).toBe("Electronic");
    expect(normalized.streamable).toBe(true);
    expect(normalized.streamUrl).toContain("/tracks/W08NKdZ/stream");
    expect(normalized.streamUrl).toContain("app_name=QMusic");
    expect(normalized.artist.id).toBe("audius:user-1");
    expect(normalized.sourceUrl).toBe("https://audius.co/nghe-si-thu/bai-hat-thu");
  });

  it("marks gated or deleted tracks as unplayable", () => {
    const gated = normalizeAudiusTrack({ ...track, is_stream_gated: true });
    expect(gated.streamable).toBe(false);
    expect(gated.streamUrl).toBeUndefined();

    const deleted = normalizeAudiusTrack({ ...track, is_delete: true });
    expect(deleted.streamable).toBe(false);
  });

  it("builds a stable public stream URL", () => {
    expect(audiusStreamUrl("abc")).toBe("https://api.audius.co/v1/tracks/abc/stream?app_name=QMusic");
  });
});

describe("normalizeAudiusPlaylist", () => {
  it("normalizes playlists and album flags", () => {
    const playlist: RawPlaylist = {
      id: "playlist-1",
      playlist_name: "Playlist thử",
      description: "Mô tả",
      artwork: null,
      is_album: true,
      track_count: 9,
      total_play_count: 1234,
      user,
      permalink: "/nghe-si-thu/album/playlist-thu",
      is_private: false,
      is_delete: false,
      release_date: null,
    };

    const normalized = normalizeAudiusPlaylist(playlist);
    expect(normalized.id).toBe("audius:playlist-1");
    expect(normalized.title).toBe("Playlist thử");
    expect(normalized.isAlbum).toBe(true);
    expect(normalized.trackCount).toBe(9);
    expect(normalized.playCount).toBe(1234);
    expect(normalized.owner?.name).toBe("Nghệ sĩ thử");
  });
});
