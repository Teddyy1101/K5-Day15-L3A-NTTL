# Tóm tắt mô phỏng simulate-1@20261127-223955

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| khach_di_1_ngay | 19 | 1 | 2288 | 135 | 1.1 | 5.5 |
| khach_di_2_3_ngay | 13 | 3 | 7972 | 543 | 3.8 | 17.5 |
| khach_nhom_gia_dinh | 6 | 4 | 11887 | 725 | 5.7 | 22.3 |

Tỉ lệ đạt dùng để tính: 20/20 (100%) — lượt run-2@20261127-221642

- Tỉ lệ đạt lấy từ lượt nhóm chọn: eval/run-2.csv (--rate-from).

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (200 người) | Chi phí / tháng — cơ sở (500 người) | Chi phí / tháng — cao (1.500 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemini-3.1-flash-lite (vào 0.25 · ra 1.5 $/1M) | $0.0020 (≈ 51 ₫) | $0.0020 (≈ 51 ₫) | $0.00092 (≈ 23 ₫) | $0.5109 (≈ 12.976 ₫) | $1.28 (≈ 32.439 ₫) | $3.83 (≈ 97.317 ₫) | $0.0026 (≈ 65 ₫) |
| gpt-5-mini (vào 0.25 · ra 2.0 $/1M) | $0.0022 (≈ 55 ₫) | $0.0022 (≈ 55 ₫) | $0.0010 (≈ 26 ₫) | $0.5579 (≈ 14.170 ₫) | $1.39 (≈ 35.424 ₫) | $4.18 (≈ 106.272 ₫) | $0.0028 (≈ 71 ₫) |
| gpt-5 (vào 1.25 · ra 10.0 $/1M) | $0.0109 (≈ 276 ₫) | $0.0109 (≈ 276 ₫) | $0.0050 (≈ 128 ₫) | $2.79 (≈ 70.848 ₫) | $6.97 (≈ 177.120 ₫) | $20.92 (≈ 531.359 ₫) | $0.0139 (≈ 354 ₫) |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (2.2) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: gemini-3.1-flash-lite. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 12/50.
- Tỷ giá: 1 USD = 25.400 ₫ (Tỉ giá tham khảo Vietcombank ~25.400 VND/USD (tự ước tính cho bản nháp)).
