"use client";

import Link from "next/link";
import { ExternalLink, Music2, Sparkles, Timer, TrendingUp } from "lucide-react";
import { PlaylistCard } from "@/components/music/playlist-card";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useVietnameseQuery } from "@/hooks/use-music";

function VietnameseSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="space-y-2">
        <Skeleton className="mb-4 h-7 w-48" />
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl p-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VietnameseContent() {
  const { data, isLoading, isError, error, refetch } = useVietnameseQuery();

  if (isLoading) return <VietnameseSkeleton />;

  if (isError || !data) {
    return (
      <ErrorState
        title="Không thể tải nhạc Việt"
        message={error instanceof Error ? error.message : "Bảng xếp hạng iTunes Việt Nam tạm thời không phản hồi."}
        onRetry={() => void refetch()}
        className="mt-8"
      />
    );
  }

  const { tracks, albums } = data;

  return (
    <div className="space-y-10 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" /> Nhạc Việt
          </p>
          <h1 className="text-balance font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Bảng xếp hạng nhạc Việt
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Những bài hát đang được nghe nhiều nhất trên Apple Music Việt Nam, lấy từ bảng xếp hạng chính thức của
            iTunes. Mỗi bài phát dưới dạng đoạn nghe thử 30 giây; mở Apple Music để nghe bản đầy đủ.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="accent">
              <TrendingUp className="h-3 w-3" /> Top {tracks.length || 20}
            </Badge>
            <Badge variant="outline">
              <Timer className="h-3 w-3" /> Nghe thử 30 giây
            </Badge>
            <Badge>Nguồn: iTunes Việt Nam</Badge>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link href="/search?q=nh%E1%BA%A1c%20Vi%E1%BB%87t" className={buttonVariants()}>
              <Music2 className="h-4 w-4" /> Tìm thêm nhạc Việt
            </Link>
            <a
              href="https://music.apple.com/vn/charts"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              Bảng xếp hạng Apple Music <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Top bài hát"
          subtitle="Cập nhật từ bảng xếp hạng iTunes Việt Nam"
          href="/search?q=nh%E1%BA%A1c%20Vi%E1%BB%87t"
          hrefLabel="Tìm kiếm"
        />
        {tracks.length === 0 ? (
          <EmptyState
            icon={Music2}
            title="Bảng xếp hạng đang trống"
            description="iTunes chưa trả về bài hát nào cho khu vực Việt Nam. Vui lòng thử lại sau ít phút."
          />
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
              {tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} queue={tracks} />
              ))}
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted">
              Đoạn nghe thử được cung cấp bởi iTunes. QMusic không tải xuống, lưu trữ hay đồng bộ tệp âm thanh; mọi
              liên kết mua và nghe đầy đủ đều dẫn tới Apple Music.
            </p>
          </>
        )}
      </section>

      {albums.length > 0 && (
        <section>
          <SectionHeader
            title="Album nổi bật"
            subtitle="Album đang được nghe nhiều nhất trên iTunes Việt Nam"
            href="https://music.apple.com/vn/charts"
            hrefLabel="Apple Music"
          />
          <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {albums.map((album) => (
              <PlaylistCard key={album.id} playlist={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
