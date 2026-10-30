import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Khóa ổn định cho track trong localStorage / React. */
export function trackKey(track: { provider: string; remoteId: string }) {
  return `${track.provider}:${track.remoteId}`;
}

export function providerLabel(provider: string) {
  return provider === "audius" ? "Audius" : provider === "jamendo" ? "Jamendo" : provider;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
