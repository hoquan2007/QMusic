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
    const artist = await provider.getArtist(id);
    if (!artist) throw new ApiError("Không tìm thấy nghệ sĩ.", 404, "ARTIST_NOT_FOUND");
    return jsonOk({ artist }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
