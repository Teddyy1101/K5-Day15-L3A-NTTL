# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Ba nguồn ngang nhau — tối thiểu **≥1 nguồn đạt ngưỡng**. Mạnh nhất: đào data ra insight → hỏi người dùng để kiểm lại (hoặc ngược lại).

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☐ chưa làm | `evidence/data-mining.md` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ đang xác minh — chưa đưa vào | `evidence/interviews/` |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☑ **21 phiếu** (bản xuất lúc 27/11 22:14). Cần nhóm xác nhận không có thành viên nhóm trả lời; 1 phiếu dưới 18 tuổi, 4 phiếu "không lên lịch trước" vẫn giữ trong mẫu số | `evidence/survey/` (`questions.md`, `results.csv`, `count_survey.py`) |

## 2. Số chính

- Đào data: __/__ (__%) …
- Phỏng vấn: *(chưa đưa vào — xem mục 1)*
- **Khảo sát, n = 21 (số chạy lại bằng `python evidence/survey/count_survey.py`):**
  - Thời gian lên lịch cho chuyến 2–3 ngày: **10/21 (48%) mất từ 2 tiếng trở lên**, trong đó 6/21 (29%) "trên 5 tiếng (hoặc mất nhiều ngày)"; 3/21 từ 30 phút – 2 tiếng; 4/21 dưới 30 phút; **4/21 (19%) không lên lịch trước**.
  - Khâu khó nhất (chọn nhiều): tìm điểm ăn chơi hợp sở thích 16/21 (76%) · sắp thứ tự thuận đường 9/21 (43%) · cân đối thời gian giữa các điểm và dự trù chi phí 9/21 (43%) · đọc review khó phân biệt thật / quảng cáo 9/21 (43%) · tổng hợp từ nhiều nguồn 8/21 (38%) · thiếu ảnh thật 7/21 (33%).
  - **12/21 (57%) chọn "thuận đường" hoặc "cân đối thời gian + chi phí"** — đúng hai việc lát cắt làm.
  - Khó chịu ≥4/5: **khó sửa lịch khi thời tiết đổi / muốn đổi điểm 13/21 (62%)** · mở 4–5 app / tab 10/21 (48%) · đến nơi mới thấy điểm xa nhau, ngược đường 9/21 (43%) · đọc nhiều review 9/21 · thiếu ảnh 9/21.
  - Đã từng bỏ / đổi điểm vì thiếu thông tin: rất thường xuyên 5/21, thỉnh thoảng 10/21, hiếm khi 4/21, chưa bao giờ 1/21, bỏ trống 1/21 → **15/21 (71%) ít nhất thỉnh thoảng**.
  - Thông tin quan trọng nhất khi chọn điểm: ảnh thực tế 13/21 · review chi tiết / video 13/21 · khoảng cách và thời gian di chuyển 11/21 · tóm tắt ưu / nhược 11/21 · **giờ mở cửa và chi phí dự kiến 7/21 (33%)**.
  - Công cụ đang dùng: Google Maps 19/21 · TikTok / Facebook / Instagram 17/21 · hỏi bạn bè 11/21 · blog 7/21 · app du lịch 6/21 · ghi chú thủ công 5/21.
  - Người trả lời: 18/21 ở tuổi 18–24; 14/21 đi tự túc 1–2 lần/năm. Khảo sát hỏi du lịch tự túc nói chung, không riêng Hà Nội.

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

Nguyên văn câu trả lời tự do trong khảo sát (cả ý ủng hộ lẫn ý ngược):

1. "chỉ cần đi, và mọi thứ cần lo theo kế hoạch" — phiếu khảo sát 27/11/2026 17:43:40 (câu mong muốn)
2. "Mình muốn cái gì đó có thể check chính xác thông tin địa điểm du lịch" — phiếu khảo sát 27/11/2026 21:33:07 (câu mong muốn)
3. "một ứng dụng tiện gọn có thể làm được tất cả" — phiếu khảo sát 27/11/2026 21:25:03 (câu mong muốn)
4. "Review chân thực lên xin đừng lừa :(" — phiếu khảo sát 27/11/2026 18:25:59 (câu mong muốn)
5. "Mình thường đi tới đâu tính tới đó, không lên lịch trước" — 4 phiếu (17:43:40, 21:28:17, 21:33:07, 22:11:39) (câu thời gian lên lịch) *(ngược giả thuyết)*
6. "có tiền thì lên xe thôi chứ không cần lập kế hoạch" — phiếu khảo sát 27/11/2026 18:45:42 (câu mong muốn) *(ngược giả thuyết)*
7. "chỉ việc xách vali lên và đi" — phiếu khảo sát 27/11/2026 22:11:39 (câu mong muốn) *(ngược giả thuyết)*
8. "Không cần lập kế hoạch" — phiếu khảo sát 27/11/2026 18:06:37 (câu mong muốn) *(ngược giả thuyết)*

## 4. Các nguồn có khớp nhau không

Hiện mới có một nguồn đạt ngưỡng (khảo sát). Nguồn thứ hai để kiểm lại (phỏng vấn ≥3 người hoặc đào review công khai) chưa đưa vào. Đối chiếu phụ (không phải bằng chứng pain): chatbot chung xếp điểm vào giờ / ngày đóng cửa ở 2/4 lịch thử (`evidence/competitor/chatbot-findings.md`).

## 5. Kết luận

*(Bản CP3, n = 21.)* Giả thuyết **đúng một phần**:
- **Ủng hộ:** gần một nửa mất nhiều thời gian lên lịch (10/21 từ 2 tiếng trở lên); 12/21 thấy khó ở đúng hai việc lát cắt làm (sắp thuận đường, cân đối thời gian + chi phí); 15/21 ít nhất thỉnh thoảng phải bỏ / đổi điểm vì thiếu thông tin; **sửa lịch khi tình huống thay đổi là khó chịu nhất (13/21)** — lý do nhóm làm thêm phần sửa lịch trong phiên chat.
- **Ngược / lệch:** khó khăn được chọn nhiều nhất là **tìm điểm hợp sở thích (16/21)**; ảnh thật và review được coi trọng hơn (13/21) so với **giờ mở cửa + chi phí (7/21)**; **4/21 không lên lịch trước** và 4 câu trả lời tự do nói không cần lập kế hoạch. Lát cắt đỡ được phần "tìm điểm hợp sở thích" (AI chọn điểm theo sở thích) nhưng không đỡ phần review / ảnh.

Điều vẫn chưa biết: khách đi **Hà Nội** cụ thể có giống không; lần gần nhất bị lỡ điểm vì đóng cửa hay vượt tiền là khi nào và mất bao nhiêu (cần phỏng vấn hỏi chuyện đã xảy ra); có thành viên nhóm nào trả lời khảo sát không.
