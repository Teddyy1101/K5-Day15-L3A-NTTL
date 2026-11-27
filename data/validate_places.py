"""Kiểm tra tính hợp lệ của data/places_hanoi.json và xuất bản CSV (data/places_hanoi.csv).

Chạy từ thư mục gốc repo:
    python3 data/validate_places.py
"""
import csv
import json
from collections import Counter
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSON_PATH = DATA_DIR / "places_hanoi.json"
CSV_PATH = DATA_DIR / "places_hanoi.csv"

REQUIRED_FIELDS = [
    "id", "name", "city", "district", "categories",
    "lat", "lng", "open_time", "close_time", "closed_days",
    "duration_min", "estimated_cost_vnd", "cost_note",
    "best_slots", "indoor", "kid_friendly", "tags", "notes", "source",
]
VALID_DAYS = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
VALID_SLOTS = {"sang", "trua", "chieu", "toi"}


def to_minutes(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def main() -> int:
    places = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    errors = []
    seen_ids = set()

    for idx, p in enumerate(places, start=1):
        pid = p.get("id", f"row-{idx}")
        for field in REQUIRED_FIELDS:
            if field not in p:
                errors.append(f"[{pid}] Thiếu trường: {field}")
        if pid in seen_ids:
            errors.append(f"[{pid}] Trùng mã địa điểm")
        seen_ids.add(pid)

        if not (20.8 <= float(p["lat"]) <= 21.3 and 105.5 <= float(p["lng"]) <= 106.1):
            errors.append(f"[{pid}] Tọa độ ngoài khu vực Hà Nội: ({p['lat']}, {p['lng']})")

        if to_minutes(p["open_time"]) >= to_minutes(p["close_time"]):
            errors.append(f"[{pid}] Giờ mở >= giờ đóng: {p['open_time']} - {p['close_time']}")

        bad_days = set(p["closed_days"]) - VALID_DAYS
        if bad_days:
            errors.append(f"[{pid}] Ngày đóng cửa không hợp lệ: {bad_days}")

        bad_slots = set(p["best_slots"]) - VALID_SLOTS
        if bad_slots:
            errors.append(f"[{pid}] Khung giờ không hợp lệ: {bad_slots}")

        if int(p["duration_min"]) <= 0 or int(p["estimated_cost_vnd"]) < 0:
            errors.append(f"[{pid}] duration_min hoặc estimated_cost_vnd không hợp lệ")

    if errors:
        print("PHÁT HIỆN LỖI DỮ LIỆU:")
        for e in errors:
            print(" -", e)
        return 1

    # Xuất bản CSV phẳng để dễ mở trên Excel / Google Sheets
    csv_fields = [
        "id", "name", "district", "categories", "lat", "lng",
        "open_time", "close_time", "closed_days", "duration_min",
        "estimated_cost_vnd", "best_slots", "indoor", "kid_friendly", "notes",
    ]
    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields)
        writer.writeheader()
        for p in places:
            writer.writerow({
                "id": p["id"],
                "name": p["name"],
                "district": p["district"],
                "categories": "|".join(p["categories"]),
                "lat": p["lat"],
                "lng": p["lng"],
                "open_time": p["open_time"],
                "close_time": p["close_time"],
                "closed_days": "|".join(p["closed_days"]),
                "duration_min": p["duration_min"],
                "estimated_cost_vnd": p["estimated_cost_vnd"],
                "best_slots": "|".join(p["best_slots"]),
                "indoor": p["indoor"],
                "kid_friendly": p["kid_friendly"],
                "notes": p["notes"],
            })

    cat_counts = Counter(c for p in places for c in p["categories"])
    closed_mon = [p["id"] for p in places if "Mon" in p["closed_days"]]
    short_window = [p["id"] for p in places if (to_minutes(p["close_time"]) - to_minutes(p["open_time"])) <= 240]
    costs = [p["estimated_cost_vnd"] for p in places]

    print(f"OK: {len(places)} địa điểm hợp lệ -> đã xuất {CSV_PATH.name}")
    print(f"Danh mục: {dict(cat_counts)}")
    print(f"Điểm đóng cửa Thứ 2 ({len(closed_mon)}): {closed_mon}")
    print(f"Điểm khung giờ hẹp <=4h ({len(short_window)}): {short_window}")
    print(f"Chi phí ước tính: {min(costs):,}đ – {max(costs):,}đ")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
