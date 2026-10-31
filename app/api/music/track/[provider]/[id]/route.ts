import { getProviderForRead } from "@/lib/providers";
import { ApiError } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string; id: string }> },
) {
  try {
    const { provider: providerId, id } = await params;
    const provider = getProviderForRead(providerId);
    const track = await provider.getTrack(id);
    if (!track) throw new ApiError("Không tìm thấy bài hát.", 404, "TRACK_NOT_FOUND");
    return jsonOk({ track }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
