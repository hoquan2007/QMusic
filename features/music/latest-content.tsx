"use client";

import { useMemo, useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import { CardGridSkeleton } from "@/components/music/track-list-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useGenresQuery, useLatestInfiniteQuery } from "@/hooks/use-music";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function LatestContent() {
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const query = useLatestInfiniteQuery(genre);
  const genresQuery = useGenresQuery();

  const tracks = useMemo(() => {
    const all = (query.data?.pages ?? []).flatMap((page) => page.tracks);
    const seen = new Set<string>();
    return all.filter((track) => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    });
  }, [query.data]);

  const genres = (genresQuery.data?.genres ?? []).slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <header className="mb-7">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Clock3 className="h-3 w-3" /> Mới phát hành
        </p>
        <h1 className="text-balance font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Vừa lên sóng
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          Những bản nhạc mới nhất từ kho nhạc mở Audius, cập nhật liên tục. Nhấn vào một bài để phát và xem lời bài
          hát.
        </p>
      </header>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setGenre(undefined)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            !genre
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface text-muted hover:text-foreground",
          )}
        >
          Tất cả
        </button>
        {genres.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setGenre(item.name)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              genre === item.name
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <SectionHeader
        title={genre ? `Mới trong ${genre}` : "Tất cả bản phát hành mới"}
        subtitle={tracks.length > 0 ? `${tracks.length} bài hát` : undefined}
        className="mb-3"
      />

      {query.isLoading ? (
        <CardGridSkeleton count={8} />
      ) : query.isError ? (
        <ErrorState
          title="Không thể tải nhạc mới"
          message={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => void query.refetch()}
        />
      ) : tracks.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="Chưa có bản phát hành mới"
          description="Nguồn nhạc chưa trả về bài hát nào cho bộ lọc này. Thử thể loại khác hoặc quay lại sau."
        />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {tracks.map((track: MusicTrack, index: number) => (
              <TrackRow key={track.id} track={track} index={index} queue={tracks} />
            ))}
          </div>

          {query.hasNextPage && (
            <div className="mt-5 flex justify-center">
              <Button
                variant="outline"
                onClick={() => void query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )}
                Tải thêm bản phát hành
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
