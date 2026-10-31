"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Disc3, Loader2, Music2, Sparkles, Video } from "lucide-react";
import { CardGridSkeleton } from "@/components/music/track-list-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { GenreCard } from "@/components/music/genre-card";
import { PlaylistCard } from "@/components/music/playlist-card";
import { TrackGrid } from "@/components/music/track-grid";
import { TrackRow } from "@/components/music/track-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenresQuery, useHomeQuery, useTrendingQuery } from "@/hooks/use-music";
import { cn } from "@/lib/utils";

const TIMES = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "allTime", label: "Mọi lúc" },
] as const;

type TimeFilter = (typeof TIMES)[number]["value"];

export function DiscoverContent() {
  const [time, setTime] = useState<TimeFilter>("week");
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const home = useHomeQuery();
  const genresQuery = useGenresQuery();
  const trending = useTrendingQuery({ time, genre, limit: 30 });

  const genres = home.data?.genres ?? genresQuery.data?.genres ?? [];
  const tracks = trending.data?.tracks ?? [];
  const latest = home.data?.latest ?? [];

  return (
    <div className="space-y-10 pb-6">
      <header className="max-w-3xl">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Compass className="h-3 w-3" /> Khám phá
        </p>
        <h1 className="text-balance font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Tìm nhạc mới, đi theo giai điệu
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Duyệt nhạc thịnh hành trên Audius theo thể loại và khoảng thời gian, hoặc khám phá bảng xếp hạng nhạc Việt
          chính thức từ iTunes. Tất cả đều dùng API chính thức và phát trực tuyến hợp pháp.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href="/vietnamese"
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Music2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Nhạc Việt — bảng xếp hạng iTunes</p>
              <p className="mt-0.5 text-xs text-muted">
                Top bài hát và album Việt Nam, kèm đoạn nghe thử 30 giây do iTunes cung cấp.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
            Xem bảng xếp hạng
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/videos"
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Video âm nhạc — YouTube chính thức</p>
              <p className="mt-0.5 text-xs text-muted">
                MV đầy đủ trong khung hình, giữ nguyên quảng cáo và không tách âm thanh.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
            Xem video
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <section>
        <SectionHeader
          title="Thể loại phổ biến"
          subtitle="Chọn một thể loại để lọc nhanh danh sách bên dưới"
          href="/search"
          hrefLabel="Tìm kiếm"
        />
        {genres.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {genres.slice(0, 12).map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setGenre(genre === item.name ? undefined : item.name)}
                className={cn(
                  "rounded-2xl text-left transition-transform duration-300 hover:-translate-y-0.5",
                  genre === item.name && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <GenreCard genre={item} index={index} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-[-0.025em] sm:text-2xl">
              {genre ? `Thịnh hành · ${genre}` : "Đang thịnh hành"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {tracks.length > 0 ? `${tracks.length} bài hát từ nguồn nhạc mở` : "Đang tải bảng xếp hạng…"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={time} onValueChange={(value) => setTime(value as TimeFilter)}>
              <TabsList>
                {TIMES.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {genre && (
              <Button variant="ghost" size="sm" onClick={() => setGenre(undefined)}>
                Bỏ lọc thể loại
              </Button>
            )}
          </div>
        </div>

        {trending.isLoading ? (
          <CardGridSkeleton />
        ) : trending.isError ? (
          <ErrorState
            title="Không thể tải bảng xếp hạng"
            message={trending.error instanceof Error ? trending.error.message : undefined}
            onRetry={() => void trending.refetch()}
          />
        ) : tracks.length === 0 ? (
          <ErrorState
            title="Chưa có bài hát phù hợp"
            message="Thử chọn thể loại hoặc khoảng thời gian khác."
          />
        ) : (
          <TrackGrid tracks={tracks} />
        )}
      </section>

      {home.isLoading ? (
        <section className="space-y-4">
          <SectionHeader title="Mới phát hành" subtitle="Đang tải…" />
          <CardGridSkeleton count={5} />
        </section>
      ) : latest.length > 0 ? (
        <section>
          <SectionHeader
            title="Mới phát hành"
            subtitle="Những bản nhạc vừa lên sóng"
            href="/latest"
          />
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {latest.slice(0, 8).map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} queue={latest} />
            ))}
          </div>
        </section>
      ) : null}

      {home.data && (home.data.playlists.length > 0 || home.data.albums.length > 0) && (
        <section>
          <SectionHeader
            title="Bộ sưu tập nổi bật"
            subtitle="Playlist và album do cộng đồng tuyển chọn"
            href="/search?type=playlists"
          />
          <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {[...home.data.playlists, ...home.data.albums].slice(0, 10).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" /> Nguồn nhạc mở
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight">Nhạc hay, công bằng cho nghệ sĩ</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            QMusic phát nhạc trực tiếp từ Audius. Bài hát luôn mở nguồn gốc để bạn ủng hộ nghệ sĩ và kiểm tra giấy
            phép.
          </p>
          <a
            href="https://audius.co"
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ className: "mt-4" })}
          >
            <Disc3 className="h-4 w-4" /> Tìm hiểu Audius
          </a>
        </div>
      </section>

      {trending.isFetching && !trending.isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang cập nhật bảng xếp hạng…
        </div>
      )}
    </div>
  );
}
