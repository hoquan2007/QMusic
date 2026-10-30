import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "accent" | "success";
}) {
  const variants = {
    default: "bg-surface-2 text-muted",
    outline: "border border-border text-muted",
    accent: "bg-primary/12 text-primary",
    success: "bg-success/12 text-success",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
