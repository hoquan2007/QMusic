"use client";

import { ArrowDown, ArrowUp, ListMusic, Trash2, X } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function QueuePanel() {
  const open = useUiStore((state) => state.queueOpen);
  const close = useUiStore((state) => state.closeQueue);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playIndex = usePlayerStore((state) => state.playIndex);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const moveInQueue = usePlayerStore((state) => state.moveInQueue);
  const clearQueue = usePlayerStore((state) => state.clearQueue);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent
        hideClose
        className="left-auto right-0 top-0 h-[100dvh] w-full max-w-md translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 rounded-none border-y-0 border-r-0 border-l p-0"
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4 pr-5">
          <div>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ListMusic className="h-5 w-5 text-primary" /> Hàng đợi
            </DialogTitle>
            <DialogDescription>{queue.length} bài hát</DialogDescription>
          </div>
          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearQueue} className="text-danger hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" /> Xóa
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Đóng hàng đợi">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="no-scrollbar overflow-y-auto p-3">
          {queue.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <ListMusic className="mb-3 h-8 w-8 text-muted" />
              <p className="text-sm font-semibold">Hàng đợi đang trống</p>
              <p className="mt-1 text-xs text-muted">Thêm bài hát từ menu “Thêm vào hàng đợi”.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, index) => {
                const active = index === currentIndex;
                return (
                  <div
                    key={`${track.id}-${index}`}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-surface-2",
                      active && "bg-primary/10",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => playIndex(index)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      aria-label={`Phát ${track.title}`}
                    >
                      <span className="w-4 shrink-0 text-center text-[10px] tabular-nums text-muted">
                        {active && isPlaying ? "▶" : index + 1}
                      </span>
                      <Artwork src={track.artwork} alt={track.title} className="h-9 w-9 shrink-0 rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-xs font-semibold", active && "text-primary")}>
                          {track.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted">{track.artist.name}</span>
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted">
                        {formatDuration(track.duration)}
                      </span>
                    </button>
                    <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => moveInQueue(index, index - 1)}
                        disabled={index === 0}
                        aria-label="Chuyển lên"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-surface-3 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveInQueue(index, index + 1)}
                        disabled={index === queue.length - 1}
                        aria-label="Chuyển xuống"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-surface-3 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(index)}
                        aria-label="Xóa khỏi hàng đợi"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
