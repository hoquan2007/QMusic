type EventMap = {
  time: { currentTime: number; duration: number };
  duration: { duration: number };
  state: { playing?: boolean; buffering?: boolean };
  ended: undefined;
  error: { message: string };
  volume: { volume: number; muted: boolean };
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Map<keyof EventMap, Set<(payload: never) => void>>();
  private currentUrl: string | null = null;
  private pendingSeek: number | null = null;
  private suppressPause = false;
  private volume = 1;
  private muted = false;

  private ensure(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (this.audio) return this.audio;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = this.volume;
    audio.muted = this.muted;

    audio.addEventListener("timeupdate", () => {
      this.emit("time", { currentTime: audio.currentTime, duration: this.safeDuration(audio) });
    });
    audio.addEventListener("loadedmetadata", () => {
      if (this.pendingSeek !== null) {
        try {
          audio.currentTime = this.pendingSeek;
        } catch {
          // Some streams are not seekable before a canplay event.
        }
        this.pendingSeek = null;
      }
      this.emit("duration", { duration: this.safeDuration(audio) });
    });
    audio.addEventListener("durationchange", () => {
      this.emit("duration", { duration: this.safeDuration(audio) });
    });
    audio.addEventListener("waiting", () => this.emit("state", { buffering: true }));
    audio.addEventListener("stalled", () => this.emit("state", { buffering: true }));
    audio.addEventListener("canplay", () => this.emit("state", { buffering: false }));
    audio.addEventListener("playing", () => {
      this.suppressPause = false;
      this.emit("state", { playing: true, buffering: false });
    });
    audio.addEventListener("play", () => this.emit("state", { playing: true }));
    audio.addEventListener("pause", () => {
      if (this.suppressPause) return;
      this.emit("state", { playing: false });
    });
    audio.addEventListener("ended", () => this.emit("ended", undefined));
    audio.addEventListener("volumechange", () => {
      this.volume = audio.volume;
      this.muted = audio.muted;
      this.emit("volume", { volume: audio.volume, muted: audio.muted });
    });
    audio.addEventListener("error", () => {
      const code = audio.error?.code;
      if (code === 1 || this.currentUrl === null) return;
      this.suppressPause = false;
      this.emit("error", { message: this.errorMessage(code) });
      this.emit("state", { playing: false, buffering: false });
    });

    this.audio = audio;
    return audio;
  }

  private safeDuration(audio: HTMLAudioElement) {
    return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  }

  private errorMessage(code: number | undefined) {
    if (code === 2) return "Mất kết nối khi tải bài hát. Kiểm tra mạng và thử lại.";
    if (code === 3) return "Không thể giải mã nguồn phát này.";
    if (code === 4) return "Nguồn phát không được hỗ trợ hoặc đã hết hạn.";
    return "Không thể phát bài hát này.";
  }

  on<K extends keyof EventMap>(event: K, listener: Listener<K>) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(listener as (payload: never) => void);
    return () => this.off(event, listener);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<K>) {
    this.listeners.get(event)?.delete(listener as (payload: never) => void);
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        (listener as Listener<K>)(payload);
      } catch {
        // A listener must never break playback.
      }
    });
  }

  load(url: string, options: { autoplay?: boolean; position?: number } = {}) {
    const audio = this.ensure();
    if (!audio) return;

    const { autoplay = false, position } = options;
    this.pendingSeek = position && position > 0 ? position : null;
    this.suppressPause = true;

    if (this.currentUrl !== url) {
      this.currentUrl = url;
      audio.src = url;
      audio.load();
    } else if (position && position > 0) {
      this.seek(position);
    }

    if (autoplay) this.play();
  }

  play() {
    const audio = this.ensure();
    if (!audio) return;
    this.suppressPause = false;
    const promise = audio.play();
    if (!promise) return;
    void promise.catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      this.emit("state", { playing: false, buffering: false });
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        this.emit("error", { message: "Trình duyệt chặn tự động phát. Nhấn nút phát để tiếp tục." });
        return;
      }
      this.emit("error", { message: "Không thể bắt đầu phát. Vui lòng thử lại." });
    });
  }

  pause() {
    this.suppressPause = false;
    this.audio?.pause();
  }

  seek(seconds: number) {
    const audio = this.ensure();
    if (!audio) return;
    if (!Number.isFinite(seconds)) return;
    const duration = this.safeDuration(audio);
    const target = Math.max(0, duration > 0 ? Math.min(seconds, duration - 0.15) : seconds);
    try {
      audio.currentTime = target;
      this.emit("time", { currentTime: target, duration });
    } catch {
      this.pendingSeek = target;
    }
  }

  setVolume(value: number) {
    const audio = this.ensure();
    const volume = Math.max(0, Math.min(1, value));
    this.volume = volume;
    if (audio) {
      audio.volume = volume;
      audio.muted = volume === 0 ? true : this.muted;
    }
    this.emit("volume", { volume, muted: volume === 0 ? true : this.muted });
  }

  setMuted(muted: boolean) {
    const audio = this.ensure();
    this.muted = muted;
    if (audio) audio.muted = muted;
    this.emit("volume", { volume: this.volume, muted });
  }

  getCurrentTime() {
    return this.audio?.currentTime ?? 0;
  }

  stop() {
    if (!this.audio) return;
    this.suppressPause = true;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.currentUrl = null;
    this.pendingSeek = null;
  }

  destroy() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.audio = null;
    this.currentUrl = null;
  }
}

export const audioEngine = new AudioEngine();
