import type { Metadata } from "next";
import { LatestContent } from "@/features/music/latest-content";

export const metadata: Metadata = {
  title: "Mới phát hành",
  description: "Những bản nhạc mới nhất từ Audius, cập nhật liên tục trên QMusic.",
};

export default function LatestPage() {
  return <LatestContent />;
}
