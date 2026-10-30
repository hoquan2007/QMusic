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
    if (!provider.getAlbum) throw new ApiError("Nguồn nhạc không hỗ trợ album.", 404, "ALBUM_UNSUPPORTED");
    const album = await provider.getAlbum(id);
    if (!album) throw new ApiError("Không tìm thấy album.", 404, "ALBUM_NOT_FOUND");
    return jsonOk({ album }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
