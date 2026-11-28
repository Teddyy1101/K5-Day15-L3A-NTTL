# Reflection — Nguyễn Đức Trung

> Làm ở guide bước 5.3. Mỗi người một file: chép file này thành `reflection/<ten-khong-dau>.md` (viết thường, không dấu). Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình là Đội trưởng (`TEAMS.md`), phụ trách điều phối nhóm, phỏng vấn người dùng ngoài nhóm, tổng hợp spec/bằng chứng và hoàn thiện gói nộp CP4. Cụ thể: mình thực hiện 3 buổi phỏng vấn người thật (`evidence/interviews/P1.md`, `P2.md`, `P3.md`, commit `e95971d`, `60b357a`), rà soát `spec.md` §3–§6 và `canvas.md`, sau đó gộp các nhánh `main` và `ngoc` về nhánh `trung`, tạo bộ slide HTML 4 trang (`slides/demo-slides.html`), bổ sung link video demo CP4 vào `README.md` và viết bộ unit test kiểm tra luồng chính.

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng Claude Code và Antigravity để nháp khung `spec.md` §3–§7, tóm tắt lại số liệu bằng chứng khi khảo sát tăng từ 13 lên 21 phiếu, dựng nhanh bộ slide HTML từ dữ liệu đã có trong repo và viết unit test tự động cho `codebase/`. Chỗ mình phải trực tiếp kiểm và sửa: giữ nguyên toàn bộ số liệu và trích dẫn thật từ 3 buổi phỏng vấn `P1–P3` (không để AI suy diễn hay làm tròn quá mức), giải quyết xung đột merge ở `docs/ai-usage.md` để không mất các dòng cập nhật mới trên `main` lẫn phần của Ngọc, và đối chiếu từng con số trên slide với `evidence/summary.md`, `eval/report.md`, `cost/cost-estimate.md`.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   Ở lượt đánh giá chính thức 1 (`eval/run-1.csv`, 24/30 = 80%), câu `B28` (*"Chủ nhật đi Hà Nội với bé 4 tuổi, bé ngủ trưa 12h30-14h nên chỉ đi được từ 8h đến 11h30, ngân sách 500k cho 2 mẹ con."*) bị trượt vì `parse_request` không nhận ra cụm `"Chủ nhật ... từ 8h đến 11h30"` là chuyến đi 1 ngày nên hệ thống hỏi ngược lại số ngày. Đây là tình huống mình rút trực tiếp từ phỏng vấn P3 (gia đình có con nhỏ), nên bài học rõ nhất là các ca người dùng thực tế thường nêu thứ và khung giờ thay vì nói thẳng "1 ngày" — câu thử từ phỏng vấn thật giúp lộ đúng lỗ hổng mà bộ câu tự viết trước đó bỏ sót.
