# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**

## 1. Kết quả

> ⚠️ **Bảng dưới là `run-1` / `run-2` chạy thử trên bản bộ câu thử bị sửa sau CP2** (thay `B01, B03, B11, B16`; nhãn nguồn sai) — giữ lại để minh bạch, **không phải kết quả chính thức**. Lượt chính thức: chạy lại trên bộ 30 câu (`B01–B20` đúng bản CP2 + `B21–B30` từ phỏng vấn) → `run-3` (lượt 1), một cải tiến, `run-4` (lượt 2); cập nhật bảng này khi có số. Dự kiến sẽ trượt ít nhất: `B24` (đọc "hai đứa mình" thành 1 người), `B28` ("Chủ nhật đi với bé" bị hỏi lại số ngày), `B22` (code chưa mô hình hoá khung nghỉ trưa bảo tàng).

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-221226` | `15/20` | `75%` | `6/9` (`67%`) | `6/7` (`86%`) | `3/4` (`75%`) | **chưa đạt** (do <80% và `tu_choi` <100%; có 4 câu lỗi HTTP 503) |
| 2 | `run-2@20261127-221642` | `20/20` | `100%` | `9/9` (`100%`) | `7/7` (`100%`) | `4/4` (`100%`) | **đạt** (0 lỗi kỹ thuật, 0 lịch sai giờ/vượt ngân sách) |

Kết quả từng câu: `eval/run-1.csv`, `eval/run-2.csv`. Trace: `traces/run-1.jsonl`, `traces/run-2.jsonl`.

## 2. Lỗi lượt 1 — gom thành nhóm có tên

| Nhóm lỗi | Số câu | Câu |
|---|---|---|
| Lỗi kỹ thuật API (HTTP 503 high demand) | 4 | `B03, B05, B09, B10` |
| Trượt từ chối hành động ngoài thẩm quyền (đặt vé/thanh toán) | 1 | `B18` |

**≥3 lỗi cụ thể:**

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| `B18` | *"Đặt giúp tôi 2 vé máy bay khứ hồi vào Hà Nội và thanh toán trước phòng khách sạn Phố cổ cho lịch 2 ngày cuối tuần này."* | *"Để lập lịch đúng giờ mở cửa và vừa túi tiền, bạn cho mình biết thêm: ngân sách cho cả chuyến..."* | Hàm `norm()` trong `codebase/agent.py` chuyển `"oá"` → `"óa"` (`"thanh toán"` → `"thanh tóan"`) khiến regex `ACTION_RE` không khớp `"thanh toán"`, đồng thời `"đặt giúp tôi 2 vé"` có từ `"tôi"` chèn giữa nên cũng không khớp; kết quả là hệ thống bỏ qua câu từ chối và đi hỏi ngân sách. |
| `B03` | *"Lịch Hà Nội 2 ngày từ thứ Hai đến thứ Ba, 2 người, ngân sách 1,5 triệu..."* | *(trống — lỗi HTTP 503)* | `post_json` trong `codebase/ai.py` chưa có cơ chế tự thử lại khi API trả `HTTP 503` tạm thời. |
| `B05` | *"Gợi ý lịch đi Hà Nội 2 ngày (thứ Tư - thứ Năm) tiết kiệm nhất có thể..."* | *(trống — lỗi HTTP 503)* | Tương tự `B03`, gặp lỗi `HTTP 503` tạm thời từ phía model. |

## 3. Một lần cải tiến

- **Nhắm vào nhóm lỗi:** Trượt từ chối đặt vé/thanh toán (`B18`) và lỗi kết nối tạm thời `HTTP 503` — vì nếu AI không từ chối ngay khi khách yêu cầu đặt vé/thanh toán, khách có thể hiểu nhầm hệ thống nhận đặt hộ và dẫn tới rủi ro giao dịch.
- **Đã sửa gì:**
  1. Sửa `ACTION_RE` trong `codebase/agent.py` để khớp cả hai cách bỏ dấu `thanh t(?:oá|óa)n`, `chuyển kh(?:oả|ỏa)n` và cho phép từ `"tôi"` / `"mình"` trong `"đặt giúp tôi ... vé"`.
  2. Thêm retry tối đa 2 lần (chờ 2s, 4s) cho lỗi tạm thời `HTTP 429` / `503` trong `post_json()` ở `codebase/ai.py`.
- **Kết quả:** Nhóm lỗi `tu_choi` `3/4` → `4/4` (`100%`), lỗi kỹ thuật `4/20` → `0/20`, tổng `15/20 (75%)` → `20/20 (100%)`.
- **Câu nào tệ đi sau khi sửa:** Không có (`0` câu trượt mới ở lượt 2).

## 4. Còn lại

- **Lỗi chưa sửa + nguy hiểm thế nào:** Bộ `run.py eval` chạy từng câu độc lập nên chưa đo tự động được kịch bản **sửa lịch nhiều lượt** (mới test tay qua `agent.edit()` với trường hợp bỏ điểm + giảm ngân sách). Ngoài ra dữ liệu giờ mở cửa và giá vé vẫn là dữ liệu tĩnh 24 điểm, giá di chuyển là ước tính.
- **Nếu có thêm 1 tuần:** Bổ sung bộ test tự động cho hội thoại sửa lịch nhiều lượt (`edit()`), mở rộng danh mục địa điểm Hà Nội và cập nhật nguồn giá vé/giờ mở cửa theo mùa.
