function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

/**
 * URL công khai của ứng dụng.
 *
 * Ưu tiên biến tường minh, sau đó tự nhận domain production/preview của Vercel
 * để lần deploy đầu tiên không ghi sai địa chỉ localhost vào metadata/User-Agent.
 */
export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000",
);
