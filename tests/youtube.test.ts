import { describe, expect, it } from "vitest";
import {
  extractYouTubeVideoId,
  isVideoTrack,
  parseYouTubeDuration,
  youTubeEmbedUrl,
} from "@/lib/youtube";
import { normalizeYouTubeVideo } from "@/lib/providers/youtube";

const videoId = "dQw4w9WgXcQ";

const rawVideo = {
  id: videoId,
  snippet: {
    title: "Rick Astley - Never Gonna Give You Up (Official Video) &amp; More",
    description: "MV chính thức",
    channelId: "UCuAXFkgsw1L7xaCfnd5JJOw",
    channelTitle: "Rick Astley",
    publishedAt: "2009-10-25T06:57:33Z",
    thumbnails: {
      high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
    },
    tags: ["pop"],
    categoryId: "10",
  },
  contentDetails: { duration: "PT3M33S" },
  statistics: { viewCount: "1500000000", likeCount: "17000000" },
  status: { embeddable: true, privacyStatus: "public" },
};

describe("extractYouTubeVideoId", () => {
  it.each([
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}&list=PL123`,
    `https://youtu.be/${videoId}?t=42`,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube.com/live/${videoId}`,
    `https://music.youtube.com/watch?v=${videoId}`,
    `https://www.youtube-nocookie.com/embed/${videoId}`,
    `youtu.be/${videoId}`,
    videoId,
  ])("accepts %s", (input) => {
    expect(extractYouTubeVideoId(input)).toBe(videoId);
  });

  it.each([
    "https://vimeo.com/123456",
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch?v=invalid!id",
    "javascript:alert(1)",
    "",
  ])("rejects %s", (input) => {
    expect(extractYouTubeVideoId(input)).toBeNull();
  });
});

describe("parseYouTubeDuration", () => {
  it("parses ISO-8601 durations from the YouTube API", () => {
    expect(parseYouTubeDuration("PT3M33S")).toBe(213);
    expect(parseYouTubeDuration("PT1H2M3S")).toBe(3723);
    expect(parseYouTubeDuration("P1DT1M")).toBe(86_460);
  });

  it("returns zero for missing or invalid values", () => {
    expect(parseYouTubeDuration(undefined)).toBe(0);
    expect(parseYouTubeDuration("")).toBe(0);
    expect(parseYouTubeDuration("3:33")).toBe(0);
  });
});

describe("normalizeYouTubeVideo", () => {
  it("creates a video-only track without an audio stream", () => {
    const track = normalizeYouTubeVideo(rawVideo);

    expect(track.id).toBe(`youtube:${videoId}`);
    expect(track.videoId).toBe(videoId);
    expect(track.provider).toBe("youtube");
    expect(track.playbackMode).toBe("video");
    expect(track.title).toBe("Rick Astley - Never Gonna Give You Up (Official Video) & More");
    expect(track.artist.name).toBe("Rick Astley");
    expect(track.duration).toBe(213);
    expect(track.playCount).toBe(1_500_000_000);
    expect(track.artwork?.url).toContain("hqdefault.jpg");
    expect(track.streamable).toBe(false);
    expect(track.streamUrl).toBeUndefined();
    expect(track.sourceUrl).toBe(`https://www.youtube.com/watch?v=${videoId}`);
    expect(isVideoTrack(track)).toBe(true);
  });

  it("builds an official embed URL without hiding ads", () => {
    const url = new URL(youTubeEmbedUrl(videoId, { autoplay: true }));
    expect(url.origin).toBe("https://www.youtube.com");
    expect(url.pathname).toBe(`/embed/${videoId}`);
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.has("controls")).toBe(false);
    expect(url.searchParams.has("iv_load_policy")).toBe(false);
  });
});
