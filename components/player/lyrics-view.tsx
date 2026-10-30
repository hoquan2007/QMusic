"use client";

import { useEffect, useRef } from "react";
import { FileText, Loader2, Music2 } from "lucide-react";
import { useLyricsQuery } from "@/hooks/use-music";
import { activeLyricIndex } from "@/lib/lyrics/lrc";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

export function LyricsView({
  className,
  enabled = true,
}: {
  className?: string;
  enabled?: boolean;
}) {
  const track = usePlayerStore((state) => state.queue[state.currentIndex] ?? null);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const seek = usePlayerStore((state) => state.seek);
  const { data, isLoading, isError } = useLyricsQuery(track, enabled);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = data?.synced ? activeLyricIndex(data.lines, currentTime) : -1;

  useEffect(() => {
    if (activeIndex < 0) return;
    const element = containerRef.current?.querySelector<HTMLElement>(`[data-line-index="${activeIndex}"]`);
    element?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex]);

  if (!track) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center py-12 text-center", className)}>
        <Music2 className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Chọn một bài hát để xem lời bài hát.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center gap-3 py-16", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted">Đang tìm lời bài hát trên LRCLIB…</p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center py-12 text-center", className)}>
        <FileText className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Mở trình phát để xem lời bài hát.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center py-12 text-center", className)}>
        <FileText className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm font-semibold">Không thể tải lời bài hát</p>
        <p className="mt-1 max-w-sm text-xs text-muted">
          LRCLIB hiện không phản hồi. Nhạc vẫn tiếp tục phát bình thường.
        </p>
      </div>
    );
  }

  if (!data?.found || data.instrumental) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center px-6 py-12 text-center", className)}>
        <FileText className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm font-semibold">
          {data?.instrumental ? "Bài hát không có lời" : "Chưa có lời bài hát"}
        </p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
          LRCLIB chưa có bản ghi phù hợp cho “{track.title}”. QMusic không tự tạo lời bài hát.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div
        ref={containerRef}
        className="no-scrollbar flex-1 overflow-y-auto px-1 py-6"
        aria-label="Lời bài hát"
      >
        {data.synced ? (
          <div className="space-y-1 pb-24">
            {data.lines.map((line, index) => {
              const active = index === activeIndex;
              const passed = index < activeIndex;
              return (
                <button
                  key={`${line.time}-${index}`}
                  type="button"
                  data-line-index={index}
                  onClick={() => seek(line.time)}
                  className={cn(
                    "block w-full rounded-xl px-4 py-2 text-left text-lg font-semibold leading-snug transition-all duration-300 sm:text-xl",
                    active
                      ? "bg-primary/10 text-foreground"
                      : passed
                        ? "text-muted/55 hover:text-muted"
                        : "text-muted hover:text-foreground",
                  )}
                >
                  {line.text}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="whitespace-pre-line pb-24 text-base leading-8 text-foreground/85 sm:text-lg">
            {data.plain}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-[11px] text-muted">
        <span>{data.synced ? "Lời đồng bộ — nhấn vào câu để tua" : "Lời bài hát dạng văn bản"}</span>
        <a
          href="https://lrclib.net"
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold transition-colors hover:text-foreground"
        >
          Nguồn: LRCLIB
        </a>
      </div>
    </div>
  );
}
