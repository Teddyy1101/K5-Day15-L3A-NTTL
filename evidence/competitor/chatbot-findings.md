# Chatbot chung lập lịch Hà Nội — đối chiếu với danh mục của nhóm (cho `spec.md` §3)

- **Cách làm:** hỏi thẳng model `gpt-5-mini` 5 câu lập lịch như khách hỏi một chatbot, **không** đưa danh mục, **không** kiểm bằng code (`evidence/competitor/chatbot_test.py`). Nguyên văn: `evidence/competitor/chatbot-outputs.md` (chạy 27/11/2026 21:24).
- **Đối chiếu với:** `data/places_hanoi.json` (giờ mở cửa, ngày đóng cửa, giá vé nhóm đã đối chiếu 27/11/2026 — xem `data/DATA_CARD.md`). Nếu dữ liệu nhóm sai thì kết luận dưới đây sai theo.
- **Giới hạn:** n = 5, chỉ là **ví dụ**, không phải tỉ lệ. Gọi qua API, không phải ứng dụng ChatGPT (ứng dụng có thể tra web). Chấm: Nguyễn Huy Thứ (cùng Claude Code), cần người thứ hai đọc lại.

| Câu | Hỏi | Chatbot làm gì | So với danh mục nhóm |
|---|---|---|---|
| C1 | 1 ngày **thứ Hai**, lịch sử + bảo tàng, 500k | Xếp Hỏa Lò, Hoàng Thành; buổi chiều "Bảo tàng Lịch sử Quốc gia … tùy mở cửa"; tổng 365–460k | Bảo tàng Lịch sử QG **đóng thứ Hai** (`HN07`) — chatbot chỉ nhắc chung "kiểm tra giờ mở". Giá vé thấp hơn dữ liệu: Hỏa Lò "30–40k" (dữ liệu 50k), Hoàng Thành "30–40k" (dữ liệu 100k) |
| C2 | 1 ngày **thứ Sáu**, muốn vào Lăng Bác | Phương án A xếp **Lăng Bác 07:30–08:30 thứ Sáu**; nhắc "có thể đóng/điều chỉnh vào thứ Sáu tuỳ tuần" | Lăng Bác **đóng thứ Hai và thứ Sáu** (`HN01`) → lịch chính rơi vào ngày đóng cửa |
| C3 | 2 ngày thứ Hai–thứ Ba, 2 người, 1,5 triệu | Hỏi lại ngân sách có gồm chỗ ở không, chưa lập lịch | Hỏi lại hợp lý (không chấm sai) |
| C4 | 1 ngày thứ Năm, chỉ rảnh **17h–22h**, Văn Miếu + Hoàng Thành | Nói đúng: cả hai đóng khoảng 17:00, không vào trong được; đưa phương án buổi tối | **Đúng** về giờ. Giá "30–50k / nơi" thấp hơn dữ liệu (Văn Miếu 70k, Hoàng Thành 100k) |
| C5 | 1 ngày thứ Tư, **bún chả Hàng Quạt buổi tối**, **phở Bát Đàn buổi chiều**, 300k | Xếp phở Bát Đàn **13:00–14:00**, bún chả Hàng Quạt **19:00** ("tới sớm lúc mở cửa 19:00"); tổng đúng 300k | Phở Bát Đàn chỉ bán **06:00–10:00** (`HN12`), bún chả Hàng Quạt chỉ bán **10:00–14:00** (`HN11`) → **2 điểm ngoài giờ**, và giờ mở "19:00" không có nguồn |

**Đếm (n nhỏ, không ghi %):** trong 4 câu chatbot đưa lịch (C1, C2, C4, C5):
- **2/4** lịch xếp điểm vào ngày / giờ đóng cửa theo dữ liệu nhóm (C2, C5); 1/4 nhắc bảo tàng "tùy mở cửa" nhưng vẫn để trong lịch (C1); 1/4 đúng (C4).
- **2/4** đưa giá vé thấp hơn dữ liệu nhóm ở các điểm có vé (C1, C4).
- 0/4 tính thời gian di chuyển giữa các điểm bằng số cụ thể từ vị trí; tổng tiền là ước lượng theo khoảng.

**Rút ra cho thiết kế:** chatbot chung hiểu câu tự do tốt và biết hỏi lại (C3), nhưng giờ mở cửa / ngày đóng cửa / giá không gắn với nguồn nào nên có thể sai mà người dùng không biết — đúng chỗ bản chạy thử của nhóm để **code** kiểm bằng danh mục (`kiem_lich_trinh`) thay vì tin lời model.
