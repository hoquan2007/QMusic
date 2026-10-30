"use client";

import { ListPlus, Play, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/player-store";
import type { MusicTrack } from "@/types/music";

export function PlayAllButton({
  tracks,
  label = "Phát tất cả",
  className,
}: {
  tracks: MusicTrack[];
  label?: string;
  className?: string;
}) {
  const playQueue = usePlayerStore((state) => state.playQueue);

  return (
    <Button
      className={className}
      onClick={() => {
        if (tracks.length === 0) {
          toast.error("Danh sách này chưa có bài hát có thể phát.");
          return;
        }
        playQueue(tracks, 0);
      }}
      disabled={tracks.length === 0}
    >
      <Play className="h-4 w-4 fill-current" />
      {label}
    </Button>
  );
}

export function ShuffleButton({
  tracks,
  className,
}: {
  tracks: MusicTrack[];
  className?: string;
}) {
  const playQueue = usePlayerStore((state) => state.playQueue);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        if (tracks.length === 0) {
          toast.error("Danh sách này chưa có bài hát có thể phát.");
          return;
        }
        if (!shuffle) toggleShuffle();
        playQueue(tracks, Math.floor(Math.random() * tracks.length));
      }}
      disabled={tracks.length === 0}
    >
      <Shuffle className="h-4 w-4" />
      Ngẫu nhiên
    </Button>
  );
}

export function AddCollectionToQueueButton({ tracks }: { tracks: MusicTrack[] }) {
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (tracks.length === 0) return;
        tracks.forEach((track) => addToQueue(track));
        toast.success("Đã thêm vào hàng đợi", { description: `${tracks.length} bài hát` });
      }}
      disabled={tracks.length === 0}
    >
      <ListPlus className="h-4 w-4" />
      Thêm vào hàng đợi
    </Button>
  );
}
