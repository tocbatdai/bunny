# Bé Vẽ Vui – tô màu cho bé từ 2 tuổi

Web app tĩnh (HTML/CSS/JS thuần, không cần backend, không cần cài package). Cài được lên màn hình chính như một ứng dụng: chạy toàn màn hình và dùng được khi không có mạng.

## Dành cho bé
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
| `index.html`, `styles.css`, `app.js` | Giao diện và logic |
| `src/pages.js` | Định dạng file vùng tô (dùng chung cho app và công cụ build) |
| `data/drawings.js` | Danh sách tranh và danh mục |
| `assets/coloring/` | Tranh gốc (SVG/PNG) |
| `assets/pages/` | **Sinh tự động**: nét vẽ PNG cho tranh SVG + file vùng tô `.bin` |
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
