import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProvider } from "@/lib/providers";
import { DetailUnavailable } from "@/components/music/detail-unavailable";
import { ArtistDetailView } from "@/features/artists/artist-detail-view";
import type { MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ provider: string; id: string }>;
}

const getArtistData = cache(async (providerId: string, id: string) => {
  const provider = getProvider(providerId);
  const artist = await provider.getArtist(id);
  if (!artist) return null;
  const tracks = await provider
    .getArtistTracks(id, { limit: 30 })
    .catch((): MusicTrack[] => []);
  return { artist, tracks };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider, id } = await params;
  try {
    const data = await getArtistData(provider, id);
    if (!data) return { title: "Không tìm thấy nghệ sĩ" };
    return {
      title: data.artist.name,
      description: data.artist.bio ?? `Nghe nhạc của ${data.artist.name} trên QMusic.`,
      openGraph: {
        title: data.artist.name,
        images: data.artist.avatar?.url ? [{ url: data.artist.avatar.url }] : undefined,
      },
    };
  } catch {
    return { title: "Nghệ sĩ" };
  }
}

export default async function ArtistPage({ params }: PageProps) {
  const { provider, id } = await params;
  let data: Awaited<ReturnType<typeof getArtistData>>;
  try {
    data = await getArtistData(provider, id);
  } catch (error) {
    return (
      <DetailUnavailable
        title="Không thể tải nghệ sĩ"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }
  if (!data) notFound();
  return <ArtistDetailView artist={data.artist} tracks={data.tracks} />;
}
