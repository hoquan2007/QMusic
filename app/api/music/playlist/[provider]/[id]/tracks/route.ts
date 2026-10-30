import { getProvider } from "@/lib/providers";
import { jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string; id: string }> },
) {
  try {
    const { provider: providerId, id } = await params;
    const provider = getProvider(providerId);
    const tracks = await provider.getPlaylistTracks(id);
    return jsonOk({ tracks }, 120);
  } catch (error) {
    return jsonError(error);
  }
}
