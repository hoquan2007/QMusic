"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { audioEngine } from "@/lib/player/audio-engine";
import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore, type RepeatMode } from "@/stores/player-store";

const REPEAT_CYCLE: RepeatMode[] = ["off", "all", "one"];

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // Kết nối engine với store đúng một lần.
  useEffect(() => {
    const unsubscribers = [
      audioEngine.on("time", ({ currentTime, duration }) => {
        usePlayerStore.getState().setCurrentTime(currentTime, duration);
      }),
      audioEngine.on("duration", ({ duration }) => {
        usePlayerStore.getState().setDuration(duration);
      }),
      audioEngine.on("state", ({ playing, buffering }) => {
        const store = usePlayerStore.getState();
        if (typeof playing === "boolean") store.setPlaying(playing);
        if (typeof buffering === "boolean") store.setBuffering(buffering);
      }),
      audioEngine.on("volume", ({ volume, muted }) => {
        usePlayerStore.setState({ volume, muted });
      }),
      audioEngine.on("ended", () => {
        const state = usePlayerStore.getState();
        const settings = useLibraryStore.getState().settings;
        if (state.repeat === "one" || settings.autoplayNext) {
          state.next(true);
        } else {
          state.setPlaying(false);
        }
      }),
      audioEngine.on("error", ({ message }) => {
        usePlayerStore.getState().setError(message);
        toast.error("Không thể phát nhạc", { description: message });
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  // Khôi phục nguồn đã lưu nhưng không tự phát (tuân thủ autoplay policy).
  useEffect(() => {
    const restore = () => {
      const state = usePlayerStore.getState();
      const track = state.queue[state.currentIndex];
      if (track) state.restoreSource();
    };
    if (usePlayerStore.persist.hasHydrated()) restore();
    return usePlayerStore.persist.onFinishHydration(restore);
  }, []);

  // Ghi lịch sử khi bắt đầu phát thực sự.
  const currentTrack = usePlayerStore((state) => state.queue[state.currentIndex]);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  useEffect(() => {
    if (currentTrack && isPlaying) {
      useLibraryStore.getState().recordHistory(currentTrack);
    }
  }, [currentTrack, isPlaying]);

  // Media Session API.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const artwork = currentTrack?.artwork?.url
      ? [{ src: currentTrack.artwork.url, sizes: "1000x1000", type: "image/jpeg" }]
      : [];
    session.metadata = new MediaMetadata({
      title: currentTrack?.title ?? "QMusic",
      artist: currentTrack?.artist.name ?? "",
      album: currentTrack?.album?.title ?? "",
      artwork,
    });
    session.playbackState = isPlaying ? "playing" : "paused";

    try {
      session.setActionHandler("play", () => usePlayerStore.getState().play());
      session.setActionHandler("pause", () => usePlayerStore.getState().pause());
      session.setActionHandler("previoustrack", () => usePlayerStore.getState().previous());
      session.setActionHandler("nexttrack", () => usePlayerStore.getState().next());
      session.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") usePlayerStore.getState().seek(details.seekTime);
      });
      session.setActionHandler("seekbackward", (details) => {
        const state = usePlayerStore.getState();
        state.seek(Math.max(0, state.currentTime - (details.seekOffset ?? 10)));
      });
      session.setActionHandler("seekforward", (details) => {
        const state = usePlayerStore.getState();
        state.seek(state.currentTime + (details.seekOffset ?? 10));
      });
    } catch {
      // Một số trình duyệt chỉ hỗ trợ một phần Media Session.
    }
  }, [currentTrack, isPlaying]);

  // Cập nhật position state cho system media controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const unsub = audioEngine.on("time", ({ currentTime, duration }) => {
      if (!("setPositionState" in navigator.mediaSession) || duration <= 0) return;
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch {
        // ignore invalid transient state
      }
    });
    return unsub;
  }, []);

  // Keyboard shortcuts (không can thiệp khi đang nhập liệu).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const state = usePlayerStore.getState();
      switch (event.code) {
        case "Space":
          if ((event.target as HTMLElement | null)?.closest("button,a")) return;
          event.preventDefault();
          state.togglePlay();
          break;
        case "ArrowRight":
          if (!state.isPlaying) return;
          event.preventDefault();
          state.seek(Math.min(state.duration || 0, state.currentTime + 5));
          break;
        case "ArrowLeft":
          if (!state.isPlaying) return;
          event.preventDefault();
          state.seek(Math.max(0, state.currentTime - 5));
          break;
        case "KeyM":
          state.toggleMute();
          break;
        case "KeyN":
          state.next();
          break;
        case "KeyP":
          state.previous();
          break;
        case "KeyS":
          state.toggleShuffle();
          break;
        case "KeyR": {
          const next = REPEAT_CYCLE[(REPEAT_CYCLE.indexOf(state.repeat) + 1) % REPEAT_CYCLE.length];
          if (next) state.setRepeat(next);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reduce motion là tùy chọn thật, áp dụng lên document.
  const reduceMotion = useLibraryStore((state) => state.settings.reduceMotion);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  return <>{children}</>;
}
