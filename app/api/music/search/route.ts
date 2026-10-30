import { enabledProviders, isProviderId, searchEverything } from "@/lib/providers";
import { intParam, jsonError, jsonOk, textParam } from "@/lib/api/route-utils";
import type { MusicArtist, MusicPlaylist, MusicTrack } from "@/types/music";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

type SearchType = "all" | "tracks" | "artists" | "playlists";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = textParam(searchParams, "q", 120);
    const type = (searchParams.get("type") ?? "all") as SearchType;
    const offset = intParam(searchParams, "offset", 0, 0, 5000);
    const limit = intParam(searchParams, "limit", 24, 1, 50);
    const providerFilter = searchParams.get("provider") ?? "all";

    if (!query) {
      return jsonOk({ tracks: [], artists: [], albums: [], playlists: [], warnings: [] }, 0);
    }
    if (!["all", "tracks", "artists", "playlists"].includes(type)) {
      throw new ApiError("Loại tìm kiếm không hợp lệ.", 400, "INVALID_TYPE");
    }

    if (type === "all") {
      const { result, warnings } = await searchEverything(query, { offset, limit });
      return jsonOk({ ...result, warnings }, 30);
    }

    let active = enabledProviders();
    if (providerFilter !== "all") {
      if (!isProviderId(providerFilter)) {
        throw new ApiError("Nguồn nhạc không hợp lệ.", 400, "INVALID_PROVIDER");
      }
      active = active.filter((provider) => provider.id === providerFilter);
    }

    const settled = await Promise.allSettled(
      active.map((provider) => {
        if (type === "tracks") return provider.searchTracks(query, { offset, limit });
        if (type === "artists") return provider.searchArtists(query, { offset, limit });
        return provider.searchPlaylists(query, { offset, limit });
      }),
    );

    const warnings: string[] = [];
    const items: Array<MusicTrack | MusicArtist | MusicPlaylist> = [];
    settled.forEach((outcome, index) => {
      if (outcome.status === "fulfilled") items.push(...outcome.value);
      else {
        warnings.push(
          `${active[index]?.name ?? "Nguồn nhạc"}: ${outcome.reason instanceof Error ? outcome.reason.message : "không phản hồi"}`,
        );
      }
    });

    if (items.length === 0 && warnings.length > 0) {
      throw new ApiError(warnings[0] ?? "Không thể tìm kiếm lúc này.", 502, "SEARCH_FAILED");
    }

    if (type === "tracks") return jsonOk({ tracks: items, artists: [], albums: [], playlists: [], warnings }, 30);
    if (type === "artists") return jsonOk({ tracks: [], artists: items, albums: [], playlists: [], warnings }, 30);
    const playlists = items as MusicPlaylist[];
    return jsonOk(
      {
        tracks: [],
        artists: [],
        albums: playlists.filter((item) => item.isAlbum),
        playlists: playlists.filter((item) => !item.isAlbum),
        warnings,
      },
      30,
    );
  } catch (error) {
    return jsonError(error);
  }
}
