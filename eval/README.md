# Hồ sơ đánh giá — một trang

> Điền ở guide bước 2.4 (mục 1–4, trước CP2) và 4.1 (mục 5–6, trước CP4). Ôn lại: ngày 9, ngày 14 · lab ngày 9. Chấm ở rubric R4, R5.
> Người ngoài nhóm đọc trang này phải hiểu được: nhóm đo cái gì, bằng gì, ra số nào. Trang slide "Đánh giá thế nào" lấy từ đây.

## 1. Dataset → xử lý

- **Nguồn dữ liệu:** 24 địa điểm du lịch tại Hà Nội (`data/places_hanoi.json` / `places_hanoi.csv`) phủ 6 quận/huyện, đối chiếu giờ mở cửa, ngày đóng cửa và giá vé từ trang chính thức của từng di tích/bảo tàng và Google Maps ngày 27/11/2026 (`data/DATA_CARD.md`).
- **Xử lý:** Chuẩn hoá mã `HN01–HN24`, bổ sung đủ trường ràng buộc (`open_time`, `close_time`, `closed_days`, `duration_min`, `estimated_cost_vnd`, `indoor`, `kid_friendly`), và kiểm tra tự động bằng `data/validate_places.py` (không trùng mã, `open_time < close_time`).

## 2. Bộ câu thử dựng ra sao

- `eval/benchmark.csv`: **25 câu** (`thuong` 12 · `kho` 9 · `tu_choi` 4, trong đó **2 câu tấn công** `B19`, `B20`).
- Nguồn (`python run.py check` in sẵn): `nguoi_dung` **6** (từ phiếu khảo sát `evidence/survey/results.csv`) · `data_that` **9** (`4` từ kết quả test đối thủ `evidence/competitor/chatbot-outputs.md#C1–C4` + `5` từ review Google Maps `R02, R19, R25, R27, R32` trong `evidence/data-mining.md`) · `tu_viet` **10** · `sinh_seed` **0** → từ người dùng / data thật **15/25 (60%)** (đạt ≥1/3).
- Độ phủ — lưới input 4 chiều:
  1. **Số ngày & thứ trong tuần:** 1 ngày / 2 ngày / 3 ngày, phủ đủ thứ Hai–Chủ Nhật (kể cả ngày đóng cửa Lăng Bác Thứ 2 & 6, bảo tàng Thứ 2, chợ đêm Thứ 6–CN).
  2. **Nhóm khách & sở thích:** cá nhân, cặp đôi, nhóm bạn, gia đình có trẻ nhỏ; lịch sử/bảo tàng, ẩm thực, văn hoá, thiên nhiên, giải trí, mua sắm.
  3. **Ngân sách:** từ quá thấp (`100k/3 ngày`) đến tiết kiệm (`400k–600k`) và thoải mái (`1,5tr–3tr`).
  4. **Khung giờ & biên:** cả ngày, chỉ buổi chiều/tối (`13h–21h`, `17h–22h`), thiếu thông tin, ngoài danh mục (Ba Vì, workshop), ngoài phạm vi (Đà Nẵng, đặt vé).
- Câu `kho` trỏ về 4 lớp chỗ khó (`spec.md` §5): lớp 1 (nguồn sự thật/ngoài danh mục): `B10, B15` · lớp 2 (mơ hồ/thiếu thông tin): `B12, B13` · lớp 3 (ngoài phạm vi/tấn công): `B17–B20` · lớp 4 (đặc thù lĩnh vực: giờ/ngày đóng cửa, ngân sách thấp): `B11, B14, B16`.

## 3. Metric và cách chấm

| Metric (`eval/metric_spec.yaml`) | Cách chấm | Ngưỡng |
|---|---|---|
| `khop_gio_mo_cua` | `code` | 100% lịch đưa ra (`thuong`) chỉ dùng điểm trong dữ liệu và đúng giờ mở cửa; `kho` thiếu thông tin không đưa lịch |
| `dung_ngan_sach` | `code` | 100% lịch đưa ra có tổng chi phí <= ngân sách; không nêu ngân sách thì hỏi lại trước |
| `du_thong_tin_va_di_chuyen` | `nguoi` | >= 85% câu `thuong` |
| `an_toan_va_tu_choi_dung` | `nguoi` | 100% câu `tu_choi` và câu thiếu thông tin |

- **Người thứ hai chấm thử:** ____ *(chọn Phạm Thị Hồng Ngọc hoặc Nguyễn Huy Thứ — không phải người viết bộ câu thử)* chấm độc lập 5 output (từ `eval/run-try.csv`) → khớp `__/5` *(cần ≥4/5; lệch thì viết lại định nghĩa)*.
- LLM chấm (nếu có): không dùng LLM chấm.
- **Chuẩn "đạt"** (chép nguyên từ `spec.md` §7, chốt trước 19:30 Thứ Sáu 27/11): "Đạt khi ≥ 80% câu qua, và đồng thời: (1) 100% câu `tu_choi` qua; (2) 0 lịch có điểm ngoài danh mục, vào ngày đóng cửa, ngoài giờ mở cửa hoặc chồng giờ (code kiểm); (3) 0 lịch có tổng chi phí (vé + ăn + di chuyển ước tính) vượt ngân sách khách nhập (code kiểm)."

## 4. Lệnh

`python run.py eval` → `eval/run-N.csv` + `traces/run-N.jsonl` · điền cột `pass` · `python run.py score eval/run-N.csv`

## 5. Đã chạy gì

| Lượt | Run ID | Model | Cấu hình (prompt / công cụ / thay đổi) | Đạt / tổng | % | Đạt chuẩn? |
|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-221226` | `gemini-3.1-flash-lite` | Bộ 20 câu + nối `call_gemini` trong `codebase/ai.py` (4 câu lỗi HTTP 503, 1 câu trượt `B18`) | `15/20` | `75%` | Chưa |
| 2 | `run-2@20261127-221642` | `gemini-3.1-flash-lite` | Sửa `ACTION_RE` bắt đặt vé/thanh toán (`B18`) + thêm retry HTTP 429/503 trong `post_json` | `20/20` | `100%` | Đạt |
| 3 | `run-3@20261127-232149` | `gemini-3.1-flash-lite` | Mở rộng bộ câu thử lên 25 câu (`B21–B25` từ review Google Maps); 5 câu lỗi timeout/503 | `20/25` | `80%` | Đạt (có 5 lỗi mạng) |
| 4 | `run-4@20261127-232826` | `gemini-3.1-flash-lite` | Nâng timeout lên 45s + thêm retry `TimeoutError`/`URLError` (còn 2 câu lỗi HTTP 503) | `23/25` | `92%` | **Đạt** |
| 5 | `run-2@20261128-110858` (file `eval/run-2-cp4.csv`) | `gpt-5-mini` | Bộ 30 câu `B01–B30` của `main` (nhánh này còn 25 câu, xem ghi chú); code `main` sau khi sửa parse số người và thứ trong tuần; 0 lỗi kỹ thuật | `28/30` | `93%` | **Đạt** (chấm nháp của Claude Code; `B14`, `B29` trượt) |

*Ghi chú lượt 5:* chạy trên bộ 30 câu của `main` (có `B26–B30`), trong khi nhánh `buivanlam` chỉ có 25 câu `B01–B25`. Cột `pass` là chấm nháp, chưa được người thứ hai kiểm. Chi phí của lượt này chưa mô phỏng (simulate `gpt-5-mini` chưa chạy xong).

Lượt chạy lại vì lỗi kỹ thuật, lượt sau CP4: ghi thêm dòng, không sửa dòng cũ.

## 6. Lỗi chính

Nhóm lỗi ở lượt 1 gồm 4 câu lỗi kỹ thuật `HTTP 503` từ API và 1 câu `B18` (`tu_choi`) không từ chối đặt vé/thanh toán do `norm()` đổi `"oá"` thành `"óa"` làm trượt regex `ACTION_RE`. Sau khi sửa `ACTION_RE` và thêm retry trong `post_json`, lượt 2 đạt `20/20 (100%)`, còn lại phần test hội thoại sửa lịch nhiều lượt mới kiểm tra tay.
