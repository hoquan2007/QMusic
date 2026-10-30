"use client";

import Link from "next/link";
import { Disc3, ExternalLink, ListMusic, Music2 } from "lucide-react";
import { DetailHero } from "@/components/music/detail-hero";
import {
  AddCollectionToQueueButton,
  PlayAllButton,
  ShuffleButton,
} from "@/components/music/play-collection-buttons";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCount, formatDate } from "@/lib/format";
import { providerLabel } from "@/lib/utils";
import type { MusicPlaylist, MusicTrack } from "@/types/music";

export function RemoteCollectionView({
  collection,
  tracks,
}: {
  collection: MusicPlaylist;
  tracks: MusicTrack[];
}) {
  const kindLabel = collection.isAlbum ? "Album" : "Danh sách phát";

  return (
    <div className="space-y-9 pb-6">
      <DetailHero
        artwork={collection.artwork}
        eyebrow={`${kindLabel} · ${providerLabel(collection.provider)}`}
        title={collection.title}
        description={collection.description}
        meta={
          <>
            {collection.owner && (
              <Link
                href={`/artist/${collection.owner.provider}/${encodeURIComponent(collection.owner.remoteId)}`}
                className="font-semibold text-foreground transition-colors hover:text-primary"
              >
                {collection.owner.name}
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <span>{tracks.length || collection.trackCount || 0} bài hát</span>
            {collection.playCount ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatCount(collection.playCount)} lượt nghe</span>
              </>
            ) : null}
            {collection.releaseDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(collection.releaseDate)}</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <PlayAllButton tracks={tracks} label={collection.isAlbum ? "Phát album" : "Phát danh sách"} />
            <ShuffleButton tracks={tracks} />
            <AddCollectionToQueueButton tracks={tracks} />
            {collection.sourceUrl && (
              <a
                href={collection.sourceUrl}
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
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge variant={collection.isAlbum ? "accent" : "default"}>
            {collection.isAlbum ? <Disc3 className="h-3 w-3" /> : <ListMusic className="h-3 w-3" />}
            {kindLabel}
          </Badge>
          {collection.owner && <Badge variant="outline">Bởi {collection.owner.name}</Badge>}
        </div>
        {collection.provider === "itunes" && (
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted">
            Các bài hát trong album này được phát dưới dạng đoạn nghe thử 30 giây do iTunes cung cấp.{" "}
            {collection.sourceUrl && (
              <a
                href={collection.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Nghe đầy đủ trên Apple Music <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </p>
        )}
      </DetailHero>

      <section>
        <SectionHeader title="Danh sách bài hát" className="mb-3" />
        {tracks.length === 0 ? (
          <EmptyState
            icon={Music2}
            title="Bộ sưu tập chưa có bài hát"
            description="Nguồn nhạc trả về danh sách trống hoặc các bài hát không thể phát. Hãy thử bộ sưu tập khác."
          />
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
              {tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  queue={tracks}
                  showAlbum={!collection.isAlbum}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              {tracks.length} bài hát ·{" "}
              {collection.provider === "itunes"
                ? "Nghe thử 30 giây từ iTunes"
                : `Phát trực tiếp từ ${providerLabel(collection.provider)}`}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
