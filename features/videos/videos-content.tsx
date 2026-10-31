"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  ExternalLink,
  KeyRound,
  Loader2,
  Search,
  SearchX,
  ShieldCheck,
  Video,
} from "lucide-react";
import { VideoGrid } from "@/components/music/video-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useVideosQuery } from "@/hooks/use-music";
import { extractYouTubeVideoId } from "@/lib/youtube";

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3 p-2">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function VideosContent({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const query = useVideosQuery(enabled ? debounced.trim() : "", enabled);
  const videos = query.data?.videos ?? [];
  const warning = query.data?.warnings?.[0];

  function openLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const videoId = extractYouTubeVideoId(link);
    if (!videoId) {
      setLinkError("Liên kết chưa hợp lệ. Hãy dán link youtube.com/watch?v=…, youtu.be/… hoặc ID 11 ký tự.");
      return;
    }
    setLinkError(null);
    router.push(`/track/youtube/${videoId}`);
  }

  return (
    <div className="space-y-9 pb-6">
      <header className="max-w-3xl">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Clapperboard className="h-3 w-3" /> Video âm nhạc
        </p>
        <h1 className="text-balance font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Xem MV chính thức, trọn khung hình
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Video được phát bằng trình phát nhúng chính thức của YouTube. QMusic giữ nguyên quảng cáo, không
          tách âm thanh và không phát video trong nền.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" /> API chính thức
          </Badge>
          <Badge variant="outline">Có quảng cáo</Badge>
          <Badge variant="outline">Không tải xuống</Badge>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Video className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Mở một video bằng liên kết</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Dán liên kết YouTube công khai hoặc ID video. Không cần API key cho thao tác xem trực tiếp.
            </p>
            <form onSubmit={openLink} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={link}
                onChange={(event) => {
                  setLink(event.target.value);
                  if (linkError) setLinkError(null);
                }}
                placeholder="https://www.youtube.com/watch?v=…"
                aria-label="Dán liên kết YouTube"
                aria-invalid={Boolean(linkError)}
                className="h-10 flex-1"
              />
              <Button type="submit" className="shrink-0">
                Mở video
              </Button>
            </form>
            {linkError && <p className="mt-2 text-xs text-danger">{linkError}</p>}
          </div>
        </div>
      </section>

      {!enabled ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Bật tìm kiếm &amp; video thịnh hành</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                Trang xem video và dán liên kết đã hoạt động. Để tải danh sách video nhạc thịnh hành và tìm
                kiếm video, hãy thêm khóa YouTube Data API v3 vào biến môi trường phía máy chủ.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-2 px-3 py-2 text-xs text-foreground">
                <code>YOUTUBE_API_KEY=your-server-side-key</code>
              </pre>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Khóa chỉ dùng phía server, không dùng tiền tố <code>NEXT_PUBLIC_</code>. Mỗi lần tìm kiếm
                tiêu tốn 100 đơn vị quota; kết quả được cache để tiết kiệm.
              </p>
              <a
                href="https://developers.google.com/youtube/v3/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Hướng dẫn tạo khóa YouTube Data API
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold tracking-[-0.025em] sm:text-2xl">
                {debounced.trim() ? "Kết quả video" : "Video nhạc thịnh hành"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {debounced.trim()
                  ? `Tìm thấy ${videos.length} video cho “${debounced.trim()}”`
                  : "Bảng xếp hạng video âm nhạc công khai tại Việt Nam"}
              </p>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm video âm nhạc…"
                aria-label="Tìm video âm nhạc"
                className="h-10 bg-surface pl-10 pr-10"
              />
              {query.isFetching && (
                <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>
          </div>

          {warning && (
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-300">
              {warning}
            </div>
          )}

          {query.isLoading ? (
            <VideoGridSkeleton />
          ) : query.isError ? (
            <ErrorState
              title="Không thể tải video"
              message={query.error instanceof Error ? query.error.message : undefined}
              onRetry={() => void query.refetch()}
            />
          ) : videos.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Không tìm thấy video"
              description={
                debounced.trim()
                  ? `Không có video công khai phù hợp cho “${debounced.trim()}”. Thử từ khóa khác.`
                  : "Chưa có video thịnh hành từ YouTube. Hãy thử lại sau hoặc dán liên kết video."
              }
            />
          ) : (
            <VideoGrid videos={videos} />
          )}
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 text-xs leading-relaxed text-muted">
        <p className="font-semibold text-foreground">Cách QMusic xử lý video</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Chỉ dùng YouTube Data API v3 và oEmbed chính thức; không scrape hay dùng endpoint không công khai.</li>
          <li>Trình phát nhúng giữ nguyên quảng cáo và điều khiển của YouTube; không có chế độ chỉ phát âm thanh.</li>
          <li>Video không đi vào hàng đợi audio, không lưu tệp và không phát khi rời khỏi khung hình.</li>
        </ul>
        <p className="mt-2">
          Xem thêm{" "}
          <Link href="/settings" className="font-semibold text-primary hover:underline">
            trạng thái nguồn nhạc
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
