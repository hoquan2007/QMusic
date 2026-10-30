"use client";

import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  ListMusic,
  ListPlus,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { FavoriteButton } from "@/components/music/favorite-button";
import { PreviewBadge, PreviewNote } from "@/components/music/preview-badge";
import { LyricsView } from "@/components/player/lyrics-view";
import { ProgressSlider } from "@/components/player/progress-slider";
import { PlayerTransport } from "@/components/player/player-transport";
import { VolumeControl } from "@/components/player/volume-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { providerLabel } from "@/lib/utils";

export function NowPlayingOverlay() {
  const open = useUiStore((state) => state.nowPlayingOpen);
  const close = useUiStore((state) => state.closeNowPlaying);
  const openQueue = useUiStore((state) => state.openQueue);
  const openAddToPlaylist = useUiStore((state) => state.openAddToPlaylist);
  const track = usePlayerStore((state) => state.queue[state.currentIndex] ?? null);
  const error = usePlayerStore((state) => state.error);
  const retry = usePlayerStore((state) => state.retry);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent
        hideClose
        className="left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none border-0 p-0"
      >
        <DialogTitle className="sr-only">Đang phát — {track?.title ?? "QMusic"}</DialogTitle>
        <DialogDescription className="sr-only">
          Trình phát toàn màn hình với lời bài hát đồng bộ.
        </DialogDescription>

        {track ? (
          <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Artwork
                src={track.artwork}
                alt=""
                rounded="rounded-none"
                className="h-full w-full opacity-25"
                imageClassName="scale-110 blur-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
              <div className="absolute inset-0 hero-glow opacity-45" />
            </div>

            <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={close}
                aria-label="Đóng trình phát toàn màn hình"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/60 text-foreground backdrop-blur transition-colors hover:bg-surface"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Đang phát</p>
                <p className="text-xs text-muted/80">{providerLabel(track.provider)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openQueue}
                  aria-label="Mở hàng đợi"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/60 text-foreground backdrop-blur transition-colors hover:bg-surface"
                >
                  <ListMusic className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Thu nhỏ trình phát"
                  className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface/60 text-foreground backdrop-blur transition-colors hover:bg-surface sm:flex"
                >
                  <Maximize2 className="h-4 w-4 rotate-180" />
                </button>
              </div>
            </div>

            <div className="relative z-10 grid min-h-0 flex-1 gap-6 overflow-y-auto px-4 pb-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:overflow-hidden lg:px-12">
              <div className="flex min-h-0 flex-col items-center justify-center lg:items-start">
                <div className="w-full max-w-[420px]">
                  <Artwork
                    src={track.artwork}
                    alt={track.title}
                    eager
                    className="w-full surface-shadow rounded-2xl"
                  />
                  <div className="mt-5 flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
                        onClick={close}
                        className="line-clamp-2 font-display text-2xl font-bold tracking-tight transition-colors hover:text-primary sm:text-3xl"
                      >
                        {track.title}
                      </Link>
                      <Link
                        href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
                        onClick={close}
                        className="mt-1 block truncate text-sm font-medium text-muted transition-colors hover:text-foreground"
                      >
                        {track.artist.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {track.isPreview && <PreviewBadge seconds={track.previewSeconds} />}
                        {track.genre && <Badge variant="accent">{track.genre}</Badge>}
                        {track.license && <Badge variant="outline">{track.license.name}</Badge>}
                        {track.sourceUrl && (
                          <a
                            href={track.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-foreground"
                          >
                            Nguồn <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <PreviewNote track={track} className="mt-2" />
                    </div>
                    <FavoriteButton track={track} />
                  </div>

                  {error && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger">
                      <span className="line-clamp-2">{error}</span>
                      <button
                        type="button"
                        onClick={retry}
                        className="inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" /> Thử lại
                      </button>
                    </div>
                  )}

                  <div className="mt-5">
                    <ProgressSlider size="large" />
                    <PlayerTransport size="large" className="mt-2" />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <VolumeControl />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          close();
                          openAddToPlaylist(track);
                        }}
                      >
                        <ListPlus className="h-3.5 w-3.5" /> Thêm vào danh sách
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-[320px] rounded-2xl border border-border bg-surface/55 p-4 backdrop-blur-lg lg:my-2 lg:h-[calc(100dvh-150px)] lg:min-h-0">
                <div className="mb-2 flex items-center justify-between px-2">
                  <h2 className="font-display text-base font-bold tracking-tight">Lời bài hát</h2>
                  <span className="text-[10px] uppercase tracking-wider text-muted">LRCLIB</span>
                </div>
                <LyricsView className="h-[calc(100%-2rem)]" enabled={open} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[100dvh] items-center justify-center bg-background">
            <div className="text-center">
              <p className="font-display text-lg font-semibold">Chưa có bài hát</p>
              <p className="mt-1 text-sm text-muted">Chọn một bài hát để bắt đầu nghe.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={close}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
