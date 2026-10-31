import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YouTubeEmbed } from "@/components/music/youtube-embed";

const videoId = "dQw4w9WgXcQ";

describe("YouTubeEmbed", () => {
  it("mounts the official YouTube iframe with fullscreen and autoplay delegation", () => {
    render(<YouTubeEmbed videoId={videoId} title="Video thử" />);

    const iframe = screen.getByTitle("Video thử — YouTube");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("src")).toContain(`youtube.com/embed/${videoId}`);
    expect(iframe).toHaveAttribute("allowfullscreen");
    expect(iframe.getAttribute("allow")).toContain("autoplay");
    expect(iframe.getAttribute("allow")).toContain("picture-in-picture");
    expect(iframe.getAttribute("referrerpolicy")).toBe("strict-origin-when-cross-origin");
  });
});
