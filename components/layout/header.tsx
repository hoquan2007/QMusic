"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Moon, Search, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Wordmark } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6 lg:px-8">
      <Link href="/" className="mr-1 lg:hidden" aria-label="QMusic — Trang chủ">
        <Wordmark className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Quay lại"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          aria-label="Tiến tới"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <form
        className="relative min-w-0 flex-1 md:mx-2 md:max-w-xl"
        onSubmit={(event) => {
          event.preventDefault();
          const value = query.trim();
          if (!value) return;
          router.push(`/search?q=${encodeURIComponent(value)}`);
        }}
        role="search"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm bài hát, nghệ sĩ, playlist…"
          aria-label="Tìm kiếm âm nhạc"
          className="h-10 bg-surface-2/70 pl-10 pr-14 md:bg-surface"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted sm:block">
          /
        </kbd>
      </form>

      <Link
        href="/search"
        aria-label="Tìm kiếm"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </Link>

      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        aria-label={mounted && resolvedTheme === "light" ? "Chuyển giao diện tối" : "Chuyển giao diện sáng"}
        title="Chuyển giao diện sáng/tối"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        {mounted ? (
          resolvedTheme === "light" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )
        ) : (
          <span className="h-[18px] w-[18px]" />
        )}
      </button>

      <Link
        href="/settings"
        aria-label="Cài đặt"
        className={cn(
          "hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:flex",
          pathname === "/settings" && "bg-surface-2 text-foreground",
        )}
      >
        <Settings className="h-[18px] w-[18px]" />
      </Link>
    </header>
  );
}
