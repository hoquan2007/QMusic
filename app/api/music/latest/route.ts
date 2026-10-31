import { audioProviders } from "@/lib/providers";
import { ApiError } from "@/lib/api/errors";
import { intParam, jsonError, jsonOk, textParam } from "@/lib/api/route-utils";
import type { MusicTrack } from "@/types/music";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = textParam(searchParams, "genre", 80) || undefined;
    const offset = intParam(searchParams, "offset", 0, 0, 1000);
    const limit = intParam(searchParams, "limit", 24, 1, 50);

    const settled = await Promise.allSettled(
      audioProviders().map((provider) => provider.getLatestTracks({ limit, offset, genre })),
    );
    const tracks: MusicTrack[] = [];
    settled.forEach((outcome) => {
      if (outcome.status === "fulfilled") tracks.push(...outcome.value);
    });
    if (tracks.length === 0) throw new ApiError("Không thể tải nhạc mới.", 502, "LATEST_FAILED");
    return jsonOk({ tracks }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
