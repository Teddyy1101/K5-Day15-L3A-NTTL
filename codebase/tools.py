"""Công cụ của VietTravel Copilot — lập lịch đi Hà Nội 1–3 ngày.

Mỗi công cụ là một hàm Python có @tool. Docstring ghi 4 ý như sơ đồ ở spec.md §4:
    tên · input · output · có tác động ra ngoài không
Cả 3 công cụ chỉ ĐỌC data/places_hanoi.json (xem data/DATA_CARD.md) và tính toán bằng code.
Không công cụ nào gửi tin, đặt vé, thanh toán hay sửa dữ liệu.

Di chuyển là ƯỚC TÍNH (tự ước tính), cùng hệ số với data/chi_phi_khac.csv:
    km đường  = khoảng cách đường chim bay giữa hai toạ độ × 1,4
    thời gian = 5 phút gửi xe / đón xe + km đường ÷ 20 km/h
    tiền      = mở cửa 15.000đ + 12.000đ × km đường, mỗi người một xe (xe ôm công nghệ) — giá đọc từ chi_phi_khac.csv
Chỉ tính các chặng GIỮA các điểm trong ngày; chưa tính chặng từ chỗ ở ra điểm đầu và chặng quay về.
Chưa có dữ liệu kẹt xe thật.
"""
import csv
import json
import math
import os

from tracing import tool, TOOLS  # noqa: F401

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "places_hanoi.json")
COST_PATH = os.path.join(ROOT, "data", "chi_phi_khac.csv")

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
DAY_LABEL = {"Mon": "Thứ 2", "Tue": "Thứ 3", "Wed": "Thứ 4", "Thu": "Thứ 5",
             "Fri": "Thứ 6", "Sat": "Thứ 7", "Sun": "Chủ nhật"}
DAY_END = "22:00"          # không xếp điểm kết thúc sau giờ này
ROAD_FACTOR = 1.4          # (tự ước tính) đường thật dài hơn đường chim bay — khớp chi_phi_khac.csv
SPEED_KMH = 20.0           # (tự ước tính) tốc độ trung bình nội thành Hà Nội
FIXED_MIN = 5              # (tự ước tính) gửi xe, đón xe, đi bộ vào cổng
URGENT_WINDOW = 30         # phút: khi xếp, các điểm bắt đầu được trong khoảng này coi như "cùng lúc"

_PLACES = None
_TRAVEL_PRICE = None


def load_places() -> dict:
    """Đọc danh mục địa điểm một lần, trả {id: địa điểm}."""
    global _PLACES
    if _PLACES is None:
        with open(DATA_PATH, encoding="utf-8") as f:
            _PLACES = {p["id"]: p for p in json.load(f)}
    return _PLACES


def to_min(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def to_hhmm(minutes: int) -> str:
    return "%02d:%02d" % (minutes // 60, minutes % 60)


def travel_price() -> tuple:
    """(giá mở cửa, giá mỗi km) của di chuyển nội thành, đọc từ data/chi_phi_khac.csv."""
    global _TRAVEL_PRICE
    if _TRAVEL_PRICE is None:
        with open(COST_PATH, encoding="utf-8-sig") as f:
            rows = {r["muc"]: int(r["gia_vnd"]) for r in csv.DictReader(f) if r["loai"] == "di_chuyen_noi_thanh"}
        _TRAVEL_PRICE = (rows["co_dinh"], rows["theo_km"])
    return _TRAVEL_PRICE


def road_km(a: dict, b: dict) -> float:
    """Km đường ước tính giữa hai địa điểm = đường chim bay × ROAD_FACTOR."""
    lat1, lng1, lat2, lng2 = map(math.radians, (a["lat"], a["lng"], b["lat"], b["lng"]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h)) * ROAD_FACTOR


def travel_min(a: dict, b: dict) -> int:
    """Phút di chuyển ước tính giữa hai địa điểm (xem docstring đầu file)."""
    return int(round(FIXED_MIN + road_km(a, b) / SPEED_KMH * 60))


def travel_cost(a: dict, b: dict) -> int:
    """Tiền di chuyển ước tính MỘT người cho một chặng, làm tròn lên nghìn đồng."""
    fixed, per_km = travel_price()
    return int(math.ceil((fixed + per_km * road_km(a, b)) / 1000.0) * 1000)


@tool
def tra_dia_diem(so_thich: list = None, co_tre_nho: bool = False, troi_mua: bool = False) -> list:
    """Tên: tra_dia_diem — tra danh mục địa điểm Hà Nội của nhóm, xếp theo mức phù hợp.
    Input: so_thich (list mã danh mục: lich-su, van-hoa, am-thuc, thien-nhien, giai-tri, mua-sam),
           co_tre_nho (bool: bỏ điểm không hợp trẻ nhỏ), troi_mua (bool: ưu tiên điểm trong nhà).
    Output: list địa điểm {id, name, district, categories, open_time, close_time, closed_days,
            duration_min, estimated_cost_vnd, best_slots, indoor, kid_friendly, diem_phu_hop}.
    Tác động ra ngoài: KHÔNG (chỉ đọc data/places_hanoi.json)."""
    so_thich = set(so_thich or [])
    out = []
    for p in load_places().values():
        if co_tre_nho and not p["kid_friendly"]:
            continue
        score = 2 * len(so_thich & set(p["categories"]))
        if troi_mua and p["indoor"]:
            score += 2
        if "am-thuc" in p["categories"]:
            score += 1  # luôn cần chỗ ăn trong lịch
        out.append({k: p[k] for k in ("id", "name", "district", "categories", "open_time", "close_time",
                                      "closed_days", "duration_min", "estimated_cost_vnd", "best_slots",
                                      "indoor", "kid_friendly")})
        out[-1]["diem_phu_hop"] = score
    out.sort(key=lambda x: (-x["diem_phu_hop"], x["id"]))
    return out


@tool
def sap_xep_lo_trinh(ids: list, thu: str, gio_bat_dau: str = "08:00") -> dict:
    """Tên: sap_xep_lo_trinh — xếp thứ tự và giờ cho các điểm của MỘT ngày.
    Cách xếp (tham lam): từ điểm hiện tại, xét các điểm bắt đầu được trong vòng 30 phút so với điểm
    sớm nhất (tính cả thời gian di chuyển và chờ mở cửa), chọn điểm có "giờ muộn nhất còn vào kịp"
    (giờ đóng − thời lượng) sớm nhất — để điểm mở ngắn (vd phở sáng) không bị bỏ lỡ. Điểm đóng cửa
    hôm đó, hoặc không còn kịp tham quan trước giờ đóng / trước 22:00, đưa vào khong_xep_duoc kèm lý do.
    Input: ids (list mã địa điểm), thu (Mon..Sun), gio_bat_dau ("HH:MM").
    Output: {"lich": [{id, name, den, bat_dau, ket_thuc, di_chuyen_phut, di_chuyen_km,
                       tien_di_chuyen (1 người, chặng tới điểm này), chi_phi (vé/ăn 1 người)}],
             "khong_xep_duoc": [{id, ly_do}]}.
    Tác động ra ngoài: KHÔNG (chỉ tính toán)."""
    places = load_places()
    lich, bo = [], []
    con_lai = []
    for pid in ids:
        p = places.get(pid)
        if p is None:
            bo.append({"id": pid, "ly_do": "không có trong danh mục địa điểm"})
        elif thu in p["closed_days"]:
            bo.append({"id": pid, "ly_do": "%s đóng cửa %s" % (p["name"], DAY_LABEL[thu])})
        else:
            con_lai.append(p)

    now, here = to_min(gio_bat_dau), None
    while con_lai:
        feasible = []
        for p in con_lai:
            move = travel_min(here, p) if here else 0
            start = max(now + move, to_min(p["open_time"]))
            end = start + p["duration_min"]
            if end > to_min(p["close_time"]) or end > to_min(DAY_END):
                continue
            latest = to_min(p["close_time"]) - p["duration_min"]  # giờ muộn nhất còn vào kịp
            feasible.append((start, latest, p, move, now + move, end))
        if not feasible:
            break
        # Trong các điểm bắt đầu được trong vòng URGENT_WINDOW phút tới, ưu tiên điểm sắp hết giờ vào
        earliest = min(f[0] for f in feasible)
        start, _, p, move, arrive, end = min((f for f in feasible if f[0] <= earliest + URGENT_WINDOW),
                                             key=lambda f: (f[1], f[0]))
        lich.append({"id": p["id"], "name": p["name"], "den": to_hhmm(arrive), "bat_dau": to_hhmm(start),
                     "ket_thuc": to_hhmm(end), "di_chuyen_phut": move,
                     "di_chuyen_km": round(road_km(here, p), 1) if here else 0.0,
                     "tien_di_chuyen": travel_cost(here, p) if here else 0,
                     "chi_phi": p["estimated_cost_vnd"]})
        con_lai.remove(p)
        now, here = end, p
    for p in con_lai:
        bo.append({"id": p["id"], "ly_do": "%s không còn kịp giờ mở cửa (%s–%s) trong ngày"
                   % (p["name"], p["open_time"], p["close_time"])})
    return {"lich": lich, "khong_xep_duoc": bo}


@tool
def kiem_lich_trinh(cac_ngay: list, ngan_sach: int = None, so_nguoi: int = 1) -> dict:
    """Tên: kiem_lich_trinh — chốt chặn cuối: kiểm cả lịch nhiều ngày trước khi đưa cho khách.
    Kiểm: mã địa điểm có thật · không trùng điểm giữa các ngày · không đi vào ngày đóng cửa ·
          bắt đầu sau giờ mở, kết thúc trước giờ đóng · các điểm trong ngày không chồng giờ ·
          tổng chi phí = (vé + ăn tại điểm + di chuyển ước tính giữa các điểm) × số người
          không vượt ngân sách. Tiền di chuyển được TÍNH LẠI từ toạ độ, không tin số trong lịch.
    Input: cac_ngay (list {"thu": Mon..Sun, "lich": output "lich" của sap_xep_lo_trinh}),
           ngan_sach (int VND cho cả nhóm, None = khách chưa cho), so_nguoi (int).
    Output: {"hop_le": bool, "loi": [str], "tong_chi_phi": int, "tong_ve_an": int, "tong_di_chuyen": int}.
    Tác động ra ngoài: KHÔNG (chỉ đọc và kiểm)."""
    places = load_places()
    loi, seen, ve_an, di_chuyen = [], set(), 0, 0
    for i, ngay in enumerate(cac_ngay, start=1):
        prev_end, prev_p = 0, None
        for s in ngay["lich"]:
            p = places.get(s["id"])
            if p is None:
                loi.append("Ngày %d: %s không có trong danh mục" % (i, s["id"]))
                continue
            if s["id"] in seen:
                loi.append("Ngày %d: %s bị lặp lại" % (i, p["name"]))
            seen.add(s["id"])
            if ngay["thu"] in p["closed_days"]:
                loi.append("Ngày %d: %s đóng cửa %s" % (i, p["name"], DAY_LABEL[ngay["thu"]]))
            start, end = to_min(s["bat_dau"]), to_min(s["ket_thuc"])
            if start < to_min(p["open_time"]) or end > to_min(p["close_time"]):
                loi.append("Ngày %d: %s ngoài giờ mở cửa (%s–%s)" % (i, p["name"], p["open_time"], p["close_time"]))
            if start < prev_end:
                loi.append("Ngày %d: %s chồng giờ với điểm trước" % (i, p["name"]))
            prev_end = end
            ve_an += p["estimated_cost_vnd"] * so_nguoi
            if prev_p is not None:
                di_chuyen += travel_cost(prev_p, p) * so_nguoi
            prev_p = p
    tong = ve_an + di_chuyen
    if ngan_sach is not None and tong > ngan_sach:
        loi.append("Tổng chi phí %s đ vượt ngân sách %s đ" % (format(tong, ",").replace(",", "."),
                                                             format(ngan_sach, ",").replace(",", ".")))
    return {"hop_le": not loi, "loi": loi, "tong_chi_phi": tong, "tong_ve_an": ve_an, "tong_di_chuyen": di_chuyen}
