import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AppShell } from "@/components/layout/app-shell";
import { SITE_URL } from "@/lib/site";

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QMusic — Nghe nhạc mở, khám phá không giới hạn",
    template: "%s · QMusic",
  },
  description:
    "QMusic là trình nghe nhạc hiện đại kết nối kho nhạc mở Audius, Jamendo và bảng xếp hạng nhạc Việt từ iTunes, cùng lời bài hát LRCLIB. Khám phá, tìm kiếm và tạo thư viện cá nhân của bạn.",
  applicationName: "QMusic",
  metadataBase: new URL(SITE_URL),
  keywords: ["QMusic", "nghe nhạc", "nhạc Việt", "Audius", "Jamendo", "iTunes", "LRCLIB", "streaming"],
  openGraph: {
    title: "QMusic — Nghe nhạc mở, khám phá không giới hạn",
    description: "Trình nghe nhạc hiện đại từ kho nhạc mở Audius và bảng xếp hạng nhạc Việt iTunes.",
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090c" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5fa" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sans.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Bỏ qua điều hướng
        </a>
        <Providers>
          <AppShell>
            <div id="main-content">{children}</div>
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
