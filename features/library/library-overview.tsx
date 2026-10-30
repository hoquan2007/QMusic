"use client";

import Link from "next/link";
import { Heart, History, ListMusic, Plus, Sparkles } from "lucide-react";
import { ContinueListening, RecentTracks } from "@/components/home/continue-listening";
import { LocalPlaylistCard } from "@/features/library/local-playlist-card";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMounted } from "@/hooks/use-mounted";
import { useLibraryStore } from "@/stores/library-store";
import { useUiStore } from "@/stores/ui-store";

export function LibraryOverview() {
  const mounted = useMounted();
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);
  const playlists = useLibraryStore((state) => state.playlists);
  const setCreatePlaylistOpen = useUiStore((state) => state.setCreatePlaylistOpen);

  const favoriteTracks = favorites.map((entry) => entry.track);
  const historyTracks = history.map((entry) => entry.track);
  const playlistTrackCount = playlists.reduce((total, playlist) => total + playlist.tracks.length, 0);

  if (!mounted) {
    return (
      <div className="space-y-5">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-surface-2" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-9 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" /> Thư viện của bạn
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Bộ sưu tập cá nhân</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Bài hát yêu thích, lịch sử nghe và danh sách phát được lưu trên thiết bị này. Không cần tài khoản, không
            gửi dữ liệu đi đâu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreatePlaylistOpen(true)}
          className={buttonVariants({ className: "gap-2" })}
        >
          <Plus className="h-4 w-4" /> Tạo danh sách phát
        </button>
      </header>

      <ContinueListening />

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/library/liked"
          className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
        >
          <Heart className="h-5 w-5 text-primary" />
          <p className="mt-3 font-display text-2xl font-bold">{favorites.length}</p>
          <p className="text-xs text-muted">Bài hát yêu thích</p>
          <p className="mt-2 text-[11px] font-semibold text-muted transition-colors group-hover:text-primary">
            Mở danh sách →
          </p>
        </Link>
        <Link
          href="/library/history"
          className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
        >
          <History className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-2xl font-bold">{history.length}</p>
          <p className="text-xs text-muted">Lượt nghe gần đây</p>
          <p className="mt-2 text-[11px] font-semibold text-muted transition-colors group-hover:text-primary">
            Xem lịch sử →
          </p>
        </Link>
        <Link
          href="/library/playlists"
          className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
        >
          <ListMusic className="h-5 w-5 text-foreground" />
          <p className="mt-3 font-display text-2xl font-bold">{playlists.length}</p>
          <p className="text-xs text-muted">
            Danh sách phát · {playlistTrackCount} bài hát
          </p>
          <p className="mt-2 text-[11px] font-semibold text-muted transition-colors group-hover:text-primary">
            Quản lý →
          </p>
        </Link>
      </div>

      <section>
        <SectionHeader
          title="Nghe gần đây"
          subtitle="Tiếp tục từ nơi bạn dừng lại"
          href={history.length > 0 ? "/library/history" : undefined}
          className="mb-3"
        />
        {historyTracks.length === 0 ? (
          <EmptyState
            icon={History}
            title="Chưa có lịch sử nghe"
            description="Khi bạn phát một bài hát, bài đó sẽ xuất hiện ở đây và vẫn còn sau khi tải lại trang."
            action={
              <Link href="/discover" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Khám phá nhạc
              </Link>
            }
          />
        ) : (
          <RecentTracks history={history} />
        )}
      </section>

      <section>
        <SectionHeader
          title="Bài hát yêu thích"
          subtitle="Nhấn trái tim để lưu bài hát"
          href={favorites.length > 0 ? "/library/liked" : undefined}
          className="mb-3"
        />
        {favoriteTracks.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Chưa có bài hát yêu thích"
            description="Nhấn vào biểu tượng trái tim trên bất kỳ bài hát nào để lưu vào thư viện."
            action={
              <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Tìm nhạc
              </Link>
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {favoriteTracks.slice(0, 6).map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} queue={favoriteTracks} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Danh sách phát của bạn"
          subtitle="Tạo và sắp xếp theo cách của bạn"
          href={playlists.length > 0 ? "/library/playlists" : undefined}
          className="mb-3"
        />
        {playlists.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title="Chưa có danh sách phát"
            description="Tạo danh sách đầu tiên để nhóm những bài hát bạn yêu thích theo tâm trạng hoặc hoạt động."
            action={
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className={buttonVariants({ size: "sm" })}
              >
                <Plus className="h-4 w-4" /> Tạo danh sách phát
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {playlists.slice(0, 5).map((playlist) => (
              <LocalPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
