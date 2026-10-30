import { getHomeData } from "@/lib/providers";
import { jsonError, jsonOk } from "@/lib/api/route-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomeData();
    return jsonOk(data, 120);
  } catch (error) {
    return jsonError(error);
  }
}
