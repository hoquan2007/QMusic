"use client";

import { useState } from "react";
import {
  Database,
  ExternalLink,
  Info,
  Monitor,
  Moon,
  Music2,
  RotateCcw,
  Sun,
  Trash2,
  Waves,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useLibraryStore } from "@/stores/library-store";
import { cn } from "@/lib/utils";

function SettingSwitch({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-primary" : "bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Sun;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-2 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

export function SettingsView({
  providers,
}: {
  providers: { id: string; name: string; enabled: boolean }[];
}) {
  const mounted = useMounted();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const settings = useLibraryStore((state) => state.settings);
  const setSetting = useLibraryStore((state) => state.setSetting);
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);
  const playlists = useLibraryStore((state) => state.playlists);
  const clearLibrary = useLibraryStore((state) => state.clearLibrary);
  const [confirmClear, setConfirmClear] = useState(false);
  const jamendoEnabled = providers.some((provider) => provider.id === "jamendo" && provider.enabled);
  const itunesEnabled = providers.some((provider) => provider.id === "itunes" && provider.enabled);

  const themes = [
    { value: "light", label: "Sáng", icon: Sun },
    { value: "dark", label: "Tối", icon: Moon },
    { value: "system", label: "Theo hệ thống", icon: Monitor },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6">
      <header>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Info className="h-3 w-3" /> Cài đặt
        </p>
        <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Tùy chỉnh QMusic</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Mọi tùy chọn được lưu ngay trên thiết bị này. QMusic không yêu cầu tài khoản và không gửi dữ liệu thư viện
          lên máy chủ.
        </p>
      </header>

      <Section icon={Sun} title="Giao diện" description="Chế độ tối là mặc định, nhưng bạn có thể chuyển bất cứ lúc nào.">
        <div className="grid grid-cols-3 gap-2 py-4">
          {themes.map((item) => {
            const active = mounted && theme === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-2/40 text-muted hover:border-primary/40 hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="pb-4 pt-2 text-[11px] text-muted">
          Đang hiển thị: {mounted ? (resolvedTheme === "light" ? "Sáng" : "Tối") : "…"}
        </p>
      </Section>

      <Section icon={Waves} title="Trải nghiệm nghe" description="Điều chỉnh hành vi trình phát và chuyển động giao diện.">
        <SettingSwitch
          title="Tự động phát bài tiếp theo"
          description="Khi bài hát kết thúc, tự chuyển sang bài kế tiếp trong hàng đợi."
          checked={settings.autoplayNext}
          onChange={(value) => setSetting("autoplayNext", value)}
        />
        <SettingSwitch
          title="Giảm chuyển động"
          description="Tắt hiệu ứng chuyển động để giao diện nhẹ nhàng và dễ chịu hơn."
          checked={settings.reduceMotion}
          onChange={(value) => setSetting("reduceMotion", value)}
        />
      </Section>

      <Section icon={Database} title="Dữ liệu trên thiết bị" description="Thư viện của bạn được lưu bằng localStorage.">
        <div className="grid grid-cols-3 gap-2 py-4">
          <div className="rounded-xl bg-surface-2/60 p-3 text-center">
            <p className="font-display text-xl font-bold">{favorites.length}</p>
            <p className="text-[10px] text-muted">Yêu thích</p>
          </div>
          <div className="rounded-xl bg-surface-2/60 p-3 text-center">
            <p className="font-display text-xl font-bold">{history.length}</p>
            <p className="text-[10px] text-muted">Lịch sử</p>
          </div>
          <div className="rounded-xl bg-surface-2/60 p-3 text-center">
            <p className="font-display text-xl font-bold">{playlists.length}</p>
            <p className="text-[10px] text-muted">Danh sách phát</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-xs text-muted">
            Lưu cục bộ trên trình duyệt này ·{" "}
            <span className="font-semibold text-foreground">
              {favorites.length + history.length + playlists.length} mục
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Xóa toàn bộ thư viện
          </Button>
        </div>
      </Section>

      <Section icon={Music2} title="Nguồn nhạc & lời bài hát" description="QMusic chỉ sử dụng API chính thức, không scrape hay vượt giới hạn.">
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Audius</p>
              <p className="text-xs text-muted">Nguồn nhạc chính · API công khai</p>
            </div>
            <a
              href="https://audius.co"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Mở <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Jamendo</p>
              <p className="text-xs text-muted">
                {jamendoEnabled
                  ? "Đã bật trên máy chủ"
                  : "Chưa cấu hình · thêm JAMENDO_CLIENT_ID để bật"}
              </p>
            </div>
            <a
              href="https://developer.jamendo.com"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">iTunes Việt Nam</p>
              <p className="text-xs text-muted">
                {itunesEnabled
                  ? "Nhạc Việt & đoạn nghe thử 30 giây · API chính thức của Apple"
                  : "Đang tắt trên máy chủ"}
              </p>
            </div>
            <a
              href="https://performance-partners.apple.com/search-api"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">LRCLIB</p>
              <p className="text-xs text-muted">Lời bài hát đồng bộ · API mở</p>
            </div>
            <a
              href="https://lrclib.net"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Mở <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="rounded-xl bg-surface-2/60 p-3 text-[11px] leading-relaxed text-muted">
            iTunes chỉ cung cấp đoạn nghe thử 30 giây cho mục đích quảng bá. QMusic hiển thị rõ nhãn “Nghe thử”, liên
            kết tới Apple Music và không tải xuống, lưu trữ hay đồng bộ tệp âm thanh.
          </p>
        </div>
      </Section>

      <section className="rounded-2xl border border-border bg-surface p-5 text-xs leading-relaxed text-muted sm:p-6">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> QMusic 1.0.0
        </p>
        <p className="mt-1.5">
          Ứng dụng nghe nhạc mã nguồn mở sử dụng Next.js, React, TanStack Query và Zustand. Nhạc được phát trực tiếp
          từ nguồn gốc; QMusic không lưu trữ hoặc phân phối lại tệp âm thanh. Các bài từ iTunes Việt Nam là đoạn nghe
          thử quảng bá 30 giây, kèm liên kết mua bản đầy đủ trên Apple Music.
        </p>
        <p className="mt-2">
          Nếu một bài hát không phát được, đó có thể do nguồn nhạc hoặc giới hạn khu vực. Hãy thử bài khác hoặc quay
          lại sau.
        </p>
      </section>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa toàn bộ thư viện?</DialogTitle>
            <DialogDescription>
              Tất cả bài hát yêu thích, lịch sử nghe và danh sách phát trên thiết bị này sẽ bị xóa vĩnh viễn. Tùy chọn
              giao diện vẫn được giữ.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearLibrary();
                setConfirmClear(false);
                toast.success("Đã xóa toàn bộ thư viện trên thiết bị");
              }}
            >
              <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
