# Khảo sát — thói quen và khó khăn khi lập kế hoạch du lịch tự túc

- Form: Google Form "KHẢO SÁT THÓI QUEN VÀ KHÓ KHĂN KHI LẬP KẾ HOẠCH DU LỊCH TỰ TÚC"
- Kênh đã gửi: __ *(nhóm điền)* · mở: __ · bản xuất dùng ở đây: phiếu cuối lúc 27/11/2026 18:45:42 (13 phiếu)
- Bản xuất gốc chỉ có dấu thời gian + câu trả lời, không có tên / email. `results.csv` giữ nguyên câu trả lời, đổi tên cột cho ngắn; câu chọn nhiều ngăn bằng ` | `.
- Đếm: `python evidence/survey/count_survey.py`

| Cột trong `results.csv` | Câu hỏi (nguyên văn) | Kiểu |
|---|---|---|
| `thoi_gian` | Dấu thời gian | tự động |
| `do_tuoi` | Độ tuổi của bạn? | chọn một |
| `so_chuyen_nam` | Bạn thường đi du lịch tự túc (tự lên lịch trình, không đi theo tour) bao nhiêu lần mỗi năm? | chọn một |
| `thoi_gian_len_lich` | Trung bình bạn mất bao lâu để tìm hiểu và lên lịch trình cho một chuyến đi 2–3 ngày? | chọn một / khác |
| `cong_cu` | Hiện tại, bạn thường dùng những công cụ nào để tìm địa điểm và sắp xếp lịch trình? | chọn nhiều |
| `kho_nhat` | Khi tự lên kế hoạch cho một chuyến đi, bạn cảm thấy mất thời gian hoặc gặp khó khăn nhất ở khâu nào? | chọn nhiều |
| `kc_nhieu_app` | Mức độ khó chịu [Phải mở cùng lúc 4–5 ứng dụng/tab khác nhau chỉ để lên lịch cho 1 ngày đi chơi.] | 1–5 |
| `kc_xa_nguoc_duong` | Mức độ khó chịu [Tự xếp lịch trình xong nhưng đến nơi mới phát hiện các điểm ở quá xa nhau hoặc ngược đường.] | 1–5 |
| `kc_doc_review` | Mức độ khó chịu [Phải đọc/xem rất nhiều bài review mới biết một địa điểm có điểm trừ gì cần lưu ý (đông đúc, giá cao, khó gửi xe...).] | 1–5 |
| `kc_thieu_anh` | Mức độ khó chịu [Xem tên địa điểm nhưng thiếu hình ảnh thực tế nên khó quyết định có nên đi hay không.] | 1–5 |
| `kc_kho_sua` | Mức độ khó chịu [Đã lên kế hoạch nhưng khó chỉnh sửa lại nhanh chóng khi thời tiết thay đổi hoặc muốn đổi điểm đến.] | 1–5 |
| `tung_bo_doi_diem` | Bạn đã từng từ bỏ hoặc thay đổi một địa điểm trong lịch trình chỉ vì thiếu thông tin/review rõ ràng chưa? | chọn một |
| `thong_tin_quan_trong` | Khi tìm hiểu một địa điểm mới, thông tin nào quan trọng nhất giúp bạn ra quyết định? | chọn nhiều |
| `hi_goi_y_lich` | Mức độ hữu ích [Tự động gợi ý lịch trình chi tiết theo số ngày, ngân sách và sở thích cá nhân.] | 1–5 |
| `hi_sap_xep_duong` | Mức độ hữu ích [Tự động sắp xếp lại thứ tự các địa điểm đã chọn sao cho quãng đường di chuyển ngắn nhất.] | 1–5 |
| `hi_tom_tat_review` | Mức độ hữu ích [Tóm tắt nhanh các điểm cộng, điểm trừ cần lưu ý từ nhiều nguồn review khác nhau.] | 1–5 |
| `hi_anh_video` | Mức độ hữu ích [Xem trực tiếp ảnh thực tế và các bài viết/video review liên quan ngay tại một nơi mà không cần chuyển ứng dụng.] | 1–5 |
| `hi_luu_chia_se` | Mức độ hữu ích [Lưu trữ, kéo thả chỉnh sửa lịch trình và chia sẻ dễ dàng cho bạn bè đi cùng.] | 1–5 |
| `mong_muon` | Nếu có một điều bạn mong muốn nhất để việc lập kế hoạch du lịch trở nên nhẹ nhàng hơn, đó là gì? | đoạn văn, tuỳ chọn |

**Giới hạn của bộ câu hỏi:** các câu "mức độ hữu ích" là ý kiến, không phải hành vi đã xảy ra — không dùng làm bằng chứng pain chính. Khảo sát hỏi du lịch tự túc nói chung, không riêng Hà Nội.
