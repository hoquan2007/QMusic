import Link from "next/link";
import { ChevronLeft, Clapperboard, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { PauseAudioForVideo } from "@/components/music/pause-audio-for-video";
import { SectionHeader } from "@/components/music/section-header";
import { VideoGrid } from "@/components/music/video-grid";
import { YouTubeEmbed } from "@/components/music/youtube-embed";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import type { MusicTrack } from "@/types/music";

export function VideoDetailView({
  track,
  related,
}: {
  track: MusicTrack;
  related: MusicTrack[];
}) {
  const videoId = track.videoId ?? track.remoteId;
  const sourceUrl = track.sourceUrl ?? `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="space-y-10 pb-6">
      <PauseAudioForVideo />
      <div>
        <Link
          href="/videos"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Thư viện video
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <YouTubeEmbed videoId={videoId} title={track.title} eager />
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
              Trình phát nhúng chính thức của YouTube. Video luôn hiển thị đầy đủ, quảng cáo của YouTube
              được giữ nguyên; QMusic không tách âm thanh, không chặn quảng cáo và không phát nền.
            </p>
          </div>

          <aside className="min-w-0 lg:pt-1">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Clapperboard className="h-3 w-3" /> Video chính thức · YouTube
            </p>
            <h1 className="text-balance font-display text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-3xl">
              {track.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted">{track.artist.name}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {track.playCount && track.playCount > 0 && <span>{formatCount(track.playCount)} lượt xem</span>}
              {track.releaseDate && <span>· {formatDate(track.releaseDate)}</span>}
              {track.duration > 0 && <span>· {formatDuration(track.duration)}</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="accent">Có quảng cáo</Badge>
              <Badge variant="outline">Không tách âm thanh</Badge>
              <Badge variant="outline">Phát trong khung hình</Badge>
            </div>

            {track.description && (
              <p className="mt-4 line-clamp-6 whitespace-pre-line text-xs leading-relaxed text-muted">
                {track.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm" })}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Mở trên YouTube
              </a>
              <Link href="/videos" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Tìm video khác
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-surface p-4 text-[11px] leading-relaxed text-muted">
              <p className="flex items-center gap-1.5 font-semibold text-foreground">
                <Info className="h-3.5 w-3.5" /> Về chế độ video
              </p>
              <p className="mt-1.5">
                QMusic dùng YouTube Data API và trình phát nhúng chính thức để khám phá, xem video. Chế độ
                này tách biệt hoàn toàn với trình phát audio một thẻ của ứng dụng.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <SectionHeader
            title="Video cùng kênh"
            subtitle="Khám phá thêm các video chính thức từ cùng nghệ sĩ / kênh"
            href="/videos"
          />
          <VideoGrid videos={related} limit={8} />
        </section>
      )}
    </div>
  );
}
