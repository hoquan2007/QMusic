import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DetailUnavailable } from "@/components/music/detail-unavailable";
import { VideoDetailView } from "@/features/videos/video-detail-view";
import { getRelatedYouTubeVideos, youtubeProvider } from "@/lib/providers/youtube";
import { extractYouTubeVideoId } from "@/lib/youtube";
import type { MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Chỉ tải metadata video; không gọi tìm kiếm video liên quan để tiết kiệm quota. */
const getVideo = cache(async (id: string) => {
  const videoId = extractYouTubeVideoId(id);
  if (!videoId) return null;

  const track = await youtubeProvider.getTrack(videoId);
  return track ? { track } : null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getVideo(id);
    if (!data) return { title: "Không tìm thấy video" };
    return {
      title: data.track.title,
      description: `Xem ${data.track.title} của ${data.track.artist.name} bằng trình phát YouTube chính thức trên QMusic.`,
      openGraph: {
        title: `${data.track.title} — ${data.track.artist.name}`,
        description: "Video chính thức từ YouTube, phát trong khung hình cùng quảng cáo.",
        images: data.track.artwork?.url ? [{ url: data.track.artwork.url }] : undefined,
      },
    };
  } catch {
    return { title: "Video YouTube" };
  }
}

export default async function YouTubeVideoPage({ params }: PageProps) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getVideo>>;
  try {
    data = await getVideo(id);
  } catch (error) {
    return (
      <DetailUnavailable
        title="Không thể tải video"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }

  if (!data) notFound();

  let related: MusicTrack[] = [];
  try {
    related = await getRelatedYouTubeVideos(data.track, 8);
  } catch {
    related = [];
  }

  return <VideoDetailView track={data.track} related={related} />;
}
