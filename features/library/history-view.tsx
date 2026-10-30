"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Trash2 } from "lucide-react";
import { PlayAllButton, ShuffleButton } from "@/components/music/play-collection-buttons";
import { TrackRow } from "@/components/music/track-row";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useMounted } from "@/hooks/use-mounted";
import { formatRelativeDate } from "@/lib/format";
import { useLibraryStore } from "@/stores/library-store";

export function HistoryView() {
  const mounted = useMounted();
  const history = useLibraryStore((state) => state.history);
  const clearHistory = useLibraryStore((state) => state.clearHistory);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tracks = history.map((entry) => entry.track);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-6 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <History className="h-3 w-3" /> Thư viện
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Lịch sử nghe</h1>
          <p className="mt-1.5 text-sm text-muted">
            {history.length > 0
              ? `${history.length} bài hát gần đây, mới nhất trước. Dữ liệu vẫn còn sau khi tải lại trang.`
              : "Lịch sử nghe của bạn sẽ xuất hiện ở đây."}
          </p>
          {tracks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <PlayAllButton tracks={tracks} label="Phát lại tất cả" />
              <ShuffleButton tracks={tracks} />
            </div>
          )}
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Xóa lịch sử
          </Button>
        )}
      </header>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="Chưa có lịch sử nghe"
          description="Phát một bài hát bất kỳ và QMusic sẽ ghi nhớ để bạn tiếp tục sau."
          action={
            <Link href="/discover" className={buttonVariants({ size: "sm" })}>
              Khám phá nhạc
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {history.map((entry, index) => (
              <div key={`${entry.track.id}-${entry.playedAt}`} className="group/history relative">
                <TrackRow track={entry.track} index={index} queue={tracks} showAlbum />
                <span className="pointer-events-none absolute right-24 top-1/2 hidden -translate-y-1/2 text-[10px] text-muted sm:block">
                  {formatRelativeDate(entry.playedAt)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-muted">
            Lịch sử được lưu cục bộ, tối đa 120 bài gần nhất.
          </p>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa toàn bộ lịch sử?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Bài hát yêu thích và danh sách phát vẫn được giữ nguyên.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearHistory();
                setConfirmOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" /> Xóa lịch sử
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
