import type { Metadata } from "next";
import { LocalPlaylistView } from "@/features/library/local-playlist-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Danh sách phát của bạn",
  description: "Phát và chỉnh sửa danh sách phát cá nhân trên QMusic.",
};

export default async function LocalPlaylistPage({ params }: PageProps) {
  const { id } = await params;
  return <LocalPlaylistView playlistId={id} />;
}
