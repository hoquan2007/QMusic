import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteButton } from "@/components/music/favorite-button";
import { useLibraryStore } from "@/stores/library-store";
import type { MusicTrack } from "@/types/music";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const track: MusicTrack = {
  id: "audius:one",
  remoteId: "one",
  provider: "audius",
  title: "Bài hát thử",
  artist: {
    id: "audius:artist",
    remoteId: "artist",
    provider: "audius",
    name: "Nghệ sĩ",
  },
  duration: 180,
  streamable: true,
  streamUrl: "https://api.audius.co/v1/tracks/one/stream?app_name=QMusic",
};

describe("FavoriteButton", () => {
  beforeEach(() => {
    useLibraryStore.setState({ favorites: [] });
  });

  it("adds and removes a favorite with accessible state", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton track={track} />);

    const button = screen.getByRole("button", { name: "Yêu thích bài hát" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    const active = screen.getByRole("button", { name: "Bỏ yêu thích" });
    expect(active).toHaveAttribute("aria-pressed", "true");
    expect(useLibraryStore.getState().favorites).toHaveLength(1);

    await user.click(active);

    expect(screen.getByRole("button", { name: "Yêu thích bài hát" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(useLibraryStore.getState().favorites).toHaveLength(0);
  });
});
