import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { QMusicLogo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <QMusicLogo className="h-14 w-14" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-muted">Lỗi 404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Không tìm thấy trang</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Đường dẫn này không tồn tại hoặc nội dung đã được gỡ khỏi nguồn nhạc.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className={buttonVariants()}>
          <Home className="h-4 w-4" /> Về trang chủ
        </Link>
        <Link
          href="/discover"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:bg-surface-2"
        >
          <Compass className="h-4 w-4" /> Khám phá
        </Link>
      </div>
    </div>
  );
}
