import { getProvider } from "@/lib/providers";
import { jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getProvider("itunes");
    const [tracks, albums] = await Promise.all([
      provider.getTrendingTracks({ limit: 24 }),
      provider.getAlbums({ limit: 10 }),
    ]);
    return jsonOk({ tracks, albums }, 300);
  } catch (error) {
    return jsonError(error);
  }
}
