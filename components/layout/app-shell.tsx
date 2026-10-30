import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PlayerBar } from "@/components/player/player-bar";
import { MiniPlayer } from "@/components/player/mini-player";
import { QueuePanel } from "@/components/player/queue-panel";
import { NowPlayingOverlay } from "@/components/player/now-playing-overlay";
import { CreatePlaylistDialog } from "@/components/library/create-playlist-dialog";
import { AddToPlaylistDialog } from "@/components/library/add-to-playlist-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-[264px]">
        <Header />
        <main className="mx-auto w-full max-w-[1560px] px-4 pb-44 pt-5 sm:px-6 lg:px-10 lg:pb-32 lg:pt-7">
          {children}
        </main>
      </div>
      <PlayerBar />
      <MiniPlayer />
      <MobileNav />
      <QueuePanel />
      <NowPlayingOverlay />
      <CreatePlaylistDialog />
      <AddToPlaylistDialog />
    </div>
  );
}
