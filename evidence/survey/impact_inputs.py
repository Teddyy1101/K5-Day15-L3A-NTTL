"""Số đầu vào cho bảng impact ở spec.md §2 — chạy lại được: python evidence/survey/impact_inputs.py

Nguồn: evidence/survey/results.csv (n = 21 tại CP3; số đổi khi thêm phiếu — chạy lại script).
Giả định (tự ước tính), vì form hỏi theo khoảng chứ không hỏi số:
  - Thời gian lên lịch: lấy giữa khoảng. "Trên 5 tiếng" lấy 300 phút (cận dưới). "Không lên lịch trước" = 0.
  - Số chuyến / năm: "1–2" = 1,5 · "dưới 1" = 0,5 · "3–5" = 4.
  - Quy mô: tính trên 1.000 khách tự túc (tự ước tính, chưa có nguồn quy mô thật).
Impact / tháng = số người gặp × số lần / tháng × phút mỗi lần (guide 1.3).
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
N, BASE = len(rows), 1000

MINUTES = {"Dưới 30 phút": 15, "Từ 30 phút – 2 tiếng": 75, "Từ 2 – 5 tiếng": 210,
           "Trên 5 tiếng (hoặc mất nhiều ngày)": 300}
TRIPS = {"1 – 2 lần/năm": 1.5, "Chưa từng / Hiếm khi (dưới 1 lần/năm)": 0.5, "3 – 5 lần/năm": 4}


def steps(r):
    return r["kho_nhat"].split(" | ")


HUONG = {
    "A · Lập lịch có kiểm thuận đường, giờ, chi phí (CHỌN)": lambda r: any(
        s.startswith(("Sắp xếp thứ tự", "Cân đối thời gian")) for s in steps(r)),
    "B · Lọc / tóm tắt review thật – quảng cáo": lambda r: any(s.startswith("Đọc quá nhiều bài review") for s in steps(r)),
    "C · Sửa lịch nhanh khi thời tiết / đổi điểm": lambda r: int(r["kc_kho_sua"]) >= 4,
    "D · Ảnh thực tế để hình dung địa điểm": lambda r: any(s.startswith("Không hình dung rõ") for s in steps(r)),
}

print("n = %d phiếu · quy mô giả định %d khách tự túc (tự ước tính)\n" % (N, BASE))
for name, hit in HUONG.items():
    g = [r for r in rows if hit(r)]
    people = BASE * len(g) / N
    per_month = sum(TRIPS[r["so_chuyen_nam"]] for r in g) / len(g) / 12
    minutes = sum(MINUTES.get(r["thoi_gian_len_lich"], 0) for r in g) / len(g)
    print("%s\n  gặp: %d/%d → %.0f người · %.3f lần/tháng · %.0f phút/lần · impact ≈ %.0f phút/tháng (≈ %.0f giờ)\n"
          % (name, len(g), N, people, per_month, minutes, people * per_month * minutes,
             people * per_month * minutes / 60))
