"use client";

import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

const REPEAT_LABEL = {
  off: "Lặp lại: tắt",
  all: "Lặp lại toàn bộ",
  one: "Lặp lại một bài",
} as const;

export function PlayerTransport({
  size = "default",
  className,
}: {
  size?: "default" | "large";
  className?: string;
}) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const hasTrack = usePlayerStore((state) => state.queue.length > 0);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeat = usePlayerStore((state) => state.repeat);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const setRepeat = usePlayerStore((state) => state.setRepeat);

  const cycleRepeat = () => {
    const order = ["off", "all", "one"] as const;
    const index = order.indexOf(repeat);
    setRepeat(order[(index + 1) % order.length] ?? "off");
  };

  const iconClass = size === "large" ? "h-6 w-6" : "h-[18px] w-[18px]";
  const mainSize = size === "large" ? "h-16 w-16" : "h-11 w-11";

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
      <button
        type="button"
        onClick={toggleShuffle}
        title={shuffle ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
        aria-label={shuffle ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
        aria-pressed={shuffle}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-2",
          shuffle ? "text-primary" : "text-muted hover:text-foreground",
        )}
      >
        <Shuffle className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={previous}
        disabled={!hasTrack}
        title="Bài trước (P)"
        aria-label="Bài trước"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40",
          size === "large" && "h-11 w-11",
        )}
      >
        <SkipBack className={cn(iconClass, "fill-current")} />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        disabled={!hasTrack}
        aria-label={isPlaying ? "Tạm dừng" : "Phát"}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 disabled:opacity-40",
          mainSize,
        )}
      >
        {isBuffering && isPlaying ? (
          <Loader2 className={cn(size === "large" ? "h-6 w-6" : "h-5 w-5", "animate-spin")} />
        ) : isPlaying ? (
          <Pause className={cn(size === "large" ? "h-6 w-6" : "h-5 w-5", "fill-current")} />
        ) : (
          <Play className={cn(size === "large" ? "h-6 w-6" : "h-5 w-5", "ml-0.5 fill-current")} />
        )}
      </button>

      <button
        type="button"
        onClick={() => next()}
        disabled={!hasTrack}
        title="Bài tiếp theo (N)"
        aria-label="Bài tiếp theo"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40",
          size === "large" && "h-11 w-11",
        )}
      >
        <SkipForward className={cn(iconClass, "fill-current")} />
      </button>

      <button
        type="button"
        onClick={cycleRepeat}
        title={REPEAT_LABEL[repeat]}
        aria-label={REPEAT_LABEL[repeat]}
        aria-pressed={repeat !== "off"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-2",
          repeat !== "off" ? "text-primary" : "text-muted hover:text-foreground",
        )}
      >
        {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
      </button>
    </div>
  );
}
