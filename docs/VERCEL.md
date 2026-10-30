# Triển khai QMusic lên Vercel

QMusic dùng Next.js App Router và không cần cấu hình `vercel.json`. Vercel tự nhận diện framework, chạy `npm run build` và triển khai các route serverless cho `/api/*` cùng các trang động.

## 1. Chuẩn bị repository

```bash
npm ci
npm run check
```

`npm run check` lần lượt chạy typecheck, lint, unit test và production build. Chỉ push khi lệnh này đạt.

Các tệp bí mật như `.env.local` đã nằm trong `.gitignore` và không được đưa lên GitHub.

## 2. Import project vào Vercel

1. Mở [vercel.com/new](https://vercel.com/new).
2. Chọn **Import Git Repository** và chọn repo GitHub của QMusic.
3. Giữ các giá trị mặc định:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.`
   - **Install Command**: mặc định (Vercel dùng `npm ci` khi có `package-lock.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: mặc định `.next`
4. Chọn **Node.js 22.x** trong Project Settings nếu Vercel cho phép chọn phiên bản. Project yêu cầu Node `>=20.9.0`.

Không cần thêm `vercel.json`; mọi cấu hình bảo mật, cache và route đã nằm trong mã nguồn.

## 3. Biến môi trường

Chỉ các biến sau là cần thiết khi muốn bật thêm tính năng. Tất cả đều **không bắt buộc** để bản deploy cơ bản hoạt động.

| Biến | Môi trường | Ghi chú |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | URL công khai, ví dụ `https://qmusic.example.com`. Nếu bỏ trống, ứng dụng tự dùng domain production/preview của Vercel. |
| `AUDIUS_API_KEY` | Production / Preview | Khóa đọc Audius, chỉ dùng phía server. Có thể để trống. |
| `AUDIUS_APP_NAME` | Tất cả | Mặc định `QMusic`. |
| `JAMENDO_CLIENT_ID` | Production / Preview | Chỉ thêm khi đã đăng ký Jamendo. Thêm biến này sẽ bật provider Jamendo. |
| `LRCLIB_APP_ID` | Production / Preview | Tùy chọn, giúp tăng hạn mức LRCLIB. |

Lưu ý:

- Không thêm tiền tố `NEXT_PUBLIC_` cho khóa bí mật. Chỉ `NEXT_PUBLIC_SITE_URL` là công khai.
- Nếu đặt `NEXT_PUBLIC_SITE_URL` cho cả Preview, metadata của preview sẽ trỏ về domain production. Nên gán biến này riêng cho môi trường **Production**.
- Sau khi đổi biến môi trường, cần **Redeploy** để giá trị mới có hiệu lực.

## 4. Deploy và kiểm tra

Sau khi deploy, kiểm tra nhanh:

```text
GET /                       → trang chủ tải dữ liệu Audius
GET /api/music/home         → JSON 200, có trending
GET /api/music/search?q=lofi→ JSON 200
GET /api/lyrics?track=Blinding%20Lights&artist=The%20Weeknd&duration=202
                            → found=true, synced=true
```

Nếu Audius hoặc LRCLIB tạm thời trả `429` / `503`, giao diện sẽ hiển thị lỗi và nút thử lại. Đây là lỗi từ nguồn upstream, không phải lỗi build.

## 5. Giới hạn cần biết trên Vercel

- **Không có database**: thư viện cá nhân lưu trong `localStorage`; không đồng bộ giữa thiết bị.
- **Không lưu tệp nhạc**: QMusic phát trực tiếp từ Audius/Jamendo, không proxy hoặc host lại audio.
- **Serverless timeout**: các route gọi API ngoài có timeout và retry giới hạn. Trên gói Hobby, thời gian chạy function ngắn hơn gói trả phí; nếu upstream chậm kéo dài, route có thể bị cắt.
- **Rate limit**: QMusic không vượt giới hạn upstream. Nếu lượng truy cập tăng, nên thêm `AUDIUS_API_KEY` và `JAMENDO_CLIENT_ID` / `LRCLIB_APP_ID` để có hạn mức tốt hơn.
- **CSP**: `next.config.ts` chỉ cho phép kết nối tới Audius, Jamendo và LRCLIB. Nếu thêm provider mới, cập nhật `connect-src` và `media-src` tương ứng.

## 6. Custom domain

1. Vào **Project → Settings → Domains**, thêm domain và cấu hình DNS theo hướng dẫn của Vercel.
2. Đặt `NEXT_PUBLIC_SITE_URL=https://domain-cua-ban` cho môi trường Production.
3. Redeploy và kiểm tra lại `openGraph.url` / User-Agent trong log request của nguồn nhạc.

## 7. Rollback

Vercel giữ lịch sử deployment. Vào **Deployments**, chọn bản ổn định trước đó và bấm **Promote to Production** nếu cần quay lại nhanh mà không đổi mã nguồn.
