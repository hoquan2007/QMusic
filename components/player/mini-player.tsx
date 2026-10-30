"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const track = usePlayerStore((state) => state.queue[state.currentIndex] ?? null);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const openNowPlaying = useUiStore((state) => state.openNowPlaying);

  if (!track) return null;
  const total = duration > 0 ? duration : track.duration;
  const progress = total > 0 ? Math.min(100, (currentTime / total) * 100) : 0;

  return (
    <div
      className="fixed inset-x-0 z-40 border-t border-border glass lg:hidden"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="h-0.5 w-full bg-surface-3">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex h-16 items-center gap-3 px-3">
        <button
          type="button"
          onClick={() => openNowPlaying("lyrics")}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-label="Mở trình phát toàn màn hình"
        >
          <Artwork src={track.artwork} alt={track.title} className="h-11 w-11 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{track.title}</span>
            <span className="block truncate text-xs text-muted">{track.artist.name}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={() => next()}
          aria-label="Bài tiếp theo"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground",
          )}
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
