# Data card — dữ liệu bản chạy thử dùng

> Phụ trách: **Phạm Thị Hồng Ngọc** · Nhóm **NTTL (L3A · Track C)**
> Cập nhật nguồn chi tiết (27/11/2026) · Kiểm tra tự động bằng `python3 data/validate_places.py`.

## Dataset 1 · Danh mục địa điểm du lịch Hà Nội (`places_hanoi.json` / `places_hanoi.csv`)

| | |
|---|---|
| Dùng để làm gì | Nguồn sự thật (ground truth) cho các công cụ `tra_dia_diem`, `sap_xep_lo_trinh`, `kiem_lich_trinh` trong `codebase/tools.py` và làm căn cứ chấm bộ câu thử `eval/benchmark.csv` |
| Từ đâu | Danh sách 24 địa điểm Hà Nội lấy từ nền tảng dự án web của nhóm, đối chiếu trực tiếp giờ mở cửa, ngày đóng cửa và giá vé với trang chính thức của từng di tích/bảo tàng và Google Maps (chi tiết link và ngày xem ở bảng dưới) |
| Xử lý những bước gì | (1) Chuẩn hoá mã định danh `HN01–HN24` · (2) Bổ sung đủ trường kiểm ràng buộc (`open_time`, `close_time`, `closed_days`, `duration_min`, `estimated_cost_vnd`, `indoor`, `kid_friendly`) · (3) Chạy kiểm tra tự động tọa độ, trùng mã, `open_time < close_time`, ngày đóng cửa và xuất CSV phẳng bằng `data/validate_places.py` |
| Số dòng / số đoạn | **24 địa điểm** tại Hà Nội (phủ 6 quận/huyện: Hoàn Kiếm, Ba Đình, Đống Đa, Tây Hồ, Cầu Giấy, Gia Lâm) |
| Phiên bản / ngày lấy | `v1.2` · cập nhật **27/11/2026** |
| Nhãn | Tổng hợp và đối chiếu từ trang chính thức + Google Maps (`verified_public_sources` — **không phải** bằng chứng pain) |
| Giới hạn | Chỉ phủ **Hà Nội** (cố ý để kiểm tra khả năng từ chối / báo "chưa có dữ liệu" khi hỏi thành phố khác); giá vé và giờ mở cửa là mức chuẩn ban ngày ngày thường (chưa cập nhật tự động theo mùa nóng/lạnh, ngày lễ/Tết hoặc tour đêm); thời gian di chuyển ước tính từ tọa độ GPS chưa gồm kẹt xe thời gian thực |

### Bảng nguồn đối chiếu giờ mở cửa, ngày đóng cửa & giá vé (kiểm 27/11/2026)

| Mã | Địa điểm | Ràng buộc chính trong JSON | Link nguồn đối chiếu | Ngày xem |
|---|---|---|---|---|
| `HN01` | Lăng Chủ tịch Hồ Chí Minh | `07:30–10:30` · Đóng `Mon`, `Fri` · `0đ` | https://bqllang.gov.vn | 27/11/2026 |
| `HN02` | Văn Miếu – Quốc Tử Giám | `08:00–17:00` · Mở cả tuần · `70.000đ` | https://vanmieu.gov.vn | 27/11/2026 |
| `HN03` | Di tích Nhà tù Hỏa Lò | `08:00–17:00` · Mở cả tuần · `50.000đ` | https://hoalo.vn | 27/11/2026 |
| `HN04` | Hoàng Thành Thăng Long | `08:00–17:00` · Mở cả tuần · `100.000đ` | https://hoangthanhthanglong.vn | 27/11/2026 |
| `HN05` | Bảo tàng Dân tộc học VN | `08:30–17:30` · Đóng `Mon` · `40.000đ` | https://vme.org.vn | 27/11/2026 |
| `HN06` | Bảo tàng Mỹ thuật VN | `08:30–17:00` · Mở cả tuần · `40.000đ` | https://vnfam.vn | 27/11/2026 |
| `HN07` | Bảo tàng Lịch sử Quốc gia | `08:00–17:00` (nghỉ trưa `12:00–13:30`) · Đóng `Mon` · `40.000đ` | https://baotanglichsu.vn | 27/11/2026 |
| `HN08` | Bảo tàng Phụ nữ Việt Nam | `08:00–17:00` · Mở cả tuần · `40.000đ` | https://baotangphunu.org.vn | 27/11/2026 |
| `HN09` | Nhà hát Múa rối Nước Thăng Long | `13:45–21:00` (các suất chiều/tối) · `150.000đ` | https://thanglongwaterpuppet.com | 27/11/2026 |
| `HN11` | Bún Chả Hàng Quạt | `10:00–14:00` (chỉ bán trưa) · `55.000đ` | Google Maps (`74 Hàng Quạt, Hoàn Kiếm`) | 27/11/2026 |
| `HN12` | Phở Gia Truyền Bát Đàn | `06:00–10:00` (ca sáng) · `65.000đ` | Google Maps (`49 Bát Đàn, Hoàn Kiếm`) | 27/11/2026 |
| `HN16` | Phố Ẩm Thực Tạ Hiện & Chợ Đêm | `18:00–23:00` · Chợ đêm chỉ mở `Fri–Sun` · `180.000đ` | Cổng TTĐT quận Hoàn Kiếm & Google Maps (`Hàng Đào – Tạ Hiện`) | 27/11/2026 |
| `HN21` | Làng gốm Bát Tràng & Bảo tàng Gốm | `08:00–17:30` · `160.000đ` · cách trung tâm ~13 km | Google Maps (`Làng gốm Bát Tràng, Gia Lâm`) | 27/11/2026 |
| `HN22` | Đài quan sát Lotte Center (Sky Walk) | `09:30–22:00` · `230.000đ` | https://lottesky.vn | 27/11/2026 |
| `HN23` | Thủy cung Lotte World Aquarium | `09:30–21:30` · `280.000đ` (ngày thường) | https://lotteworld.vn | 27/11/2026 |
| `HN10, HN13–HN15, HN17–HN20, HN24` | Các điểm ăn uống, chùa, công viên, phố đi bộ còn lại | Giờ mở và mức chi tiêu ước tính/người | Google Maps (tra từng địa điểm tại Hà Nội) | 27/11/2026 |

### Cấu trúc trường dữ liệu (cho `codebase/tools.py` và `codebase/agent.py`)

| Nhóm trường | Tên cột | Kiểu & mục đích kiểm tra |
|---|---|---|
| Định danh & vị trí | `id`, `name`, `city`, `district`, `lat`, `lng` | Chống AI bịa địa điểm (chỉ chấp nhận `id` tồn tại trong file) và tính khoảng cách trong `sap_xep_lo_trinh` |
| Khung giờ & ngày mở | `open_time`, `close_time` (`HH:MM`), `closed_days` (`Mon..Sun`), `duration_min` | Code `kiem_lich_trinh` phát hiện trễ giờ đóng cửa, đi nhầm ngày đóng cửa hoặc chồng lịch |
| Chi phí & sở thích | `estimated_cost_vnd`, `cost_note`, `categories`, `best_slots`, `tags` | Code tính tổng chi phí toàn chuyến 1–3 ngày (AI không tự cộng nhẩm) và lọc theo sở thích |
| Bối cảnh đặc thù | `indoor` (`bool`), `kid_friendly` (`bool`), `notes` | Hỗ trợ tình huống khó: trời mưa (ưu tiên điểm trong nhà), gia đình có trẻ nhỏ, giải thích lý do chọn |

---

## Dataset 2 · Bằng chứng người dùng & review công khai

| | |
|---|---|
| Dùng để làm gì | Đào và kiểm chứng bằng chứng pain (không đưa vào công cụ lập lịch), đồng thời cung cấp ví dụ nguồn `data_that` cho bộ câu thử |
| Từ đâu | (1) Khảo sát người dùng ngoài nhóm (`evidence/survey/results.csv`) · (2) Phỏng vấn người dùng (`evidence/interviews/`) · (3) **50 review công khai mới nhất trên Google Maps** của 5 điểm Hà Nội (`evidence/reviews_labeled.csv`, tổng hợp ở `evidence/data-mining.md`) |
| Xử lý những bước gì | Lấy lần lượt 10 review mới nhất mỗi điểm (không lọc riêng review chê), ẩn danh toàn bộ tên người viết, cắt tối đa 2 câu nguyên văn, kèm link và ngày xem `27/11/2026`; AI gắn nhãn nháp, Phạm Thị Hồng Ngọc kiểm tay lại 50/50 dòng; đếm bằng `python3 evidence/count_reviews.py` |
| Trạng thái | Đã hoàn thành phần đào review công khai (`N = 50`, 5/50 có pain lập lịch) ngày 27/11/2026 |
