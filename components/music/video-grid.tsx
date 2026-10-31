import { VideoCard } from "@/components/music/video-card";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function VideoGrid({
  videos,
  limit,
  className,
}: {
  videos: MusicTrack[];
  limit?: number;
  className?: string;
}) {
  const visible = typeof limit === "number" ? videos.slice(0, limit) : videos;
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {visible.map((video) => (
        <VideoCard key={video.id} track={video} />
      ))}
    </div>
  );
}
