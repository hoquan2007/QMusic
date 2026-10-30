"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

export function ProgressSlider({
  className,
  showTimes = true,
  size = "default",
}: {
  className?: string;
  showTimes?: boolean;
  size?: "default" | "large";
}) {
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const trackDuration = usePlayerStore((state) => state.queue[state.currentIndex]?.duration ?? 0);
  const seek = usePlayerStore((state) => state.seek);
  const total = duration > 0 ? duration : trackDuration;
  const [dragValue, setDragValue] = useState<number | null>(null);

  const raw = dragValue ?? Math.min(currentTime, total || 0);
  const value = total > 0 ? Math.min(raw, total) : 0;

  return (
    <div className={cn("group flex w-full items-center gap-2.5", className)}>
      {showTimes && (
        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted">
          {formatDuration(value)}
        </span>
      )}
      <Slider
        value={[total > 0 ? value : 0]}
        max={total > 0 ? total : 1}
        step={1}
        disabled={total <= 0}
        aria-label="Tiến trình bài hát"
        onValueChange={([next]) => setDragValue(next ?? 0)}
        onValueCommit={([next]) => {
          if (typeof next === "number") seek(next);
          setDragValue(null);
        }}
        className={size === "large" ? "py-2" : "py-1"}
      />
      {showTimes && (
        <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted">
          {formatDuration(total)}
        </span>
      )}
    </div>
  );
}
