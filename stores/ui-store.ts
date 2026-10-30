import { create } from "zustand";
import type { MusicTrack } from "@/types/music";

interface UiState {
  queueOpen: boolean;
  nowPlayingOpen: boolean;
  nowPlayingTab: "lyrics" | "queue";
  mobileMenuOpen: boolean;
  addToPlaylistTrack: MusicTrack | null;
  createPlaylistOpen: boolean;
  openQueue: () => void;
  closeQueue: () => void;
  openNowPlaying: (tab?: "lyrics" | "queue") => void;
  closeNowPlaying: () => void;
  setNowPlayingTab: (tab: "lyrics" | "queue") => void;
  setMobileMenu: (open: boolean) => void;
  openAddToPlaylist: (track: MusicTrack) => void;
  closeAddToPlaylist: () => void;
  setCreatePlaylistOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  queueOpen: false,
  nowPlayingOpen: false,
  nowPlayingTab: "lyrics",
  mobileMenuOpen: false,
  addToPlaylistTrack: null,
  createPlaylistOpen: false,
  openQueue: () => set({ queueOpen: true }),
  closeQueue: () => set({ queueOpen: false }),
  openNowPlaying: (tab = "lyrics") => set({ nowPlayingOpen: true, nowPlayingTab: tab }),
  closeNowPlaying: () => set({ nowPlayingOpen: false }),
  setNowPlayingTab: (tab) => set({ nowPlayingTab: tab }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  openAddToPlaylist: (track) => set({ addToPlaylistTrack: track }),
  closeAddToPlaylist: () => set({ addToPlaylistTrack: null }),
  setCreatePlaylistOpen: (open) => set({ createPlaylistOpen: open }),
}));
