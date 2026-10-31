import { audioProviders, isProviderId } from "@/lib/providers";
import { ApiError } from "@/lib/api/errors";
import { intParam, jsonError, jsonOk, textParam } from "@/lib/api/route-utils";
import type { MusicTrack } from "@/types/music";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("provider") ?? "all";
    const genre = textParam(searchParams, "genre", 80) || undefined;
    const timeParam = searchParams.get("time") ?? "week";
    const time = ["week", "month", "year", "allTime"].includes(timeParam)
      ? (timeParam as "week" | "month" | "year" | "allTime")
      : "week";
    const offset = intParam(searchParams, "offset", 0, 0, 1000);
    const limit = intParam(searchParams, "limit", 24, 1, 50);

    let active = audioProviders();
    if (providerId !== "all") {
      if (!isProviderId(providerId)) throw new ApiError("Nguồn nhạc không hợp lệ.", 400, "INVALID_PROVIDER");
      active = active.filter((provider) => provider.id === providerId);
    }

    const settled = await Promise.allSettled(
      active.map((provider) => provider.getTrendingTracks({ limit, offset, genre, time })),
    );
    const tracks: MusicTrack[] = [];
    const warnings: string[] = [];
    settled.forEach((outcome, index) => {
      if (outcome.status === "fulfilled") tracks.push(...outcome.value);
      else warnings.push(`${active[index]?.name ?? "Nguồn nhạc"}: nguồn tạm thời không phản hồi`);
    });

    if (tracks.length === 0 && warnings.length > 0) {
      throw new ApiError(warnings[0] ?? "Không thể tải danh sách thịnh hành.", 502, "TRENDING_FAILED");
    }

    return jsonOk({ tracks, warnings }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
