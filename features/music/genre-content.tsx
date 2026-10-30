"use client";

import Link from "next/link";
import { ArrowLeft, AudioLines } from "lucide-react";
import { CardGridSkeleton, TrackListSkeleton } from "@/components/music/track-list-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { TrackGrid } from "@/components/music/track-grid";
import { TrackRow } from "@/components/music/track-row";
import { PlayAllButton } from "@/components/music/play-collection-buttons";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useLatestQuery, useTrendingQuery } from "@/hooks/use-music";

export function GenreContent({ genre }: { genre: string }) {
  const trending = useTrendingQuery({ genre, time: "week", limit: 30 });
  const latest = useLatestQuery(genre);
  const tracks = trending.data?.tracks ?? [];
  const latestTracks = latest.data?.tracks ?? [];

  return (
    <div className="space-y-9 pb-6">
      <header>
        <Link
          href="/discover"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Khám phá
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <AudioLines className="h-3 w-3" /> Thể loại
            </p>
            <h1 className="text-balance font-display text-3xl font-bold capitalize tracking-[-0.04em] sm:text-4xl">
              {genre}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {tracks.length > 0
                ? `${tracks.length} bài hát thịnh hành trong tuần`
                : "Đang tải các bài hát thuộc thể loại này…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PlayAllButton tracks={[...tracks, ...latestTracks]} label="Phát thể loại" />
            <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
              Khám phá thêm
            </Link>
          </div>
        </div>
      </header>

      <section>
        <SectionHeader title="Thịnh hành tuần này" subtitle={`Những bản ${genre} được nghe nhiều nhất`} />
        {trending.isLoading ? (
          <CardGridSkeleton count={10} />
        ) : trending.isError ? (
          <ErrorState
            title="Không thể tải thể loại"
            message={trending.error instanceof Error ? trending.error.message : undefined}
            onRetry={() => void trending.refetch()}
          />
        ) : tracks.length === 0 ? (
          <EmptyState
            icon={AudioLines}
            title="Chưa có bài hát cho thể loại này"
            description="Audius có thể chưa có dữ liệu cho thể loại này. Thử một thể loại khác trong trang Khám phá."
          />
        ) : (
          <TrackGrid tracks={tracks} />
        )}
      </section>

      <section>
        <SectionHeader title="Mới trong thể loại" subtitle="Bản phát hành gần đây" />
        {latest.isLoading ? (
          <TrackListSkeleton rows={6} />
        ) : latest.isError ? (
          <ErrorState
            title="Không thể tải bản phát hành mới"
            message={latest.error instanceof Error ? latest.error.message : undefined}
            onRetry={() => void latest.refetch()}
          />
        ) : latestTracks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Chưa có bản phát hành mới trong thể loại này.
          </p>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {latestTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} queue={latestTracks} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
