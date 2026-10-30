import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { z } from "zod";
import type { MusicTrack } from "@/types/music";
import { trackKey } from "@/lib/utils";

export interface FavoriteEntry {
  track: MusicTrack;
  addedAt: number;
}

export interface HistoryEntry {
  track: MusicTrack;
  playedAt: number;
}

export interface LocalPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: MusicTrack[];
  createdAt: number;
  updatedAt: number;
}

export interface LibrarySettings {
  autoplayNext: boolean;
  reduceMotion: boolean;
}

interface LibraryState {
  favorites: FavoriteEntry[];
  history: HistoryEntry[];
  playlists: LocalPlaylist[];
  settings: LibrarySettings;
  toggleFavorite: (track: MusicTrack) => void;
  recordHistory: (track: MusicTrack) => void;
  clearHistory: () => void;
  createPlaylist: (name: string, tracks?: MusicTrack[]) => string | null;
  renamePlaylist: (id: string, name: string) => void;
  updatePlaylist: (id: string, patch: { name?: string; description?: string }) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: MusicTrack) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, from: number, to: number) => void;
  setSetting: <K extends keyof LibrarySettings>(key: K, value: LibrarySettings[K]) => void;
  clearLibrary: () => void;
}

const trackGuard = z.custom<MusicTrack>((value) => {
  if (!value || typeof value !== "object") return false;
  const track = value as Partial<MusicTrack>;
  return (
    typeof track.id === "string" &&
    typeof track.remoteId === "string" &&
    (track.provider === "audius" || track.provider === "jamendo") &&
    typeof track.title === "string" &&
    typeof track.duration === "number" &&
    typeof track.streamable === "boolean" &&
    Boolean(track.artist) &&
    typeof track.artist?.name === "string"
  );
}, "Dữ liệu bài hát không hợp lệ");

const persistedSchema = z.object({
  favorites: z.array(z.object({ track: trackGuard, addedAt: z.number() })).default([]),
  history: z.array(z.object({ track: trackGuard, playedAt: z.number() })).default([]),
  playlists: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().default(""),
        tracks: z.array(trackGuard).default([]),
        createdAt: z.number(),
        updatedAt: z.number(),
      }),
    )
    .default([]),
  settings: z
    .object({
      autoplayNext: z.boolean().default(true),
      reduceMotion: z.boolean().default(false),
    })
    .default({ autoplayNext: true, reduceMotion: false }),
});

const validatedStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { state?: unknown; version?: number };
      const result = persistedSchema.safeParse(parsed.state);
      if (!result.success) {
        window.localStorage.removeItem(name);
        return null;
      }
      return raw;
    } catch {
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Safari private mode / quota: app still works in memory.
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      playlists: [],
      settings: { autoplayNext: true, reduceMotion: false },

      toggleFavorite: (track) => {
        const key = trackKey(track);
        set((state) => {
          const exists = state.favorites.some((entry) => trackKey(entry.track) === key);
          return {
            favorites: exists
              ? state.favorites.filter((entry) => trackKey(entry.track) !== key)
              : [{ track, addedAt: Date.now() }, ...state.favorites],
          };
        });
      },

      recordHistory: (track) => {
        const key = trackKey(track);
        set((state) => ({
          history: [
            { track, playedAt: Date.now() },
            ...state.history.filter((entry) => trackKey(entry.track) !== key),
          ].slice(0, 120),
        }));
      },

      clearHistory: () => set({ history: [] }),

      createPlaylist: (name, tracks = []) => {
        const trimmed = name.trim().slice(0, 80);
        if (!trimmed) return null;
        const now = Date.now();
        const playlist: LocalPlaylist = {
          id: makeId(),
          name: trimmed,
          description: "",
          tracks: [...tracks],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ playlists: [playlist, ...state.playlists] }));
        return playlist.id;
      },

      renamePlaylist: (id, name) => {
        const trimmed = name.trim().slice(0, 80);
        if (!trimmed) return;
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === id ? { ...playlist, name: trimmed, updatedAt: Date.now() } : playlist,
          ),
        }));
      },

      updatePlaylist: (id, patch) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== id) return playlist;
            const name = patch.name !== undefined ? patch.name.trim().slice(0, 80) : playlist.name;
            return {
              ...playlist,
              name: name || playlist.name,
              description:
                patch.description !== undefined ? patch.description.slice(0, 500) : playlist.description,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deletePlaylist: (id) => {
        set((state) => ({ playlists: state.playlists.filter((playlist) => playlist.id !== id) }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        const playlist = get().playlists.find((item) => item.id === playlistId);
        if (!playlist) return false;
        if (playlist.tracks.some((item) => item.id === track.id)) return false;
        set((state) => ({
          playlists: state.playlists.map((item) =>
            item.id === playlistId
              ? { ...item, tracks: [...item.tracks, track], updatedAt: Date.now() }
              : item,
          ),
        }));
        return true;
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  tracks: playlist.tracks.filter((track) => track.id !== trackId),
                  updatedAt: Date.now(),
                }
              : playlist,
          ),
        }));
      },

      reorderPlaylistTracks: (playlistId, from, to) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            if (from < 0 || to < 0 || from >= playlist.tracks.length || to >= playlist.tracks.length) {
              return playlist;
            }
            const tracks = [...playlist.tracks];
            const [moved] = tracks.splice(from, 1);
            if (!moved) return playlist;
            tracks.splice(to, 0, moved);
            return { ...playlist, tracks, updatedAt: Date.now() };
          }),
        }));
      },

      setSetting: (key, value) => {
        set((state) => ({ settings: { ...state.settings, [key]: value } }));
      },

      clearLibrary: () => {
        set({ favorites: [], history: [], playlists: [] });
      },
    }),
    {
      name: "qmusic-library",
      version: 3,
      storage: createJSONStorage(() => validatedStorage),
      migrate: (persisted, version) => {
        if (version < 3) {
          return {
            favorites: [],
            history: [],
            playlists: [],
            settings: { autoplayNext: true, reduceMotion: false },
          };
        }
        return persisted as LibraryState;
      },
    },
  ),
);

export function isFavorite(track: MusicTrack, favorites: FavoriteEntry[]) {
  return favorites.some((entry) => trackKey(entry.track) === trackKey(track));
}
