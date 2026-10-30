import { getProvider } from "@/lib/providers";
import { intParam, jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string; id: string }> },
) {
  try {
    const { provider: providerId, id } = await params;
    const { searchParams } = new URL(request.url);
    const offset = intParam(searchParams, "offset", 0, 0, 1000);
    const limit = intParam(searchParams, "limit", 30, 1, 50);
    const provider = getProvider(providerId);
    const tracks = await provider.getArtistTracks(id, { offset, limit });
    return jsonOk({ tracks }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
