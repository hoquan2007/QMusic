import { NextResponse } from "next/server";
import { normalizeError } from "@/lib/api/errors";

export function jsonOk(data: unknown, maxAge = 60) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 3}`,
    },
  });
}

export function jsonError(error: unknown) {
  const normalized = normalizeError(error);
  return NextResponse.json(
    {
      error: {
        message: normalized.message,
        code: normalized.code,
      },
    },
    {
      status: normalized.status,
      headers: normalized.retryAfter
        ? { "Retry-After": String(Math.ceil(normalized.retryAfter / 1000)) }
        : undefined,
    },
  );
}

export function intParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const raw = searchParams.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export function textParam(searchParams: URLSearchParams, key: string, max = 160) {
  return (searchParams.get(key) ?? "").trim().slice(0, max);
}
