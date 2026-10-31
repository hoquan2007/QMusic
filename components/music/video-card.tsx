import Link from "next/link";
import { Play } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { Badge } from "@/components/ui/badge";
import { formatCount, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

export function VideoCard({ track, className }: { track: MusicTrack; className?: string }) {
  const videoId = track.videoId ?? track.remoteId;
  const href = `/track/youtube/${encodeURIComponent(videoId)}`;

  return (
    <article className={cn("group rounded-2xl p-2 transition-colors hover:bg-surface", className)}>
      <Link href={href} className="block" aria-label={`Xem video ${track.title}`}>
        <div className="relative">
          <Artwork
            src={track.artwork}
            alt={track.title}
            rounded="rounded-xl"
            className="aspect-video w-full"
            imageClassName="transition-transform duration-500 group-hover:scale-[1.025]"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex h-11 w-11 translate-y-1 items-center justify-center rounded-full bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
            </span>
          </span>
          <Badge
            variant="accent"
            className="absolute left-2.5 top-2.5 border border-white/10 bg-background/80 backdrop-blur"
          >
            Video
          </Badge>
          {track.duration > 0 && (
            <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {formatDuration(track.duration)}
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {track.title}
        </h3>
        <p className="mt-1 truncate text-xs text-muted">{track.artist.name}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {track.playCount && track.playCount > 0
            ? `${formatCount(track.playCount)} lượt xem · YouTube`
            : "YouTube"}
        </p>
      </Link>
    </article>
  );
}
