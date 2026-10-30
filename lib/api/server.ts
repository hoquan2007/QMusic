import { z } from "zod";
import { ApiError, normalizeError } from "@/lib/api/errors";
import { SITE_URL } from "@/lib/site";

export const USER_AGENT = `QMusic/1.0 (+${SITE_URL})`;

interface FetchJsonOptions<T> {
  schema?: z.ZodType<T>;
  timeoutMs?: number;
  revalidate?: number;
  headers?: Record<string, string>;
  retries?: number;
}

function readRetryAfter(response: Response): number | undefined {
  const raw = response.headers.get("retry-after");
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(raw);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * HTTP client phía server: timeout, retry có giới hạn, exponential backoff,
 * tôn trọng Retry-After và validate JSON bằng Zod trước khi trả về.
 */
export async function fetchJson<T>(url: string, options: FetchJsonOptions<T> = {}): Promise<T> {
  const { schema, timeoutMs = 12_000, revalidate = 120, headers, retries = 2 } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
          ...headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
        next: revalidate > 0 ? { revalidate } : { revalidate: 0 },
      });
    } catch (error) {
      if (attempt < retries) {
        await sleep(350 * 2 ** attempt);
        continue;
      }
      throw normalizeError(error);
    }

    if (!response.ok) {
      const retryAfter = readRetryAfter(response);
      if (RETRYABLE_STATUS.has(response.status) && attempt < retries) {
        const delay = retryAfter ?? Math.min(4000, 350 * 2 ** attempt);
        await sleep(delay + Math.floor(Math.random() * 150));
        continue;
      }
      let message = `Nguồn nhạc trả về lỗi ${response.status}.`;
      if (response.status === 429) message = "Đã chạm giới hạn tần suất của nguồn nhạc. Vui lòng thử lại sau.";
      if (response.status === 404) message = "Không tìm thấy nội dung.";
      throw new ApiError(message, response.status, "UPSTREAM_HTTP_ERROR", retryAfter);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new ApiError("Nguồn nhạc trả về dữ liệu không hợp lệ.", 502, "INVALID_JSON");
    }

    if (!schema) return json as T;

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError("Dữ liệu từ nguồn nhạc không đúng định dạng.", 502, "INVALID_RESPONSE");
    }
    return parsed.data;
  }

  throw new ApiError("Không thể kết nối nguồn nhạc.", 502, "UPSTREAM_UNAVAILABLE");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}
