# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử | Claude Code (Claude Opus 5.5) | Viết `codebase/agent.py` (luồng 6 bước) và `codebase/tools.py` (3 công cụ) theo thiết kế ở `spec.md` §4 | Đọc diff; chạy `python run.py` với input mẫu, chạy 20 câu trong `eval/benchmark.csv`, thử AI giả lập bịa mã địa điểm để kiểm bước sửa | Nguyễn Huy Thứ |
| Prompt / thiết kế lời gọi mô hình | Claude Code (Claude Opus 5.5) | Nháp `SYSTEM` prompt trong `agent.py` (chỉ chọn mã trong danh sách, trả JSON, coi yêu cầu khách là dữ liệu) | Chưa thử với model thật — kiểm lại khi nối model trước CP3 | Nguyễn Huy Thứ |
| Giao diện web + kéo thả thứ tự (28/11) | Claude Code (Claude Opus 5.5) | Viết `codebase/web.py`, `codebase/web/`; thêm `giu_thu_tu` vào `sap_xep_lo_trinh` để giữ thứ tự khách kéo | Thử qua API trên server: đổi chỗ, đặt sai giờ bị từ chối có lý do, giờ / tiền di chuyển tính lại; thử kéo bằng chuột trên trình duyệt | Nguyễn Huy Thứ |
| Siết chatbot + chặn prompt injection (28/11) | Claude Code (Claude Opus 5.5) | Code tự trả lời chào hỏi / ngoài lề không gọi model; bắt câu tấn công không dấu / tiếng Anh; lọc `<<< >>>` trong input; lọc link, số điện thoại trong chữ model trả | Thử bằng model giả + qua web; kiểm 30 câu thử không câu nào đổi kết quả chặn | Nguyễn Huy Thứ |
| Cải tiến trước lượt 2 (28/11) | Claude Code (Claude Opus 5.5) | Sửa `parse_request`: số người viết bằng chữ, "một thứ + khung giờ" = 1 ngày (nhóm lỗi "đọc sai yêu cầu", `B24`, `B28`) | So kết quả đọc cả 30 câu trước / sau: chỉ `B24`, `B28` đổi; thử thêm câu ngoài bộ thử | Nguyễn Huy Thứ |
| Đào data (viết script đếm, gợi ý nhãn) & chuẩn hoá danh mục địa điểm | Antigravity (Gemini) | Hỗ trợ chuẩn hoá `data/places_hanoi.json` / `.csv`, viết `data/validate_places.py`, `evidence/count_reviews.py`, dịch review ngoại ngữ và gợi ý nhãn nháp cho `evidence/reviews_labeled.csv` | Tự thu thập 50 review thật trên Google Maps (10 review mới nhất/điểm, không lọc riêng review chê), kiểm tay lại 50/50 dòng nhãn; đối chiếu link nguồn chính thức, sửa `HN06` mở cả tuần theo `vnfam.vn` và làm rõ `date_viewed` | Phạm Thị Hồng Ngọc |
| Rà câu hỏi phỏng vấn / khảo sát | | Chỉ rà câu dẫn dắt | | |
| Viết câu thử (benchmark) | Claude Code (Claude Opus 5.5) | Viết câu chữ `B21–B30` dựa trên tình huống trong `evidence/interviews/P1–P3.md` (nguồn ghi `nguoi_dung: P_`); trả `B01–B20` về đúng bản CP2 | Mỗi câu thử có `source`; Lâm đọc lại B21–B30 trước khi chạy lượt chính thức | Bùi Văn Lâm, Nguyễn Huy Thứ |
| Sinh data `synthetic` (nếu có) | | | Seed __ · kiểm tay __ dòng | |
| Chấm cột `pass` bằng LLM (nếu có) | Claude Code (Claude Opus 5.5) | (1) Chấm **thử** 5 output của một lượt chạy thử (đã xoá 28/11) làm người chấm thứ hai. (2) **Chấm nháp cột `pass` + `ghi_chu` của `run-1` (lượt 1, 30 câu)** theo `pass_criterion`; điều kiện cứng (giờ / ngày đóng / ngân sách) kiểm bằng script đọc output | (1) Khớp 5/5 với Lâm; cần một người thật chấm lại 5 câu (`eval/README.md` mục 3). (2) Lâm kiểm lại 30 câu, ít nhất 6 câu trượt và `B21`, `B22`; sửa `pass` nếu không đồng ý và ghi lại | Nguyễn Huy Thứ, Bùi Văn Lâm |
| Slide, văn bản | Claude Code (Claude Opus 5.5) | Nháp `spec.md` §3–§7 (sơ đồ Mermaid, bảng công cụ, kịch bản khó), dòng 5–6 và "Đã đổi gì" của `canvas.md` | §3 còn ghi "chưa kiểm" — cần người thử từng sản phẩm; Trung rà §3–§6 trước khi nộp | Nguyễn Đức Trung, Nguyễn Huy Thứ |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
