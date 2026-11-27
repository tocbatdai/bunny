# Thế Giới Của Bé – trò chơi cho bé từ 2 tuổi

Web app tĩnh (HTML/CSS/JS thuần, không cần backend, không cần cài package). Cài được lên màn hình chính như một ứng dụng: chạy toàn màn hình và dùng được khi không có mạng.

## Dành cho bé
Trang chủ là một cảnh thế giới vẽ tay. Mỗi ngôi nhà là một khu chơi: chạm vào thì nhà nảy lên, giọng đọc tên khu rồi mở ra. Nhà chưa làm xong đang "ngủ" (zzz), chạm vào thì nghe "Sắp có rồi!".

| Ngôi nhà | Khu | Trạng thái |
|---|---|---|
| 🎨 Vẽ Vui | Bé Vẽ Vui (tô màu) | Có |
| 🧩 Ghép Hình | Bé Ghép Hình | Có |
| 🦒 Vườn Thú | Bé Học Nhận Biết | Có |
| 🎵 Âm Nhạc | Bé Khám Phá Âm Thanh | Có |
| 📖 Kể Chuyện | Bé Nghe Kể Chuyện | Sắp có |

### Bé Ghép Hình
- Chọn số mảnh (2, 3, 4 hoặc 6) rồi chọn tranh. Tranh là các tranh tô màu, đã có màu: chỗ nào bé đã tô thì giữ màu của bé (tranh bé đã tô có dấu 🎨 và đứng đầu danh sách), còn lại app tự tô.
- Mảnh ghép nằm nhỏ bên cạnh (hoặc bên dưới) bảng. Kéo một mảnh thì nó to lên; thả gần đúng chỗ thì tự hút vào. Thả sai chỗ thì mảnh quay về, không bị tính sai.
- Ghép xong cả tranh thì có lời khen; nút 🔁 ghép lại tranh đó, ➡️ sang tranh kế.

### Bé Học Nhận Biết (Vườn Thú)
- 48 con vật vẽ màu: mèo, chó, gà, vịt, bò, lợn, voi, khỉ, ếch, cá, rùa, chim cánh cụt, cá chép, cá hề, cá nóc, cá vàng, sao biển, rồng, hổ, cá đuối, ngựa, dê, cừu, trâu, thỏ, sư tử, hươu cao cổ, gấu, bướm, cá heo, ngỗng, chuột, ngựa vằn, gấu trúc, cá sấu, rắn, hà mã, tê giác, chuột túi, vẹt, cú, công, ong, kiến, ốc sên, cá voi, bạch tuộc, cua. 36 con sau cũng có bản tranh tô màu (nhóm Động vật).
- Chạm con vật thì nó nhảy lên và giọng đọc tên kèm tiếng kêu ("Con mèo. Meo meo!").
- Nút 🎯 **Tìm con vật**: giọng hỏi "Con vịt đâu?". Lúc đầu 2 lựa chọn, đúng 3 lần thì 3 lựa chọn, đúng 8 lần thì 4. Chọn sai thì giọng nói tên con bé vừa chạm rồi hỏi lại. Nút 👂 nghe lại câu hỏi. Cứ đúng 5 lần thì có lời khen.

### Bé Khám Phá Âm Thanh (Âm Nhạc)
- 🎹 **Đàn piano**: 8 phím trắng to (Đô đến Đô cao, mỗi phím có dải màu ở mép) và 5 phím đen. Chạm nhiều ngón cùng lúc được, vuốt dọc bàn phím thì đàn kêu liên tiếp. Tiếng piano tổng hợp bằng Web Audio, không cần file âm thanh. Cầm máy dọc thì bàn phím xoay nằm dọc màn hình (nốt trầm ở trên).
  - 🎵 chơi tự do; ⭐ 🐑 🐮 là 3 bài (giai điệu dân gian đã hết bản quyền, chỉ có nhạc, không có lời): phím cần nhấn tiếp theo sáng màu và có ngôi sao, nhấn đúng thì bài đi tiếp, nhấn phím khác vẫn có tiếng. Nút 👂 nghe bài mẫu. Chơi hết bài thì có lời khen.
- 🎤 **Mic vui**: bạn thú trên sân khấu nhảy theo giọng bé, đèn sáng và sao bay khi bé hát to (chạm bạn thú để đổi bạn khác). Nút 🔴 thu 5 giây rồi nghe lại bằng 🙂 giọng bé, 🐭 giọng chuột, 🐻 giọng gấu, 🏔️ giọng vọng.
  - Cần cho phép dùng micro. Tiếng chỉ nằm trong máy, không gửi đi, không lưu lại; micro tắt ngay khi thu xong và khi rời màn hình.

### Bé Vẽ Vui
- Chạm vào tranh là mở màn tô toàn màn hình. Nút 🏠 to ở góc trái để về trang chủ (nút Back của điện thoại cũng được).
- 12 màu lớn, dễ chạm. Chạm một vùng là tô cả vùng, chạm lên nét vẽ thì tự chọn vùng gần nhất.
- Nút ↶ quay lại bước trước. Nút ↺ phải **giữ** khoảng 1 giây mới xóa hết màu, bấm nhầm không sao.
- Màu bé tô được lưu lại, mở lại tranh vẫn còn.
- Tô kín 100% các vùng thì có lời khen, pháo giấy và giọng đọc (giọng tiếng Việt của máy; máy không có giọng tiếng Việt thì chỉ hiện chữ, không đọc sai). Nút 🔊 bật/tắt toàn bộ âm thanh.
- Chỉ nhận một ngón tay mỗi lần, nên lòng bàn tay chạm vào màn hình không làm tô lung tung.

## Cài lên điện thoại/tablet
- Android (Chrome): mở trang → menu ⋮ → *Thêm vào màn hình chính* / *Cài đặt ứng dụng*.
- iPhone/iPad (Safari): nút Chia sẻ → *Thêm vào MH chính*.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `styles.css` | Giao diện |
| `app.js` | Khung app: nút dùng chung, router, offline |
| `src/router.js` | Router theo hash: `#/` (trang chủ thế giới), `#/ve` và `#/ve/<id>` (tô màu), `#/ghep-hinh` và `#/ghep-hinh/<id>` (ghép hình), `#/nhan-biet` và `#/nhan-biet/tim` (vườn thú), `#/am-nhac`, `#/am-nhac/dan`, `#/am-nhac/mic` (âm nhạc). Mỗi khu tải lần đầu khi bé vào |
| `src/shared/` | Dùng chung cho mọi khu: âm thanh và nhạc, giọng đọc tiếng Việt, màn khen, lưu dữ liệu |
| `src/zones/hub/` | Trang chủ: cảnh thế giới SVG (bố cục ngang và dọc) và danh sách ngôi nhà trong `world.js` |
| `src/zones/ve/` | Khu tô màu (Bé Vẽ Vui) |
| `src/zones/nhan-biet/` | Khu Vườn Thú. Hình con vật là SVG vẽ trong `animals.js` (thêm con mới: thêm một mục vào danh sách) |
| `src/zones/am-nhac/` | Khu Âm Nhạc: đàn piano và các bài trong `am-nhac.js`, Mic vui trong `mic.js` |
| `src/zones/ghep-hinh/` | Khu ghép hình. Tranh màu được vẽ ngay trên máy từ nét vẽ và file vùng tô (`src/shared/picture.js`) |
| `src/pages.js` | Định dạng file vùng tô (dùng chung cho app và công cụ build) |
| `data/drawings.js` | Danh sách tranh và danh mục |
| `assets/coloring/` | Tranh gốc (SVG/PNG) |
| `assets/pages/` | **Sinh tự động**: nét vẽ PNG đã làm sạch (tranh SVG được vẽ ra; tranh PNG được làm nét, bỏ khung cũ, thêm khung mới nếu bị cắt mép) + file vùng tô `.bin` |
| `assets/thumbs/` | **Sinh tự động**: ảnh nhỏ WebP cho trang chủ |
| `assets/icons/` | **Sinh tự động**: icon ứng dụng |
| `sw.js`, `manifest.webmanifest` | Chạy offline và cài như ứng dụng |
| `tools/` | Server dev và công cụ build tài nguyên |

### Vì sao mượt trên máy yếu
Các vùng tô của mỗi tranh được tính trước một lần trên máy tính (`tools/build.html`). Trên điện thoại, mở tranh chỉ cần tải nét vẽ và file vùng (~15 KB), còn mỗi lần chạm chỉ tô sẵn danh sách điểm ảnh của vùng đó và vẽ lại đúng ô chữ nhật của vùng. Trang chủ dùng ảnh nhỏ WebP (~10 KB/tranh, tổng 1,2 MB) thay vì ảnh gốc (11 MB).

## Chạy local
```
python tools/dev_server.py
```
Mở http://localhost:5173. Muốn thử trên điện thoại/tablet cùng Wi-Fi: chạy `python tools/dev_server.py 5173 lan` rồi mở `http://<IP máy tính>:5173` trên máy đó. Service worker không chạy trên localhost (để luôn thấy file mới); thêm `?sw=1` vào URL nếu muốn thử offline.

### Offline
Lần đầu mở app (có mạng), service worker lưu toàn bộ code của mọi khu và ảnh nhỏ của tất cả tranh. Sau đó không có mạng vẫn mở được trang chủ, danh sách tranh, Vườn Thú (hình con vật nằm trong code). Tô màu và ghép hình cần nét vẽ + file vùng của tranh: tranh nào đã mở ít nhất một lần thì dùng offline được, tranh chưa mở thì hiện 😢 cạnh tên.

### Thêm khu mới
1. Tạo `src/zones/<tên>/<tên>.js` export `show(rest)` và `leave()`, thêm phần HTML của khu vào `index.html` (để `hidden`).
2. Đăng ký trong `app.js`: `registerZone("<tên>", () => import(...))`.
3. Trong `src/zones/hub/world.js`, đặt `route: "<tên>"` cho ngôi nhà tương ứng (nhà có `route: null` là nhà đang "ngủ").
4. Thêm các file mới vào `SHELL_FILES` trong `sw.js` và tăng `APP_VERSION`.

## Thêm hoặc sửa tranh
1. Bỏ file vào `assets/coloring/` (PNG nét đen trên nền trắng, hoặc SVG với các vùng có `data-region`).
2. Thêm một dòng vào `data/drawings.js` (`id` không trùng).
3. Chạy `python tools/dev_server.py`, mở http://localhost:5173/tools/build.html, bấm **Build** (thêm `?only=id1,id2` để build vài tranh).
4. Tăng `ART_VERSION` trong `sw.js` để máy đã cài tải lại tranh mới (sửa code thì tăng `APP_VERSION`).
5. Commit cả các file sinh ra trong `assets/pages`, `assets/thumbs`, `assets/icons`.

## Deploy
Import repository vào Vercel (hoặc GitHub Pages). Không cần build command, thư mục gốc là trang web.

## Lưu ý về hình ảnh
Tranh SVG trong `assets/coloring` là minh họa vector đơn giản tạo riêng cho dự án; nhóm "Nhân vật" là mascot nguyên bản. Cảnh thế giới ở trang chủ (`world.js`) và 48 con vật ở Vườn Thú (`animals.js`) cũng là hình vẽ nguyên bản cho dự án. Nếu muốn đưa nhân vật có bản quyền vào bản phát hành công khai, cần có quyền sử dụng artwork phù hợp.
