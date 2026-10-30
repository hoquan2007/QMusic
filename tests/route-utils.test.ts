import { describe, expect, it } from "vitest";
import { intParam } from "@/lib/api/route-utils";

describe("intParam", () => {
  it("uses the fallback for missing, blank or non-numeric values", () => {
    expect(intParam(new URLSearchParams(), "limit", 24, 1, 50)).toBe(24);
    expect(intParam(new URLSearchParams("limit="), "limit", 24, 1, 50)).toBe(24);
    expect(intParam(new URLSearchParams("limit=abc"), "limit", 24, 1, 50)).toBe(24);
  });

  it("floors and clamps numeric values", () => {
    expect(intParam(new URLSearchParams("limit=12.9"), "limit", 24, 1, 50)).toBe(12);
    expect(intParam(new URLSearchParams("offset=-5"), "offset", 0, 0, 100)).toBe(0);
    expect(intParam(new URLSearchParams("limit=999"), "limit", 24, 1, 50)).toBe(50);
  });
});
