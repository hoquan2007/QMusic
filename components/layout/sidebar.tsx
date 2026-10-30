"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  History,
  Home,
  Library,
  ListMusic,
  Music2,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { useLibraryStore } from "@/stores/library-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/discover", label: "Khám phá", icon: Compass },
  { href: "/vietnamese", label: "Nhạc Việt", icon: Music2 },
  { href: "/search", label: "Tìm kiếm", icon: Search },
];

const libraryNav = [
  { href: "/library", label: "Thư viện", icon: Library },
  { href: "/library/liked", label: "Bài hát yêu thích", icon: Heart },
  { href: "/library/history", label: "Lịch sử nghe", icon: History },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/library") return pathname === "/library";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const playlists = useLibraryStore((state) => state.playlists);
  const setCreatePlaylistOpen = useUiStore((state) => state.setCreatePlaylistOpen);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border bg-surface/40 lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/" aria-label="QMusic — Trang chủ">
          <Wordmark />
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-6" aria-label="Điều hướng chính">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                isActive(pathname, item.href)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive(pathname, item.href) && "text-primary")} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 space-y-0.5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted/70">
            Thư viện
          </p>
          {libraryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                isActive(pathname, item.href)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive(pathname, item.href) && "text-primary")} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/70">
              Danh sách phát
            </p>
            <button
              type="button"
              onClick={() => setCreatePlaylistOpen(true)}
              aria-label="Tạo danh sách phát"
              title="Tạo danh sách phát"
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {playlists.length === 0 ? (
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="w-full rounded-xl border border-dashed border-border px-3 py-3 text-left text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Tạo danh sách phát đầu tiên của bạn
              </button>
            ) : (
              playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/library/playlist/${playlist.id}`}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition-colors",
                    pathname === `/library/playlist/${playlist.id}`
                      ? "bg-surface-2 text-foreground"
                      : "text-muted hover:bg-surface-2/60 hover:text-foreground",
                  )}
                >
                  <ListMusic className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{playlist.name}</span>
                  <span className="ml-auto text-[10px] text-muted">{playlist.tracks.length}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-3">
          <Link
            href="/settings"
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
              isActive(pathname, "/settings")
                ? "bg-surface-2 text-foreground"
                : "text-muted hover:bg-surface-2/60 hover:text-foreground",
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
            Cài đặt
          </Link>
        </div>
      </nav>

      <div className="shrink-0 border-t border-border px-5 py-4 text-[10px] leading-relaxed text-muted/70">
        <p>
          Nguồn nhạc:{" "}
          <a
            href="https://audius.co"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-muted hover:text-foreground"
          >
            Audius
          </a>
        </p>
        <p>
          Nhạc Việt:{" "}
          <a
            href="https://music.apple.com/vn/charts"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-muted hover:text-foreground"
          >
            iTunes
          </a>
        </p>
        <p>
          Lời bài hát:{" "}
          <a
            href="https://lrclib.net"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-muted hover:text-foreground"
          >
            LRCLIB
          </a>
        </p>
      </div>
    </aside>
  );
}
