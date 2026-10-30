"use client";

import Link from "next/link";
import { ExternalLink, Heart, Info, ListEnd, ListPlus, MoreHorizontal, Play } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isFavorite, useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function TrackActions({
  track,
  className,
  align = "end",
}: {
  track: MusicTrack;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const playNext = usePlayerStore((state) => state.playNext);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const openAddToPlaylist = useUiStore((state) => state.openAddToPlaylist);
  const favorite = useLibraryStore((state) => isFavorite(track, state.favorites));
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Tùy chọn cho ${track.title}`}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none",
            className,
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(event) => event.stopPropagation()}>
        <DropdownMenuLabel className="max-w-56 truncate">{track.title}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => playTrack(track)}>
          <Play className="h-4 w-4" /> Phát ngay
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            playNext(track);
            toast.success("Sẽ phát tiếp theo", { description: track.title });
          }}
        >
          <ListEnd className="h-4 w-4" /> Phát tiếp theo
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            addToQueue(track);
            toast.success("Đã thêm vào hàng đợi", { description: track.title });
          }}
        >
          <ListPlus className="h-4 w-4" /> Thêm vào hàng đợi
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openAddToPlaylist(track)}>
          <ListPlus className="h-4 w-4" /> Thêm vào danh sách phát
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            toggleFavorite(track);
            toast.success(favorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích", {
              description: track.title,
            });
          }}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current text-primary")} />
          {favorite ? "Bỏ yêu thích" : "Yêu thích"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/track/${track.provider}/${encodeURIComponent(track.remoteId)}`}>
            <Info className="h-4 w-4" /> Xem chi tiết
          </Link>
        </DropdownMenuItem>
        {track.sourceUrl && (
          <DropdownMenuItem asChild>
            <a href={track.sourceUrl} target="_blank" rel="noreferrer noopener">
              <ExternalLink className="h-4 w-4" /> Mở nguồn gốc
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
