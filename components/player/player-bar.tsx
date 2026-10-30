"use client";

import Link from "next/link";
import { ListMusic, Maximize2, Mic2 } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { FavoriteButton } from "@/components/music/favorite-button";
import { ProgressSlider } from "@/components/player/progress-slider";
import { PlayerTransport } from "@/components/player/player-transport";
import { VolumeControl } from "@/components/player/volume-control";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const track = usePlayerStore((state) => state.queue[state.currentIndex] ?? null);
  const error = usePlayerStore((state) => state.error);
  const retry = usePlayerStore((state) => state.retry);
  const queueLength = usePlayerStore((state) => state.queue.length);
  const openQueue = useUiStore((state) => state.openQueue);
  const openNowPlaying = useUiStore((state) => state.openNowPlaying);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 hidden h-[88px] border-t border-border glass px-4 lg:block">
      <div className="mx-auto grid h-full max-w-[1800px] grid-cols-[minmax(220px,1fr)_minmax(340px,1.3fr)_minmax(220px,1fr)] items-center gap-6">
        <div className="flex min-w-0 items-center gap-3">
          {track ? (
            <>
              <Link
                href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
                className="shrink-0"
                aria-label={track.title}
              >
                <Artwork src={track.artwork} alt={track.title} className="h-14 w-14 rounded-xl" />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
                  className="block truncate text-sm font-semibold transition-colors hover:text-primary"
                >
                  {track.title}
                </Link>
                <Link
                  href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
                  className="mt-0.5 block truncate text-xs text-muted transition-colors hover:text-foreground"
                >
                  {track.artist.name}
                </Link>
                {error && (
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-0.5 block truncate text-[11px] font-medium text-danger hover:underline"
                    title={error}
                  >
                    Lỗi phát nhạc — nhấn để thử lại
                  </button>
                )}
              </div>
              <FavoriteButton track={track} className="shrink-0" />
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="artwork-fallback flex h-14 w-14 items-center justify-center rounded-xl">
                <ListMusic className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-semibold">Chưa có bài hát</p>
                <p className="text-xs text-muted">Chọn một bài hát để bắt đầu nghe.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col items-center gap-1">
          <PlayerTransport />
          <ProgressSlider className="w-full max-w-xl" />
        </div>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openNowPlaying("lyrics")}
            title="Lời bài hát"
            aria-label="Mở lời bài hát"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Mic2 className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={openQueue}
            title="Hàng đợi"
            aria-label="Mở hàng đợi"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <ListMusic className="h-[18px] w-[18px]" />
            {queueLength > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {queueLength > 99 ? "99" : queueLength}
              </span>
            )}
          </button>
          <VolumeControl />
          <button
            type="button"
            onClick={() => openNowPlaying("lyrics")}
            title="Mở trình phát toàn màn hình"
            aria-label="Mở trình phát toàn màn hình"
            className={cn(
              "ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Maximize2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
