import { TrackCard } from "@/components/music/track-card";
import type { MusicTrack } from "@/types/music";
import { cn } from "@/lib/utils";

export function TrackGrid({
  tracks,
  limit,
  className,
}: {
  tracks: MusicTrack[];
  limit?: number;
  className?: string;
}) {
  const visible = typeof limit === "number" ? tracks.slice(0, limit) : tracks;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {visible.map((track) => (
        <TrackCard key={`${track.id}-${track.remoteId}`} track={track} queue={tracks} />
      ))}
    </div>
  );
}
