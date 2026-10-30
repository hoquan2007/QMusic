import type { Metadata } from "next";
import { VietnameseContent } from "@/features/music/vietnamese-content";

export const metadata: Metadata = {
  title: "Nhạc Việt",
  description:
    "Bảng xếp hạng nhạc Việt chính thức từ iTunes Việt Nam: bài hát và album đang được nghe nhiều nhất, kèm đoạn nghe thử 30 giây và liên kết Apple Music.",
};

export default function VietnamesePage() {
  return <VietnameseContent />;
}
