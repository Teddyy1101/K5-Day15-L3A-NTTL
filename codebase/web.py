"""Giao diện web của VietTravel Copilot — chạy bằng:  py codebase/web.py   (rồi mở http://127.0.0.1:8000)

Chỉ dùng thư viện chuẩn của Python. Không thay app.py / run.py: CLI, eval và simulate vẫn chạy như cũ.
Web gọi ĐÚNG các hàm của agent.py, không có luồng riêng:
    • nhắn tin        → answer(text) khi chưa có lịch, edit(text, state) khi đã có (AI chọn điểm, code xếp + kiểm)
                        → lịch mới chỉ là ĐỀ XUẤT; khách bấm đồng ý (/api/apply) thì mới thay lịch đang dùng
    • kéo thả điểm    → build(req, plan) — code xếp giờ và kiểm lại (sap_xep_lo_trinh + kiem_lich_trinh), không gọi AI
                        thả vào ngày → code tự xếp thứ tự; thả vào giữa hai điểm → giữ đúng thứ tự khách đặt (giu_thu_tu)
    • lịch chỉ giữ trong bộ nhớ của server theo phiên trình duyệt; tắt server là mất (spec.md §4 — không có CSDL).
Không có công cụ nào tác động ra ngoài: không đặt vé, không thanh toán, không lưu, không gửi lịch đi đâu.
"""
import datetime
import json
import mimetypes
import os
import re
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import tracing  # noqa: E402
from agent import MAX_DAYS, answer, build, check_scope, day_list, edit, parse_request, window  # noqa: E402
from tools import DAY_LABEL, DAYS, load_places  # noqa: E402

STATIC = os.path.join(HERE, "web")
LOCK = threading.Lock()   # tracing và agent dùng biến toàn cục → mỗi lần chỉ chạy một yêu cầu
SESSIONS = {}             # mã phiên → {"state": lịch hiện tại | None}
CATEGORY_LABEL = {"lich-su": "Lịch sử", "van-hoa": "Văn hoá", "am-thuc": "Ăn uống",
                  "thien-nhien": "Thiên nhiên", "giai-tri": "Giải trí", "mua-sam": "Mua sắm"}


# ---------------------------------------------------------------- dữ liệu gửi cho trình duyệt
def place_view(p: dict) -> dict:
    return {"id": p["id"], "name": p["name"], "district": p["district"], "lat": p["lat"], "lng": p["lng"],
            "categories": p["categories"], "open": p["open_time"], "close": p["close_time"],
            "closed": p["closed_days"], "duration": p["duration_min"], "cost": p["estimated_cost_vnd"],
            "cost_note": p.get("cost_note", ""), "indoor": p["indoor"], "kid": p["kid_friendly"],
            "notes": p.get("notes", "")}


def plan_input(days: list) -> list:
    return [{"ids": list(d["ids"]), "ly_do": d["ly_do"], "giu_thu_tu": bool(d.get("giu_thu_tu"))} for d in days]


def plan_view(state: dict) -> dict:
    """Dựng lại lịch có giờ từ state bằng build() của agent.py — cùng code xếp + kiểm như CLI."""
    req, places = state["req"], load_places()
    result = build(req, plan_input(state["days"]))
    start_date = req.get("ngay_cu_the")
    days = []
    for k, d in enumerate(result["days"]):
        stops = []
        for s in d["lich"]:
            p = places[s["id"]]
            stops.append(dict(s, district=p["district"], lat=p["lat"], lng=p["lng"],
                              open=p["open_time"], close=p["close_time"]))
        days.append({
            "thu": d["thu"], "label": DAY_LABEL[d["thu"]], "ly_do": d["ly_do"],
            "fixed": bool(state["days"][k].get("giu_thu_tu")),
            "date": (start_date + datetime.timedelta(days=k)).isoformat() if start_date else None,
            "stops": stops,
            "subtotal": sum(s["chi_phi"] + s["tien_di_chuyen"] for s in d["lich"]) * req["so_nguoi"],
        })
    c = result["check"]
    start, end = window(req)
    return {
        "meta": {"so_ngay": req["so_ngay"], "thu": req["thu"], "so_nguoi": req["so_nguoi"],
                 "ngan_sach": req["ngan_sach"], "gio": [start, end],
                 "troi_mua": req["troi_mua"], "co_tre_nho": req["co_tre_nho"]},
        "days": days,
        "check": {"tong": c["tong_chi_phi"], "ve_an": c["tong_ve_an"], "di_chuyen": c["tong_di_chuyen"],
                  "vuot": req["ngan_sach"] is not None and c["tong_chi_phi"] > req["ngan_sach"]},
        "issues": result["issues"],
    }


def split_reply(output: str, has_plan: bool) -> dict:
    """Tách câu trả lời chữ của agent thành phần web cần: lời nhắn đầu, các thay đổi, lưu ý, nguồn chọn điểm.
    Lịch chi tiết không lặp lại trong chat — đã hiện ở cột lịch."""
    if not has_plan:
        return {"lines": [l for l in output.splitlines() if l.strip()], "changes": [], "notes": [], "source": None}
    lines = output.splitlines()
    head = next((i for i, l in enumerate(lines) if l.startswith("Lịch đi Hà Nội")), len(lines))
    top, changes = [], []
    for l in lines[:head]:
        if l.startswith("Đã sửa so với lịch trước: "):
            changes = l[len("Đã sửa so với lịch trước: "):].split(" · ")
        elif l.strip():
            top.append(l)
    notes = [l[len("Lưu ý: "):] for l in lines if l.startswith("Lưu ý: ")]
    m = re.search(r"Chọn điểm: ([^.]+(?:\([^)]*\))?)\.", output)
    return {"lines": top, "changes": changes, "notes": notes, "source": m.group(1) if m else None}


# ---------------------------------------------------------------- các thao tác
def do_chat(sess: dict, text: str, confirm: bool = True) -> dict:
    """Nhắn tin → agent đề xuất lịch. confirm=True (khung chat): lịch mới CHƯA áp dụng, giữ ở sess["pending"]
    chờ khách bấm đồng ý (/api/apply). confirm=False (nút "Gợi ý lịch" — khách đã chủ động bấm): áp dụng ngay.
    Tin nhắn mới luôn tính trên lịch đang áp dụng; đề xuất cũ chưa trả lời bị bỏ."""
    sess["pending"] = None
    tracing.begin("web")
    try:
        result = edit(text, sess["state"]) if sess["state"] else answer(text)
    finally:
        summary, events = tracing.end()
    new_state, proposal = result.get("state"), None
    if new_state:
        new_view = plan_view(new_state)
        if not confirm:
            sess["state"] = new_state
        elif sess["state"] is None or new_view != plan_view(sess["state"]):
            sess["pending"], proposal = new_state, new_view
    return {"reply": split_reply(result.get("output", ""), bool(new_state)),
            "plan": plan_view(sess["state"]) if sess["state"] else None,
            "proposal": proposal,
            "run": {"model_calls": summary["model_calls"], "tool_calls": summary["tool_calls"],
                    "models": summary["models"], "tokens_in": summary["tokens_in"],
                    "tokens_out": summary["tokens_out"],
                    "steps": [e["text"] for e in events if e["kind"] == "note"]}}


def compose_request(body: dict) -> str:
    """Biểu mẫu đầu trang → một câu yêu cầu, để đi qua đúng parse_request / answer() như khi khách gõ."""
    days = int(body.get("so_ngay") or 0)
    thu = body.get("thu") or ""
    who = int(body.get("so_nguoi") or 1)
    money = int(body.get("ngan_sach") or 0)
    thu_text = "chủ nhật" if thu == "Sun" else "thứ %d" % (DAYS.index(thu) + 2) if thu in DAYS else ""
    likes = [CATEGORY_LABEL[c].lower() for c in body.get("so_thich") or [] if c in CATEGORY_LABEL]
    text = "Đi Hà Nội %d ngày, bắt đầu %s, %d người, ngân sách %d đồng" % (days, thu_text, who, money)
    if likes:
        text += ", thích " + ", ".join(likes)
    return text


def do_setup(sess: dict, body: dict) -> dict:
    text = compose_request(body)
    sess["pending"] = None
    if body.get("mode") == "ai":
        sess["state"] = None
        return do_chat(sess, text, confirm=False)
    req = parse_request(text)
    blocked = check_scope(req)
    if blocked:
        return {"error": blocked}
    req.update(dia_diem_muon=[], bo_diem=[], ngay_dich=None)
    sess["state"] = {"req": req, "days": [{"thu": thu, "ids": [], "ly_do": ""} for thu in day_list(req)],
                     "chon": []}
    return {"plan": plan_view(sess["state"])}


def do_move(sess: dict, pid: str, to, pos=None) -> dict:
    """Kéo thả: đưa pid vào ngày `to` (0-based) hoặc bỏ khỏi lịch (to = None). Code xếp lại giờ và kiểm.
    pos = None  → thả vào phần đầu ngày: code tự xếp lại thứ tự cả ngày đó.
    pos = số    → thả vào giữa các điểm: đặt pid đúng vị trí đó, ngày đó chuyển sang giữ thứ tự khách đặt.
    Thêm / đổi chỗ mà làm một điểm trong ngày không còn kịp giờ → không nhận, nói rõ vì sao; lịch giữ như cũ."""
    state, places = sess["state"], load_places()
    if not state:
        return {"error": "Chưa có lịch. Chọn số ngày, thứ bắt đầu và ngân sách trước đã."}
    if pid not in places:
        return {"error": "Không có điểm %s trong danh mục." % pid}
    p = places[pid]
    days = [dict(d, ids=[i for i in d["ids"] if i != pid]) for d in state["days"]]
    if to is not None:
        if not 0 <= to < len(days):
            return {"error": "Ngày không hợp lệ."}
        thu = days[to]["thu"]
        if thu in p["closed_days"]:
            return {"error": "%s đóng cửa %s — không xếp vào ngày %d được." % (p["name"], DAY_LABEL[thu], to + 1)}
        if pos is None:
            days[to]["ids"].append(pid)
            days[to]["giu_thu_tu"] = False  # thả vào phần đầu ngày → code tự xếp lại cả ngày
        else:
            days[to]["ids"].insert(max(0, min(pos, len(days[to]["ids"]))), pid)
            days[to]["giu_thu_tu"] = True
    result = build(state["req"], plan_input(days))
    if to is not None:
        err = lost_error(days[to], result["days"][to], result["issues"], to, p)
        if err:
            return {"error": err}
    chon = set(state.get("chon") or [])
    chon = chon | {pid} if to is not None else chon - {pid}
    return commit(sess, state, days, result, chon)


def lost_error(day: dict, built: dict, issues: list, to: int, p: dict):
    """Có điểm của ngày `to` bị rơi khỏi lịch sau khi thêm / đổi chỗ → câu báo lỗi; không rơi điểm nào → None."""
    places = load_places()
    placed = {s["id"] for s in built["lich"]}
    lost = [i for i in day["ids"] if i not in placed]
    if not lost:
        return None
    if day.get("giu_thu_tu"):
        why = [x.split(": ", 1)[1] for x in issues if x.startswith("Ngày %d: " % (to + 1))
               and any(places[i]["name"] in x for i in lost)]
        return "%s. Kéo %s sang vị trí khác, hoặc thả vào phần đầu ngày để code tự xếp." % (
            "; ".join(why) or "Thứ tự này làm một điểm không còn kịp giờ", p["name"])
    if lost == [p["id"]]:
        why = "%s mở %s–%s, ngày %d không còn chỗ trống hợp giờ đó." % (
            p["name"], p["open_time"], p["close_time"], to + 1)
    else:
        why = "Thêm %s thì %s không còn kịp giờ mở cửa." % (
            p["name"], ", ".join(places[i]["name"] for i in lost if i != p["id"]))
    return why + " Bỏ bớt một điểm của ngày %d rồi thử lại." % (to + 1)


def commit(sess: dict, state: dict, days: list, result: dict, chon: set) -> dict:
    trial = dict(state, days=[dict(d, ids=[s["id"] for s in r["lich"]]) for d, r in zip(days, result["days"])])
    trial["chon"] = sorted(chon)  # điểm khách tự kéo vào: edit() giữ lại qua các lần nhắn sửa sau
    sess["state"] = trial
    return {"plan": plan_view(trial)}


# ---------------------------------------------------------------- HTTP
class Handler(BaseHTTPRequestHandler):
    server_version = "VietTravelWeb/1.0"

    def log_message(self, fmt, *args):  # gọn log: chỉ in API
        if "/api/" in (args[0] if args else ""):
            sys.stderr.write("  %s\n" % (fmt % args))

    def session(self) -> dict:
        sid = (self.headers.get("X-Session") or "anon")[:64]
        return SESSIONS.setdefault(sid, {"state": None, "pending": None})

    def send(self, code: int, body: bytes, ctype: str):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def json(self, data, code: int = 200):
        self.send(code, json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/places":
            return self.json({"places": [place_view(p) for p in load_places().values()],
                              "days": {d: DAY_LABEL[d] for d in DAYS}, "categories": CATEGORY_LABEL,
                              "max_days": MAX_DAYS})
        if path == "/api/state":
            st = self.session()["state"]
            return self.json({"plan": plan_view(st) if st else None})
        name = "index.html" if path in ("/", "") else path.lstrip("/")
        full = os.path.normpath(os.path.join(STATIC, name))
        if not full.startswith(STATIC) or not os.path.isfile(full):
            return self.send(404, b"Not found", "text/plain; charset=utf-8")
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("javascript"):
            ctype += "; charset=utf-8"
        with open(full, "rb") as f:
            self.send(200, f.read(), ctype)

    def do_POST(self):
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(n).decode("utf-8") or "{}") if n else {}
        except (ValueError, UnicodeDecodeError):
            return self.json({"error": "Yêu cầu không đọc được."}, 400)
        sess, path = self.session(), self.path.split("?")[0]
        try:
            with LOCK:
                if path == "/api/chat":
                    text = str(body.get("text") or "").strip()[:1000]
                    if not text:
                        return self.json({"error": "Tin nhắn trống."}, 400)
                    return self.json(do_chat(sess, text))
                if path == "/api/setup":
                    return self.json(do_setup(sess, body))
                if path == "/api/move":
                    to, pos = body.get("to"), body.get("pos")
                    return self.json(do_move(sess, str(body.get("id") or ""), int(to) if to is not None else None,
                                             int(pos) if pos is not None else None))
                if path == "/api/apply":
                    pending, sess["pending"] = sess.get("pending"), None
                    if body.get("accept"):
                        if not pending:
                            return self.json({"error": "Đề xuất này đã hết hiệu lực (lịch đã đổi sau đó). "
                                                       "Nhắn lại yêu cầu để mình đề xuất trên lịch hiện tại."})
                        sess["state"] = pending
                    return self.json({"plan": plan_view(sess["state"]) if sess["state"] else None})
                if path == "/api/reset":
                    sess["state"], sess["pending"] = None, None
                    return self.json({"plan": None})
        except NotImplementedError as e:
            return self.json({"error": "Chưa nối model: %s" % e}, 503)
        except Exception as e:  # lỗi gọi model / mạng: báo rõ, giữ nguyên lịch cũ
            return self.json({"error": "Lỗi khi xử lý (%s): %s" % (type(e).__name__, e)}, 500)
        return self.json({"error": "Không có đường dẫn này."}, 404)


def main() -> int:
    port = int(os.environ.get("PORT") or 8000)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("VietTravel Copilot — web: http://127.0.0.1:%d   (Ctrl+C để tắt; tắt là mất lịch đang có)" % port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
