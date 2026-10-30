import type { Metadata } from "next";
import { HistoryView } from "@/features/library/history-view";

export const metadata: Metadata = {
  title: "Lịch sử nghe",
  description: "Những bài hát bạn đã nghe gần đây trên QMusic.",
};

export default function HistoryPage() {
  return <HistoryView />;
}
