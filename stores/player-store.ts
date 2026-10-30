import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioEngine } from "@/lib/player/audio-engine";
import type { MusicTrack } from "@/types/music";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  currentTime: number;
  duration: number;
  error: string | null;
  shuffleHistory: number[];
  playTrack: (track: MusicTrack, context?: MusicTrack[]) => void;
  playQueue: (tracks: MusicTrack[], startIndex?: number) => void;
  playIndex: (index: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: (fromEnded?: boolean) => void;
  previous: () => void;
  seek: (seconds: number) => void;
  addToQueue: (track: MusicTrack) => void;
  playNext: (track: MusicTrack) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number, duration?: number) => void;
  setDuration: (duration: number) => void;
  setBuffering: (value: boolean) => void;
  setPlaying: (value: boolean) => void;
  setError: (message: string | null) => void;
  retry: () => void;
  restoreSource: () => void;
}

function currentTrack(state: Pick<PlayerState, "queue" | "currentIndex">) {
  return state.queue[state.currentIndex];
}

function startTrack(
  set: (partial: Partial<PlayerState>) => void,
  track: MusicTrack,
  autoplay = true,
) {
  if (!track.streamUrl || !track.streamable) {
    set({
      currentTime: 0,
      duration: track.duration || 0,
      isPlaying: false,
      isBuffering: false,
      error: "Bài hát này hiện không thể phát.",
    });
    return;
  }
  set({
    currentTime: 0,
    duration: track.duration || 0,
    isBuffering: autoplay,
    isPlaying: autoplay,
    error: null,
  });
  audioEngine.load(track.streamUrl, { autoplay, position: 0 });
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      isBuffering: false,
      volume: 0.8,
      muted: false,
      shuffle: false,
      repeat: "off",
      currentTime: 0,
      duration: 0,
      error: null,
      shuffleHistory: [],

      playTrack: (track, context) => {
        const state = get();

        if (state.queue[state.currentIndex]?.id === track.id) {
          if (state.isPlaying) {
            audioEngine.pause();
            set({ isPlaying: false });
          } else {
            if (!track.streamUrl) {
              set({ error: "Bài hát này hiện không thể phát.", isPlaying: false });
              return;
            }
            set({ isPlaying: true, error: null });
            audioEngine.load(track.streamUrl, {
              autoplay: true,
              position: state.currentTime > 0 ? state.currentTime : undefined,
            });
          }
          return;
        }

        let queue = context && context.length > 0 ? context : state.queue;
        let index = queue.findIndex((item) => item.id === track.id);

        if (index === -1) {
          if (!context || context.length === 0) {
            if (state.queue.length > 0) {
              queue = [...state.queue];
              index = state.queue.findIndex((item) => item.id === track.id);
            }
            if (index === -1) {
              queue = [track];
              index = 0;
            }
          } else {
            queue = [...queue, track];
            index = queue.length - 1;
          }
        }

        set({
          queue,
          currentIndex: index,
          shuffleHistory: [],
          isPlaying: true,
          error: null,
        });
        startTrack(set, track, true);
      },

      playQueue: (tracks, startIndex = 0) => {
        if (tracks.length === 0) return;
        const safeIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
        const track = tracks[safeIndex];
        if (!track) return;
        set({ queue: tracks, currentIndex: safeIndex, shuffleHistory: [] });
        startTrack(set, track, true);
      },

      playIndex: (index) => {
        const state = get();
        const track = state.queue[index];
        if (!track) return;
        set({ currentIndex: index });
        startTrack(set, track, true);
      },

      togglePlay: () => {
        const state = get();
        const track = currentTrack(state);
        if (!track) return;
        if (state.isPlaying) {
          audioEngine.pause();
          set({ isPlaying: false });
          return;
        }
        if (!track.streamUrl) {
          set({ error: "Bài hát này hiện không thể phát." });
          return;
        }
        set({ isPlaying: true, error: null });
        audioEngine.load(track.streamUrl, {
          autoplay: true,
          position: state.currentTime > 0 ? state.currentTime : undefined,
        });
      },

      play: () => {
        const track = currentTrack(get());
        if (!track?.streamUrl) return;
        set({ isPlaying: true, error: null });
        audioEngine.play();
      },

      pause: () => {
        audioEngine.pause();
        set({ isPlaying: false });
      },

      next: (fromEnded = false) => {
        const state = get();
        if (state.queue.length === 0) return;

        if (fromEnded && state.repeat === "one") {
          audioEngine.seek(0);
          audioEngine.play();
          set({ isPlaying: true, currentTime: 0 });
          return;
        }

        let nextIndex: number;
        if (state.shuffle && state.queue.length > 1) {
          const choices = state.queue
            .map((_, index) => index)
            .filter((index) => index !== state.currentIndex);
          nextIndex = choices[Math.floor(Math.random() * choices.length)] ?? state.currentIndex;
        } else {
          nextIndex = state.currentIndex + 1;
        }

        if (nextIndex >= state.queue.length) {
          if (state.repeat === "all") {
            nextIndex = 0;
          } else {
            audioEngine.pause();
            set({ isPlaying: false, currentTime: 0, isBuffering: false });
            return;
          }
        }

        const track = state.queue[nextIndex];
        if (!track) return;
        set({
          currentIndex: nextIndex,
          shuffleHistory: [...state.shuffleHistory, state.currentIndex].slice(-100),
        });
        startTrack(set, track, true);
      },

      previous: () => {
        const state = get();
        if (state.queue.length === 0) return;
        if (audioEngine.getCurrentTime() > 3) {
          audioEngine.seek(0);
          set({ currentTime: 0 });
          return;
        }

        let previousIndex: number;
        if (state.shuffle && state.shuffleHistory.length > 0) {
          previousIndex = state.shuffleHistory[state.shuffleHistory.length - 1] ?? 0;
        } else {
          previousIndex = state.currentIndex - 1;
        }
        if (previousIndex < 0) {
          previousIndex = state.repeat === "all" ? state.queue.length - 1 : 0;
        }
        const track = state.queue[previousIndex];
        if (!track) return;
        set({
          currentIndex: previousIndex,
          shuffleHistory: state.shuffleHistory.slice(0, -1),
        });
        startTrack(set, track, true);
      },

      seek: (seconds) => {
        audioEngine.seek(seconds);
        set({ currentTime: Math.max(0, seconds) });
      },

      addToQueue: (track) => {
        set((state) => ({ queue: [...state.queue, track] }));
      },

      playNext: (track) => {
        set((state) => {
          if (state.queue.length === 0) {
            return { queue: [track], currentIndex: 0 };
          }
          const queue = [...state.queue];
          queue.splice(state.currentIndex + 1, 0, track);
          return { queue };
        });
      },

      removeFromQueue: (index) => {
        const state = get();
        if (index < 0 || index >= state.queue.length) return;
        const wasCurrent = index === state.currentIndex;
        const wasPlaying = state.isPlaying;
        const queue = state.queue.filter((_, itemIndex) => itemIndex !== index);

        if (queue.length === 0) {
          audioEngine.pause();
          audioEngine.stop();
          set({
            queue: [],
            currentIndex: 0,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            error: null,
          });
          return;
        }

        if (wasCurrent) {
          const nextIndex = Math.min(index, queue.length - 1);
          const track = queue[nextIndex];
          if (!track) return;
          set({ queue, currentIndex: nextIndex });
          startTrack(set, track, wasPlaying);
          return;
        }

        set({
          queue,
          currentIndex: index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex,
        });
      },

      moveInQueue: (from, to) => {
        set((state) => {
          if (
            from < 0 ||
            to < 0 ||
            from >= state.queue.length ||
            to >= state.queue.length ||
            from === to
          ) {
            return {};
          }
          const queue = [...state.queue];
          const [moved] = queue.splice(from, 1);
          if (!moved) return {};
          queue.splice(to, 0, moved);
          let currentIndex = state.currentIndex;
          if (state.currentIndex === from) currentIndex = to;
          else if (from < state.currentIndex && to >= state.currentIndex) currentIndex -= 1;
          else if (from > state.currentIndex && to <= state.currentIndex) currentIndex += 1;
          return { queue, currentIndex };
        });
      },

      clearQueue: () => {
        audioEngine.pause();
        audioEngine.stop();
        set({
          queue: [],
          currentIndex: 0,
          isPlaying: false,
          isBuffering: false,
          currentTime: 0,
          duration: 0,
          error: null,
          shuffleHistory: [],
        });
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle, shuffleHistory: [] })),

      setRepeat: (mode) => set({ repeat: mode }),

      setVolume: (volume) => {
        const next = Math.max(0, Math.min(1, volume));
        audioEngine.setVolume(next);
        if (next > 0 && get().muted) {
          audioEngine.setMuted(false);
          set({ volume: next, muted: false });
        } else {
          set({ volume: next });
        }
      },

      toggleMute: () => {
        const state = get();
        const nextMuted = !state.muted;
        if (!nextMuted && state.volume === 0) {
          audioEngine.setVolume(0.7);
          audioEngine.setMuted(false);
          set({ muted: false, volume: 0.7 });
          return;
        }
        audioEngine.setMuted(nextMuted);
        set({ muted: nextMuted });
      },

      setCurrentTime: (time, nextDuration) => {
        set((state) => ({
          currentTime: time,
          duration: nextDuration && nextDuration > 0 ? nextDuration : state.duration,
        }));
      },

      setDuration: (duration) => {
        if (duration > 0) set({ duration });
      },

      setBuffering: (value) => set({ isBuffering: value }),

      setPlaying: (value) => set({ isPlaying: value }),

      setError: (message) => set({ error: message, isPlaying: message ? false : get().isPlaying }),

      retry: () => {
        const state = get();
        const track = currentTrack(state);
        if (!track?.streamUrl) return;
        set({ error: null, isPlaying: true });
        audioEngine.load(track.streamUrl, { autoplay: true });
      },

      restoreSource: () => {
        const state = get();
        const track = currentTrack(state);
        if (!track?.streamUrl) return;
        audioEngine.setVolume(state.volume);
        audioEngine.setMuted(state.muted);
        audioEngine.load(track.streamUrl, { autoplay: false });
      },
    }),
    {
      name: "qmusic-player",
      version: 2,
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        volume: state.volume,
        muted: state.muted,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
      migrate: (persisted) => persisted as PlayerState,
    },
  ),
);

export function getCurrentTrack() {
  return currentTrack(usePlayerStore.getState());
}
