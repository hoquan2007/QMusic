import { youTubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function YouTubeEmbed({
  videoId,
  title,
  autoplay = false,
  eager = false,
  className,
}: {
  videoId: string;
  title: string;
  autoplay?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black",
        className,
      )}
      data-testid="youtube-embed"
    >
      <iframe
        src={youTubeEmbedUrl(videoId, { autoplay })}
        title={`${title} — YouTube`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading={eager ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
