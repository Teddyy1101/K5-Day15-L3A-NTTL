# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-221226` | `15/20` | `75%` | `6/9` (`67%`) | `6/7` (`86%`) | `3/4` (`75%`) | **chưa đạt** (do <80% và `tu_choi` <100%; có 4 câu lỗi HTTP 503) |
| 2 | `run-2@20261127-221642` | `20/20` | `100%` | `9/9` (`100%`) | `7/7` (`100%`) | `4/4` (`100%`) | **đạt** (0 lỗi kỹ thuật, 0 lịch sai giờ/vượt ngân sách) |
| 3 | `run-3@20261127-232149` | `20/25` | `80%` | `8/12` (`67%`) | `8/9` (`89%`) | `4/4` (`100%`) | **đạt** (mở rộng 25 câu từ review Google Maps; 5 câu lỗi timeout/503) |
| 4 | `run-4@20261127-232826` | `23/25` | `92%` | `11/12` (`92%`) | `8/9` (`89%`) | `4/4` (`100%`) | **đạt** (retry `TimeoutError` + timeout 45s; còn 2 câu lỗi HTTP 503) |

Kết quả từng câu: `eval/run-1.csv` → `eval/run-4.csv`. Trace: `traces/run-1.jsonl` → `traces/run-4.jsonl`.

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

- **Lượt 5 (`gpt-5-mini`, `eval/run-2-cp4.csv`, run ID `run-2@20261128-110858`):** chạy trên bộ 30 câu `B01–B30` của `main`, 30/30 câu, 0 lỗi kỹ thuật, kết quả chấm nháp `28/30 (93%)`: `thuong` 12/12 · `kho` 11/13 · `tu_choi` 5/5. Trượt `B14` (ngân sách 100k: lịch trống, nhãn sai "chưa có dữ liệu", câu bị cắt) và `B29` (không nói rõ chưa có dữ liệu chỗ đỗ xe / cấm đường). Cột `pass` là chấm nháp; Bùi Văn Lâm cần kiểm lại trước khi chốt. Chi phí của lượt này chưa có mô phỏng.

## 4. Còn lại

- **Lỗi chưa sửa + nguy hiểm thế nào:** Bộ `run.py eval` chạy từng câu độc lập nên chưa đo tự động được kịch bản **sửa lịch nhiều lượt** (mới test tay qua `agent.edit()` với trường hợp bỏ điểm + giảm ngân sách). Ngoài ra dữ liệu giờ mở cửa và giá vé vẫn là dữ liệu tĩnh 24 điểm, giá di chuyển là ước tính.
- **Nếu có thêm 1 tuần:** Bổ sung bộ test tự động cho hội thoại sửa lịch nhiều lượt (`edit()`), mở rộng danh mục địa điểm Hà Nội và cập nhật nguồn giá vé/giờ mở cửa theo mùa.
