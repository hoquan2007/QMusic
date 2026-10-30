"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useLibraryStore, isFavorite } from "@/stores/library-store";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function FavoriteButton({
  track,
  className,
  size = "default",
  withLabel = false,
}: {
  track: MusicTrack;
  className?: string;
  size?: "default" | "sm";
  withLabel?: boolean;
}) {
  const favorite = useLibraryStore((state) => isFavorite(track, state.favorites));
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);

  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? "Bỏ yêu thích" : "Yêu thích bài hát"}
      title={favorite ? "Bỏ yêu thích" : "Yêu thích"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(track);
        toast.success(favorite ? "Đã bỏ khỏi bài hát yêu thích" : "Đã thêm vào bài hát yêu thích", {
          description: track.title,
        });
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full text-muted transition-colors hover:text-primary focus-visible:outline-none",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
        withLabel && "w-auto px-3 text-sm font-semibold",
        favorite && "text-primary",
        className,
      )}
    >
      <Heart className={cn(size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]", favorite && "fill-current")} />
      {withLabel && <span>{favorite ? "Đã yêu thích" : "Yêu thích"}</span>}
    </button>
  );
}
