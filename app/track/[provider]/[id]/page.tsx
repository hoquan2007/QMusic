import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProvider } from "@/lib/providers";
import { DetailUnavailable } from "@/components/music/detail-unavailable";
import { TrackDetailView } from "@/features/tracks/track-detail-view";
import type { MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ provider: string; id: string }>;
}

const getTrackData = cache(async (providerId: string, id: string) => {
  const provider = getProvider(providerId);
  const track = await provider.getTrack(id);
  if (!track) return null;
  const related = await provider
    .getArtistTracks(track.artist.remoteId, { limit: 12 })
    .catch((): MusicTrack[] => []);
  return { track, related };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider, id } = await params;
  try {
    const data = await getTrackData(provider, id);
    if (!data) return { title: "Không tìm thấy bài hát" };
    return {
      title: data.track.title,
      description: `Nghe ${data.track.title} của ${data.track.artist.name} trên QMusic.`,
      openGraph: {
        title: `${data.track.title} — ${data.track.artist.name}`,
        description: `Phát trực tiếp trên QMusic từ ${provider}.`,
        images: data.track.artwork?.url ? [{ url: data.track.artwork.url }] : undefined,
      },
    };
  } catch {
    return { title: "Bài hát" };
  }
}

export default async function TrackPage({ params }: PageProps) {
  const { provider, id } = await params;
  let data: Awaited<ReturnType<typeof getTrackData>>;
  try {
    data = await getTrackData(provider, id);
  } catch (error) {
    return (
      <DetailUnavailable
        title="Không thể tải bài hát"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }
  if (!data) notFound();
  return <TrackDetailView track={data.track} related={data.related} />;
}
