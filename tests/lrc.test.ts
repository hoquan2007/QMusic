import { describe, expect, it } from "vitest";
import { activeLyricIndex, parseLrc } from "@/lib/lyrics/lrc";

describe("parseLrc", () => {
  it("parses timestamps, metadata and multiple timestamps per line", () => {
    const lrc = [
      "[ar:QMusic]",
      "[00:01.50]Xin chào",
      "[00:03.00][00:05.25]Điệp khúc",
      "[01:02.10]Kết thúc",
    ].join("\n");

    expect(parseLrc(lrc)).toEqual([
      { time: 1.5, text: "Xin chào" },
      { time: 3, text: "Điệp khúc" },
      { time: 5.25, text: "Điệp khúc" },
      { time: 62.1, text: "Kết thúc" },
    ]);
  });

  it("supports colon fractions and ignores empty text", () => {
    expect(parseLrc("[00:01:25]\n[00:02:50]Ca từ")).toEqual([{ time: 2.5, text: "Ca từ" }]);
  });

  it("returns an empty list for empty or metadata-only input", () => {
    expect(parseLrc("")).toEqual([]);
    expect(parseLrc("[ti:Bài hát]\n[by:Ai đó]")).toEqual([]);
  });
});

describe("activeLyricIndex", () => {
  const lines = [
    { time: 1, text: "một" },
    { time: 5, text: "hai" },
    { time: 9, text: "ba" },
  ];

  it("returns the latest line at or before the current time", () => {
    expect(activeLyricIndex(lines, 0)).toBe(-1);
    expect(activeLyricIndex(lines, 1)).toBe(0);
    expect(activeLyricIndex(lines, 6.5)).toBe(1);
    expect(activeLyricIndex(lines, 100)).toBe(2);
  });

  it("applies a small timing tolerance", () => {
    expect(activeLyricIndex(lines, 0.9)).toBe(0);
    expect(activeLyricIndex([], 5)).toBe(-1);
  });
});
