import { ApiError } from "@/lib/api/errors";
import { intParam, jsonError, jsonOk, textParam } from "@/lib/api/route-utils";
import { youtubeProvider } from "@/lib/providers/youtube";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!youtubeProvider.enabled) {
      throw new ApiError(
        "Tính năng tìm kiếm video YouTube chưa được cấu hình trên máy chủ.",
        503,
        "YOUTUBE_DISABLED",
      );
    }

    const { searchParams } = new URL(request.url);
    const query = textParam(searchParams, "q", 120);
    const limit = intParam(searchParams, "limit", 24, 1, 50);
    const offset = intParam(searchParams, "offset", 0, 0, 50);

    const videos = query
      ? await youtubeProvider.searchTracks(query, { limit, offset })
      : await youtubeProvider.getTrendingTracks({ limit, offset });

    return jsonOk({ videos, warnings: [] }, query ? 60 : 300);
  } catch (error) {
    return jsonError(error);
  }
}
