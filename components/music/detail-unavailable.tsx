import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function DetailUnavailable({
  title = "Không thể tải nội dung",
  message = "Nguồn nhạc tạm thời không phản hồi. Vui lòng thử lại sau.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-danger/20 bg-danger/5 px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/discover" className={buttonVariants({ size: "sm" })}>
          Khám phá nhạc
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
