import { describe, expect, it } from "vitest";
import { imageCandidates } from "@/lib/artwork";

describe("imageCandidates", () => {
  it("keeps the original URL first and swaps only the host for mirrors", () => {
    const candidates = imageCandidates({
      url: "https://creatornode.audius.co/content/abc/1000x1000.jpg?x=1",
      mirrors: ["https://creatornode2.audius.co", "https://creatornode3.audius.co"],
    });

    expect(candidates[0]).toBe("https://creatornode.audius.co/content/abc/1000x1000.jpg?x=1");
    expect(candidates[1]).toBe("https://creatornode2.audius.co/content/abc/1000x1000.jpg?x=1");
    expect(candidates[2]).toBe("https://creatornode3.audius.co/content/abc/1000x1000.jpg?x=1");
  });

  it("deduplicates and ignores invalid mirrors", () => {
    const candidates = imageCandidates({
      url: "https://cdn.example.com/a.jpg",
      mirrors: ["https://cdn.example.com", "not a url"],
    });
    expect(candidates).toEqual(["https://cdn.example.com/a.jpg"]);
  });

  it("returns an empty list without a URL", () => {
    expect(imageCandidates(undefined)).toEqual([]);
    expect(imageCandidates(null)).toEqual([]);
  });
});
