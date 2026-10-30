"use client";

import Link from "next/link";
import { MoreHorizontal, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Artwork } from "@/components/music/artwork";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate } from "@/lib/format";
import type { LocalPlaylist } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";

export function LocalPlaylistCard({
  playlist,
  onDelete,
}: {
  playlist: LocalPlaylist;
  onDelete?: (playlist: LocalPlaylist) => void;
}) {
  const playQueue = usePlayerStore((state) => state.playQueue);

  return (
    <article className="group relative rounded-2xl p-2.5 transition-colors hover:bg-surface">
      <div className="relative">
        <Link href={`/library/playlist/${playlist.id}`} className="block overflow-hidden rounded-xl">
          <Artwork
            src={playlist.tracks[0]?.artwork}
            alt={playlist.name}
            className="w-full transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </Link>
        <button
          type="button"
          onClick={() => {
            if (playlist.tracks.length === 0) {
              toast.error("Danh sách phát này chưa có bài hát.");
              return;
            }
            playQueue(playlist.tracks, 0);
          }}
          aria-label={`Phát ${playlist.name}`}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary-hover focus-visible:outline-none sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </button>
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
          Của bạn
        </span>
      </div>

      <div className="flex items-start gap-1 pt-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/library/playlist/${playlist.id}`}
            className="line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-primary"
          >
            {playlist.name}
          </Link>
          <p className="mt-1 truncate text-xs text-muted">
            {playlist.tracks.length} bài · Cập nhật {formatRelativeDate(playlist.updatedAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Tùy chọn cho ${playlist.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => playQueue(playlist.tracks, 0)} disabled={playlist.tracks.length === 0}>
              <Play className="h-4 w-4" /> Phát danh sách
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/library/playlist/${playlist.id}`}>Mở danh sách phát</Link>
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem className="text-danger" onSelect={() => onDelete(playlist)}>
                <Trash2 className="h-4 w-4" /> Xóa danh sách
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
