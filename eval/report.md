# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**

## 1. Kết quả

Bộ câu thử: `eval/benchmark.csv` — **30 câu** (`B01–B20` đúng bản chốt CP2, `B21–B30` thêm sau CP2 từ phỏng vấn P1–P3). Model: **`gpt-5-mini`**. Chuẩn "đạt" (`spec.md` §7): ≥ 80% câu qua + 100% `tu_choi` + 0 lịch sai giờ / đóng cửa / chồng giờ / ngoài danh mục + 0 lịch vượt ngân sách.

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | Điều kiện cứng (code kiểm) | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-232730` | **24/30** | **80%** | 9/12 (75%) | 10/13 (77%) | 5/5 (100%) | 0 vi phạm giờ / ngày đóng / chồng giờ / ngoài danh mục trên 21 lịch · 0 lịch vượt ngân sách | **Đạt — vừa đúng ngưỡng 80%** |
| 2 | `run-2@…` | __/30 | __% | | | | | *(sau một cải tiến, trước CP4)* |

- Kết quả từng câu + lý do chấm: `eval/run-1.csv` (cột `pass`, `ghi_chu`). Trace: `traces/run-1.jsonl`. Lượt chạy 30/30 câu, 0 lỗi kỹ thuật; trung bình 1,0 lần gọi model, 4,3 lần gọi công cụ, 1.849 token vào / 3.034 token ra mỗi câu.
- **Người chấm:** cột `pass` do **Claude Code chấm nháp** theo `pass_criterion` (khai trong `docs/ai-usage.md`), điều kiện cứng (2)–(3) kiểm bằng script đọc output. **Bùi Văn Lâm cần kiểm lại**, nhất là 6 câu trượt và `B21`, `B22`.
- **Độ nhạy:** `B21` chấm chặt là trượt (lịch không có điểm nào là bảo tàng, chỉ di tích); nếu coi Hỏa Lò là bảo tàng thì đạt → 25/30. Cách chấm chặt vẫn đạt chuẩn.

## 2. Lỗi lượt 1 — gom thành nhóm có tên

| Nhóm lỗi | Số câu | Câu |
|---|---|---|
| **Đọc sai yêu cầu của khách** (code bước ①) | 2 | `B24` ("hai đứa mình" → 1 người), `B28` ("Chủ nhật … từ 8h đến 11h30" không hiểu là đi 1 ngày → hỏi lại số ngày) |
| **Không làm được nhưng không nói rõ vì sao** | 2 | `B14` (ngân sách quá thấp → lịch trống, không báo "không đủ ngân sách"), `B29` (hỏi chỗ đỗ ô tô / cấm đường → chỉ hỏi lại số ngày, không nói "chưa có dữ liệu") |
| **Chọn / xếp điểm chưa khớp ý** | 2 | `B08` (ngày 3 đi ngược đường Hồ Tây ↔ Ba Đình), `B21` (khách thích bảo tàng nhưng lịch chỉ có di tích) |

**≥3 lỗi cụ thể:**

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| `B24` | *"Hai đứa mình đi Hà Nội 3 ngày từ thứ Sáu, thích cà phê, ăn uống và chụp ảnh, ngân sách ăn chơi 3 triệu cho cả hai."* | *"Lịch đi Hà Nội 3 ngày · bắt đầu Thứ 6 · **1 người** · ngân sách 3.000.000đ … Tổng chi phí ước tính: 1.190.000đ cho 1 người"* | `parse_request` chỉ bắt số người dạng chữ số ("2 người", "4 khách"); "hai đứa" là chữ nên rơi về mặc định 1 người → tiền tính sai cho cả nhóm. |
| `B14` | *"Lập lịch đi Hà Nội 3 ngày từ thứ Sáu đến Chủ Nhật … ngân sách tổng cộng 100.000đ cho cả 3 ngày."* | *"Chưa có dữ liệu cho: Không thể lập lịch thỏa mãn tất cả luật: với ngân sách tổng … Ngày 1 · Thứ 6 (chưa xếp được điểm nào hợp giờ mở cửa hôm này) … Tổng chi phí ước tính: 0đ"* | AI trả lịch rỗng và nhét câu giải thích vào `khong_co_du_lieu`; code chỉ báo "ngân sách không đủ" khi chính nó phải cắt điểm, nên khi lịch rỗng ngay từ AI thì không có câu báo, còn lý do hiện ra lại là "hợp giờ mở cửa" — sai. |
| `B08` | *"Lịch đi Hà Nội 3 ngày (thứ Tư - thứ Sáu) cho cặp đôi thích không gian lãng mạn, xem múa rối nước và ăn tối ngon, ngân sách 3.000.000đ."* | Ngày 3: *"Chùa Trấn Quốc (Tây Hồ) → Bảo tàng Mỹ thuật (Ba Đình) → Bánh Tôm Hồ Tây (Tây Hồ) → Lotte Center (Ba Đình)"* | `sap_xep_lo_trinh` xếp theo giờ mở cửa (điểm nào bắt đầu được sớm nhất), không gom theo khu → đi đi lại lại giữa hai quận. Lịch cũng không có bữa tối dù khách nhắc "ăn tối ngon". |
| `B28` | *"Chủ nhật đi Hà Nội với bé 4 tuổi, bé ngủ trưa nên nhà mình chỉ đi từ 8h đến 11h30, 3 người, ngân sách 800 nghìn."* | *"Để lập lịch đúng giờ mở cửa và vừa túi tiền, bạn cho mình biết thêm: đi mấy ngày (1, 2 hay 3) nhé."* | Câu nêu một ngày cụ thể và một khung giờ trong ngày nhưng không có chữ "1 ngày"; luật hỏi lại (G10) chưa suy ra được trường hợp này. |

**Đạt nhưng sát:** `B22` đạt vì lịch tình cờ xếp bảo tàng buổi sáng — code **chưa** mô hình hoá khung nghỉ trưa 12:00–13:30 (chỉ có trong ghi chú dữ liệu). `B04` tính cho 1 người vì input "gia đình có trẻ nhỏ" không nêu số người.

## 3. Một lần cải tiến *(làm sau CP3, chạy lại thành `run-2` trước CP4)*

- **Nhắm vào nhóm lỗi:** **Đọc sai yêu cầu của khách** — `B24` ("hai đứa mình" thành 1 người), `B28` ("Chủ nhật … từ 8h đến 11h30" bị hỏi lại số ngày).
- **Đã sửa gì:** `parse_request` trong `codebase/agent.py`, luật chung: (1) số người viết bằng chữ ("hai đứa", "ba người"; bỏ qua "thứ hai"); (2) có một thứ / ngày cụ thể + khung giờ có cả giờ đi lẫn giờ về mà không nói số ngày → 1 ngày. So kết quả đọc cả 30 câu trước / sau: chỉ `B24`, `B28` đổi. *Lưu ý:* `run-2` còn gồm phần siết chatbot / chặn prompt injection làm cùng buổi (`spec.md` §10, 28/11 09:50).
- **Kết quả:** nhóm lỗi __ → __ · tổng 24/30 → __/30
- **Câu nào tệ đi sau khi sửa:** __

## 4. Còn lại

- **Lỗi chưa sửa + nguy hiểm thế nào:** khung nghỉ trưa bảo tàng chưa có trong code (`B22` đạt do may); `run.py eval` chạy từng câu độc lập nên chưa đo tự động kịch bản **sửa lịch nhiều lượt** (`agent.edit()` mới thử tay); dữ liệu giờ mở cửa / giá vé là dữ liệu tĩnh 24 điểm, tiền di chuyển là ước tính.
- **Nếu có thêm 1 tuần:** bộ câu thử tự động cho hội thoại sửa lịch nhiều lượt; xếp lịch theo cụm khu vực trước rồi mới theo giờ; mở rộng danh mục và cập nhật giờ / giá theo mùa, cấm đường cuối tuần.
