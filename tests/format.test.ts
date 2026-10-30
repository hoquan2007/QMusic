import { describe, expect, it } from "vitest";
import { formatCount, formatDate, formatDuration, formatRelativeDate } from "@/lib/format";
import { trackKey } from "@/lib/utils";

describe("format helpers", () => {
  it("formats durations including hours", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(Number.NaN)).toBe("0:00");
  });

  it("formats counts in compact Vietnamese style", () => {
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1500)).toBe("1.5K");
    expect(formatCount(12_000)).toBe("12K");
    expect(formatCount(2_500_000)).toBe("2.5M");
    expect(formatCount(undefined)).toBe("0");
  });

  it("formats dates in Vietnamese and tolerates invalid values", () => {
    expect(formatDate("2024-05-01")).toContain("2024");
    expect(formatDate("not-a-date")).toBe("");
    expect(formatRelativeDate(Date.now() - 2 * 60_000)).toContain("phút");
  });
});

describe("trackKey", () => {
  it("is stable across providers and ids", () => {
    expect(trackKey({ provider: "audius", remoteId: "abc" })).toBe("audius:abc");
    expect(trackKey({ provider: "jamendo", remoteId: "xyz" })).toBe("jamendo:xyz");
  });
});
