# Chi phí khi dùng thật

> Điền ở guide bước 4.2, nộp ở CP4 14:30 Thứ Bảy 28/11. Ôn lại: ngày 13, ngày 1, ngày 14 · lab ngày 13, lab ngày 14. Chấm ở rubric R6.
> Số **không điền tay**: điền `cost/personas.yaml` → `python run.py simulate` → chép bảng trong `cost/simulate-N-summary.md` vào đây.
> Lúc build dùng gói miễn phí vẫn tính theo **giá gói trả phí** — đây là chi phí cho lúc đưa vào dùng thật.

## 1. Đầu vào

- **Persona** (`cost/personas.yaml`): 3 kiểu (`khach_di_1_ngay` 40%, 1 lượt/phiên, 2 phiên/tháng · `khach_di_2_3_ngay` 40%, 3 lượt/phiên, 1 phiên/tháng · `khach_nhom_gia_dinh` 20%, 4 lượt/phiên, 1 phiên/tháng). Nguồn: `evidence/survey/results.csv` và `*(tự ước tính)*`.
- **Số người dùng thật** 3 kịch bản: thấp `200` · cơ sở `500` · cao `1.500`. Nguồn: `*(tự ước tính)*` quy mô pilot nhóm khách tự túc đi Hà Nội (18–24 tuổi, đi 1–2 lần/năm theo `evidence/survey/results.csv`).
- **Giá** 3 mức model: `gemini-3.1-flash-lite` ($0.25 / $1.50 per 1M tokens, `https://ai.google.dev/gemini-api/docs/pricing`, xem 27/11/2026) · `gpt-5-mini` ($0.25 / $2.00 per 1M tokens) · `gpt-5` ($1.25 / $10.00 per 1M tokens, `https://openai.com/api/pricing/`, xem 27/11/2026).
- **Tỉ lệ đạt** dùng để tính: `20/20 (100%)` — lượt chạy thử Gemini `run-2@20261127-221642` (**file đã xoá 28/11**, không phải lượt chính thức). **Cần chạy lại `python run.py simulate`** với tỉ lệ đạt của lượt chính thức `run-1` (24/30, 80%) / `run-2`.
- Đo token trên model `gemini-3.1-flash-lite`, tính giá model `gemini-3.1-flash-lite`, `gpt-5-mini` và `gpt-5` (tỷ giá `1 USD = 25.400 ₫`, tự ước tính).

## 2. Kết quả mô phỏng

Lượt mô phỏng: `cost/simulate-1.csv` · run ID `simulate-1@20261127-223955` · `50` phiên (`12/50` phiên lỗi API không tính vào trung bình) · seed `42`

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (200 người) | Chi phí / tháng — cơ sở (500 người) | Chi phí / tháng — cao (1.500 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemini-3.1-flash-lite` (vào 0.25 · ra 1.5 $/1M) | $0.0020 (≈ 51 ₫) | $0.0020 (≈ 51 ₫) | $0.00092 (≈ 23 ₫) | $0.5109 (≈ 12.976 ₫) | $1.28 (≈ 32.439 ₫) | $3.83 (≈ 97.317 ₫) | $0.0026 (≈ 65 ₫) |
| `gpt-5-mini` (vào 0.25 · ra 2.0 $/1M) | $0.0022 (≈ 55 ₫) | $0.0022 (≈ 55 ₫) | $0.0010 (≈ 26 ₫) | $0.5579 (≈ 14.170 ₫) | $1.39 (≈ 35.424 ₫) | $4.18 (≈ 106.272 ₫) | $0.0028 (≈ 71 ₫) |
| `gpt-5` (vào 1.25 · ra 10.0 $/1M) | $0.0109 (≈ 276 ₫) | $0.0109 (≈ 276 ₫) | $0.0050 (≈ 128 ₫) | $2.79 (≈ 70.848 ₫) | $6.97 (≈ 177.120 ₫) | $20.92 (≈ 531.359 ₫) | $0.0139 (≈ 354 ₫) |

Chi phí / task thành công = chi phí trung bình mỗi phiên ÷ tỉ lệ đạt — **không coi như đạt 100%**.

## 3. So với impact

- Impact / người / tháng (`spec.md` §2): ~17 phút/tháng trên 1.000 khách tự túc (284 giờ/tháng ÷ 1.000 người, từ `evidence/survey/results.csv` và tự ước tính).
- Chi phí / người / tháng (cơ sở, model `gemini-3.1-flash-lite`): `$0.0026` (**≈ 65 ₫/người/tháng**; với `gpt-5-mini` là **≈ 71 ₫/người/tháng**).
- **Kết luận một dòng — đáng làm không:** **Rất đáng làm** — chỉ tốn khoảng `51 ₫/lịch` (`65 ₫/người/tháng`) để tiết kiệm hàng chục phút đến vài giờ tìm hiểu và khớp giờ mở cửa/ngân sách; dùng `gemini-3.1-flash-lite` hoặc `gpt-5-mini` rẻ hơn `5.4×` so với `gpt-5` mà vẫn đạt `100%` trên bộ câu thử.

## 4. *(Muốn sâu hơn, không bắt buộc)*

- **Độ nhạy model:** Chuyển từ `gpt-5` sang `gemini-3.1-flash-lite` giảm chi phí tháng cơ sở từ `177.120 ₫` xuống `32.439 ₫` (giảm ~82%).
- **Chi phí ngoài model:** Hosting backend nhẹ + lưu trữ danh mục JSON tĩnh (gần như 0đ ở quy mô pilot 500 người/tháng); không tốn giờ công duyệt vì khách tự quyết lưu lịch.
