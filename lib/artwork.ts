import type { RemoteImage } from "@/types/music";

/**
 * Audius trả về URL gốc + danh sách mirror host. Khi ảnh lỗi, thay host gốc
 * bằng từng mirror và giữ nguyên path/query để thử lại.
 */
export function imageCandidates(image?: RemoteImage | null): string[] {
  if (!image?.url) return [];
  const urls = [image.url];
  for (const mirror of image.mirrors) {
    try {
      const source = new URL(image.url);
      const target = new URL(mirror);
      target.pathname = source.pathname;
      target.search = source.search;
      urls.push(target.toString());
    } catch {
      // Mirror không hợp lệ: bỏ qua, không làm hỏng ảnh gốc.
    }
  }
  return [...new Set(urls)];
}
