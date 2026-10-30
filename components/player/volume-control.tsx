"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

export function VolumeControl({ className }: { className?: string }) {
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);

  const effective = muted ? 0 : volume;
  const Icon = effective === 0 ? VolumeX : effective < 0.5 ? Volume1 : Volume2;

  return (
    <div className={cn("group flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={toggleMute}
        title={muted ? "Bật âm thanh (M)" : "Tắt âm thanh (M)"}
        aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
      >
        <Icon className="h-4 w-4" />
      </button>
      <Slider
        value={[effective]}
        max={1}
        step={0.01}
        aria-label="Âm lượng"
        onValueChange={([next]) => setVolume(next ?? 0)}
        className="w-20 sm:w-24"
      />
    </div>
  );
}
