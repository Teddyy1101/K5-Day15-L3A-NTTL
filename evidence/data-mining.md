# Đào review công khai — cách đếm và kết quả

> Phụ trách: **Phạm Thị Hồng Ngọc** · Nguồn bằng chứng thứ hai đối chiếu với khảo sát (`evidence/survey/`).
> Quy tắc dữ liệu: không chép tên người viết review, mỗi ví dụ trích tối đa 2 câu nguyên văn, ghi rõ link nguồn và ngày xem (`27/11/2026`). Bảng gắn nhãn đầy đủ (đã ẩn danh) nằm ở `evidence/reviews_labeled.csv`; chạy lại số bằng `python3 evidence/count_reviews.py`.

## 1. Cách chọn mẫu & cách đếm — viết TRƯỚC khi chạy

- **Nguồn dữ liệu:** Review công khai trên Google Maps (xem ngày **27/11/2026**) của **5 địa điểm Hà Nội** — cố ý trộn **3 điểm có ràng buộc giờ/ngày đóng** với **2 điểm mở cửa cả tuần (đối chứng)** để tránh lệch mẫu:
  1. [Lăng Chủ tịch Hồ Chí Minh (`HN01`)](https://www.google.com/maps/place/L%C4%83ng+Ch%E1%BB%A7+t%E1%BB%8Bch+H%E1%BB%93+Ch%C3%AD+Minh/@21.0368973,105.8320864,17z/data=!4m8!3m7!1s0x3135aba15ec15d17:0x620e85c2cfe14d4c!8m2!3d21.0368973!4d105.8346667!9m1!1b1!16s%2Fm%2F02xbhg7?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D) — đóng Thứ 2 & Thứ 6, chỉ mở buổi sáng
  2. [Bảo tàng Dân tộc học Việt Nam (`HN05`)](https://www.google.com/maps/place/B%E1%BA%A3o+t%C3%A0ng+D%C3%A2n+t%E1%BB%99c+h%E1%BB%8Dc+Vi%E1%BB%87t+Nam/@21.0403422,105.7961551,17z/data=!4m8!3m7!1s0x3135ab394353b821:0x47c950bb0f081a1c!8m2!3d21.0403422!4d105.7987354!9m1!1b1!16s%2Fm%2F03c23m3?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D) — đóng Thứ 2, xa trung tâm
  3. [Bún Chả Hàng Quạt (`HN11`)](https://www.google.com/maps/place/B%C3%BAn+ch%E1%BA%A3+74+H%C3%A0ng+Qu%E1%BA%A1t/@18.5251236,104.368086,7z/data=!4m10!1m2!2m1!1zQsO6biBDaOG6oyBIw6BuZyBRdeG6oXQ!3m6!1s0x3135ab001163e089:0x413a37b83f2fc44b!8m2!3d21.0325441!4d105.8488354!15sChdCw7puIENo4bqjIEjDoG5nIFF14bqhdFoZIhdiw7puIGNo4bqjIGjDoG5nIHF14bqhdJIBCnJlc3RhdXJhbnSaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnBPUkdOc2JEQk9hMHA0WWxjeFMyRnNPV3BpZWtreFdtczFVVkl3UlJBQuABAPoBBAgAEEM!16s%2Fg%2F11xmz9plpx?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D) — chỉ bán buổi trưa 10:00–14:00
  4. [Hoàng Thành Thăng Long (`HN04`)](https://www.google.com/maps/place/Ho%C3%A0ng+Th%C3%A0nh+Th%C4%83ng+Long/@21.0352231,105.8376791,17z/data=!3m1!4b1!4m6!3m5!1s0x3135aba3381d7c49:0xb521a7d98f582937!8m2!3d21.0352231!4d105.8402594!16s%2Fm%2F05zw9vk?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D) — mở cửa cả tuần *(điểm đối chứng)*
  5. [Hồ Hoàn Kiếm (`HN18`)](https://www.google.com/maps/place/H%E1%BB%93+Ho%C3%A0n+Ki%E1%BA%BFm/@21.0352473,105.8299707,15z/data=!4m10!1m2!2m1!1zSOG7kyBIb8OgbiBLaeG6v20gLyDEkOG7gW4gTmfhu41jIFPGoW4!3m6!1s0x3135ab953357c995:0x1babf6bb4f9a20e!8m2!3d21.0286669!4d105.8521484!15sCiZI4buTIEhvw6BuIEtp4bq_bSAvIMSQ4buBbiBOZ-G7jWMgU8ahblomIiRo4buTIGhvw6BuIGtp4bq_bSDEkeG7gW4gbmfhu41jIHPGoW6SAQRsYWtlmgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDI1b1lWWXlXakpoTVc4eVlucHNibE5ZU1hkVlZrcHRXbnBvVldWdVl4QULgAQD6AQQIABBD!16zL20vMGdwNjV3?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D) — mở cửa cả tuần *(điểm đối chứng)*
- **Cách chọn mẫu (không chọn lọc riêng review chê):** Ở mỗi điểm, sắp xếp theo **"Mới nhất"**, lấy **lần lượt 10 review đầu tiên** (tính cả review khen, chê, không liên quan và 3 review chỉ chấm sao ở Hồ Gươm) → tổng mẫu số **N = 50 review**. Lưu ý: `date_viewed = 27/11/2026` là **ngày xem và thu thập**; các bình luận được người dùng đăng trong khoảng vài ngày gần nhất tính đến 27/11/2026 (không phải toàn bộ đều đăng đúng ngày 27/11).
- **Định nghĩa 5 nhãn (mỗi review gắn đúng 1 nhãn chính):**
  - `dong_cua_sai_gio` *(đóng cửa / sai giờ)*: đến nơi mới biết đóng cửa theo thứ (Thứ 2/Thứ 6), hết giờ mở cửa hoặc đóng giữa ngày.
  - `cho_lau_lo_lich` *(chờ lâu làm lỡ lịch)*: phải xếp hàng / chờ lâu vào giờ cao điểm hoặc luôn đông phải đợi.
  - `gia_khac_du_tinh` *(giá khác dự tính)*: giá cao hơn kỳ vọng hoặc không tương xứng.
  - `xa_kho_di` *(xa / khó đi)*: than điểm xa trung tâm, khó đi hoặc ngược tuyến.
  - `khong_lien_quan` *(không liên quan)*: khen chung, chấm sao không chữ, hoặc nhận xét khác không liên quan việc lập lịch.
- **Mẫu số (N):** Toàn bộ **50 review** đã đọc (`evidence/reviews_labeled.csv`), kể cả `khong_lien_quan`.
- **Cách gắn nhãn & kiểm tra:** AI hỗ trợ gắn nhãn nháp và dịch các review ngoại ngữ (Romania, Hàn, Nhật, Pháp, Trung); **Phạm Thị Hồng Ngọc tự đọc và kiểm tay lại 50/50 dòng**.
- **Script đếm kiểm lại được:** `python3 evidence/count_reviews.py`.

## 2. Đọc trước, đếm sau

Sau khi đọc lần lượt 50 review mới nhất trên Google Maps (gồm cả du khách Việt và quốc tế):
- Đa số review mới nhất là lời khen ngắn hoặc chỉ chấm sao (45/50), nhưng **2/2 trường hợp bị đóng cửa đều để lại đánh giá 1 sao** (một khách đi ghép sau Chùa Một Cột đến Lăng Bác giữa ngày thấy đóng; một khách đến Bảo tàng Dân tộc học đúng Thứ 2 bị đóng cửa).
- Ngoài 5 review nêu rõ pain, một số review còn xác nhận trực tiếp dữ liệu nền của nhóm: thời lượng tham quan Hoàng Thành >1 tiếng (`R37`), cảnh báo nếu thời gian ít không nên cất công đi Hoàng Thành (`R39`), và vé Đền Ngọc Sơn 50.000đ + đi bộ từ Nhà thờ Lớn sang Hồ Gươm (`R49`).

## 3. Kết quả (`python3 evidence/count_reviews.py`)

- **Tổng review có pain liên quan lập lịch:** **5 / 50 (10.0%)**
- **So sánh hai nhóm điểm:**
  - Nhóm **3 điểm có ràng buộc giờ/ngày đóng** (`HN01`, `HN05`, `HN11`, `n = 30`): **4 / 30 (13.3%)** có pain lập lịch, trong đó **2 / 30 (6.7%)** gặp lỗi **đóng cửa / sai giờ** (cả 2 đều chấm 1 sao).
  - Nhóm **2 điểm mở cả tuần đối chứng** (`HN04`, `HN18`, `n = 20`): **1 / 20 (5.0%)** có pain (chờ lâu mùa cao điểm), **0 / 20 (0.0%)** gặp lỗi đóng cửa.

| Nhãn vấn đề | x / N | % | Ghi chú |
|---|---:|---:|---|
| `dong_cua_sai_gio` *(đóng cửa / sai giờ)* | **2 / 50** | **4.0%** | Cả 2 đều 1★: `R02` (Lăng Bác đóng giữa ngày), `R19` (Bảo tàng DTH đóng Thứ 2) |
| `cho_lau_lo_lich` *(chờ lâu làm lỡ lịch)* | **2 / 50** | **4.0%** | `R27` (Bún Chả Hàng Quạt luôn phải đợi), `R32` (Hoàng Thành chờ lâu mùa cao điểm) |
| `gia_khac_du_tinh` *(giá khác dự tính)* | **1 / 50** | **2.0%** | `R25` (Bún Chả Hàng Quạt: cảm thấy giá cao so với kỳ vọng) |
| `xa_kho_di` *(xa / khó đi)* | **0 / 50** | **0.0%** | Không xuất hiện trong 50 review mới nhất (xem phân tích mục 5) |
| `khong_lien_quan` *(không liên quan)* | **45 / 50** | **90.0%** | Khen chung, chấm sao không chữ (3 dòng), nhận xét nội dung/hành lý |

## 4. 5 ví dụ trích dẫn nguyên văn (bỏ tên, tối đa 2 câu — dùng làm nguồn `data_that` cho bộ câu thử)

1. **[R02 · `HN01` Lăng Bác · 1★ · `dong_cua_sai_gio` · Google Maps · xem 27/11/2026]:**
   *"In plina zi sa fii inchis?! Se deschidea abia la ora 14:00...."*
   *(Dịch: "Giữa ban ngày mà đóng cửa?! Tận 14:00 mới mở...." — khách vừa thăm Chùa Một Cột định ghé luôn Lăng Bác nhưng không biết Lăng chỉ mở sáng).*
2. **[R19 · `HN05` Bảo tàng Dân tộc học · 1★ · `dong_cua_sai_gio` · Google Maps · xem 27/11/2026]:**
   *"23일(월요일) 갔으나 휴관 임. 매표소 안내에 월요일및 설 휴관이라고.ㅜㅜ"*
   *(Dịch: "Đến ngày 23 (Thứ 2) thì đóng cửa. Quầy vé ghi đóng cửa Thứ 2 và dịp Tết." — khách quên tra ngày đóng cửa trước khi đi).*
3. **[R25 · `HN11` Bún Chả Hàng Quạt · 4★ · `gia_khac_du_tinh` · Google Maps · xem 27/11/2026]:**
   *"Food was just okay, but it little bit overrated for price to me."*
   *(Dịch: "Đồ ăn bình thường, nhưng với mình giá hơi cao so với kỳ vọng.")*
4. **[R27 · `HN11` Bún Chả Hàng Quạt · 5★ · `cho_lau_lo_lich` · Google Maps · xem 27/11/2026]:**
   *"항상 웨이팅이 있는 현지인 맛집입니다. 기본 분짜에 넴이 포함돼있는것이 특징."*
   *(Dịch: "Quán địa phương lúc nào cũng phải xếp hàng chờ đợi.")*
5. **[R32 · `HN04` Hoàng Thành Thăng Long · 5★ · `cho_lau_lo_lich` · Google Maps · xem 27/11/2026]:**
   *"Vào mùa cao điểm kỷ yếu, lượng khách và học sinh đổ về khá đông khiến một số góc chụp đẹp phải chờ đợi lâu."*

*(Bổ sung 2 review bối cảnh lịch trình cho Lâm tham khảo viết biến thể câu thử: `R39` Hoàng Thành 2★ — "地方很大，但可以看的東西不多，如果時間有限不需要專程過去" [chỗ rất rộng, nếu ít thời gian không cần cất công đi riêng]; `R49` Hồ Gươm 5★ — "Its in walkable distance from st cathedral church... For temple you need to buy ticket 50k vnd per person".)*

## 5. Giới hạn của dữ liệu & đối chiếu với khảo sát (`evidence/survey/`)

- **Giới hạn:** Cỡ mẫu `N = 50` (10 review mới nhất/điểm) chưa đại diện cho mọi mùa du lịch trong năm; review Google Maps viết cho **từng địa điểm riêng lẻ** nên phản ánh rõ lỗi tại chỗ (đóng cửa, chờ lâu, giá), nhưng ít nhắc tới việc đi vòng giữa nhiều điểm trong cùng một ngày.
- **Đối chiếu hai nguồn (Khảo sát vs. Review Google Maps):**
  - **Chỗ khớp:** Cả hai nguồn đều xác nhận tồn tại pain thật về **lỡ điểm do thiếu thông tin giờ/ngày đóng cửa**, **chờ lâu ảnh hưởng lịch** và **dự trù chi phí**. Đặc biệt trên Google Maps, **2/2 ca bị đóng cửa (`R02`, `R19`) đều dẫn đến đánh giá 1 sao** — khẳng định hậu quả thực tế rất nặng dù tỷ lệ trên tổng review mới nhất không cao (4% toàn mẫu, 6.7% ở điểm có ràng buộc).
  - **Chỗ lệch và lý do:** Trong khảo sát, nhiều người chọn khó ở khâu **sắp thứ tự thuận đường** (7/13 ở bản CP2), trong khi review Google Maps có **0/50** dòng than ngược đường — vì khách chấm điểm từng địa điểm đơn lẻ thay vì chấm cả lịch trình ngày. Ngược lại, trong khảo sát chỉ 4/13 coi giờ mở cửa là thông tin ưu tiên nhất, nhưng review Google Maps cho thấy **chính sự chủ quan không kiểm tra trước khiến khách đến nơi mới gặp cửa đóng** (`R19` tự than *"biết vậy kiểm tra trước khi đi"*). Hai nguồn bổ trợ nhau để giải thích vì sao hệ thống cần **code tự động kiểm giờ mở cửa, ngày đóng cửa và ngân sách** thay vì để khách tự tra tay.
