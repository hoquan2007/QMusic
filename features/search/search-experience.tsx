"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, SearchX, TrendingUp } from "lucide-react";
import { ArtistCard } from "@/components/music/artist-card";
import { PlaylistCard } from "@/components/music/playlist-card";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchInfiniteQuery } from "@/hooks/use-music";
import type { MusicArtist, MusicPlaylist, MusicTrack } from "@/types/music";

type SearchType = "all" | "tracks" | "artists" | "playlists";

const SUGGESTED_GENRES = [
  "Nhạc Việt",
  "V-Pop",
  "Rap Việt",
  "Ballad Việt",
  "Electronic",
  "Hip-Hop/Rap",
  "Lo-Fi",
  "Ambient",
  "Pop",
  "Rock",
  "R&B/Soul",
  "Jazz",
  "House",
  "Techno",
  "Classical",
  "Soundtrack",
];

function unique<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function SearchSkeleton() {
  return (
    <div className="space-y-2">
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
  );
}

export function SearchExperience({ providerNames }: { providerNames: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").trim();
  const urlType = searchParams.get("type") ?? "all";
  const type: SearchType = ["all", "tracks", "artists", "playlists"].includes(urlType)
    ? (urlType as SearchType)
    : "all";

  const [input, setInput] = useState(urlQuery);
  const debounced = useDebounce(input, 350);
  const focusedRef = useRef(false);

  useEffect(() => {
    const normalized = debounced.trim();
    if (normalized === urlQuery) return;
    const params = new URLSearchParams(searchParams.toString());
    if (normalized) params.set("q", normalized);
    else params.delete("q");
    const suffix = params.toString();
    router.replace(`/search${suffix ? `?${suffix}` : ""}`, { scroll: false });
  }, [debounced, router, searchParams, urlQuery]);

  useEffect(() => {
    if (!focusedRef.current) setInput(urlQuery);
  }, [urlQuery]);

  const query = useSearchInfiniteQuery(urlQuery, type);
  const pages = useMemo(() => query.data?.pages ?? [], [query.data]);

  const tracks = useMemo(() => unique<MusicTrack>(pages.flatMap((page) => page.tracks)), [pages]);
  const artists = useMemo(() => unique<MusicArtist>(pages.flatMap((page) => page.artists)), [pages]);
  const playlists = useMemo(
    () => unique<MusicPlaylist>(pages.flatMap((page) => page.playlists)),
    [pages],
  );
  const albums = useMemo(() => unique<MusicPlaylist>(pages.flatMap((page) => page.albums)), [pages]);
  const warnings = useMemo(
    () => [...new Set(pages.flatMap((page) => page.warnings ?? []))],
    [pages],
  );
  const total = tracks.length + artists.length + playlists.length + albums.length;

  function changeType(next: SearchType) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("type");
    else params.set("type", next);
    const suffix = params.toString();
    router.replace(`/search${suffix ? `?${suffix}` : ""}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Search className="h-3 w-3" /> Tìm kiếm
        </p>
        <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Tìm giai điệu của bạn
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Tìm trên {providerNames.join(" và ") || "các nguồn nhạc đang bật"}. Kết quả được chuẩn hóa từ nguồn nhạc
          thật; các bài từ iTunes Việt Nam phát dưới dạng đoạn nghe thử 30 giây.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
          }}
          placeholder="Nhập tên bài hát, nghệ sĩ, playlist…"
          aria-label="Tìm kiếm âm nhạc"
          autoFocus
          className="h-14 rounded-2xl border-border bg-surface pl-12 pr-12 text-base shadow-sm"
        />
        {(input || query.isFetching) && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {query.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-xs font-semibold text-muted hover:text-foreground"
              >
                Xóa
              </button>
            )}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={type} onValueChange={(value) => changeType(value as SearchType)}>
          <TabsList>
            <TabsTrigger value="all">Tổng hợp</TabsTrigger>
            <TabsTrigger value="tracks">Bài hát</TabsTrigger>
            <TabsTrigger value="artists">Nghệ sĩ</TabsTrigger>
            <TabsTrigger value="playlists">Playlist</TabsTrigger>
          </TabsList>
        </Tabs>
        {urlQuery && total > 0 && (
          <p className="text-xs text-muted">
            {total} kết quả cho <span className="font-semibold text-foreground">“{urlQuery}”</span>
          </p>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-300">
          {warnings[0]}
        </div>
      )}

      <div className="mt-6 min-h-[280px]">
        {!urlQuery ? (
          <div className="space-y-6">
            <EmptyState
              icon={Search}
              title="Bắt đầu tìm kiếm"
              description="Nhập tên bài hát, nghệ sĩ hoặc danh sách phát. Bạn cũng có thể chọn một thể loại bên dưới."
            />
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <TrendingUp className="h-3.5 w-3.5" /> Thể loại phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      setInput(genre);
                      const params = new URLSearchParams();
                      params.set("q", genre);
                      router.replace(`/search?${params.toString()}`, { scroll: false });
                    }}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : query.isLoading ? (
          <SearchSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Tìm kiếm thất bại"
            message={query.error instanceof Error ? query.error.message : undefined}
            onRetry={() => void query.refetch()}
          />
        ) : total === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy kết quả"
            description={`Không có kết quả phù hợp cho “${urlQuery}”. Thử từ khóa ngắn hơn hoặc kiểm tra chính tả.`}
          />
        ) : (
          <div className="space-y-9">
            {(type === "all" || type === "tracks") && tracks.length > 0 && (
              <section>
                <SectionHeader
                  title="Bài hát"
                  className="mb-3"
                />
                <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
                  {tracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} queue={tracks} showAlbum />
                  ))}
                </div>
                {type === "all" && tracks.length > 6 && (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => changeType("tracks")}>
                    Xem tất cả {tracks.length} bài hát
                  </Button>
                )}
              </section>
            )}

            {(type === "all" || type === "artists") && artists.length > 0 && (
              <section>
                <SectionHeader title="Nghệ sĩ" className="mb-3" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {(type === "all" || type === "playlists") && albums.length > 0 && (
              <section>
                <SectionHeader title="Album" className="mb-3" />
                <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
                  {albums.map((album) => (
                    <PlaylistCard key={album.id} playlist={album} />
                  ))}
                </div>
              </section>
            )}

            {(type === "all" || type === "playlists") && playlists.length > 0 && (
              <section>
                <SectionHeader title="Danh sách phát" className="mb-3" />
                <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
                  {playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {query.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => void query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Tải thêm kết quả
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
