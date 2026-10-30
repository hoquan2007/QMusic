"use client";

import Link from "next/link";
import { ExternalLink, ListPlus, Play, Radio, Sparkles } from "lucide-react";
import { DetailHero } from "@/components/music/detail-hero";
import { FavoriteButton } from "@/components/music/favorite-button";
import { TrackRow } from "@/components/music/track-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import { providerLabel } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import type { MusicTrack } from "@/types/music";
import { TrackLyricsPanel } from "@/features/tracks/track-lyrics-panel";

function PlayNowButton({ track }: { track: MusicTrack }) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentId = usePlayerStore((state) => state.queue[state.currentIndex]?.id);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isCurrent = currentId === track.id;

  return (
    <Button onClick={() => playTrack(track, [track])} disabled={!track.streamable}>
      <Play className={isCurrent && isPlaying ? "h-4 w-4" : "h-4 w-4 fill-current"} />
      {isCurrent && isPlaying ? "Tạm dừng" : "Phát bài hát"}
    </Button>
  );
}

function AddToPlaylistButton({ track }: { track: MusicTrack }) {
  const openAddToPlaylist = useUiStore((state) => state.openAddToPlaylist);
  return (
    <Button variant="outline" onClick={() => openAddToPlaylist(track)}>
      <ListPlus className="h-4 w-4" /> Thêm vào danh sách
    </Button>
  );
}

export function TrackDetailView({
  track,
  related,
}: {
  track: MusicTrack;
  related: MusicTrack[];
}) {
  return (
    <div className="space-y-9 pb-6">
      <DetailHero
        artwork={track.artwork}
        eyebrow={`Bài hát · ${providerLabel(track.provider)}`}
        title={track.title}
        description={track.description}
        meta={
          <>
            <Link
              href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              {track.artist.name}
            </Link>
            {track.album && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/album/${track.album.provider}/${encodeURIComponent(track.album.remoteId)}`}
                  className="transition-colors hover:text-foreground"
                >
                  {track.album.title}
                </Link>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{formatDuration(track.duration)}</span>
            {track.playCount ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatCount(track.playCount)} lượt nghe</span>
              </>
            ) : null}
            {track.releaseDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(track.releaseDate)}</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <PlayNowButton track={track} />
            <FavoriteButton track={track} withLabel className="border border-border px-4" />
            <AddToPlaylistButton track={track} />
            {track.sourceUrl && (
              <a
                href={track.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" /> Nguồn gốc
              </a>
            )}
          </>
        }
      >
        {(track.genre || track.mood || track.license) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {track.genre && <Badge variant="accent">{track.genre}</Badge>}
            {track.mood && <Badge variant="outline">{track.mood}</Badge>}
            {track.license && (
              <Badge variant="outline" title={track.license.attribution}>
                {track.license.name}
              </Badge>
            )}
          </div>
        )}
      </DetailHero>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <section className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Thời lượng</p>
              <p className="mt-1 font-display text-xl font-bold">{formatDuration(track.duration)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Lượt nghe</p>
              <p className="mt-1 font-display text-xl font-bold">
                {track.playCount ? formatCount(track.playCount) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Yêu thích</p>
              <p className="mt-1 font-display text-xl font-bold">
                {track.favoriteCount ? formatCount(track.favoriteCount) : "—"}
              </p>
            </div>
          </section>

          {track.license && (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold">
                <Sparkles className="h-4 w-4 text-primary" /> Giấy phép & nguồn
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {track.license.name}
                {track.license.attribution ? ` — ${track.license.attribution}` : ""}. QMusic phát trực tiếp từ nguồn
                gốc và không lưu trữ tệp âm thanh.
              </p>
              {track.license.url && (
                <a
                  href={track.license.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Xem giấy phép <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </section>
          )}

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Thêm từ {track.artist.name}</h2>
                <p className="mt-1 text-sm text-muted">Những bài hát khác của cùng nghệ sĩ</p>
              </div>
              <Link
                href={`/artist/${track.provider}/${encodeURIComponent(track.artist.remoteId)}`}
                className="shrink-0 text-xs font-semibold text-muted hover:text-foreground"
              >
                Xem nghệ sĩ
              </Link>
            </div>
            {related.filter((item) => item.id !== track.id).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                Chưa có bài hát khác từ nghệ sĩ này.
              </p>
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
                {related
                  .filter((item) => item.id !== track.id)
                  .slice(0, 8)
                  .map((item, index) => (
                    <TrackRow
                      key={item.id}
                      track={item}
                      index={index}
                      queue={related.filter((entry) => entry.id !== track.id)}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-4 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <Radio className="h-4 w-4 text-primary" /> Lời bài hát
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-muted">LRCLIB</span>
          </div>
          <TrackLyricsPanel track={track} />
        </aside>
      </div>
    </div>
  );
}
