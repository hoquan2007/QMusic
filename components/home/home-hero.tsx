"use client";

import Link from "next/link";
import { ArrowUpRight, Headphones, Pause, Play, Users } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { FavoriteButton } from "@/components/music/favorite-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { providerLabel } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function HomeHero({ track, queue }: { track: MusicTrack; queue: MusicTrack[] }) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentId = usePlayerStore((state) => state.queue[state.currentIndex]?.id);
  const isCurrent = currentId === track.id;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface">
      <div className="absolute inset-0">
        <Artwork
          src={track.artwork}
          alt=""
          rounded="rounded-none"
          eager
          className="h-full w-full opacity-40"
          imageClassName="scale-105 blur-2xl sm:blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute inset-0 hero-glow opacity-55" />
      </div>

      <div className="relative z-10 grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-10">
        <div className="max-w-2xl animate-rise">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="uppercase tracking-wider">
              Nổi bật tuần này
            </Badge>
            <Badge variant="outline">{providerLabel(track.provider)}</Badge>
            {track.genre && <Badge>{track.genre}</Badge>}
          </div>

          <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-balance sm:text-5xl lg:text-[3.4rem]">
            {track.title}
          </h1>
          <Link
            href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:text-base"
          >
            {track.artist.name}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
            {typeof track.playCount === "number" && track.playCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5" /> {formatCount(track.playCount)} lượt nghe
              </span>
            )}
            {typeof track.favoriteCount === "number" && track.favoriteCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {formatCount(track.favoriteCount)} yêu thích
              </span>
            )}
            {track.mood && <span>· {track.mood}</span>}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => playTrack(track, queue)}
              className={buttonVariants({ size: "lg", className: "px-7" })}
            >
              {isCurrent && isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isCurrent && isPlaying ? "Tạm dừng" : "Phát ngay"}
            </button>
            <Link
              href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Xem chi tiết
            </Link>
            <FavoriteButton track={track} className="h-12 w-12 border border-border bg-surface/50" />
          </div>
        </div>

        <div className="hidden justify-center lg:flex">
          <div className="relative w-full max-w-[300px] animate-rise">
            <Artwork
              src={track.artwork}
              alt={track.title}
              eager
              className="w-full surface-shadow"
            />
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-white backdrop-blur-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {isCurrent && isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                )}
              </span>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-white/60">Đang phát</p>
                <p className="max-w-[150px] truncate text-xs font-semibold">{track.artist.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
