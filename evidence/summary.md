# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Ba nguồn ngang nhau — tối thiểu **≥1 nguồn đạt ngưỡng**. Mạnh nhất: đào data ra insight → hỏi người dùng để kiểm lại (hoặc ngược lại).

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ **50 review Google Maps** (10 review mới nhất × 5 điểm, có 2 điểm đối chứng; Phạm Thị Hồng Ngọc kiểm tay 50/50 nhãn) | `evidence/data-mining.md`, `evidence/reviews_labeled.csv`, `evidence/count_reviews.py` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☑ **3 người** (P1–P3, video, Nguyễn Đức Trung hỏi và ghi; nhóm xác nhận là người thật ngoài nhóm) — dùng làm **nguồn thứ hai** kiểm lại khảo sát | `evidence/interviews/P1.md`, `P2.md`, `P3.md` |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☑ **21 phiếu** (bản xuất lúc 27/11 22:14). Cần nhóm xác nhận không có thành viên nhóm trả lời; 1 phiếu dưới 18 tuổi, 4 phiếu "không lên lịch trước" vẫn giữ trong mẫu số | `evidence/survey/` (`questions.md`, `results.csv`, `count_survey.py`) |

## 2. Số chính

- **Đào review Google Maps, N = 50** (chạy lại bằng `python evidence/count_reviews.py`): **5/50 (10%)** review có pain liên quan lập lịch — đóng cửa / sai giờ 2/50 (4%, **cả 2 đều 1 sao**), chờ lâu lỡ lịch 2/50, giá khác dự tính 1/50, xa / khó đi 0/50; 45/50 không liên quan. Nhóm 3 điểm có ràng buộc giờ: 4/30 (13,3%), trong đó đóng cửa 2/30; nhóm 2 điểm đối chứng mở cả tuần: 1/20 (5%), đóng cửa 0/20.
- **Phỏng vấn, n = 3** *(n nhỏ — không ghi %)*: **3/3** kể được một lần tự lên lịch đi chơi gần đây (cuối 10 – giữa 11/2026) bị trục trặc khi đi thật · chuẩn bị mất 45 / 90 / 150 phút · tự lên lịch 1–3 lần / quý.
  - **Vượt chi phí: 3/3** (P1 +~250.000đ tiền xe do dồn lịch · P2 vượt ~1,2 triệu · P3 +~700.000đ giá vé, gửi xe).
  - **Đi lại / tuyến đường: 3/3** (P1 phải đặt xe nhiều chặng lẻ sau khi lỡ giờ · P2 đi chéo tuyến, ~2 tiếng kẹt xe · P3 cấm đường cuối tuần, gửi xe xa ~1,5 km).
  - **Giờ mở cửa: 1/3** (P1 quên khung nghỉ trưa của bảo tàng, chờ hơn 1 tiếng, bỏ một điểm). P2 không kiểm giờ trước; P3 có kiểm giờ, vướng ở cấm đường và giá cũ.
  - **Vì sao chưa bỏ cách cũ:** P1 — miễn phí, chia sẻ bảng tính cho cả nhóm · P2 — chụp màn hình nhanh, ngại nhập liệu · P3 — cần lịch linh hoạt theo giờ của con nhỏ, tour không đáp ứng.

| | Vai | Gặp pain? | Số lần / 1 quý qua | Lần gần nhất mất | Đang xoay xở bằng |
|---|---|---|---|---|---|
| P1 | Nhóm 4 bạn, đi Hà Nội 2N1Đ | Có — giờ nghỉ trưa, đi lại, chi phí | 2 | 150 phút | TikTok + Google Maps + Google Sheets + Messenger |
| P2 | Cặp đôi sinh viên, Hà Nội 3N2Đ | Có — ngược đường, vượt ngân sách | 3 | 45 phút | Threads / Instagram + ảnh chụp màn hình + Zalo |
| P3 | Gia đình có con 4 tuổi, Hà Nội 2N1Đ | Có — cấm đường, giá vé cũ, chi phí | 1 | 90 phút | Google Search + Google Maps + Google Keep + nhắn Fanpage |
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

Phỏng vấn (nguyên văn trong `evidence/interviews/P_.md`):

- "Mình chia cột tiền ăn và tiền phòng trên Sheets kỹ lắm, nhưng lại sót đúng khung giờ nghỉ trưa của bảo tàng nên cả nhóm ngồi chờ vạ vật mất cả tiếng." — P1
- "Cứ xem một clip trên TikTok xong lại phải thoát ra mở Maps dán địa chỉ để xem có bị ngược đường không, làm cho 15 điểm là hết cả buổi tối." — P1
- "Lúc lưu thì cứ thấy quán nào xinh là chụp màn hình, đến lúc đứng ở phố Hàng Mã mở album ra mới ngớ người vì quán muốn ăn nằm tuốt bên Xã Đàn." — P2
- "Hai đứa không cộng nhẩm tiền trước nên ngày đầu vung tay quá trán, tới ngày cuối phải cắt bữa tối sang chảnh xuống ăn bún đậu." — P2
- "Giờ mở cửa thì mình xem kỹ rồi, nhưng không ngờ cuối tuần cấm đường phố đi bộ làm phải gửi ô tô cách quán ăn cả cây số rồi bế con đi bộ." — P3
- "Đọc review trên mạng toàn giá vé từ năm ngoái, đến cổng mua mới biết cuối tuần phụ thu thêm mấy trăm nghìn." — P3

Review Google Maps (bỏ tên, tối đa 2 câu — đủ trong `evidence/data-mining.md` mục 4):

- *"In plina zi sa fii inchis?! Se deschidea abia la ora 14:00...."* ("Giữa ban ngày mà đóng cửa?! …") — R02, Lăng Bác, 1★
- *"23일(월요일) 갔으나 휴관 임. 매표소 안내에 월요일및 설 휴관이라고.ㅜㅜ"* ("Đến ngày 23 (thứ Hai) thì đóng cửa. Quầy vé ghi đóng cửa thứ Hai và Tết.") — R19, Bảo tàng Dân tộc học, 1★

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

Ba nguồn đạt ngưỡng: khảo sát (n = 21), phỏng vấn (n = 3), đào review Google Maps (N = 50).
- **Review so với khảo sát / phỏng vấn:** review xác nhận chuyện **đến nơi mới biết đóng cửa** có thật và nặng (2/2 ca đều chấm 1 sao) nhưng **hiếm** (2/50) — khớp với khảo sát (chỉ 7/21 coi giờ mở cửa là quan trọng nhất) và phỏng vấn (1/3 vướng giờ). Review có **0/50** than ngược đường vì khách chấm từng điểm riêng lẻ, trong khi khảo sát (9/21) và phỏng vấn (P2) đều có — chỗ lệch do cách dữ liệu được viết, không phải do pain không có. Pain lập lịch chỉ 5/50 review → cận dưới, không phải tỉ lệ người gặp.
- **Khớp:** khảo sát 12/21 thấy khó ở sắp thuận đường / cân đối thời gian + chi phí, 9/21 khó chịu vì đến nơi mới thấy xa nhau / ngược đường → phỏng vấn 3/3 gặp chuyện đi lại và 3/3 vượt chi phí khi đi thật. Khảo sát 10/21 mất ≥2 tiếng lên lịch → phỏng vấn 45–150 phút, xoay xở bằng 3–4 công cụ ghép tay (khảo sát: 10/21 khó chịu vì mở 4–5 app / tab). Khảo sát 13/21 khó chịu khi phải sửa lịch → P1, P2, P3 đều phải đổi lịch giữa chuyến.
- **Lệch / bổ sung:** giờ mở cửa không phải vướng mắc chính — khảo sát chỉ 7/21 coi trọng, phỏng vấn 1/3 vướng (khung nghỉ trưa, P1). Phỏng vấn cho thấy chi phí phát sinh chủ yếu từ **đi lại, gửi xe, giá vé thay đổi** (P1, P3) và tiêu không kiểm soát (P2) — lát cắt có cộng tiền vé + ăn + di chuyển ước tính nhưng **chưa có** cấm đường, gửi xe, phụ thu cuối tuần. Lý do giữ cách cũ (miễn phí và chia sẻ cho nhóm, nhanh không phải nhập liệu, linh hoạt theo con) khớp với 12/21 khảo sát đánh giá "lưu, chia sẻ lịch" hữu ích — phần lát cắt chưa làm.

Đối chiếu phụ (không phải bằng chứng pain): chatbot chung xếp điểm vào giờ / ngày đóng cửa ở 2/4 lịch thử (`evidence/competitor/chatbot-findings.md`).

## 5. Kết luận

*(Bản CP3, khảo sát n = 21 + phỏng vấn n = 3.)* Giả thuyết **đúng một phần**:
- **Ủng hộ:** gần một nửa mất nhiều thời gian lên lịch (10/21 từ 2 tiếng trở lên); 12/21 thấy khó ở đúng hai việc lát cắt làm (sắp thuận đường, cân đối thời gian + chi phí); 15/21 ít nhất thỉnh thoảng phải bỏ / đổi điểm vì thiếu thông tin; **sửa lịch khi tình huống thay đổi là khó chịu nhất (13/21)** — lý do nhóm làm thêm phần sửa lịch trong phiên chat. Phỏng vấn: 3/3 có một lần đi thật bị trục trặc về đi lại và vượt chi phí.
- **Ngược / lệch:** khó khăn được chọn nhiều nhất là **tìm điểm hợp sở thích (16/21)**; ảnh thật và review được coi trọng hơn (13/21) so với **giờ mở cửa + chi phí (7/21)**; **4/21 không lên lịch trước** và 4 câu trả lời tự do nói không cần lập kế hoạch. Phỏng vấn: chỉ 1/3 vướng giờ mở cửa; chi phí phát sinh nằm ở đi lại, gửi xe, giá vé thay đổi — những thứ dữ liệu tĩnh của nhóm chưa có. Lát cắt đỡ được phần "tìm điểm hợp sở thích" (AI chọn điểm theo sở thích), sắp thuận đường, cộng tiền và sửa lịch, nhưng không đỡ phần review / ảnh, cấm đường, gửi xe.

Điều vẫn chưa biết: tỉ lệ ở riêng khách đi **Hà Nội** (khảo sát hỏi du lịch tự túc nói chung; 3 người phỏng vấn đều đi Hà Nội); có thành viên nhóm nào trả lời khảo sát không; khách có chịu đổi từ bảng tính chia sẻ cho nhóm sang công cụ mới không (P1).
