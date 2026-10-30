"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PlayAllButton, ShuffleButton } from "@/components/music/play-collection-buttons";
import { TrackRow } from "@/components/music/track-row";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMounted } from "@/hooks/use-mounted";
import { useLibraryStore } from "@/stores/library-store";

export function LikedSongsView() {
  const mounted = useMounted();
  const favorites = useLibraryStore((state) => state.favorites);
  const tracks = favorites.map((entry) => entry.track);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-6 pb-6">
      <header>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Heart className="h-3 w-3" /> Thư viện
        </p>
        <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Bài hát yêu thích</h1>
        <p className="mt-1.5 text-sm text-muted">
          {tracks.length > 0
            ? `${tracks.length} bài hát bạn đã lưu trên thiết bị này.`
            : "Những bài hát bạn yêu thích sẽ xuất hiện ở đây."}
        </p>
        {tracks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <PlayAllButton tracks={tracks} label="Phát tất cả" />
            <ShuffleButton tracks={tracks} />
          </div>
        )}
      </header>

      {tracks.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa có bài hát yêu thích"
          description="Nhấn vào trái tim trên bài hát, album hoặc trong trình phát để lưu vào đây."
          action={
            <Link href="/discover" className={buttonVariants({ size: "sm" })}>
              Khám phá nhạc
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={tracks} showAlbum />
          ))}
        </div>
      )}
    </div>
  );
}
