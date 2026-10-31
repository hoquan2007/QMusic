import type { MusicTrack } from "@/types/music";

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function validId(value: string | null | undefined): string | null {
  const id = value?.trim();
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

/**
 * Nhận diện ID video từ liên kết YouTube chính thức hoặc ID 11 ký tự.
 * Chỉ chấp nhận hostname YouTube, không mở rộng sang domain lạ.
 */
export function extractYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const direct = validId(value);
  if (direct) return direct;

  let candidate = value;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    if (/^(www\.|m\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return null;
    }
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return validId(parts[0]);
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (parts[0] === "watch") return validId(url.searchParams.get("v"));
    if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) return validId(parts[1]);
  }

  return null;
}

export function isYouTubeInput(input: string): boolean {
  return extractYouTubeVideoId(input) !== null;
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/**
 * URL trình phát nhúng chính thức. Không dùng tham số ẩn quảng cáo hoặc tách âm thanh.
 */
export function youTubeEmbedUrl(videoId: string, options: { autoplay?: boolean } = {}): string {
  const url = new URL(`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`);
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  if (options.autoplay) url.searchParams.set("autoplay", "1");
  return url.toString();
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/** Đổi duration ISO-8601 của YouTube (PT1H2M3S) thành số giây. */
export function parseYouTubeDuration(value: string | null | undefined): number {
  if (!value) return 0;
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(value);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match;
  return (
    Number(days ?? 0) * 86_400 +
    Number(hours ?? 0) * 3_600 +
    Number(minutes ?? 0) * 60 +
    Math.round(Number(seconds ?? 0))
  );
}

export function isVideoTrack(
  track: Pick<MusicTrack, "provider" | "playbackMode"> | null | undefined,
): boolean {
  return Boolean(track && (track.playbackMode === "video" || track.provider === "youtube"));
}
