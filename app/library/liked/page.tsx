import type { Metadata } from "next";
import { LikedSongsView } from "@/features/library/liked-songs-view";

export const metadata: Metadata = {
  title: "Bài hát yêu thích",
  description: "Tất cả bài hát bạn đã lưu trên QMusic.",
};

export default function LikedPage() {
  return <LikedSongsView />;
}
