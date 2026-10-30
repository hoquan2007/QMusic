import type { Metadata } from "next";
import { PlaylistsView } from "@/features/library/playlists-view";

export const metadata: Metadata = {
  title: "Danh sách phát",
  description: "Quản lý danh sách phát cá nhân của bạn trên QMusic.",
};

export default function PlaylistsPage() {
  return <PlaylistsView />;
}
