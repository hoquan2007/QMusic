"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/hooks/use-music";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";
import type { MusicPlaylist, MusicTrack } from "@/types/music";

export function CollectionPlayButton({
  playlist,
  className,
  size = "default",
}: {
  playlist: MusicPlaylist;
  className?: string;
  size?: "default" | "large";
}) {
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const [loading, setLoading] = useState(false);

  async function handlePlay(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const kind = playlist.isAlbum ? "album" : "playlist";
      const key = playlist.isAlbum
        ? queryKeys.albumTracks(playlist.provider, playlist.remoteId)
        : queryKeys.playlistTracks(playlist.provider, playlist.remoteId);
      const data = await queryClient.fetchQuery({
        queryKey: key,
        queryFn: ({ signal }) =>
          apiGet<{ tracks: MusicTrack[] }>(
            `/api/music/${kind}/${encodeURIComponent(playlist.provider)}/${encodeURIComponent(playlist.remoteId)}/tracks`,
            signal,
          ),
        staleTime: 60_000,
      });
      if (data.tracks.length === 0) {
        toast.error("Danh sách này chưa có bài hát có thể phát.");
        return;
      }
      playQueue(data.tracks, 0);
    } catch (error) {
      toast.error("Không thể phát danh sách", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={`Phát ${playlist.title}`}
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 hover:bg-primary-hover focus-visible:outline-none",
        size === "large" ? "h-14 w-14" : "h-11 w-11",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="ml-0.5 h-4 w-4 fill-current" />
      )}
    </button>
  );
}
