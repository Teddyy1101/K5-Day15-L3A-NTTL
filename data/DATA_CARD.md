# Data card — dữ liệu bản chạy thử dùng

> Phụ trách: **Phạm Thị Hồng Ngọc** · Nhóm **NTTL (L3A · Track C)**
> Bản đầu nộp CP2 (27/11/2026) · Kiểm tra tự động bằng `python3 data/validate_places.py`.

## Dataset 1 · Danh mục địa điểm du lịch Hà Nội (`places_hanoi.json` / `places_hanoi.csv`)

| | |
|---|---|
| Dùng để làm gì | Nguồn sự thật (ground truth) cho các công cụ `tra_dia_diem`, `toi_uu_lo_trinh_tsp`, `kiem_lich_trinh` trong `codebase/tools.py` và làm căn cứ chấm bộ câu thử `eval/benchmark.csv` |
| Từ đâu | Nhóm tự tổng hợp và chuẩn hoá dựa trên danh sách địa điểm Hà Nội từ nền tảng dự án web sẵn có của nhóm, đối chiếu thêm giờ mở cửa, ngày đóng cửa và giá vé công khai tại thời điểm kiểm tra |
| Xử lý những bước gì | (1) Chuẩn hoá mã định danh `HN01–HN24` · (2) Bổ sung đủ trường kiểm ràng buộc (`open_time`, `close_time`, `closed_days`, `duration_min`, `estimated_cost_vnd`, `indoor`, `kid_friendly`) · (3) Chạy kiểm tra tự động tọa độ, trùng mã, giờ mở < giờ đóng và xuất bản CSV phẳng bằng `data/validate_places.py` |
| Số dòng / số đoạn | **24 địa điểm** tại Hà Nội (phủ 6 quận/huyện: Hoàn Kiếm, Ba Đình, Đống Đa, Tây Hồ, Cầu Giấy, Gia Lâm) |
| Phiên bản / ngày lấy | `v1.0` · 27/11/2026 |
| Nhãn | Tổng hợp từ thông tin công khai, chuẩn hoá phục vụ chạy thử (`curated_public_info` — **không phải** bằng chứng pain) |
| Giới hạn | Chỉ phủ **Hà Nội** (cố ý để kiểm tra khả năng từ chối / báo "chưa có dữ liệu" khi hỏi thành phố khác); giá vé và giờ mở cửa là mức tham khảo cố định (chưa cập nhật theo lễ/Tết hoặc biến động giá thời gian thực); chưa có dữ liệu kẹt xe thực tế (thời gian di chuyển ước tính từ tọa độ + hệ số đường đô thị) |

### Cấu trúc trường dữ liệu (cho `codebase/tools.py` và `codebase/agent.py`)

| Nhóm trường | Tên cột | Kiểu & mục đích kiểm tra |
|---|---|---|
| Định danh & vị trí | `id`, `name`, `city`, `district`, `lat`, `lng` | Chống AI bịa địa điểm (chỉ chấp nhận `id` tồn tại trong file) và tính ma trận khoảng cách TSP |
| Khung giờ & ngày mở | `open_time`, `close_time` (`HH:MM`), `closed_days` (`Mon..Sun`), `duration_min` | Code `kiem_lich_trinh` phát hiện trễ giờ đóng cửa, đi nhầm ngày bảo trì hoặc chồng lịch |
| Chi phí & sở thích | `estimated_cost_vnd`, `cost_note`, `categories`, `best_slots`, `tags` | Code tính tổng chi phí toàn chuyến 1–3 ngày (AI không tự cộng nhẩm) và lọc theo sở thích |
| Bối cảnh đặc thù | `indoor` (`bool`), `kid_friendly` (`bool`), `notes` | Hỗ trợ tình huống khó: trời mưa (ưu tiên điểm trong nhà), gia đình có trẻ nhỏ, giải thích lý do chọn |

### Độ phủ tình huống khó trong dữ liệu (tránh bẫy "dữ liệu quá sạch")
- **Đóng cửa theo thứ (5 điểm):** `HN01` Lăng Bác (đóng Thứ 2 & Thứ 6) · `HN05` Bảo tàng Dân tộc học, `HN06` Bảo tàng Mỹ thuật, `HN07` Bảo tàng Lịch sử QG (đóng Thứ 2) · `HN16` Chợ đêm Phố Cổ (chỉ mở Thứ 6–Chủ nhật).
- **Khung giờ hẹp ≤ 4 tiếng (3 điểm):** `HN01` Lăng Bác (07:30–10:30), `HN12` Phở Bát Đàn (06:00–10:00), `HN11` Bún Chả Hàng Quạt (10:00–14:00) — dùng để kiểm ca **tuyến ngắn nhất bị trễ giờ đóng cửa**.
- **Chênh lệch ngân sách & khoảng cách:** Từ miễn phí (`HN01`, `HN10`) đến 230.000–280.000đ (`HN22` Lotte Sky Walk, `HN23` Thủy cung Lotte); có điểm xa trung tâm (`HN05` ~6 km, `HN23` ~7 km, `HN21` Bát Tràng ~13 km) để kiểm trade-off thời gian di chuyển.

---

## Dataset 2 · Bằng chứng người dùng (sẽ bổ sung đủ ở CP3)

| | |
|---|---|
| Dùng để làm gì | Đào và kiểm chứng bằng chứng pain (không đưa vào công cụ lập lịch) |
| Từ đâu | Phỏng vấn ≥3 người ngoài nhóm (`evidence/interviews/P1..P4.md`) và khảo sát / review công khai (`evidence/data-mining.md`) |
| Xử lý những bước gì | Ẩn danh toàn bộ họ tên, email, tài khoản; chỉ giữ mã `P1..Pn` và trích tối đa 2 câu nguyên văn |
| Trạng thái | Đang thu thập (chốt đủ số liệu trước CP3 10:00 ngày 28/11/2026) |
