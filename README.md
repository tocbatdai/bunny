# Bé Vẽ Vui – Website tô màu cho bé

Website tĩnh dùng HTML, CSS, JavaScript thuần; không cần backend hoặc cài package.

## Chạy local
- Mở thư mục bằng VS Code.
- Dùng extension Live Server hoặc chạy `python3 -m http.server 8080`.
- Truy cập `http://localhost:8080`.

## Deploy
Có thể upload toàn bộ thư mục lên GitHub và bật GitHub Pages, hoặc import repository vào Vercel.

## Tính năng
- 60 tranh tô màu: 20 động vật, 20 thiên nhiên, 20 nhân vật gốc.
- Lọc danh mục và tìm kiếm.
- Chạm vào vùng kín để tô màu.
- Hoàn tác, tô lại và tải tranh PNG.
- Responsive cho điện thoại, tablet và desktop.

## Lưu ý về hình ảnh
Các tranh SVG trong `assets/coloring` là minh họa vector đơn giản được tạo riêng cho dự án. Nhóm "Nhân vật" là các mascot nguyên bản, không phải bản sao của Hello Kitty, Doraemon, Pokémon hoặc thương hiệu hoạt hình khác. Nếu muốn đưa nhân vật có bản quyền vào bản phát hành công khai, cần có quyền sử dụng artwork phù hợp.


## Bộ tranh minh họa mới
Đã bổ sung 15 tranh PNG riêng lẻ theo danh sách được duyệt: mèo nơ hồng, cún con, thỏ cà rốt, gấu mật ong, gấu trúc, cá voi, cá heo, voi con, sư tử, chim cánh cụt, công chúa tiên, phi hành gia, nàng tiên cá, kỳ lân cầu vồng và lâu đài cổ tích. Các tranh PNG dùng thuật toán flood-fill để tô màu theo vùng; vẫn hỗ trợ hoàn tác, làm lại và tải PNG.


## Bộ tranh bổ sung V4
- Bổ sung 40 tranh PNG mới, tổng cộng 115 tranh trong thư viện.
- Có thêm danh mục Giao thông.
- Tranh PNG dùng công cụ tô màu theo vùng (flood fill).


## V5 – đơn giản cho bé 2–3 tuổi
- Nhạc nền piano nhẹ được tạo bằng Web Audio API, không cần tải nhạc.
- Một nút bật/tắt nhạc lớn, dễ chạm.
- Khi bé tô được nhiều vùng, tự hiện lời khen, confetti và giọng đọc tiếng Việt nếu trình duyệt hỗ trợ.
- Bỏ tính năng lưu/tải tranh và nút hoàn tác; giữ bảng màu lớn và nút Tô lại.
- Âm thanh chỉ bắt đầu sau khi chạm chọn tranh để tuân thủ autoplay policy của trình duyệt.
