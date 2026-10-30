import { getProvider } from "@/lib/providers";
import { ApiError } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string; id: string }> },
) {
  try {
    const { provider: providerId, id } = await params;
    const provider = getProvider(providerId);
    const playlist = await provider.getPlaylist(id);
    if (!playlist) throw new ApiError("Không tìm thấy danh sách phát.", 404, "PLAYLIST_NOT_FOUND");
    return jsonOk({ playlist }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
