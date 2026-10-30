"use client";

import { Pause, Play } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { useMounted } from "@/hooks/use-mounted";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import type { MusicTrack } from "@/types/music";

export function ContinueListening() {
  const mounted = useMounted();
  const track = usePlayerStore((state) => state.queue[state.currentIndex] ?? null);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const openNowPlaying = useUiStore((state) => state.openNowPlaying);

  if (!mounted || !track) return null;
  const total = duration > 0 ? duration : track.duration;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openNowPlaying("lyrics")}
          className="shrink-0"
          aria-label="Mở trình phát"
        >
          <Artwork src={track.artwork} alt={track.title} className="h-16 w-16 rounded-xl sm:h-20 sm:w-20" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {isPlaying ? "Đang phát" : "Tiếp tục nghe"}
          </p>
          <button
            type="button"
            onClick={() => openNowPlaying("lyrics")}
            className="mt-1 block max-w-full truncate text-left font-display text-base font-bold tracking-tight hover:text-primary sm:text-lg"
          >
            {track.title}
          </button>
          <p className="truncate text-xs text-muted">{track.artist.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${total > 0 ? Math.min(100, (currentTime / total) * 100) : 0}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-muted">
              {formatDuration(currentTime)} / {formatDuration(total)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục phát"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
      </div>
    </section>
  );
}

export function RecentTracks({ history }: { history: { track: MusicTrack; playedAt: number }[] }) {
  const playQueue = usePlayerStore((state) => state.playQueue);
  if (history.length === 0) return null;
  const tracks = history.map((entry) => entry.track).slice(0, 8);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {history.slice(0, 5).map((entry) => (
        <button
          key={`${entry.track.id}-${entry.playedAt}`}
          type="button"
          onClick={() => {
            const index = tracks.findIndex((track) => track.id === entry.track.id);
            playQueue(tracks, Math.max(0, index));
          }}
          className="group flex w-64 shrink-0 items-center gap-3 rounded-xl border border-border bg-surface p-2 text-left transition-colors hover:bg-surface-2"
        >
          <Artwork
            src={entry.track.artwork}
            alt={entry.track.title}
            className="h-11 w-11 shrink-0 rounded-lg"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{entry.track.title}</span>
            <span className="block truncate text-[11px] text-muted">{entry.track.artist.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
