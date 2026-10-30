import { describe, expect, it } from "vitest";
import {
  ITUNES_PREVIEW_SECONDS,
  itunesProvider,
  normalizeItunesAlbum,
  normalizeItunesArtist,
  normalizeItunesTrack,
  upgradeItunesArtwork,
} from "@/lib/providers/itunes";

type RawItem = Parameters<typeof normalizeItunesTrack>[0];

const previewUrl =
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b0/13/7c/preview.m4a";
const artworkUrl =
  "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/99/2a/fa/cover.jpg/100x100bb.jpg";
const storeUrl =
  "https://music.apple.com/vn/album/nh%C6%B0-m%E1%BB%99t-ng%C6%B0%E1%BB%9Di-r%C6%B0ng/6827404200?i=6827404203";

const song: RawItem = {
  wrapperType: "track",
  kind: "song",
  trackId: 6827404203,
  artistId: 1300017488,
  collectionId: 6827404200,
  artistName: "OSAD & Hà An Huy",
  collectionName: "Như Một Người Rưng - Single",
  trackName: "Như Một Người Rưng",
  previewUrl,
  artworkUrl100: artworkUrl,
  collectionViewUrl: storeUrl,
  trackViewUrl: storeUrl,
  artistViewUrl: "https://music.apple.com/vn/artist/osad/1300017488",
  releaseDate: "2026-10-28T07:00:00Z",
  trackTimeMillis: 279208,
  trackCount: 1,
  trackNumber: 1,
  discNumber: 1,
  primaryGenreName: "Pop",
  country: "VNM",
  currency: "VND",
  isStreamable: true,
};

describe("iTunes normalization", () => {
  it("maps a Vietnamese song to a track with legal preview metadata", () => {
    const track = normalizeItunesTrack(song);

    expect(track.id).toBe("itunes:6827404203");
    expect(track.remoteId).toBe("6827404203");
    expect(track.provider).toBe("itunes");
    expect(track.title).toBe("Như Một Người Rưng");
    expect(track.artist.name).toBe("OSAD & Hà An Huy");
    expect(track.album?.remoteId).toBe("6827404200");
    expect(track.album?.title).toBe("Như Một Người Rưng - Single");
    expect(track.duration).toBe(279);
    expect(track.streamable).toBe(true);
    expect(track.streamUrl).toBe(previewUrl);
    expect(track.isPreview).toBe(true);
    expect(track.previewSeconds).toBe(ITUNES_PREVIEW_SECONDS);
    expect(track.storeUrl).toBe(storeUrl);
    expect(track.license?.name).toBe("Nghe thử 30 giây");
    expect(track.license?.attribution).toContain("iTunes");
    expect(track.artwork?.url).toContain("/600x600bb.jpg");
  });

  it("does not fake playback when Apple returns no preview", () => {
    const track = normalizeItunesTrack({ ...song, previewUrl: undefined });

    expect(track.streamable).toBe(false);
    expect(track.isPreview).toBe(false);
    expect(track.previewSeconds).toBeUndefined();
    expect(track.streamUrl).toBeUndefined();
    // Liên kết cửa hàng vẫn phải còn để người dùng mở bản đầy đủ.
    expect(track.storeUrl).toBe(storeUrl);
  });

  it("normalizes albums and artists for the Vietnam storefront", () => {
    const album = normalizeItunesAlbum({
      ...song,
      wrapperType: "collection",
      collectionType: "Album",
      trackName: undefined,
    });
    expect(album.provider).toBe("itunes");
    expect(album.id).toBe("itunes:6827404200");
    expect(album.isAlbum).toBe(true);
    expect(album.title).toBe("Như Một Người Rưng - Single");
    expect(album.trackCount).toBe(1);
    expect(album.owner?.name).toBe("OSAD & Hà An Huy");

    const artist = normalizeItunesArtist(song);
    expect(artist.provider).toBe("itunes");
    expect(artist.id).toBe("itunes:1300017488");
    expect(artist.avatar?.url).toContain("/600x600bb.jpg");
  });

  it("upgrades only Apple artwork sizes it understands", () => {
    expect(upgradeItunesArtwork(artworkUrl)).toContain("/600x600bb.jpg");
    expect(
      upgradeItunesArtwork("https://is1-ssl.mzstatic.com/image/thumb/cover.png/60x60bb.png"),
    ).toContain("/600x600bb.png");
    expect(upgradeItunesArtwork("https://example.com/cover.jpg")).toBe(
      "https://example.com/cover.jpg",
    );
  });

  it("returns a legal preview playback source and refuses unavailable tracks", async () => {
    const track = normalizeItunesTrack(song);
    await expect(itunesProvider.getPlaybackSource(track)).resolves.toEqual({
      url: previewUrl,
      mimeType: "audio/mp4",
      provider: "itunes",
    });

    await expect(
      itunesProvider.getPlaybackSource({ ...track, streamable: false, streamUrl: undefined }),
    ).rejects.toThrow(/không thể phát/i);
  });
});
