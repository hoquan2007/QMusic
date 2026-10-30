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

const getAlbumData = cache(async (providerId: string, id: string) => {
  const provider = getProvider(providerId);
  const album = (await provider.getAlbum?.(id)) ?? (await provider.getPlaylist(id));
  if (!album) return null;
  const tracks = await (provider.getAlbumTracks?.(id) ?? provider.getPlaylistTracks(id)).catch(
    (): MusicTrack[] => [],
  );
  return { album: { ...album, isAlbum: true }, tracks };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider, id } = await params;
  try {
    const data = await getAlbumData(provider, id);
    if (!data) return { title: "Không tìm thấy album" };
    return {
      title: data.album.title,
      description: data.album.description ?? `Nghe album ${data.album.title} trên QMusic.`,
      openGraph: {
        title: data.album.title,
        images: data.album.artwork?.url ? [{ url: data.album.artwork.url }] : undefined,
      },
    };
  } catch {
    return { title: "Album" };
  }
}

export default async function AlbumPage({ params }: PageProps) {
  const { provider, id } = await params;
  let data: Awaited<ReturnType<typeof getAlbumData>>;
  try {
    data = await getAlbumData(provider, id);
  } catch (error) {
    return (
      <DetailUnavailable
        title="Không thể tải album"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }
  if (!data) notFound();
  return <RemoteCollectionView collection={data.album} tracks={data.tracks} />;
}
