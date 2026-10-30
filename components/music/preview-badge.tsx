import { ExternalLink, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

/**
 * Nhãn cho các bản phát là đoạn nghe thử có giới hạn thời lượng (iTunes).
 * Điều khoản của Apple yêu cầu ghi rõ nguồn và đặt liên kết cửa hàng gần đó.
 */
export function PreviewBadge({
  seconds = 30,
  className,
}: {
  seconds?: number;
  className?: string;
}) {
  return (
    <Badge
      variant="accent"
      className={cn("gap-1 border border-white/10 bg-background/75 backdrop-blur", className)}
      title={`Đoạn nghe thử ${seconds} giây, cung cấp bởi iTunes`}
    >
      <Timer className="h-3 w-3" aria-hidden="true" />
      Nghe thử {seconds}s
    </Badge>
  );
}

export function StoreLink({
  track,
  className,
  label = "Apple Music",
}: {
  track: MusicTrack;
  className?: string;
  label?: string;
}) {
  const href = track.storeUrl ?? track.sourceUrl;
  if (!track.isPreview || !href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 font-semibold text-primary hover:underline",
        className,
      )}
    >
      {label}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}

export function PreviewNote({ track, className }: { track: MusicTrack; className?: string }) {
  if (!track.isPreview) return null;
  const seconds = track.previewSeconds ?? 30;
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      Bạn đang nghe đoạn nghe thử {seconds} giây do iTunes cung cấp.{" "}
      <StoreLink track={track} label="Nghe đầy đủ trên Apple Music" />
    </p>
  );
}
