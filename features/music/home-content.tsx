"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Video } from "lucide-react";
import { ContinueListening, RecentTracks } from "@/components/home/continue-listening";
import { HomeHero } from "@/components/home/home-hero";
import { ArtistCard } from "@/components/music/artist-card";
import { GenreCard } from "@/components/music/genre-card";
import { PlaylistCard } from "@/components/music/playlist-card";
import { SectionHeader } from "@/components/music/section-header";
import { TrackGrid } from "@/components/music/track-grid";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useHomeQuery } from "@/hooks/use-music";
import { useMounted } from "@/hooks/use-mounted";
import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";
import type { MusicTrack } from "@/types/music";

function dedupe(tracks: MusicTrack[]) {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function HomeSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-[360px] w-full rounded-3xl" />
      <div>
        <Skeleton className="mb-4 h-7 w-52" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeContent() {
  const { data, isLoading, isError, error, refetch } = useHomeQuery();
  const mounted = useMounted();
  const history = useLibraryStore((state) => state.history);
  const playQueue = usePlayerStore((state) => state.playQueue);

  const recommended = useMemo(() => {
    if (!data) return [];
    const heroGenre = data.trending[0]?.genre;
    return dedupe([
      ...data.trending.filter((track) => heroGenre && track.genre === heroGenre),
      ...data.latest,
      ...data.trending,
    ]).slice(0, 10);
  }, [data]);

  if (isLoading) return <HomeSkeleton />;

  if (isError || !data) {
    return (
      <ErrorState
        title="Không thể tải trang chủ"
        message={error instanceof Error ? error.message : "Nguồn nhạc tạm thời không phản hồi."}
        onRetry={() => void refetch()}
        className="mt-8"
      />
    );
  }

  const hero = data.trending[0];
  if (!hero) {
    return (
      <ErrorState
        title="Chưa có bài hát nào"
        message="Nguồn nhạc trả về danh sách trống. Vui lòng thử lại sau."
        onRetry={() => void refetch()}
        className="mt-8"
      />
    );
  }

  const artists = Array.from(
    new Map(data.trending.map((track) => [track.artist.id, track.artist])).values(),
  ).slice(0, 6);

  return (
    <div className="space-y-11 pb-6">
      <HomeHero track={hero} queue={data.trending} />

      {mounted && history.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ContinueListening />
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">Nghe gần đây</h2>
              <Link href="/library/history" className="text-[11px] font-semibold text-muted hover:text-foreground">
                Tất cả
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {history.slice(0, 4).map((entry) => (
                <button
                  key={entry.playedAt}
                  type="button"
                  onClick={() => {
                    const recent = history.map((item) => item.track);
                    const index = recent.findIndex((track) => track.id === entry.track.id);
                    playQueue(dedupe(recent), Math.max(0, index));
                  }}
                  className="shrink-0"
                  title={entry.track.title}
                >
                  <span className="block h-14 w-14 overflow-hidden rounded-lg bg-surface-2">
                    {entry.track.artwork?.url ? (
                      <img
                        src={entry.track.artwork.url}
                        alt={entry.track.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-muted">♪</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section>
        <SectionHeader
          title="Thịnh hành tuần này"
          subtitle="Những bản nhạc đang được nghe nhiều nhất trên Audius"
          href="/discover"
        />
        <TrackGrid tracks={data.trending} limit={10} />
      </section>

      {data.vietnamese.length > 0 && (
        <section>
          <SectionHeader
            title="Nhạc Việt"
            subtitle="Bảng xếp hạng chính thức từ iTunes Việt Nam — nghe thử 30 giây"
            href="/vietnamese"
          />
          <TrackGrid tracks={data.vietnamese} limit={10} />
          {data.vietnameseAlbums.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {data.vietnameseAlbums.slice(0, 5).map((album) => (
                <PlaylistCard key={album.id} playlist={album} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-25" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Chế độ video</p>
              <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
                MV chính thức, trọn khung hình
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Xem video bằng trình phát nhúng YouTube chính thức. Quảng cáo được giữ nguyên, video luôn hiển
                thị và không tách âm thanh.
              </p>
            </div>
          </div>
          <Link href="/videos" className={buttonVariants({ variant: "outline" })}>
            Mở thư viện video <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Mới phát hành"
          subtitle="Nhạc mới lên sóng từ các nghệ sĩ độc lập"
          href="/latest"
        />
        <TrackGrid tracks={data.latest} limit={10} />
      </section>

      {artists.length > 0 && (
        <section>
          <SectionHeader title="Nghệ sĩ nổi bật" subtitle="Gặp gỡ những giọng ca và nhà sản xuất đang lên" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {data.playlists.length > 0 && (
        <section>
          <SectionHeader
            title="Danh sách phát nổi bật"
            subtitle="Tuyển chọn bởi cộng đồng Audius"
            href="/discover"
          />
          <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {data.playlists.slice(0, 5).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {data.albums.length > 0 && (
        <section>
          <SectionHeader
            title="Album mới"
            subtitle="Nghe trọn vẹn tác phẩm từ đầu đến cuối"
            href="/discover"
          />
          <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {data.albums.slice(0, 5).map((album) => (
              <PlaylistCard key={album.id} playlist={album} />
            ))}
          </div>
        </section>
      )}

      {mounted && history.length > 0 && (
        <section>
          <SectionHeader
            title="Nghe lại gần đây"
            subtitle="Tiếp tục gu nhạc của bạn"
            href="/library/history"
          />
          <RecentTracks history={history} />
        </section>
      )}

      {data.genres.length > 0 && (
        <section>
          <SectionHeader
            title="Khám phá theo thể loại"
            subtitle="Từ electronic, hip-hop đến ambient và classical"
            href="/discover"
          />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {data.genres.slice(0, 8).map((genre, index) => (
              <GenreCard key={genre.name} genre={genre} index={index} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-30" />
          <div className="relative z-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  <Sparkles className="h-3 w-3" /> Dành cho bạn
                </p>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Có thể bạn sẽ thích</h2>
              </div>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground"
              >
                Khám phá thêm <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <TrackGrid tracks={recommended} limit={10} />
          </div>
        </section>
      )}

      <section className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="font-display text-lg font-bold">Bạn muốn tìm giai điệu mới?</h2>
          <p className="mt-1 text-sm text-muted">
            Tìm theo bài hát, nghệ sĩ hoặc playlist trên toàn bộ kho nhạc mở.
          </p>
        </div>
        <Link href="/search" className={buttonVariants()}>
          <Compass className="h-4 w-4" /> Bắt đầu khám phá
        </Link>
      </section>
    </div>
  );
}
