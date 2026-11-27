# Thế Giới Của Bé – trò chơi cho bé từ 2 tuổi

Web app tĩnh (HTML/CSS/JS thuần, không cần backend, không cần cài package). Cài được lên màn hình chính như một ứng dụng: chạy toàn màn hình và dùng được khi không có mạng.

## Dành cho bé
Trang chủ là một cảnh thế giới vẽ tay. Mỗi ngôi nhà là một khu chơi: chạm vào thì nhà nảy lên, giọng đọc tên khu rồi mở ra. Nhà chưa làm xong đang "ngủ" (zzz), chạm vào thì nghe "Sắp có rồi!".

| Ngôi nhà | Khu | Trạng thái |
|---|---|---|
| 🎨 Vẽ Vui | Bé Vẽ Vui (tô màu) | Có |
| 🧩 Ghép Hình | Bé Ghép Hình | Sắp có |
| 🦒 Vườn Thú | Bé Học Nhận Biết | Sắp có |
| 🎵 Âm Nhạc | Bé Khám Phá Âm Thanh | Sắp có |
| 📖 Kể Chuyện | Bé Nghe Kể Chuyện | Sắp có |

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
| `src/router.js` | Router theo hash: `#/` (trang chủ thế giới), `#/ve` (danh sách tranh), `#/ve/<id>` (tô một tranh). Mỗi khu tải lần đầu khi bé vào |
| `src/shared/` | Dùng chung cho mọi khu: âm thanh và nhạc, giọng đọc tiếng Việt, màn khen, lưu dữ liệu |
| `src/zones/hub/` | Trang chủ: cảnh thế giới SVG (bố cục ngang và dọc) và danh sách ngôi nhà trong `world.js` |
| `src/zones/ve/` | Khu tô màu (Bé Vẽ Vui) |
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

## Thêm hoặc sửa tranh
1. Bỏ file vào `assets/coloring/` (PNG nét đen trên nền trắng, hoặc SVG với các vùng có `data-region`).
2. Thêm một dòng vào `data/drawings.js` (`id` không trùng).
3. Chạy `python tools/dev_server.py`, mở http://localhost:5173/tools/build.html, bấm **Build** (thêm `?only=id1,id2` để build vài tranh).
4. Tăng `ART_VERSION` trong `sw.js` để máy đã cài tải lại tranh mới (sửa code thì tăng `APP_VERSION`).
5. Commit cả các file sinh ra trong `assets/pages`, `assets/thumbs`, `assets/icons`.

## Deploy
Import repository vào Vercel (hoặc GitHub Pages). Không cần build command, thư mục gốc là trang web.

## Lưu ý về hình ảnh
Tranh SVG trong `assets/coloring` là minh họa vector đơn giản tạo riêng cho dự án; nhóm "Nhân vật" là mascot nguyên bản. Nếu muốn đưa nhân vật có bản quyền vào bản phát hành công khai, cần có quyền sử dụng artwork phù hợp.
