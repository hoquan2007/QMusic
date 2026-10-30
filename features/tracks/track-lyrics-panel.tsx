"use client";

import { FileText, Play } from "lucide-react";
import { LyricsView } from "@/components/player/lyrics-view";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { usePlayerStore } from "@/stores/player-store";
import type { MusicTrack } from "@/types/music";

export function TrackLyricsPanel({ track }: { track: MusicTrack }) {
  const mounted = useMounted();
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentId = usePlayerStore((state) => state.queue[state.currentIndex]?.id);
  const isCurrent = mounted && currentId === track.id;

  if (!isCurrent) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-10 text-center">
        <FileText className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm font-semibold">Lời đồng bộ theo trình phát</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
          Phát bài hát để QMusic tải lời từ LRCLIB, làm nổi bật từng câu và tự cuộn theo nhạc.
        </p>
        <Button size="sm" className="mt-4" onClick={() => playTrack(track, [track])} disabled={!track.streamable}>
          <Play className="h-3.5 w-3.5 fill-current" /> Phát bài hát
        </Button>
      </div>
    );
  }

  return <LyricsView className="h-[420px]" />;
}
