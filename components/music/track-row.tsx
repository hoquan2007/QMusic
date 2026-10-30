"use client";

import Link from "next/link";
import { Play, X } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { Equalizer } from "@/components/music/track-card";
import { FavoriteButton } from "@/components/music/favorite-button";
import { TrackActions } from "@/components/music/track-actions";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";
import type { MusicTrack } from "@/types/music";

interface TrackRowProps {
  track: MusicTrack;
  index?: number;
  queue: MusicTrack[];
  showArtwork?: boolean;
  showAlbum?: boolean;
  className?: string;
  onRemove?: () => void;
  removeLabel?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function TrackRow({
  track,
  index,
  queue,
  showArtwork = true,
  showAlbum = true,
  className,
  onRemove,
  removeLabel = "Xóa khỏi danh sách",
  onMoveUp,
  onMoveDown,
}: TrackRowProps) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentId = usePlayerStore((state) => state.queue[state.currentIndex]?.id);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isCurrent = currentId === track.id;
  const clickAction = () => playTrack(track, queue);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2 sm:px-3",
        isCurrent && "bg-primary/[0.07]",
        className,
      )}
    >
      <div className="flex w-7 shrink-0 items-center justify-center text-xs text-muted">
        <button
          type="button"
          onClick={clickAction}
          aria-label={isCurrent && isPlaying ? `Tạm dừng ${track.title}` : `Phát ${track.title}`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          {isCurrent ? (
            <Equalizer className={isPlaying ? undefined : "opacity-50"} />
          ) : (
            <>
              <span className="tabular-nums group-hover:hidden">{typeof index === "number" ? index + 1 : ""}</span>
              <Play className="ml-0.5 hidden h-3.5 w-3.5 fill-current group-hover:block" />
            </>
          )}
        </button>
      </div>

      {showArtwork && (
        <Link
          href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
          className="shrink-0"
          aria-label={track.title}
        >
          <Artwork src={track.artwork} alt={track.title} className="h-10 w-10 rounded-lg" />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <Link
          href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
          className={cn(
            "block truncate text-sm font-semibold transition-colors hover:text-primary",
            isCurrent && "text-primary",
          )}
        >
          {track.title}
        </Link>
        <Link
          href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
          className="mt-0.5 block truncate text-xs text-muted transition-colors hover:text-foreground"
        >
          {track.artist.name}
        </Link>
      </div>

      {showAlbum && (
        <Link
          href={
            track.album
              ? `/album/${track.album.provider}/${encodeURIComponent(track.album.remoteId)}`
              : `/track/${track.provider}/${encodeURIComponent(track.remoteId)}`
          }
          className="hidden w-40 shrink-0 truncate text-xs text-muted transition-colors hover:text-foreground lg:block xl:w-56"
        >
          {track.album?.title ?? track.genre ?? "—"}
        </Link>
      )}

      <FavoriteButton track={track} size="sm" className="hidden shrink-0 sm:inline-flex" />

      <span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-muted sm:block">
        {formatDuration(track.duration)}
      </span>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={removeLabel}
          aria-label={removeLabel}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted opacity-70 hover:bg-surface-3 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {(onMoveUp || onMoveDown) && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            aria-label="Chuyển lên"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-foreground disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            aria-label="Chuyển xuống"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-foreground disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      )}

      <TrackActions track={track} className="shrink-0" />
    </div>
  );
}
