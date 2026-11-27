# AI SPEC — VietTravel Copilot (Lập lịch Hà Nội 1–3 ngày) · Nhóm NTTL · Lớp L3A

> Mốc nộp: §7 chốt chuẩn "đạt" tại **CP2 19:30 Thứ Sáu 27/11** · §0–§7 nộp **CP3 10:00 Thứ Bảy 28/11** · đủ §0–§10 **CP4 14:30 Thứ Bảy 28/11** · §10 changelog ghi tiếp đến **23:59 Thứ Bảy 28/11**.
> Đầu mỗi mục ghi bước guide (`02-guide.md` trong repo đề) chỉ cách điền. Mỗi mục ngắn, có số và nguồn; chi tiết để ở file được trỏ tới. Xoá dòng hướng dẫn trong ngoặc vuông khi điền xong.

Track: [ ] A · [ ] B · [x] C · [ ] D · [ ] E — bài toán: VietTravel Copilot lập lịch đi Hà Nội từ 1 đến 3 ngày
Data BTC cấp đã dùng (nếu có — không commit nguyên file): Không dùng data BTC; nhóm tự xây dựng `data/places_hanoi.csv` và `data/places_hanoi.json`.

## §0. Hiện tại việc này diễn ra thế nào *(guide 1.1)*
- Luồng hiện tại của việc này trên các app thật (4 bước):
  1. Người dùng tìm địa điểm ăn uống, tham quan trên TikTok, Facebook hoặc blog du lịch.
  2. Mở Google Maps để xem từng điểm nằm ở khu vực nào, cách nhau bao xa và mất bao lâu di chuyển.
  3. Tra giờ mở cửa từng ngày trong tuần (nhiều điểm tại Hà Nội như Lăng Bác, bảo tàng đóng cửa thứ Hai hoặc thứ Sáu; phố đi bộ chỉ mở cuối tuần) và giá vé/chi phí ước tính.
  4. Tự ghép lịch theo buổi vào Google Docs, Notes hoặc Google Sheets, rồi sửa lại khi phát hiện trùng giờ hoặc vượt ngân sách.
- Công cụ / AI đang được dùng cho việc này: Google Maps, TikTok/Facebook, Google Sheets/Notes, ChatGPT riêng *(chưa kiểm nguồn tỷ lệ dùng chính thức — chờ số liệu khảo sát thật ở `evidence/survey/`)*.

## §1. Người dùng & bằng chứng *(guide 1.1, 1.2)*
- Người dùng chính (một vai cụ thể): Khách tự lên kế hoạch cho chuyến đi ngắn (1–3 ngày) ở Hà Nội.
- Việc họ cố làm xong: Lập lịch trình tham quan và ăn uống tại Hà Nội trong 1–3 ngày khớp sở thích, giờ mở cửa, thời gian di chuyển và ngân sách.
- Hôm nay họ giải bằng gì, hỏng ở đâu, vì sao chưa bỏ: Tự tra rời rạc trên Google Maps, TikTok/blog rồi ghép vào Notes; dễ sót giờ đóng cửa theo thứ trong tuần hoặc ước lượng sai thời gian di chuyển và tổng chi phí; chưa bỏ vì các công cụ hiện tại miễn phí và quen dùng.
- Pain (KHÔNG chữ AI): Khách tự lên lịch đi Hà Nội — đang phải đối chiếu giờ mở cửa, chi phí và thời gian di chuyển từ nhiều nguồn rời rạc — vướng ở việc dữ liệu phân tán và thay đổi theo ngày trong tuần — hậu quả là mất nhiều thời gian sắp xếp lại hoặc đến nơi mới phát hiện điểm đóng cửa / vượt chi phí.
- Bằng chứng — số chính + kết luận (chi tiết: `evidence/summary.md`): **3/3 người phỏng vấn** (P1–P3) gặp sự cố do đối chiếu rời rạc giờ mở cửa/nghỉ trưa, khoảng cách tuyến đường và chi phí; thời gian chuẩn bị trước chuyến đi 45–150 phút (trung vị 90 phút), phát sinh ngoài dự kiến 250.000đ–1.200.000đ/chuyến. *(Đang chờ ghép thêm số liệu khảo sát ≥20 phiếu).*

## §2. Impact & quyết định chọn *(guide 1.3)*

| Hướng | Bao nhiêu người gặp | Bao nhiêu lần / tháng | Mỗi lần tốn gì | Impact / tháng | Làm kịp không | Chọn? |
|---|---|---|---|---|---|---|
| Tự lên lịch đi Hà Nội 1–3 ngày (đối chiếu giờ mở cửa, tuyến đường, ngân sách) | 100 *(tự ước tính)* | 0,67 *(trung vị 2 lần/quý từ P1–P3)* | 90 phút *(trung vị từ P1–P3)* | 6.030 phút *(tự ước tính quy mô 100 người)* | Có (dữ liệu Hà Nội gọn, kiểm được ràng buộc) | Có |
| Gợi ý đặt vé máy bay và khách sạn tự động đa thành phố | 100 *(tự ước tính)* | 0,5 *(tự ước tính)* | 60 phút *(tự ước tính)* | 3.000 phút *(tự ước tính)* | Không (rủi ro giao dịch/giá biến động, ngoài phạm vi 1 ngày) | Không |
| Hướng dẫn viên tương tác giọng nói thời gian thực tại điểm | 40 *(tự ước tính)* | 0,5 *(tự ước tính)* | 30 phút *(tự ước tính)* | 600 phút *(tự ước tính)* | Không (đòi hỏi hạ tầng audio/GPS ngoài lát cắt) | Không |

- **Impact / tháng** của hướng chọn = 100 người *(tự ước tính)* × 0,67 lần/tháng *(từ P1–P3: 1–3 lần/quý, trung vị 2 lần/quý)* × 90 phút *(trung vị từ P1–P3: 45–150 phút)* ≈ **6.030 phút/tháng**.
- Hướng ĐÃ LOẠI + vì sao:
  - *Đặt vé máy bay/khách sạn tự động đa thành phố*: liên quan thanh toán thật và biến động giá theo thời gian thực, vượt phạm vi bản chạy thử an toàn.
  - *Hướng dẫn viên giọng nói thời gian thực*: đòi hỏi xử lý audio/GPS liên tục, không kịp hoàn thiện và kiểm định trong thời gian hackathon.
- Số lần / tháng của từng kiểu người dùng (dùng cho persona ở §8): Khách đi cuối tuần tự phát: 1–2 lần/tháng *(tự ước tính)* · Khách du lịch từ tỉnh khác đến Hà Nội ngắn ngày: 0.25–0.5 lần/tháng *(tự ước tính)*.

## §3. Giải pháp tương tự *(guide 2.1)*
- [sản phẩm / tính năng gần giống]: một điều đáng học · một điều đáng né · mình khác gì

## §4. Thiết kế *(guide 2.2, 3.2)*
- **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả):
- Không làm (≥3 điều):
- **Sơ đồ** (ảnh / Mermaid / draw.io): [chèn ở đây]
- **Hình dạng:** [ ] workflow cố định · [ ] một agent · [ ] nhiều agent — 2 dòng lý do, và vì sao **không** chọn hình dạng phức tạp hơn:
- **AI dựa vào đâu** — mỗi công cụ (khớp `codebase/tools.py`):

  | Công cụ | Input | Output | Tác động ra ngoài? |
  |---|---|---|---|
  |  |  |  |  |

- **Mức tự động:** [ ] AI gợi ý, người quyết · [ ] AI tự làm khi chắc, chuyển người khi không · [ ] AI tự làm — lý do (sai thì ai chịu gì, sửa đắt hay rẻ):
- **Chỗ chặn rủi ro** (rủi ro lớn nhất của lát cắt bị chặn ở đâu, bằng gì):
- **Chỗ người duyệt** (việc AI không được tự làm):
- **Nguyên tắc thiết kế** (≥3, bắt buộc G10):

  | Nguyên tắc | Chỗ cụ thể trên sơ đồ / trong bản chạy thử |
  |---|---|
  | G10 — thu hẹp phạm vi khi không chắc |  |
  |  |  |
  |  |  |

- Phần nào còn giả (công cụ trả dữ liệu giả, model chế độ giả…) — ghi rõ, không giả làm thật:

## §5. Chỗ khó — 4 lớp + ≥6 kịch bản + 2 tấn công *(guide 2.3)*

| Kịch bản | Lớp (1–4) | Hành vi mong muốn (nói gì, hiện gì, cho làm gì tiếp) | Câu thử |
|---|---|---|---|
|  |  |  |  |
| *(tấn công)* |  |  |  |
| *(tấn công)* |  |  |  |

(1) nguồn sự thật · (2) mơ hồ / thiếu thông tin · (3) ngoài phạm vi / thẩm quyền · (4) đặc thù lĩnh vực (sai thì người dùng mất gì đắt nhất)

## §6. Bốn đường đi của trải nghiệm
- Mọi thứ suôn sẻ: · Không chắc (lớp 2): · Không có căn cứ (lớp 1): · Người dùng sửa:
- Bị đòi ngoài phạm vi (lớp 3): · Trường hợp đặc thù lĩnh vực (lớp 4):

## §7. Đánh giá & chuẩn "đạt" *(guide 2.4, 4.1)*
- Data card: `data/DATA_CARD.md` · bộ câu thử: `eval/benchmark.csv` — __ câu (thuong __ · kho __ · tu_choi __) · metric: `eval/metric_spec.yaml` (__ metric)
- **Chuẩn "đạt"** (chốt **trước 19:30 Thứ Sáu 27/11**, giữ nguyên đến 23:59 Thứ Bảy 28/11): "Đạt khi ≥ __% câu qua, và __"
- Kết quả: lượt 1 __/__ (__%) · lượt 2 __/__ (__%) — run ID: __ / __ → chi tiết `eval/report.md`, hồ sơ `eval/README.md`

## §8. Chi phí khi dùng thật *(guide 4.2)*
- Persona + giá: `cost/personas.yaml` · lượt mô phỏng: `cost/simulate-__.csv` (__ phiên)
- Chi phí / task thành công: __ (model __) · __ (model __)
- Chi phí / tháng ở quy mô thật: thấp __ · cơ sở __ · cao __ → chi tiết `cost/cost-estimate.md`
- So với impact / người / tháng (§2): đáng làm không, vì sao:

## §9. Rủi ro & an toàn
- Dữ liệu: đã ẩn danh gì, không thu gì, không đưa gì vào model gói miễn phí:
- AI **không được** làm gì kể cả khi người dùng yêu cầu:
- Ai có thể bị hại nếu AI sai, và nhóm chặn thế nào:

## §10. Phân công & changelog
- Phân công có tên (theo chặng, chia cặp — guide "Cách chia việc"): __
- Dùng AI vào việc gì (2–3 dòng; chi tiết `docs/ai-usage.md`):
- Nhật ký thay đổi — **mọi thay đổi sau CP2 19:30 Thứ Sáu 27/11 phải có dòng ở đây**:

**CP2 → CP4** (vd thu hẹp lát cắt, hỏi thêm người dùng, lần cải tiến trước lượt 2)

| Thời điểm | Đổi gì | Vì sao (trỏ về câu thử / lỗi / bằng chứng nào) |
|---|---|---|
|  |  |  |

**Sau CP4 (đến 23:59 Thứ Bảy 28/11)** (sửa theo góp ý — không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
|  |  |  |
