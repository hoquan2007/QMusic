"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Không thể tải nội dung",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">
        {message ?? "Đã có lỗi xảy ra. Vui lòng thử lại."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Thử lại
        </Button>
      )}
    </div>
  );
}
