import { beforeEach, describe, expect, it } from "vitest";
import { isFavorite, useLibraryStore } from "@/stores/library-store";
import type { MusicTrack } from "@/types/music";

function makeTrack(remoteId: string, title: string): MusicTrack {
  return {
    id: `audius:${remoteId}`,
    remoteId,
    provider: "audius",
    title,
    artist: {
      id: "audius:artist",
      remoteId: "artist",
      provider: "audius",
      name: "Nghệ sĩ",
    },
    duration: 180,
    streamable: true,
    streamUrl: `https://api.audius.co/v1/tracks/${remoteId}/stream?app_name=QMusic`,
  };
}

const first = makeTrack("one", "Bài một");
const second = makeTrack("two", "Bài hai");

function reset() {
  useLibraryStore.setState({
    favorites: [],
    history: [],
    playlists: [],
    settings: { autoplayNext: true, reduceMotion: false },
  });
}

describe("library store", () => {
  beforeEach(reset);

  it("toggles favorites and detects them", () => {
    const state = useLibraryStore.getState();
    state.toggleFavorite(first);
    expect(useLibraryStore.getState().favorites).toHaveLength(1);
    expect(isFavorite(first, useLibraryStore.getState().favorites)).toBe(true);
    expect(window.localStorage.getItem("qmusic-library")).toContain("Bài một");

    useLibraryStore.getState().toggleFavorite(first);
    expect(useLibraryStore.getState().favorites).toHaveLength(0);
  });

  it("keeps the newest history entry first and deduplicates by track", () => {
    useLibraryStore.getState().recordHistory(first);
    useLibraryStore.getState().recordHistory(second);
    useLibraryStore.getState().recordHistory(first);

    const history = useLibraryStore.getState().history;
    expect(history).toHaveLength(2);
    expect(history[0]?.track.id).toBe(first.id);
    expect(history[1]?.track.id).toBe(second.id);
  });

  it("creates, edits and deletes a playlist", () => {
    const id = useLibraryStore.getState().createPlaylist("  Chill tối  ", [first]);
    expect(id).toBeTruthy();
    if (!id) return;

    let playlist = useLibraryStore.getState().playlists.find((item) => item.id === id);
    expect(playlist?.name).toBe("Chill tối");
    expect(playlist?.tracks).toHaveLength(1);

    useLibraryStore.getState().updatePlaylist(id, { name: "Chill hơn", description: "Mô tả mới" });
    playlist = useLibraryStore.getState().playlists.find((item) => item.id === id);
    expect(playlist?.name).toBe("Chill hơn");
    expect(playlist?.description).toBe("Mô tả mới");

    useLibraryStore.getState().deletePlaylist(id);
    expect(useLibraryStore.getState().playlists).toHaveLength(0);
  });

  it("adds, deduplicates, reorders and removes playlist tracks", () => {
    const id = useLibraryStore.getState().createPlaylist("Thử");
    if (!id) throw new Error("playlist was not created");

    expect(useLibraryStore.getState().addTrackToPlaylist(id, first)).toBe(true);
    expect(useLibraryStore.getState().addTrackToPlaylist(id, first)).toBe(false);
    expect(useLibraryStore.getState().addTrackToPlaylist(id, second)).toBe(true);

    let playlist = useLibraryStore.getState().playlists.find((item) => item.id === id);
    expect(playlist?.tracks.map((track) => track.id)).toEqual([first.id, second.id]);

    useLibraryStore.getState().reorderPlaylistTracks(id, 0, 1);
    playlist = useLibraryStore.getState().playlists.find((item) => item.id === id);
    expect(playlist?.tracks.map((track) => track.id)).toEqual([second.id, first.id]);

    useLibraryStore.getState().removeTrackFromPlaylist(id, second.id);
    playlist = useLibraryStore.getState().playlists.find((item) => item.id === id);
    expect(playlist?.tracks.map((track) => track.id)).toEqual([first.id]);
  });

  it("updates settings and clears the whole library", () => {
    useLibraryStore.getState().setSetting("autoplayNext", false);
    useLibraryStore.getState().setSetting("reduceMotion", true);
    useLibraryStore.getState().toggleFavorite(first);
    useLibraryStore.getState().recordHistory(first);

    expect(useLibraryStore.getState().settings).toEqual({ autoplayNext: false, reduceMotion: true });

    useLibraryStore.getState().clearLibrary();
    expect(useLibraryStore.getState().favorites).toHaveLength(0);
    expect(useLibraryStore.getState().history).toHaveLength(0);
    expect(useLibraryStore.getState().playlists).toHaveLength(0);
    expect(useLibraryStore.getState().settings.reduceMotion).toBe(true);
  });

  it("ignores empty playlist names", () => {
    expect(useLibraryStore.getState().createPlaylist("   ")).toBeNull();
    expect(useLibraryStore.getState().playlists).toHaveLength(0);
  });
});
