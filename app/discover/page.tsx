import type { Metadata } from "next";
import { DiscoverContent } from "@/features/music/discover-content";

export const metadata: Metadata = {
  title: "Khám phá",
  description:
    "Khám phá nhạc thịnh hành, thể loại, playlist và album từ kho nhạc mở Audius, cùng bảng xếp hạng nhạc Việt chính thức từ iTunes.",
};

export default function DiscoverPage() {
  return <DiscoverContent />;
}
