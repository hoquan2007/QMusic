import type { LyricsLine } from "@/types/music";

const TIMESTAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/**
 * Parse LRC. Hỗ trợ nhiều timestamp trên một dòng và timestamp dạng [mm:ss.xx].
 * Dòng không có timestamp bị bỏ qua (đó là metadata như [ar:...]).
 */
export function parseLrc(input: string): LyricsLine[] {
  if (!input) return [];
  const lines: LyricsLine[] = [];

  for (const rawLine of input.split(/\r?\n/)) {
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    TIMESTAMP.lastIndex = 0;
    while ((match = TIMESTAMP.exec(rawLine)) !== null) {
      const minutes = Number(match[1] ?? 0);
      const seconds = Number(match[2] ?? 0);
      const fractionRaw = match[3] ?? "0";
      const fraction = Number(fractionRaw.padEnd(3, "0").slice(0, 3)) / 1000;
      timestamps.push(minutes * 60 + seconds + fraction);
    }
    if (timestamps.length === 0) continue;
    const text = rawLine.replace(TIMESTAMP, "").trim();
    if (!text) continue;
    for (const time of timestamps) {
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function activeLyricIndex(lines: LyricsLine[], time: number): number {
  if (lines.length === 0) return -1;
  let result = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line && line.time <= time + 0.12) result = i;
    else break;
  }
  return result;
}
