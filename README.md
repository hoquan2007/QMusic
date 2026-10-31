# QMusic

QMusic là ứng dụng web nghe nhạc hiện đại, xây dựng bằng Next.js App Router và React. Ứng dụng phát nhạc trực tiếp từ các nguồn âm nhạc mở qua API chính thức, hiển thị lời bài hát đồng bộ từ LRCLIB và lưu thư viện cá nhân ngay trên thiết bị — không cần tài khoản, không scrape, không lưu trữ lại tệp âm thanh.

Bên cạnh kho nhạc mở Audius, QMusic có trang **Nhạc Việt** lấy bảng xếp hạng chính thức từ iTunes Việt Nam. Các bài này phát dưới dạng đoạn nghe thử quảng bá 30 giây do Apple cung cấp, luôn có nhãn rõ ràng và liên kết tới Apple Music để nghe bản đầy đủ.

QMusic cũng có **chế độ video YouTube**: xem MV chính thức trong khung hình bằng trình phát nhúng của YouTube, giữ nguyên quảng cáo, không tách âm thanh và không phát video trong nền. Trang xem trực tiếp hoạt động không cần API key; tìm kiếm và bảng xếp hạng video cần `YOUTUBE_API_KEY` phía máy chủ.

Giao diện tiếng Việt, tối ưu cho desktop, tablet và mobile; chế độ tối là mặc định và chế độ sáng được hỗ trợ đầy đủ.

## Tính năng

- **Khám phá nhạc thật**: trang chủ, nhạc thịnh hành, nhạc mới, thể loại, tìm kiếm bài hát / nghệ sĩ / album / playlist.
- **Nhạc Việt**: bảng xếp hạng iTunes Việt Nam tại `/vietnamese`, kèm album nổi bật, nhãn “Nghe thử 30s” và liên kết Apple Music trên mọi bề mặt phát nhạc.
- **Video YouTube**: trang `/videos` để xem video thịnh hành, tìm MV và dán liên kết; trang `/track/youtube/[id]` dùng iframe chính thức, giữ nguyên quảng cáo và hiển thị đầy đủ khung hình. Video không đi vào hàng đợi audio.
- **Trình phát toàn cục**: phát, tạm dừng, chuyển bài, tua, âm lượng, tắt tiếng, phát ngẫu nhiên, lặp lại (tắt / toàn bộ / một bài), hàng đợi, trình phát toàn màn hình.
- **Không gián đoạn khi điều hướng**: một thẻ audio duy nhất, trạng thái trình phát được giữ xuyên suốt các trang.
- **Media Session & bàn phím**: tích hợp Media Session API và phím tắt điều khiển phát nhạc.
- **Thư viện cá nhân**: bài hát yêu thích, lịch sử nghe, playlist tự tạo (tạo, đổi tên, xóa, thêm / xóa / sắp xếp bài hát). Dữ liệu tồn tại sau khi tải lại trang.
- **Lời bài hát đồng bộ**: tải từ LRCLIB, làm nổi bật câu đang phát, tự cuộn và cho phép bấm để tua. Bài không có lời vẫn phát bình thường.
- **Chi tiết nội dung**: trang bài hát, nghệ sĩ, album, playlist, thể loại và thư viện.
- **Tìm kiếm an toàn**: debounce 350 ms, đồng bộ từ khóa lên URL, phân trang, xử lý loading / rỗng / lỗi và tránh race condition.
- **Giao diện**: dark mode mặc định, light mode đầy đủ, tùy chọn giảm chuyển động, bố cục responsive, trạng thái lỗi và retry rõ ràng.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict |
| Giao diện | Tailwind CSS 4, Radix UI, Lucide, Sonner |
| Dữ liệu | TanStack Query, Zustand (persist), Zod |
| Trình phát | HTMLAudioElement singleton, Media Session API |
| Kiểm thử | Vitest + Testing Library, Playwright |
| Nguồn nhạc | Audius (mặc định), iTunes Việt Nam (nhạc Việt, nghe thử), YouTube (video, tùy chọn), Jamendo (tùy chọn), LRCLIB (lời bài hát) |

## Bắt đầu

Yêu cầu: Node.js 20.9 trở lên (khuyến nghị Node 22) và npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Trên Windows PowerShell, dùng `npm.cmd` nếu chính sách thực thi chặn `npm.ps1`:

```powershell
npm.cmd install
npm.cmd run dev
```

### Biến môi trường

Sao chép `.env.example` thành `.env.local`. Không commit `.env.local` hoặc bất kỳ khóa bí mật nào.

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `AUDIUS_API_KEY` | Không | Khóa đọc Audius (chỉ dùng phía server). API đọc công khai vẫn hoạt động khi để trống. |
| `AUDIUS_APP_NAME` | Không | Tên ứng dụng gửi tới Audius, mặc định `QMusic`. |
| `JAMENDO_CLIENT_ID` | Không | Bật provider Jamendo. Provider chỉ hoạt động khi biến này có giá trị. |
| `ITUNES_VN_ENABLED` | Không | Bật mặc định. Đặt `false` để tắt toàn bộ nội dung iTunes Việt Nam và đoạn nghe thử 30 giây. |
| `YOUTUBE_API_KEY` | Không | Bật tìm kiếm và video thịnh hành qua YouTube Data API v3. Chỉ dùng phía server. Trang xem video trực tiếp vẫn chạy khi để trống. |
| `LRCLIB_APP_ID` | Không | Tăng hạn mức khi gọi LRCLIB. |
| `NEXT_PUBLIC_SITE_URL` | Không | URL công khai dùng cho metadata và User-Agent. Trên Vercel, nếu để trống sẽ tự dùng domain production/preview. |

## Lệnh

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển. |
| `npm run build` | Build production. |
| `npm run start` | Chạy bản production (mặc định cổng 3000). |
| `npm run typecheck` | Kiểm tra TypeScript strict. |
| `npm run lint` | Chạy ESLint. |
| `npm run test` | Chạy unit / component test bằng Vitest. |
| `npm run test:e2e` | Chạy Playwright; cần build trước. |
| `npm run check` | Lần lượt chạy typecheck, lint, test, build. |

Playwright khởi động server production tại `http://127.0.0.1:3100`. Nếu đã có server khác dùng cổng này, hãy dừng nó trước để tránh kiểm thử nhầm bản build cũ.

## Triển khai Vercel

Project đã sẵn sàng để import trực tiếp vào Vercel, không cần `vercel.json`. Vercel tự nhận diện Next.js, chạy `npm run build` và triển khai các route API dưới dạng serverless functions.

1. Import repository vào [vercel.com/new](https://vercel.com/new).
2. Giữ Framework Preset **Next.js**, Root Directory `.`, Build Command `npm run build`.
3. Chọn Node.js **22.x** (project yêu cầu `>=20.9.0`; `.nvmrc` đã ghi 22).
4. Thêm biến môi trường nếu cần. Chỉ `NEXT_PUBLIC_SITE_URL` là công khai; không đặt khóa bí mật sau tiền tố `NEXT_PUBLIC_`.
5. Deploy và kiểm tra `/api/music/home`, `/api/music/vietnamese`, `/api/music/search?q=lofi`, `/videos`, `/track/youtube/dQw4w9WgXcQ`, `/api/lyrics`.

Nếu bỏ trống `NEXT_PUBLIC_SITE_URL`, ứng dụng tự dùng domain Vercel production/preview. Sau khi gắn custom domain, nên đặt biến này cho môi trường Production rồi redeploy.

Hướng dẫn chi tiết, biến môi trường và giới hạn serverless: [`docs/VERCEL.md`](docs/VERCEL.md). Workflow GitHub Actions tại `.github/workflows/ci.yml` chạy typecheck, lint, unit test và build trên mỗi lần push / pull request.

## Cấu trúc chính

```text
app/                     Route, metadata, API handlers
  api/music/…            Proxy nội bộ tới provider, validate và cache
  api/lyrics/            Proxy lời bài hát LRCLIB
components/              UI, layout, player, music cards
features/                Màn hình theo domain (home, search, library, settings…)
lib/providers/           Adapter Audius, iTunes Việt Nam, YouTube, Jamendo, LRCLIB
lib/youtube.ts           Nhận diện liên kết, duration và URL nhúng YouTube
lib/player/              Audio engine singleton
lib/api/                 HTTP client server-side, lỗi, rate-limit handling
stores/                  Zustand player + library (localStorage)
tests/                   Vitest / Testing Library
e2e/                     Playwright smoke & playback
```

### Các trang

- `/` — trang chủ, nhạc thịnh hành, playlist và album nổi bật
- `/vietnamese` — bảng xếp hạng nhạc Việt chính thức từ iTunes
- `/videos` — video thịnh hành, tìm kiếm MV và dán liên kết YouTube
- `/discover`, `/latest`, `/genre/[genre]` — khám phá, nhạc mới, thể loại
- `/search?q=…` — tìm kiếm hợp nhất; tab Video khi YouTube được cấu hình
- `/track/[provider]/[id]`, `/artist/[provider]/[id]`, `/playlist/[provider]/[id]`, `/album/[provider]/[id]`
- `/track/youtube/[id]` — trang xem video với trình phát nhúng chính thức
- `/library`, `/library/liked`, `/library/history`, `/library/playlists`, `/library/playlist/[id]`
- `/settings`

## API và nguồn dữ liệu

QMusic chỉ gọi các API công khai, hợp pháp và không cố vượt qua giới hạn của nhà cung cấp:

- **Audius** — `https://api.audius.co/v1`: trending, tìm kiếm, nghệ sĩ, playlist, album, thể loại và stream. Stream được chuẩn hóa thành URL ổn định `…/tracks/{id}/stream?app_name=QMusic` thay vì lưu URL có chữ ký hết hạn.
- **Jamendo** — `https://api.jamendo.com/v3.0`: chỉ được bật khi có `JAMENDO_CLIENT_ID`. Nhạc Jamendo phát từ URL audio do API trả về.
- **iTunes / Apple Music Việt Nam** — `https://itunes.apple.com` với `country=vn` và Apple Marketing RSS (`rss.marketingtools.apple.com`) cho bảng xếp hạng. Chỉ dùng dữ liệu quảng bá chính thức: mỗi bài phát đoạn nghe thử 30 giây, có nhãn “Nghe thử”, attribution “cung cấp bởi iTunes” và liên kết Apple Music ở gần. QMusic không tải xuống, lưu trữ, ghi lại hay đồng bộ tệp preview. Apple giới hạn khoảng 20 request/phút; provider cache 60 giây cho tìm kiếm và 300 giây cho lookup / bảng xếp hạng.
- **YouTube** — YouTube Data API v3 (`www.googleapis.com/youtube/v3`) khi có `YOUTUBE_API_KEY`, và oEmbed chính thức (`www.youtube.com/oembed`) cho trang xem trực tiếp không cần key. Video luôn phát qua iframe `youtube.com/embed`, giữ nguyên quảng cáo, không tách âm thanh, không tải xuống. `search.list` tốn 100 đơn vị quota/lần, `videos.list` tốn 1 đơn vị; kết quả được cache 5–15 phút và không tham gia tìm kiếm audio hợp nhất.
- **LRCLIB** — `https://lrclib.net`: tra cứu lời đồng bộ; tự thử lại khi gặp `429` / `503`, tôn trọng `Retry-After` và trả về trạng thái “không có lời” thay vì làm hỏng trình phát.

Các route `/api/music/*` và `/api/lyrics` chạy phía server, validate dữ liệu bằng Zod, giới hạn tham số, cache có kiểm soát và không nhận URL tùy ý từ client. Không có proxy mở.

### Quyền riêng tư và dữ liệu

- Không có đăng nhập, không gửi thư viện cá nhân lên máy chủ.
- Yêu thích, lịch sử, playlist và tùy chọn giao diện nằm trong `localStorage` của trình duyệt (`qmusic-library`, `qmusic-player`).
- Xóa toàn bộ thư viện trong **Cài đặt** sẽ xóa dữ liệu thư viện cục bộ nhưng giữ tùy chọn giao diện.

## Kiểm thử và trạng thái xác minh

Đã chạy ngày **31/10/2026** trên Windows:

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run typecheck` | Đạt |
| `npm run lint` | Đạt, không lỗi / cảnh báo |
| `npm run test` | Đạt 10 tệp, 51 test |
| `npm run build` | Đạt (Next.js 16, Turbopack) |
| `npm run test:e2e` | Đạt 11/11 test Playwright |

Các hành vi đã được xác minh thực tế:

- Audius trả dữ liệu thật; stream trả `audio/mpeg` và phát được trong Chromium.
- Audio thực sự chuyển sang trạng thái phát, `currentTime` tăng và tiếp tục tăng sau khi điều hướng sang trang khác.
- Tạm dừng / phát lại, tua, tắt / bật tiếng, phát ngẫu nhiên, lặp lại, hàng đợi, trình phát toàn màn hình và chuyển bài hoạt động.
- Yêu thích và playlist tự tạo tồn tại sau khi tải lại trang.
- Tìm kiếm cập nhật URL sau debounce và hiển thị kết quả thật; mỗi nguồn trả tối đa 24 kết quả mỗi loại.
- LRCLIB trả lời bài hát thật: `/api/lyrics?track=Blinding%20Lights&artist=The%20Weeknd&duration=202` trả `found=true`, `synced=true`, 39 dòng.
- Giao diện mobile không tràn ngang; chuyển theme và giảm chuyển động được lưu lại.
- iTunes Việt Nam trả dữ liệu thật: `/api/music/vietnamese` trả 24 bài hát và 10 album; `/api/music/search?q=son%20tung` trả 24 bài iTunes có `previewUrl`, `isPreview=true`, `previewSeconds=30` và `storeUrl` Apple Music.
- `/vietnamese` phát đoạn preview thật từ `audio-ssl.itunes.apple.com` trong Chromium, có nhãn “Nghe thử 30s”, không lỗi CSP và liên kết Apple Music hiển thị.
- Trang chủ có mục **Nhạc Việt** (12 bài, 8 album) và liên kết tới `/vietnamese`.
- `/videos` mở được khi chưa có API key, hiển thị hướng dẫn cấu hình và cho phép dán liên kết YouTube; `/track/youtube/dQw4w9WgXcQ` tải metadata thật qua oEmbed và nhúng iframe `youtube.com/embed` với tiêu đề chính thức, không lỗi CSP và không tạo thẻ `Audio` nào trong trang.
- `/api/music/videos` trả `503 YOUTUBE_DISABLED` khi thiếu key (đúng thiết kế), và tìm kiếm audio hợp nhất không còn trả kết quả YouTube.

### Chưa xác minh / giới hạn

- **Jamendo**: adapter đã triển khai nhưng chưa thể kiểm thử runtime vì môi trường hiện tại không có `JAMENDO_CLIENT_ID`. Khi chưa cấu hình, provider bị tắt và UI ghi rõ trạng thái.
- **iTunes chỉ có đoạn nghe thử**: Apple không cấp stream đầy đủ qua iTunes Search API. Mọi bài iTunes trong QMusic chỉ phát 30 giây; nút và liên kết “Apple Music” mở bản đầy đủ. Đây là giới hạn có chủ đích, không phải lỗi.
- **Hạn mức iTunes**: khoảng 20 request/phút cho mỗi IP. QMusic cache kết quả và xử lý lỗi upstream, nhưng lưu lượng rất cao có thể nhận `429` / `503` tạm thời.
- **YouTube cần API key để tìm kiếm**: tìm kiếm và bảng xếp hạng video bị tắt khi thiếu `YOUTUBE_API_KEY`; môi trường kiểm thử hiện tại không có key nên luồng `search.list` / `videos.list` (thịnh hành, tìm kiếm, video liên quan) chưa được xác minh trực tiếp. Luồng không cần key (oEmbed + iframe) đã được kiểm thử end-to-end. Mỗi lần tìm kiếm tốn 100 đơn vị quota mặc định (~10.000/ngày); QMusic cache kết quả 5–15 phút nhưng lưu lượng cao vẫn có thể chạm hạn mức.
- **Tài khoản / đồng bộ đa thiết bị**: chưa triển khai. Ứng dụng hiện là guest-only với `localStorage`; không có Supabase auth, database hay RLS.
- **Độ phủ lời bài hát**: LRCLIB là cơ sở dữ liệu cộng đồng, không phải mọi bản nhạc Audius / Jamendo đều có lời. QMusic hiển thị trạng thái không có lời và không chặn phát nhạc.
- **Phụ thuộc upstream**: Audius và LRCLIB có thể trả `429`, `503`, timeout hoặc nội dung không còn tồn tại. UI có thông báo lỗi và nút thử lại, nhưng không thể bảo đảm mọi bài luôn phát được.
- **Chất lượng nguồn**: bitrate, khả năng tua và tính ổn định phụ thuộc vào tệp gốc do nghệ sĩ / nền tảng cung cấp.

## Giấy phép và bản quyền nội dung

Mã nguồn trong repository này chưa kèm tệp giấy phép riêng. Âm nhạc, ảnh bìa và lời bài hát thuộc quyền của nghệ sĩ và nhà cung cấp tương ứng; QMusic chỉ hiển thị và phát trực tiếp từ nguồn gốc, không phân phối lại nội dung.

Riêng nội dung từ iTunes: đoạn nghe thử, ảnh bìa và metadata được Apple cung cấp cho mục đích quảng bá sản phẩm trên cửa hàng. QMusic hiển thị chúng gần liên kết Apple Music, ghi rõ nguồn “cung cấp bởi iTunes”, chỉ phát trực tuyến và không tải xuống, lưu trữ, ghi lại hay đồng bộ. Việc sử dụng này tuân theo điều khoản của iTunes Search API.

Nội dung YouTube được nhúng bằng trình phát chính thức và tuân theo Điều khoản dịch vụ cùng Chính sách dành cho nhà phát triển của YouTube. QMusic không chặn quảng cáo, không tách âm thanh, không tải xuống, không phát nền và không tính phí xem video. Việc dùng YouTube Data API tuân theo quota và chính sách của Google.
