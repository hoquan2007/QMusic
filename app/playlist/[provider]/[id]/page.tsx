import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProvider } from "@/lib/providers";
import { DetailUnavailable } from "@/components/music/detail-unavailable";
import { RemoteCollectionView } from "@/features/collections/remote-collection-view";
import type { MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ provider: string; id: string }>;
}

const getPlaylistData = cache(async (providerId: string, id: string) => {
  const provider = getProvider(providerId);
  const playlist = await provider.getPlaylist(id);
  if (!playlist) return null;
  const tracks = await provider
    .getPlaylistTracks(id)
    .catch((): MusicTrack[] => []);
  return { playlist, tracks };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider, id } = await params;
  try {
    const data = await getPlaylistData(provider, id);
    if (!data) return { title: "Không tìm thấy danh sách phát" };
    return {
      title: data.playlist.title,
      description: data.playlist.description ?? `Nghe ${data.playlist.title} trên QMusic.`,
      openGraph: {
        title: data.playlist.title,
        images: data.playlist.artwork?.url ? [{ url: data.playlist.artwork.url }] : undefined,
      },
    };
  } catch {
    return { title: "Danh sách phát" };
  }
}

export default async function PlaylistPage({ params }: PageProps) {
  const { provider, id } = await params;
  let data: Awaited<ReturnType<typeof getPlaylistData>>;
  try {
    data = await getPlaylistData(provider, id);
  } catch (error) {
    return (
      <DetailUnavailable
        title="Không thể tải danh sách phát"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }
  if (!data) notFound();
  return <RemoteCollectionView collection={data.playlist} tracks={data.tracks} />;
}
