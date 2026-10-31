import type { Metadata } from "next";
import { connection } from "next/server";
import { VideosContent } from "@/features/videos/videos-content";
import { youtubeProvider } from "@/lib/providers/youtube";

export const metadata: Metadata = {
  title: "Video âm nhạc",
  description:
    "Xem MV và video âm nhạc chính thức bằng trình phát nhúng YouTube, giữ nguyên quảng cáo và hiển thị đầy đủ khung hình.",
};

export default async function VideosPage() {
  await connection();
  return <VideosContent enabled={youtubeProvider.enabled} />;
}
