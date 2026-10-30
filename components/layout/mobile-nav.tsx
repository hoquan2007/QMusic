"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Trang chủ", icon: House },
  { href: "/discover", label: "Khám phá", icon: Compass },
  { href: "/search", label: "Tìm kiếm", icon: Search },
  { href: "/library", label: "Thư viện", icon: Library },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border glass pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Điều hướng di động"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const isActive = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors",
                isActive ? "text-primary" : "text-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-10 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-primary/12",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
