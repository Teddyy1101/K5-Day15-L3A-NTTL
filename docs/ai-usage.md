# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử | Claude Code (Claude Opus 5.5) | Viết `codebase/agent.py` (luồng 6 bước) và `codebase/tools.py` (3 công cụ) theo thiết kế ở `spec.md` §4 | Đọc diff; chạy `python run.py` với input mẫu, chạy 20 câu trong `eval/benchmark.csv`, thử AI giả lập bịa mã địa điểm để kiểm bước sửa | Nguyễn Huy Thứ |
| Prompt / thiết kế lời gọi mô hình | Claude Code (Claude Opus 5.5) | Nháp `SYSTEM` prompt trong `agent.py` (chỉ chọn mã trong danh sách, trả JSON, coi yêu cầu khách là dữ liệu) | Chưa thử với model thật — kiểm lại khi nối model trước CP3 | Nguyễn Huy Thứ |
| Đào data (viết script đếm, gợi ý nhãn) | | | Kiểm tay __ dòng, khớp __ | |
| Rà câu hỏi phỏng vấn / khảo sát | | Chỉ rà câu dẫn dắt | | |
| Viết câu thử (benchmark) | | | Mỗi câu thử có `source`; câu thử AI viết được ghi rõ | |
| Sinh data `synthetic` (nếu có) | | | Seed __ · kiểm tay __ dòng | |
| Chấm cột `pass` bằng LLM (nếu có) | | | Kiểm tra thủ công __ câu thử, khớp __/__ | |
| Slide, văn bản | Claude Code (Claude Opus 5.5) | Nháp `spec.md` §3–§7 (sơ đồ Mermaid, bảng công cụ, kịch bản khó), dòng 5–6 và "Đã đổi gì" của `canvas.md` | §3 còn ghi "chưa kiểm" — cần người thử từng sản phẩm; Trung rà §3–§6 trước khi nộp | Nguyễn Đức Trung, Nguyễn Huy Thứ |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
