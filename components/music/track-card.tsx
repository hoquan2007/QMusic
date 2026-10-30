"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { TrackActions } from "@/components/music/track-actions";
import { FavoriteButton } from "@/components/music/favorite-button";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function Equalizer({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-3.5 items-end gap-[2px]", className)} aria-hidden="true">
      <span className="equalizer-bar h-full w-[2px] rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
      <span className="equalizer-bar h-full w-[2px] rounded-full bg-primary" style={{ animationDelay: "180ms" }} />
      <span className="equalizer-bar h-full w-[2px] rounded-full bg-primary" style={{ animationDelay: "90ms" }} />
    </span>
  );
}

export function TrackCard({
  track,
  queue,
  className,
}: {
  track: MusicTrack;
  queue?: MusicTrack[];
  className?: string;
}) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentId = usePlayerStore((state) => state.queue[state.currentIndex]?.id);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isCurrent = currentId === track.id;

  return (
    <article
      className={cn(
        "group relative rounded-2xl p-2.5 transition-colors duration-300 hover:bg-surface",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
          className="block overflow-hidden rounded-xl"
          aria-label={`Xem chi tiết ${track.title}`}
        >
          <Artwork
            src={track.artwork}
            alt={track.title}
            className="w-full transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </Link>
        <div className="absolute right-3 top-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <div className="glass rounded-full border border-white/10">
            <TrackActions track={track} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => playTrack(track, queue)}
          aria-label={isCurrent && isPlaying ? `Tạm dừng ${track.title}` : `Phát ${track.title}`}
          className={cn(
            "absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary-hover focus-visible:outline-none",
            isCurrent
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>
      </div>

      <div className="flex items-start gap-2 pt-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
            className={cn(
              "line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-primary",
              isCurrent && "text-primary",
            )}
          >
            {track.title}
          </Link>
          <Link
            href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
            className="mt-1 block truncate text-xs text-muted transition-colors hover:text-foreground"
          >
            {track.artist.name}
          </Link>
        </div>
        <FavoriteButton track={track} size="sm" className="-mr-1 shrink-0" />
      </div>
    </article>
  );
}
