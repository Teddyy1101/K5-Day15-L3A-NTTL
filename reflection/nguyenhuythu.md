# Reflection — Nguyễn Huy Thứ

> Làm ở guide bước 5.3. Mỗi người một file: chép file này thành `reflection/<ten-khong-dau>.md` (viết thường, không dấu). Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách tích hợp model và luồng lập lịch. Dựng khung 6 bước ở `codebase/agent.py`, `codebase/tools.py` (`c544b3d`); nối `gpt-5-mini` vào `codebase/ai.py` (`78660f0`); thêm khung giờ, điểm khách nêu tên, báo "chưa có dữ liệu" (`96b29b6`) và sửa lịch trong phiên chat (`ef9afdd`). Mình chạy lượt 1 chính thức `run-1` (24/30, `7a4c7a4`), làm giao diện web có kéo thả thứ tự điểm (`codebase/web.py`, `55242f1`) và cải tiến trước lượt 2 (`3574c95`).

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng Claude Code viết phần lớn code, prompt và giao diện web; mình đọc diff, chạy thử, chỉ ra chỗ sai và quyết định giữ / bỏ (chi tiết `docs/ai-usage.md`). Chỗ phải sửa: lần đầu model gọi Bát Tràng là "workshop" và ghi nhầm Lăng Bác vào "chưa có dữ liệu" → siết prompt và lọc lại bằng code. Khi đã có lịch, nhắn "Hello" khiến model xếp lại cả lịch, tổng tiền đổi → thêm bước code lọc ý định trước khi gọi model. Cột `pass` của lượt 1 là AI chấm nháp nên phải để Lâm chấm lại.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   `B24` ("Hai đứa mình đi Hà Nội 3 ngày…") ra lịch cho **1 người** vì `parse_request` chỉ đọc số người viết bằng chữ số. Model chọn điểm đúng, nhưng tiền tính sai cho cả nhóm. Bài học: bước code đọc yêu cầu đứng trước AI nên một lỗi nhỏ ở đó làm hỏng cả kết quả dù AI làm đúng. Khi sửa phải dùng luật chung, rồi so kết quả đọc của cả 30 câu trước / sau để chắc chỉ câu nhắm tới thay đổi (chỉ `B24`, `B28` đổi).
