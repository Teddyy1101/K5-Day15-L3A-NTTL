"""Đếm x/N và % từ bảng gắn nhãn review công khai (evidence/reviews_labeled.csv).

Chạy từ thư mục gốc repo:
    python3 evidence/count_reviews.py
"""
import csv
import sys
from collections import Counter
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

CSV_PATH = Path(__file__).resolve().parent / "reviews_labeled.csv"
CONSTRAINED_IDS = {"HN01", "HN05", "HN11"}
CONTROL_IDS = {"HN04", "HN18"}
VALID_LABELS = {
    "dong_cua_sai_gio",
    "cho_lau_lo_lich",
    "gia_khac_du_tinh",
    "xa_kho_di",
    "khong_lien_quan",
}


def main() -> int:
    if not CSV_PATH.exists():
        print(f"Không tìm thấy {CSV_PATH}")
        return 1

    with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if not rows:
        print("Chưa có dòng review nào trong evidence/reviews_labeled.csv.")
        return 0

    bad = [r["review_id"] for r in rows if r.get("label", "").strip() not in VALID_LABELS]
    if bad:
        print("Nhãn không hợp lệ ở các dòng:", bad)
        return 1

    n = len(rows)
    counts = Counter(r["label"].strip() for r in rows)
    pain_rows = [r for r in rows if r["label"].strip() != "khong_lien_quan"]

    c_rows = [r for r in rows if r["place_id"] in CONSTRAINED_IDS]
    o_rows = [r for r in rows if r["place_id"] in CONTROL_IDS]
    c_closed = sum(1 for r in c_rows if r["label"].strip() == "dong_cua_sai_gio")
    o_closed = sum(1 for r in o_rows if r["label"].strip() == "dong_cua_sai_gio")
    c_pain = sum(1 for r in c_rows if r["label"].strip() != "khong_lien_quan")
    o_pain = sum(1 for r in o_rows if r["label"].strip() != "khong_lien_quan")

    print(f"Tổng số review đã gắn nhãn (N): {n}")
    print(f"Tổng review có pain liên quan lập lịch: {len(pain_rows)}/{n} ({len(pain_rows)*100/n:.1f}%)")
    print(f"- Nhóm 3 điểm có ràng buộc giờ/ngày đóng (HN01, HN05, HN11): pain {c_pain}/{len(c_rows)} ({c_pain*100/len(c_rows):.1f}%), đóng cửa/sai giờ {c_closed}/{len(c_rows)} ({c_closed*100/len(c_rows):.1f}%)")
    print(f"- Nhóm 2 điểm mở cả tuần đối chứng (HN04, HN18): pain {o_pain}/{len(o_rows)} ({o_pain*100/len(o_rows):.1f}%), đóng cửa/sai giờ {o_closed}/{len(o_rows)} ({o_closed*100/len(o_rows):.1f}%)\n")

    print("| Nhãn vấn đề | x / N | % |")
    print("|---|---:|---:|")
    for lbl in [
        "dong_cua_sai_gio",
        "cho_lau_lo_lich",
        "gia_khac_du_tinh",
        "xa_kho_di",
        "khong_lien_quan",
    ]:
        c = counts.get(lbl, 0)
        print(f"| `{lbl}` | {c} / {n} | {c*100/n:.1f}% |")

    print("\n--- Các ví dụ trích dẫn có pain (gửi Lâm làm source = data_that) ---")
    for r in pain_rows:
        print(f"- [{r['review_id']} · {r['place_id']} · {r['stars']}★ · {r['label']}]: \"{r['quote_max_2_sentences']}\"")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
