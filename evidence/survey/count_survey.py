"""Đếm kết quả khảo sát — chạy lại được: python evidence/survey/count_survey.py

Đọc evidence/survey/results.csv (bản đã bỏ mọi cột nhận ra người trả lời). Mẫu số = mọi phiếu trong file.
Câu chọn nhiều: các lựa chọn ngăn bằng " | ". Thang 1–5: "≥4" = khó chịu / hữu ích nhiều.
"""
import csv
import os
import sys

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.csv")
rows = list(csv.DictReader(open(PATH, encoding="utf-8-sig")))
N = len(rows)


def show(label, x):
    print("  %-78s %2d/%d (%d%%)" % (label, x, N, round(100 * x / N)))


def has(col, text):
    return sum(1 for r in rows if text in r[col].split(" | "))


def ge4(col):
    return sum(1 for r in rows if int(r[col]) >= 4)


print("Số phiếu: N = %d" % N)

print("\nĐộ tuổi:")
for v in sorted({r["do_tuoi"] for r in rows}):
    show(v, sum(1 for r in rows if r["do_tuoi"] == v))

print("\nThời gian lên lịch cho chuyến 2–3 ngày:")
for v in ["Dưới 30 phút", "Từ 30 phút – 2 tiếng", "Từ 2 – 5 tiếng", "Trên 5 tiếng (hoặc mất nhiều ngày)"]:
    show(v, sum(1 for r in rows if r["thoi_gian_len_lich"] == v))
show("Khác (không lên lịch trước)", sum(1 for r in rows if r["thoi_gian_len_lich"].startswith("Mình thường")))
show("=> Mất từ 2 tiếng trở lên",
     sum(1 for r in rows if r["thoi_gian_len_lich"] in ("Từ 2 – 5 tiếng", "Trên 5 tiếng (hoặc mất nhiều ngày)")))

print("\nKhâu mất thời gian / khó nhất (chọn nhiều):")
STEPS = {
    "tim_kiem": "Tìm kiếm địa điểm ăn uống, vui chơi phù hợp với sở thích cá nhân",
    "review": "Đọc quá nhiều bài review dài, khó phân biệt đâu là đánh giá thật hay quảng cáo",
    "hinh_dung": "Không hình dung rõ không gian thực tế của địa điểm (thiếu ảnh thật hoặc thông tin chi tiết)",
    "thuan_duong": "Sắp xếp thứ tự các điểm đi sao cho thuận đường, không bị di chuyển lòng vòng",
    "thoi_gian_chi_phi": "Cân đối thời gian giữa các địa điểm và dự trù chi phí",
    "tong_hop": "Tổng hợp thông tin rời rạc từ nhiều nguồn (Maps, TikTok, Blog...) vào chung một bản kế hoạch",
}
for text in STEPS.values():
    show(text[:78], has("kho_nhat", text))
show("=> Chọn 'thuận đường' HOẶC 'cân đối thời gian + chi phí' (đúng lát cắt)",
     sum(1 for r in rows if {STEPS["thuan_duong"], STEPS["thoi_gian_chi_phi"]} & set(r["kho_nhat"].split(" | "))))

print("\nMức khó chịu ≥4/5:")
for col, label in [("kc_nhieu_app", "Mở 4–5 ứng dụng / tab để lên lịch 1 ngày"),
                   ("kc_xa_nguoc_duong", "Đến nơi mới thấy các điểm quá xa nhau / ngược đường"),
                   ("kc_doc_review", "Phải đọc rất nhiều review mới biết điểm trừ"),
                   ("kc_thieu_anh", "Thiếu ảnh thực tế nên khó quyết định"),
                   ("kc_kho_sua", "Khó sửa lịch nhanh khi thời tiết đổi / muốn đổi điểm")]:
    show(label, ge4(col))

print("\nĐã từng bỏ / đổi một địa điểm vì thiếu thông tin:")
for v in ["Rất thường xuyên", "Thỉnh thoảng", "Hiếm khi"]:
    show(v, sum(1 for r in rows if r["tung_bo_doi_diem"] == v))

print("\nThông tin quan trọng nhất khi chọn điểm (chọn nhiều):")
for text in ["Hình ảnh thực tế của địa điểm", "Đánh giá chi tiết / Video review thực tế",
             "Khoảng cách và thời gian di chuyển từ vị trí hiện tại (hoặc từ điểm trước đó)",
             "Tóm tắt ngắn gọn ưu điểm / nhược điểm từ người đi trước", "Giờ mở cửa và mức chi phí dự kiến"]:
    show(text[:78], has("thong_tin_quan_trong", text))

print("\n(Ý kiến, không phải hành vi) Đánh giá hữu ích ≥4/5:")
for col, label in [("hi_goi_y_lich", "Gợi ý lịch theo số ngày, ngân sách, sở thích"),
                   ("hi_sap_xep_duong", "Sắp lại thứ tự điểm cho quãng đường ngắn nhất"),
                   ("hi_tom_tat_review", "Tóm tắt điểm cộng / trừ từ nhiều review"),
                   ("hi_anh_video", "Xem ảnh / video review tại một nơi"),
                   ("hi_luu_chia_se", "Lưu, kéo thả, chia sẻ lịch")]:
    show(label, ge4(col))

print("\nCâu trả lời tự do (nguyên văn):")
for r in rows:
    if r["thoi_gian_len_lich"].startswith("Mình thường"):
        print('  - "%s" — phiếu %s (câu thời gian lên lịch)' % (r["thoi_gian_len_lich"], r["thoi_gian"]))
    if r["mong_muon"].strip():
        print('  - "%s" — phiếu %s (câu mong muốn)' % (r["mong_muon"], r["thoi_gian"]))
