import { enabledProviders, providerSummary } from "@/lib/providers";
import { jsonError, jsonOk } from "@/lib/api/route-utils";
import type { MusicGenre } from "@/types/music";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const active = enabledProviders();
    const settled = await Promise.allSettled(active.map((provider) => provider.getGenres()));
    const map = new Map<string, number>();
    for (const outcome of settled) {
      if (outcome.status !== "fulfilled") continue;
      for (const genre of outcome.value) {
        map.set(genre.name, Math.max(map.get(genre.name) ?? 0, genre.count));
      }
    }
    const genres: MusicGenre[] = [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return jsonOk({ genres, providers: providerSummary() }, 3600);
  } catch (error) {
    return jsonError(error);
  }
}
