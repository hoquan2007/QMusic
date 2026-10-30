import type { Metadata } from "next";
import { LibraryOverview } from "@/features/library/library-overview";

export const metadata: Metadata = {
  title: "Thư viện",
  description: "Bài hát yêu thích, lịch sử nghe và danh sách phát của bạn trên QMusic.",
};

export default function LibraryPage() {
  return <LibraryOverview />;
}
