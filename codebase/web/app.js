/* VietTravel Copilot — web. Quyết định lập lịch / kiểm tiền nằm ở server (agent.py);
   file này thêm quản lý vị trí xuất phát (GPS / chọn điểm), đề xuất điểm nổi tiếng gần bạn và bố cục 0 chồng lấn. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
  const fold = (s) => String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/gi, "d").toLowerCase();
  const shortName = (n) => n.split(/\s*[–&,(]\s*/)[0].trim();
  const icon = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const DAY_HEX = ["#2563eb", "#d97706", "#059669"];
  const SHORT = { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" };
  const WD = { Mon: "Thứ Hai", Tue: "Thứ Ba", Wed: "Thứ Tư", Thu: "Thứ Năm", Fri: "Thứ Sáu", Sat: "Thứ Bảy", Sun: "Chủ Nhật" };
  const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 6 điểm xuất phát phổ biến tại Hà Nội
  const START_PRESETS = [
    { key: "hoankiem", name: "Hồ Hoàn Kiếm (Trung tâm)", lat: 21.0288, lng: 105.8523 },
    { key: "gahanoi", name: "Ga Hà Nội", lat: 21.0243, lng: 105.8412 },
    { key: "badinh", name: "Khu Ba Đình / Lăng Bác", lat: 21.0368, lng: 105.8347 },
    { key: "dongda", name: "Đống Đa / Văn Miếu", lat: 21.0276, lng: 105.8355 },
    { key: "tayho", name: "Tây Hồ / Chùa Trấn Quốc", lat: 21.0478, lng: 105.8369 },
    { key: "caugiay", name: "Cầu Giấy", lat: 21.0362, lng: 105.7906 },
  ];
  const POPULAR_IDS = ["HN01", "HN02", "HN03", "HN04", "HN18", "HN10", "HN11", "HN05"];

  const SID = (() => {
    const make = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      let v = sessionStorage.getItem("vt-sid");
      if (!v) { v = make(); sessionStorage.setItem("vt-sid", v); }
      return v;
    } catch { return make(); }
  })();

  const S = {
    places: [], byId: {}, cats: {}, plan: null,
    filter: null, q: "", sortNear: false, mapDay: "all",
    openStop: null, openPick: null, busy: false, drag: null,
    thread: [],
    startPoint: null, // { name, lat, lng, source: 'gps'|'preset'|'place' }
    locStatus: "", locKind: "",
    setup: { so_ngay: 2, thu: "Sat", so_nguoi: 2, ngan_sach: 2000000, so_thich: [] },
  };

  /* ------------------------------------------------------------ tính khoảng cách (khớp hệ số 1.4 của tools.py) */
  function roadKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 1.4 * 10) / 10;
  }

  function travelMins(km) {
    return Math.max(5, Math.round((km / 20) * 60));
  }

  function distFromStart(p) {
    if (!S.startPoint) return null;
    return roadKm(S.startPoint.lat, S.startPoint.lng, p.lat, p.lng);
  }

  async function api(path, body) {
    const res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", "X-Session": SID },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let data;
    try { data = await res.json(); } catch { data = { error: "Máy chủ trả về dữ liệu không đọc được (mã " + res.status + ")." }; }
    return data;
  }

  /* ------------------------------------------------------------ vị trí xuất phát (GPS / Preset / Place) */
  function setStartPoint(pt, statusMsg, kind = "ok") {
    S.startPoint = pt;
    S.locStatus = statusMsg || (pt ? `Đang tính khoảng cách từ: ${pt.name}` : "");
    S.locKind = kind;
    try { if (pt) sessionStorage.setItem("vt-start", JSON.stringify(pt)); } catch {}
    renderLocationUI();
    renderAll(null, false);
    if (pt && map && !S.plan) map.flyTo([pt.lat, pt.lng], 14, { duration: 0.45 });
  }

  function requestGPS() {
    if (!navigator.geolocation) {
      S.locStatus = "Trình duyệt không hỗ trợ GPS. Hãy chọn điểm xuất phát bên cạnh.";
      S.locKind = "warn";
      renderLocationUI();
      if (!S.plan) renderSetup();
      return;
    }
    S.locStatus = "Đang lấy tọa độ GPS hiện tại…";
    S.locKind = "";
    renderLocationUI();
    if (!S.plan) renderSetup();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const kmToHanoi = roadKm(lat, lng, 21.0288, 105.8523);
        if (kmToHanoi > 45) {
          setStartPoint(
            { name: START_PRESETS[0].name, lat: START_PRESETS[0].lat, lng: START_PRESETS[0].lng, source: "preset" },
            `Vị trí GPS của bạn cách trung tâm Hà Nội ~${Math.round(kmToHanoi)} km → tạm đặt điểm xuất phát tại Hồ Hoàn Kiếm (bạn có thể đổi bên cạnh).`,
            "warn"
          );
        } else {
          setStartPoint(
            { name: "Vị trí hiện tại (GPS)", lat, lng, source: "gps" },
            `Đã cập nhật vị trí GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}) — đang gợi ý các điểm gần bạn nhất.`,
            "ok"
          );
        }
      },
      () => {
        S.locStatus = "Không lấy được GPS (bạn chưa cấp quyền hoặc tắt định vị). Hãy chọn nhanh điểm xuất phát tại Hà Nội.";
        S.locKind = "warn";
        renderLocationUI();
        if (!S.plan) renderSetup();
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  function toggleLocBar(open) {
    const bar = $("#loc-bar"), btn = $("#btn-loc-toggle");
    bar.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    setTimeout(() => map?.invalidateSize(), 60);
  }

  function renderLocationUI() {
    $("#bar-loc-text").textContent = S.startPoint ? `Xuất phát: ${shortName(S.startPoint.name)}` : "Chọn điểm xuất phát";
    const stEl = $("#loc-status");
    if (stEl) {
      stEl.textContent = S.locStatus || "Chọn điểm xuất phát để gợi ý điểm gần bạn và ước tính chặng đầu.";
      stEl.className = "loc-status" + (S.locKind ? " is-" + S.locKind : "");
    }
    const pBox = $("#loc-presets");
    if (pBox) {
      pBox.innerHTML = START_PRESETS.map((pr) =>
        `<button type="button" class="chip" data-act="start-preset" data-key="${pr.key}" aria-pressed="${S.startPoint?.name === pr.name}">${esc(shortName(pr.name))}</button>`
      ).join("");
    }
    const sel = $("#loc-place-select");
    if (sel && S.places.length) {
      sel.innerHTML = `<option value="">-- Hoặc chọn 1 trong 24 điểm --</option>`
        + S.places.map((p) => `<option value="${p.id}"${S.startPoint?.id === p.id ? " selected" : ""}>${esc(p.name)} (${esc(p.district)})</option>`).join("");
    }
  }

  /* ------------------------------------------------------------ vị trí điểm trong lịch */
  function placement() {
    const at = {};
    (S.plan?.days || []).forEach((d, k) => d.stops.forEach((s, i) => { at[s.id] = { k, i }; }));
    return at;
  }

  function ordinals() {
    const no = {}; let n = 0;
    (S.plan?.days || []).forEach((d) => d.stops.forEach((s) => { no[s.id] = ++n; }));
    return no;
  }

  /* ------------------------------------------------------------ thanh trên */
  function renderBar() {
    const btn = $("#btn-new");
    btn.hidden = !S.plan;
  }

  /* ------------------------------------------------------------ danh mục */
  function renderFilters() {
    const all = [[null, "Tất cả"], ...Object.entries(S.cats)];
    $("#cat-filters").innerHTML = all.map(([k, label]) =>
      `<button type="button" class="chip" data-act="filter" data-cat="${k ?? ""}" aria-pressed="${S.filter === k}">${esc(label)}</button>`).join("");
  }

  function pickButtons(p, at) {
    if (!S.plan) return "";
    const btns = S.plan.days.map((d, k) => {
      const closed = p.closed.includes(d.thu);
      const here = at && at.k === k;
      if (closed) return `<button type="button" class="pick" disabled>Ngày ${k + 1} · đóng ${SHORT[d.thu]}</button>`;
      if (here) return "";
      return `<button type="button" class="pick" data-act="move" data-id="${p.id}" data-to="${k}">${at ? "Chuyển sang " : ""}Ngày ${k + 1} · ${SHORT[d.thu]}</button>`;
    }).join("");
    const rm = at ? `<button type="button" class="pick is-danger" data-act="move" data-id="${p.id}" data-to="">${icon("i-x")}Bỏ khỏi lịch</button>` : "";
    return `<div class="place-pick">${btns}${rm}</div>`;
  }

  function placeMeta(p) {
    const km = distFromStart(p);
    return `<span class="plate">${esc(p.district)}</span>`
      + (km != null ? `<span class="dist-tag">~${String(km).replace(".", ",")} km</span>` : "")
      + `<span>${p.open}–${p.close}</span>`
      + (p.closed.length ? `<span class="closed">Đóng ${p.closed.map((d) => SHORT[d]).join(", ")}</span>` : "")
      + (p.indoor ? `<span class="indoor">${icon("i-roof")}Trong nhà</span>` : "");
  }

  function renderCatalogue() {
    const at = placement();
    const q = fold(S.q.trim());
    let list = S.places.filter((p) =>
      (!S.filter || p.categories.includes(S.filter)) &&
      (!q || fold(p.name + " " + p.district + " " + p.notes + " " + p.cost_note).includes(q)));
    if (S.sortNear && S.startPoint) {
      list = [...list].sort((a, b) => distFromStart(a) - distFromStart(b));
    }
    $("#btn-sort-near").setAttribute("aria-pressed", String(S.sortNear));
    $("#cat-count").textContent = list.length === S.places.length ? `· ${list.length} điểm` : `· ${list.length}/${S.places.length}`;
    if (!list.length) {
      $("#cat-list").innerHTML = `<li class="cat-empty">Không có điểm nào khớp “${esc(S.q)}”.</li>`;
      return;
    }
    const can = !!S.plan;
    $("#cat-list").innerHTML = list.map((p) => {
      const a = at[p.id];
      const open = S.openPick === p.id && can;
      return `<li class="place${a ? " is-used" : ""}" data-id="${p.id}" draggable="${can}">
        ${can ? icon("i-grip", "ic grip") : ""}
        <div class="place-top">
          <button type="button" class="place-name" data-act="focus" data-id="${p.id}">${esc(p.name)}</button>
          <span class="place-cost">${p.cost ? vnd(p.cost) : "Miễn phí"}</span>
          ${can ? `<button type="button" class="place-add" data-act="pick" data-id="${p.id}" aria-expanded="${open}" aria-label="${a ? "Chuyển hoặc bỏ" : "Thêm"} ${esc(p.name)}">${icon(a ? "i-move" : "i-plus")}</button>` : ""}
        </div>
        <div class="place-meta">${placeMeta(p)}${a ? `<span class="in-plan" style="background:${DAY_HEX[a.k]}">Ngày ${a.k + 1}</span>` : ""}</div>
        ${open ? pickButtons(p, a) : ""}
      </li>`;
    }).join("");
  }

  const readable = (t) => String(t)
    .replace(/\b(lich-su|van-hoa|am-thuc|thien-nhien|giai-tri|mua-sam)\b/g, (c) => (S.cats[c] || c).toLowerCase())
    .replace(/\bHN\d\d\b/g, (id) => (S.byId[id] ? shortName(S.byId[id].name) : id));

  /* ------------------------------------------------------------ MÀN HÌNH MỚI VÀO: Bước 1 (Vị trí) + Bước 2 (Lập lịch) */
  function renderPopularStrip() {
    const box = $("#map-popular");
    if (!box) return;
    if (S.plan || !S.places.length) {
      box.hidden = true;
      setTimeout(() => map?.invalidateSize(), 60);
      return;
    }
    const famousPool = POPULAR_IDS.map((id) => S.byId[id]).filter(Boolean);
    const ranked = S.startPoint
      ? [...famousPool].sort((a, b) => distFromStart(a) - distFromStart(b)).slice(0, 6)
      : famousPool.slice(0, 6);
    box.hidden = false;
    box.innerHTML = `
      <div class="map-popular-head">
        <span>🔥 Địa điểm nổi tiếng ${S.startPoint ? "gần " + esc(shortName(S.startPoint.name)) : "tại Hà Nội"}</span>
        <span class="map-popular-hint">Bấm thẻ để định vị trên bản đồ ↓</span>
      </div>
      <div class="popular-strip">
        ${ranked.map((p) => {
          const km = distFromStart(p);
          return `<div class="pop-card" data-act="focus" data-id="${p.id}">
            <div class="pop-card-top">
              <span class="pop-card-name">${esc(shortName(p.name))}</span>
              ${km != null ? `<span class="pop-card-dist">~${String(km).replace(".", ",")} km</span>` : `<span class="plate">${esc(p.district)}</span>`}
            </div>
            <div class="pop-card-meta">
              <span>🕐 ${p.open}–${p.close}</span>
              <span class="pop-card-cost">${p.cost ? vnd(p.cost) : "Miễn phí"}</span>
              ${p.closed.length ? `<span class="closed">Đóng ${p.closed.map((d) => SHORT[d]).join(",")}</span>` : ""}
            </div>
          </div>`;
        }).join("")}
      </div>`;
    setTimeout(() => map?.invalidateSize(), 60);
  }

  function renderSetup(err) {
    const st = S.setup;
    const seg = (key, vals, fmt) => vals.map((v) =>
      `<button type="button" data-act="set" data-key="${key}" data-val="${v}" aria-pressed="${st[key] === v}">${fmt ? fmt(v) : v}</button>`).join("");
    const likes = Object.entries(S.cats).map(([k, label]) =>
      `<button type="button" class="chip" data-act="like" data-cat="${k}" aria-pressed="${st.so_thich.includes(k)}">${esc(label)}</button>`).join("");

    const startChips = START_PRESETS.map((pr) =>
      `<button type="button" class="chip" data-act="start-preset" data-key="${pr.key}" aria-pressed="${S.startPoint?.name === pr.name}">${esc(shortName(pr.name))}</button>`
    ).join("");

    $("#plan-empty").innerHTML = `
      <!-- Ô 1: Cập nhật vị trí hiện tại / Chọn điểm xuất phát ngay khi mới vào -->
      <div class="zone-card tint-blue">
        <div class="zone-title">
          <span>📍 Bước 1 · Vị trí hiện tại / Điểm xuất phát</span>
          ${S.startPoint ? `<span style="color:var(--green);text-transform:none">✓ ${esc(shortName(S.startPoint.name))}</span>` : ""}
        </div>
        <p class="zone-sub">${esc(S.locStatus || "Cập nhật vị trí GPS hoặc chọn khu vực bạn xuất phát tại Hà Nội để đề xuất điểm nổi tiếng gần nhất và ước tính chặng đầu.")}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button type="button" class="btn btn-primary btn-sm" data-act="gps">📡 Lấy vị trí hiện tại (GPS)</button>
          <div class="filters">${startChips}</div>
        </div>
      </div>

      <!-- Ô 2: Lập lịch trình 1–3 ngày (liền mạch ngay sau Bước 1) -->
      <div class="zone-card">
        <div class="zone-title"><span>✨ Bước 2 · Lập lịch trình Hà Nội (1–3 ngày)</span></div>
        <h3 class="zone-h3">Chuyến đi Hà Nội của bạn</h3>
        <div class="field">
          <span class="field-label">Số ngày</span>
          <div class="seg" role="group" aria-label="Số ngày">${seg("so_ngay", [1, 2, 3], (v) => v + " ngày")}</div>
        </div>
        <div class="field">
          <span class="field-label">Bắt đầu từ thứ mấy? (để code kiểm ngày đóng cửa)</span>
          <div class="week" role="group" aria-label="Thứ bắt đầu">${WEEK.map((d) =>
            `<button type="button" class="${d === "Sun" ? "is-sun" : ""}" data-act="set" data-key="thu" data-val="${d}" aria-pressed="${st.thu === d}">${d === "Sun" ? "CN" : WEEK.indexOf(d) + 2}<small>${d === "Sun" ? "C.Nhật" : "Thứ"}</small></button>`).join("")}</div>
        </div>
        <div class="row2">
          <div class="field">
            <label class="field-label" for="f-who">Số người</label>
            <input class="input" id="f-who" type="number" min="1" max="20" value="${st.so_nguoi}" inputmode="numeric">
          </div>
          <div class="field">
            <label class="field-label" for="f-money">Ngân sách cả nhóm</label>
            <div class="money"><input class="input" id="f-money" type="text" inputmode="numeric" value="${st.ngan_sach.toLocaleString("vi-VN")}"></div>
            <div class="presets">${[1000000, 2000000, 3000000, 5000000].map((v) => `<button type="button" data-act="money" data-val="${v}">${v / 1e6} tr</button>`).join("")}</div>
          </div>
        </div>
        <div class="field">
          <span class="field-label">Sở thích (tuỳ chọn)</span>
          <div class="filters">${likes}</div>
        </div>
        <div class="setup-actions">
          <button type="button" class="btn btn-primary" data-act="setup" data-mode="ai">🤖 Gợi ý lịch bằng AI</button>
          <button type="button" class="btn btn-quiet" data-act="setup" data-mode="manual">📋 Tự xếp từ danh mục</button>
        </div>
        ${err ? `<p class="setup-err" role="alert">${esc(err)}</p>` : ""}
      </div>`;
  }

  /* ------------------------------------------------------------ KPI 3 Ô VÙNG MÀU + LỊCH TỪNG NGÀY */
  function renderLedger() {
    const { check: c, meta: m, days } = S.plan;
    const budget = m.ngan_sach;
    const left = budget ? budget - c.tong : null;
    const totalKm = Math.round(days.reduce((acc, d) => acc + d.stops.reduce((s, x) => s + (x.di_chuyen_km || 0), 0), 0) * 10) / 10;
    const totalMin = days.reduce((acc, d) => acc + d.stops.reduce((s, x) => s + (x.di_chuyen_phut || 0), 0), 0);
    const issues = (S.plan.issues || []).filter((x) => !/vượt ngân sách/.test(x));
    const violCount = issues.length + (c.vuot ? 1 : 0);

    const th = $("#trip-header");
    if (th) {
      const dayLabels = days.map((d) => WD[d.thu]).join(" – ");
      th.innerHTML = `
        <div class="trip-header-title">Hà Nội ${m.so_ngay} ngày (${esc(dayLabels)})</div>
        <div class="trip-header-tags">
          <span class="trip-tag">👥 <b>${m.so_nguoi} người</b></span>
          <span class="trip-tag">💰 Ngân sách <b>${m.ngan_sach ? vnd(m.ngan_sach) : "chưa đặt"}</b></span>
          ${m.troi_mua ? `<span class="trip-tag">🌧️ Trời mưa (ưu tiên trong nhà)</span>` : ""}
          ${m.co_tre_nho ? `<span class="trip-tag">👶 Có trẻ nhỏ</span>` : ""}
        </div>`;
    }

    $("#ledger").innerHTML = `
      <div class="kpi-box s-amber">
        <div class="kpi-label">Tổng chi phí (Code tính)</div>
        <div class="kpi-val">${vnd(c.tong)}</div>
        <div class="kpi-sub">${budget
          ? (c.vuot ? `<span style="color:var(--red)">Vượt ${vnd(-left)}</span> / ${vnd(budget)}` : `Còn ${vnd(left)} / ${vnd(budget)}`)
          : `Vé+ăn ${vnd(c.ve_an)}`}</div>
      </div>
      <div class="kpi-box s-blue">
        <div class="kpi-label">Quãng đường di chuyển</div>
        <div class="kpi-val">${String(totalKm).replace(".", ",")} km</div>
        <div class="kpi-sub">~${totalMin} phút · đi lại ${vnd(c.di_chuyen)}</div>
      </div>
      <div class="kpi-box ${violCount === 0 ? "s-green" : "s-red"}">
        <div class="kpi-label">Kiểm ràng buộc</div>
        <div class="kpi-val">${violCount === 0 ? "0 vi phạm" : violCount + " cảnh báo"}</div>
        <div class="kpi-sub">${violCount === 0 ? "✓ Giờ mở, ngày đóng & tiền OK" : "Xem chi tiết bên dưới"}</div>
      </div>`;

    const sb = $("#start-banner");
    if (S.startPoint) {
      sb.hidden = false;
      sb.innerHTML = `<span>📍 Xuất phát từ <strong>${esc(S.startPoint.name)}</strong> (hiển thị chặng đầu ở từng ngày & ghim vàng trên bản đồ)</span>
        <button type="button" class="btn btn-quiet btn-xs" data-act="open-loc">Đổi điểm xuất phát</button>`;
    } else {
      sb.hidden = false;
      sb.innerHTML = `<span>📍 Chưa chọn điểm xuất phát — thêm để ước tính đường từ chỗ bạn đến điểm đầu mỗi ngày.</span>
        <button type="button" class="btn btn-quiet btn-xs" data-act="open-loc">Chọn vị trí</button>`;
    }

    const box = $("#issues");
    if (issues.length) {
      box.hidden = false;
      box.innerHTML = issues.map((x) => `<p>⚠️ ${esc(x)}</p>`).join("");
    } else {
      box.hidden = true;
      box.innerHTML = "";
    }
  }

  function orderButtons(id, i, k) {
    const n = S.plan.days[k].stops.length;
    if (n < 2) return "";
    return `<button type="button" class="pick" data-act="order" data-id="${id}" data-k="${k}" data-pos="${i - 1}"${i === 0 ? " disabled" : ""}>▲ Lên trước</button>`
      + `<button type="button" class="pick" data-act="order" data-id="${id}" data-k="${k}" data-pos="${i + 1}"${i === n - 1 ? " disabled" : ""}>▼ Xuống sau</button>`;
  }

  function stopRow(s, i, k, isNew) {
    const p = S.byId[s.id];
    const wait = s.den !== s.bat_dau ? `<span>· đến ${s.den}, chờ mở</span>` : "";
    let ride = "";
    if (i === 0 && S.startPoint) {
      const km0 = distFromStart(p);
      ride = `<li class="ride is-start">📍 Từ ${esc(shortName(S.startPoint.name))} → ~${travelMins(km0)} phút · ${String(km0).replace(".", ",")} km</li>`;
    } else if (s.di_chuyen_phut) {
      ride = `<li class="ride">↓ ${s.di_chuyen_phut} phút · ${String(s.di_chuyen_km).replace(".", ",")} km · ~${vnd(s.tien_di_chuyen)}/người</li>`;
    }
    const open = S.openStop === s.id;
    return `${ride}<li class="stop${open ? " is-open" : ""}${isNew ? " is-new" : ""}" draggable="true" data-id="${s.id}" data-k="${k}">
      <div class="stop-time"><b>${s.bat_dau}</b><span>${s.ket_thuc}</span></div>
      <span class="pin">${ordinals()[s.id]}</span>
      <div class="stop-main">
        <button type="button" class="stop-name" data-act="stop" data-id="${s.id}" aria-expanded="${open}">${esc(p.name)}</button>
        <div class="stop-meta"><span class="plate">${esc(p.district)}</span><span>mở ${p.open}–${p.close}</span>${wait}</div>
      </div>
      <span class="stop-cost">${s.chi_phi ? vnd(s.chi_phi) : "Miễn phí"}</span>
      ${open ? `<div class="stop-actions">${orderButtons(s.id, i, k)}${pickButtons(p, { k }).replace('class="place-pick"', 'style="display:contents"')}</div>` : ""}
    </li>`;
  }

  function renderDays(fresh) {
    const m = S.plan.meta;
    $("#days").innerHTML = S.plan.days.map((d, k) => {
      const span = d.stops.length ? `${d.stops[0].bat_dau}–${d.stops[d.stops.length - 1].ket_thuc}` : "Chưa có điểm";
      return `<li class="day${d.thu === "Sun" ? " is-sun" : ""}" data-k="${k}" data-thu="${d.thu}">
        <div class="day-head">
          <div class="day-head-left">
            <span class="day-badge">Ngày ${k + 1} · ${WD[d.thu]}</span>
            <span class="day-sub">${span}</span>
          </div>
          <div class="day-sum"><b>${vnd(d.subtotal)}</b><span>${d.stops.length} điểm · ${m.so_nguoi} người</span></div>
        </div>
        ${d.ly_do ? `<p class="day-why"><b>Vì sao chọn:</b> ${esc(readable(d.ly_do))}</p>` : ""}
        ${d.stops.length
          ? `<ol class="stops">${d.stops.map((s, i) => stopRow(s, i, k, fresh && fresh.has(s.id + "@" + k))).join("")}</ol>`
          : `<p class="day-empty">Ngày này chưa có điểm. Kéo điểm từ danh mục bên trái thả vào đây, hoặc mở <b>Tư vấn AI</b> để nhắn thêm.</p>`}
        <div class="drop-hint"></div>
      </li>`;
    }).join("") + `<li class="trash" id="trash">Thả vào đây để bỏ khỏi lịch</li>`;
  }

  function renderPlan(fresh) {
    const has = !!S.plan;
    $("#plan-empty").hidden = has;
    $("#plan-body").hidden = !has;
    if (!has) { renderSetup(); return; }
    renderLedger();
    renderDays(fresh);
  }

  /* ------------------------------------------------------------ BẢN ĐỒ LEAFLET */
  let map, baseLayer, planLayer, startLayer;
  const markers = {};

  function initMap() {
    if (!window.L) { $("#map").innerHTML = `<p class="cat-empty" style="padding:20px">Không tải được thư viện bản đồ (cần mạng).</p>`; return; }
    map = L.map("map", { zoomControl: false, attributionControl: false }).setView([21.03, 105.845], 13);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.attribution({ position: "bottomleft" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    baseLayer = L.layerGroup().addTo(map);
    planLayer = L.layerGroup().addTo(map);
    startLayer = L.layerGroup().addTo(map);
  }

  function popupHtml(p) {
    const a = placement()[p.id];
    const km = distFromStart(p);
    return `<div class="pop"><h4>${esc(p.name)}</h4>
      <div class="pop-meta">${placeMeta(p)}<span>${p.cost ? vnd(p.cost) + "/người" : "Miễn phí"}</span></div>
      ${km != null ? `<p class="pop-note" style="color:var(--green)">📍 Cách điểm xuất phát ~${String(km).replace(".", ",")} km (~${travelMins(km)} phút)</p>` : ""}
      ${p.notes ? `<p class="pop-note">${esc(p.notes)}</p>` : ""}
      <div class="place-pick">
        <button type="button" class="pick" data-act="start-place" data-id="${p.id}">📍 Đặt làm điểm xuất phát</button>
      </div>
      ${S.plan ? pickButtons(p, a) : ""}</div>`;
  }

  function renderMap(fit) {
    if (!map) return;
    baseLayer.clearLayers(); planLayer.clearLayers(); startLayer.clearLayers();
    for (const k in markers) delete markers[k];
    const at = placement();
    S.places.forEach((p) => {
      if (at[p.id]) return;
      const m = L.circleMarker([p.lat, p.lng], { radius: 8, color: "#2563eb", weight: 2, fillColor: "#ffffff", fillOpacity: 0.95 })
        .bindTooltip(p.name, { direction: "top", offset: [0, -8] })
        .bindPopup(() => popupHtml(p), { maxWidth: 300 });
      m.addTo(baseLayer); markers[p.id] = m;
    });

    const pts = [], no = ordinals();
    if (S.startPoint) {
      const sp = S.startPoint;
      L.marker([sp.lat, sp.lng], {
        icon: L.divIcon({ className: "", html: `<div class="mk-start" title="Điểm xuất phát">★</div>`, iconSize: [32, 32], iconAnchor: [16, 16] }),
        zIndexOffset: 900,
      }).bindTooltip(`Xuất phát: ${sp.name}`, { direction: "top", offset: [0, -16] }).addTo(startLayer);
      pts.push([sp.lat, sp.lng]);
    }

    let prev = null;
    (S.plan?.days || []).forEach((d, k) => {
      const dim = S.mapDay !== "all" && S.mapDay !== k;
      const ll = d.stops.map((s) => [s.lat, s.lng]);
      // Nối từ điểm xuất phát đến điểm 1 của ngày đang hiển thị
      if (S.startPoint && ll.length && (!dim) && (S.mapDay === k || (S.mapDay === "all" && k === 0))) {
        L.polyline([[S.startPoint.lat, S.startPoint.lng], ll[0]], {
          color: "#d97706", weight: 2.5, opacity: 0.9, dashArray: "3 6", lineCap: "round",
        }).addTo(startLayer);
      }
      if (prev && ll.length) {
        const both = S.mapDay === "all" || S.mapDay === k || S.mapDay === prev.k;
        L.polyline([prev.ll, ll[0]], { color: "#64748b", weight: 2.5, opacity: both ? 0.7 : 0.15, dashArray: "1 8", lineCap: "round" }).addTo(planLayer);
      }
      if (ll.length > 1) L.polyline(ll, { color: DAY_HEX[k], weight: 3, opacity: dim ? 0.18 : 0.95, dashArray: "6 6", lineCap: "round" }).addTo(planLayer);
      if (ll.length) prev = { k, ll: ll[ll.length - 1] };
      d.stops.forEach((s) => {
        const p = S.byId[s.id], n = no[s.id];
        const m = L.marker([s.lat, s.lng], {
          icon: L.divIcon({ className: "", html: `<div class="mk" style="--c:${DAY_HEX[k]}">${n}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }),
          opacity: dim ? 0.3 : 1, zIndexOffset: dim ? 0 : 500,
          keyboard: true, title: `${n}. ${p.name} · Ngày ${k + 1}`,
        }).bindPopup(() => popupHtml(p), { maxWidth: 300 });
        m.addTo(planLayer); markers[s.id] = m;
        if (!dim) pts.push([s.lat, s.lng]);
      });
    });
    if (fit && pts.length) map.fitBounds(pts, { padding: [48, 48], maxZoom: 15 });
  }

  function renderMapDays() {
    const box = $("#map-days");
    if (!S.plan) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<button type="button" data-act="mapday" data-k="all" aria-pressed="${S.mapDay === "all"}">Cả chuyến</button>`
      + S.plan.days.map((d, k) => `<button type="button" data-act="mapday" data-k="${k}" aria-pressed="${S.mapDay === k}">Ngày ${k + 1}</button>`).join("");
  }

  function hot(id, on) {
    const m = markers[id];
    const el = m && m.getElement && m.getElement();
    const mk = el && el.querySelector(".mk");
    if (mk) mk.classList.toggle("is-hot", on);
  }

  function focusPlace(id) {
    const p = S.byId[id];
    if (!map || !p) return;
    if (matchMedia("(max-width: 860px)").matches) setView("map");
    else if (matchMedia("(max-width: 1180px)").matches && chatOpen()) openChat(false);
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), { duration: 0.45 });
    setTimeout(() => markers[id] && markers[id].openPopup(), 480);
  }

  /* ------------------------------------------------------------ KHUNG CHAT GẮN GỌN (DOCKED, 0 ĐÈ NHAU) */
  function changeRow(t) {
    const kinds = [["+ thêm ", "add", "i-plus", "Thêm "], ["− bỏ ", "del", "i-minus", "Bỏ "], ["↔ chuyển ", "mv", "i-move", "Chuyển "]];
    const k = kinds.find(([pre]) => t.startsWith(pre));
    if (!k) return `<p>${esc(t)}</p>`;
    return `<div class="change ${k[1]}">${icon(k[2])}<span>${esc(k[3] + t.slice(k[0].length))}</span></div>`;
  }

  function proposalHtml(m, i) {
    const p = m.proposal;
    const n = p.days.reduce((a, d) => a + d.stops.length, 0);
    const days = p.days.map((d, k) =>
      `<li><b style="color:${DAY_HEX[k]}">Ngày ${k + 1} · ${SHORT[d.thu]}</b> ${d.stops.length ? d.stops.map((s) => esc(shortName(S.byId[s.id].name))).join(", ") : "chưa có điểm"}</li>`).join("");
    const before = S.plan && m.base != null ? ` <span class="was">(cũ ${vnd(m.base)})</span>` : "";
    const head = `<div class="proposal"><p class="proposal-sum">${p.days.length} ngày · ${n} điểm · tổng <b>${vnd(p.check.tong)}</b>${before}${p.check.vuot ? ` <span class="closed">vượt ngân sách</span>` : ""}</p><ol class="proposal-days">${days}</ol>`;
    let foot;
    if (m.status === "pending") {
      foot = `<p class="ask">${S.plan ? "Cập nhật lịch trình theo đề xuất này?" : "Dùng lịch này làm lịch trình?"}</p>
        <div class="ask-btns">
          <button type="button" class="btn btn-primary btn-xs" data-act="apply" data-i="${i}" data-yes="1">Có, cập nhật</button>
          <button type="button" class="btn btn-quiet btn-xs" data-act="apply" data-i="${i}" data-yes="">Không, giữ lịch cũ</button>
        </div>`;
    } else {
      const label = { applied: "✓ Đã cập nhật lịch trình.", declined: "Đã giữ nguyên lịch cũ.", expired: "Đề xuất đã bỏ qua do lịch đổi sau đó." }[m.status] || "";
      foot = `<p class="ask-done is-${m.status}">${label}</p>`;
    }
    return head + foot + `</div>`;
  }

  function botHtml(m, i) {
    if (m.error) return `<div class="msg-bot is-err"><p>${esc(m.error)}</p></div>`;
    const r = m.reply || {};
    let body = (r.lines || []).map((l) => `<p>${esc(l)}</p>`).join("");
    if (r.changes?.length) body += `<div class="changes">${r.changes.map(changeRow).join("")}</div>`;
    if (m.proposal) {
      if (!body) body = `<p>Mình đề xuất lịch như sau:</p>`;
    } else if (!body && m.plan) {
      const n = m.plan.days.reduce((a, d) => a + d.stops.length, 0);
      body = `<p>Đã lập lịch ${m.plan.days.length} ngày, ${n} điểm, tổng ${vnd(m.plan.check.tong)}. Kéo thả hoặc nhắn tiếp để sửa.</p>`;
    }
    if (r.notes?.length) body += `<div class="bot-notes">${r.notes.map((n) => `<p>${esc(n)}</p>`).join("")}</div>`;
    if (m.proposal) body += proposalHtml(m, i);
    return `<div class="msg-bot">${body}</div>`;
  }

  function renderThread() {
    const t = $("#thread");
    t.innerHTML = S.thread.map((m, i) => {
      if (m.who === "me") return `<div class="msg-me">${esc(m.text)}</div>`;
      if (m.who === "work") return `<div class="working"><i></i>AI đang chọn điểm & code kiểm lịch…</div>`;
      return botHtml(m, i);
    }).join("");
    t.scrollTop = t.scrollHeight;
  }

  function renderSuggest() {
    let list;
    if (!S.plan) {
      list = ["Đi Hà Nội 2 ngày từ thứ 7, 2 người, ngân sách 3 triệu, thích ăn uống", "1 ngày Chủ nhật, 1 người, 800k, thích lịch sử"];
    } else {
      const at = placement();
      const first = S.plan.days.find((d) => d.stops.length)?.stops[0];
      const spare = S.places.find((p) => !at[p.id] && S.plan.days.length > 1 && !p.closed.includes(S.plan.days[1].thu));
      list = [
        first && `Bỏ ${shortName(S.byId[first.id].name)}`,
        "Trời mưa, đổi sang chỗ trong nhà",
        spare && `Thêm ${shortName(spare.name)} vào ngày 2`,
        S.plan.meta.ngan_sach && `Đổi ngân sách thành ${(Math.round(S.plan.meta.ngan_sach * 0.7 / 100000) / 10).toLocaleString("vi-VN")} triệu`,
      ].filter(Boolean);
    }
    $("#suggest").innerHTML = list.map((s) => `<button type="button" data-act="say" data-text="${esc(s)}">${esc(s)}</button>`).join("");
    $("#chat-sub").textContent = S.plan ? "AI chọn điểm · code kiểm giờ mở & tiền" : "Gõ cả yêu cầu bằng lời, mình lập lịch";
  }

  const chatOpen = () => !$("#chat").hidden;
  function openChat(open) {
    const panel = $("#chat"), btn = $("#chat-toggle"), fab = $("#ai-fab"), app = $("#app");
    panel.hidden = !open;
    app.classList.toggle("has-chat", open);
    btn.setAttribute("aria-expanded", String(open));
    if (fab) {
      fab.hidden = open;
      fab.setAttribute("aria-expanded", String(open));
    }
    $("#chat-toggle-label").textContent = open ? "Ẩn tư vấn AI" : "Tư vấn AI";
    if (open) {
      $("#chat-news-dot").hidden = true;
      const fd = $("#fab-news-dot"); if (fd) fd.hidden = true;
      if (matchMedia("(max-width: 860px)").matches) setView("chat");
      renderThread();
      if (!S.busy) setTimeout(() => $("#msg").focus(), 40);
    }
    setTimeout(() => map?.invalidateSize(), 220);
  }

  function replied() {
    if (!chatOpen()) {
      $("#chat-news-dot").hidden = false;
      const fd = $("#fab-news-dot"); if (fd) fd.hidden = false;
    }
  }

  async function send(text) {
    text = text.trim();
    if (!text || S.busy) return;
    S.busy = true; setBusy(true);
    S.thread.push({ who: "me", text }, { who: "work" });
    if (!chatOpen()) openChat(true);
    renderThread();
    const data = await api("/api/chat", { text }).catch(() => ({ error: "Không kết nối được máy chủ. Kiểm tra server web còn chạy." }));
    S.thread.pop();
    expireProposals();
    if (data.error) S.thread.push({ who: "bot", error: data.error });
    else S.thread.push({ who: "bot", reply: data.reply, run: data.run, proposal: data.proposal || null,
      status: data.proposal ? "pending" : null, base: S.plan ? S.plan.check.tong : null });
    S.busy = false; setBusy(false);
    renderThread(); replied();
  }

  function expireProposals() {
    S.thread.forEach((m) => { if (m.status === "pending") m.status = "expired"; });
  }

  async function answerProposal(i, yes, btn) {
    const m = S.thread[i];
    if (!m || m.status !== "pending") return;
    $$(`[data-act=apply][data-i="${i}"]`).forEach((b) => { b.disabled = true; });
    btn.classList.add("is-busy");
    const data = await api("/api/apply", { accept: yes }).catch(() => ({ error: "Không kết nối được máy chủ." }));
    if (data.error) { m.status = "expired"; renderThread(); notice(data.error); return; }
    m.status = yes ? "applied" : "declined";
    if (yes) setPlan(data.plan, true);
    renderThread();
  }

  function setBusy(on) {
    $(".btn-send").disabled = on;
    $("#msg").disabled = on;
    if (!on && chatOpen()) $("#msg").focus();
  }

  /* ------------------------------------------------------------ cập nhật lịch */
  function setPlan(plan, fit) {
    const before = placement();
    const hadPlan = !!S.plan;
    S.plan = plan;
    if (!plan) S.mapDay = "all";
    if (plan && typeof S.mapDay === "number" && S.mapDay >= plan.days.length) S.mapDay = "all";
    let fresh = null;
    if (plan && hadPlan) {
      fresh = new Set();
      plan.days.forEach((d, k) => d.stops.forEach((s) => { if (!before[s.id] || before[s.id].k !== k) fresh.add(s.id + "@" + k); }));
    }
    S.openStop = null;
    renderAll(fresh, fit);
  }

  function renderAll(fresh, fit) {
    renderBar(); renderLocationUI(); renderPlan(fresh); renderPopularStrip(); renderCatalogue(); renderMapDays(); renderMap(fit); renderSuggest();
  }

  let noticeTimer;
  function notice(msg, kind) {
    const n = $("#notice");
    clearTimeout(noticeTimer);
    if (!msg) { n.hidden = true; return; }
    n.className = "notice" + (kind === "info" ? " is-info" : "");
    n.innerHTML = `<p>${esc(msg)}</p><button type="button" data-act="notice-x" aria-label="Đóng thông báo">${icon("i-x")}</button>`;
    n.hidden = false;
    noticeTimer = setTimeout(() => { n.hidden = true; }, 9000);
  }

  async function move(id, to, pos = null) {
    if (S.thread.some((m) => m.status === "pending")) { expireProposals(); renderThread(); }
    const data = await api("/api/move", { id, to, pos }).catch(() => ({ error: "Không kết nối được máy chủ." }));
    if (data.error) { notice(data.error); return; }
    notice(null);
    S.openPick = null;
    setPlan(data.plan, false);
  }

  async function setup(mode, btn) {
    const st = S.setup;
    st.so_nguoi = Math.max(1, Math.min(20, parseInt($("#f-who")?.value, 10) || 1));
    st.ngan_sach = parseInt(String($("#f-money")?.value || "").replace(/\D/g, ""), 10) || 0;
    if (!st.ngan_sach) { renderSetup("Nhập ngân sách cho cả nhóm để code không xếp vượt tiền."); return; }
    btn.classList.add("is-busy"); btn.disabled = true;
    expireProposals(); renderThread();
    const body = { ...st, mode };
    if (mode === "ai") {
      const label = `${st.so_ngay} ngày từ ${WD[st.thu]} · ${st.so_nguoi} người · ${vnd(st.ngan_sach)}` + (st.so_thich.length ? " · thích " + st.so_thich.map((c) => S.cats[c].toLowerCase()).join(", ") : "");
      S.thread.push({ who: "me", text: label }, { who: "work" });
      renderThread();
    }
    const data = await api("/api/setup", body).catch(() => ({ error: "Không kết nối được máy chủ." }));
    if (mode === "ai") {
      S.thread.pop();
      S.thread.push(data.error ? { who: "bot", error: data.error } : { who: "bot", reply: data.reply, run: data.run, plan: data.plan });
      renderThread(); replied();
    }
    if (data.error) { renderSetup(data.error); return; }
    setPlan(data.plan, true);
  }

  /* ------------------------------------------------------------ kéo thả */
  function dragStart(e, id, from) {
    S.drag = { id, from };
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", id); } catch {}
    document.body.classList.add("is-dragging");
    if (from !== null) document.body.classList.add("is-dragging-stop");
    const p = S.byId[id];
    $$(".day").forEach((el) => {
      const k = +el.dataset.k, thu = el.dataset.thu;
      const hint = $(".drop-hint", el);
      if (p.closed.includes(thu)) { el.dataset.drop = "closed"; hint.textContent = `${shortName(p.name)} đóng cửa ${WD[thu]}`; }
      else if (from === k && !S.plan.days[k].fixed) { el.dataset.drop = "same"; hint.textContent = "Đang ở ngày này"; }
      else if (from === k) { el.dataset.drop = "ok"; hint.textContent = `Thả ở đây để code tự xếp lại ngày ${k + 1}`; }
      else { el.dataset.drop = "ok"; hint.textContent = `Thả vào ngày ${k + 1}, code tự xếp thứ tự`; }
      el.dataset.base = hint.textContent;
    });
    if (from !== null) $$(`.stop[data-id="${id}"]`).forEach((el) => el.classList.add("is-dragging"));
  }

  function dropPos(day, y) {
    const els = $$(".stop", day).filter((el) => el.dataset.id !== S.drag.id);
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) return { pos: i, mark: els[i], after: false };
    }
    return { pos: els.length, mark: els[els.length - 1] || null, after: true };
  }

  function clearMarks() {
    $$(".stop.drop-before, .stop.drop-after").forEach((el) => el.classList.remove("drop-before", "drop-after"));
  }

  function dragEnd() {
    S.drag = null;
    document.body.classList.remove("is-dragging", "is-dragging-stop");
    $$(".day").forEach((el) => { el.classList.remove("is-target", "is-blocked"); delete el.dataset.drop; });
    $$(".place.is-dragging, .stop.is-dragging").forEach((el) => el.classList.remove("is-dragging"));
    clearMarks();
    $$(".day .drop-hint").forEach((h) => { const d = h.closest(".day"); if (d?.dataset.base) h.textContent = d.dataset.base; });
    const t = $("#trash"); if (t) t.classList.remove("is-target");
  }

  function bindDrag() {
    document.addEventListener("dragstart", (e) => {
      const place = e.target.closest?.(".place[draggable='true']");
      const stop = e.target.closest?.(".stop");
      if (place) { place.classList.add("is-dragging"); dragStart(e, place.dataset.id, placement()[place.dataset.id]?.k ?? null); }
      else if (stop) dragStart(e, stop.dataset.id, +stop.dataset.k);
    });
    document.addEventListener("dragend", dragEnd);
    document.addEventListener("dragover", (e) => {
      if (!S.drag) return;
      const day = e.target.closest?.(".day");
      const trash = e.target.closest?.("#trash");
      const cat = e.target.closest?.("#col-cat");
      $$(".day").forEach((el) => { if (el !== day) el.classList.remove("is-target", "is-blocked"); });
      $("#trash")?.classList.toggle("is-target", !!trash);
      clearMarks();
      S.drag.pos = null;
      const list = day && day.dataset.drop !== "closed" ? e.target.closest?.(".stops") : null;
      if (day && day.dataset.base) $(".drop-hint", day).textContent = day.dataset.base;
      if (list) {
        const k = +day.dataset.k, at = dropPos(day, e.clientY);
        const cur = S.plan.days[k].stops.findIndex((s) => s.id === S.drag.id);
        const same = S.drag.from === k && cur === at.pos;
        day.classList.toggle("is-target", !same);
        day.classList.remove("is-blocked");
        if (same) { e.dataTransfer.dropEffect = "none"; return; }
        if (at.mark) at.mark.classList.add(at.after ? "drop-after" : "drop-before");
        $(".drop-hint", day).textContent = `Đặt ở vị trí ${at.pos + 1} của ngày ${k + 1}, code tính lại giờ`;
        S.drag.pos = at.pos;
        e.preventDefault(); e.dataTransfer.dropEffect = "move";
      } else if (day) {
        const ok = day.dataset.drop === "ok";
        day.classList.toggle("is-target", ok);
        day.classList.toggle("is-blocked", day.dataset.drop === "closed");
        if (ok) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
        else e.dataTransfer.dropEffect = "none";
      } else if ((trash || cat) && S.drag.from !== null) {
        e.preventDefault(); e.dataTransfer.dropEffect = "move";
      }
    });
    document.addEventListener("drop", (e) => {
      if (!S.drag) return;
      const { id, from, pos } = S.drag;
      const day = e.target.closest?.(".day");
      const out = e.target.closest?.("#trash") || e.target.closest?.("#col-cat");
      e.preventDefault();
      dragEnd();
      if (day && pos != null) move(id, +day.dataset.k, pos);
      else if (day && !S.byId[id].closed.includes(day.dataset.thu) && (+day.dataset.k !== from || S.plan.days[from].fixed)) move(id, +day.dataset.k);
      else if (day && S.byId[id].closed.includes(day.dataset.thu)) notice(`${S.byId[id].name} đóng cửa ${WD[day.dataset.thu]}, không xếp vào ngày ${+day.dataset.k + 1} được.`);
      else if (out && from !== null) move(id, null);
    });
  }

  /* ------------------------------------------------------------ màn hẹp */
  function setView(v) {
    $("#app").dataset.view = v;
    if (v === "chat" && !chatOpen()) { $("#chat").hidden = false; $("#app").classList.add("has-chat"); }
    $$(".tabs button").forEach((b) => { if (b.dataset.tab === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (v === "map" && map) setTimeout(() => map.invalidateSize(), 60);
  }

  /* ------------------------------------------------------------ sự kiện */
  let resetArmed = false, resetTimer;
  function bind() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-act]");
      if (!el) return;
      const act = el.dataset.act, id = el.dataset.id;
      if (act === "filter") { S.filter = el.dataset.cat || null; renderFilters(); renderCatalogue(); }
      else if (act === "pick") { S.openPick = S.openPick === id ? null : id; renderCatalogue(); }
      else if (act === "move") { map?.closePopup(); move(id, el.dataset.to === "" ? null : +el.dataset.to); }
      else if (act === "focus") focusPlace(id);
      else if (act === "stop") {
        S.openStop = S.openStop === id ? null : id; renderDays(null);
        if (S.openStop) { const p = S.byId[id]; map?.panTo([p.lat, p.lng]); }
      }
      else if (act === "mapday") { S.mapDay = el.dataset.k === "all" ? "all" : +el.dataset.k; renderMapDays(); renderMap(true); }
      else if (act === "say") send(el.dataset.text);
      else if (act === "apply") answerProposal(+el.dataset.i, el.dataset.yes === "1", el);
      else if (act === "set") { S.setup[el.dataset.key] = el.dataset.key === "thu" ? el.dataset.val : +el.dataset.val; keepInputs(); renderSetup(); }
      else if (act === "like") { const c = el.dataset.cat, l = S.setup.so_thich; S.setup.so_thich = l.includes(c) ? l.filter((x) => x !== c) : [...l, c]; keepInputs(); renderSetup(); }
      else if (act === "money") { S.setup.ngan_sach = +el.dataset.val; keepInputs(true); renderSetup(); }
      else if (act === "setup") setup(el.dataset.mode, el);
      else if (act === "notice-x") notice(null);
      else if (act === "order") move(id, +el.dataset.k, +el.dataset.pos);
      else if (act === "gps") requestGPS();
      else if (act === "open-loc") toggleLocBar(true);
      else if (act === "start-preset") {
        const pr = START_PRESETS.find((x) => x.key === el.dataset.key);
        if (pr) setStartPoint({ ...pr, source: "preset" }, `Điểm xuất phát: ${pr.name} — đang gợi ý các điểm nổi tiếng gần nhất.`, "ok");
      }
      else if (act === "start-place") {
        const p = S.byId[id];
        if (p) {
          map?.closePopup();
          setStartPoint({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, source: "place" }, `Điểm xuất phát: ${p.name}.`, "ok");
        }
      }
    });

    function keepInputs(skipMoney) {
      const who = $("#f-who"), money = $("#f-money");
      if (who) S.setup.so_nguoi = Math.max(1, parseInt(who.value, 10) || 1);
      if (money && !skipMoney) S.setup.ngan_sach = parseInt(money.value.replace(/\D/g, ""), 10) || 0;
    }

    document.addEventListener("input", (e) => {
      if (e.target.id === "cat-q") { S.q = e.target.value; renderCatalogue(); }
      if (e.target.id === "f-money") {
        const digits = e.target.value.replace(/\D/g, "");
        e.target.value = digits ? (+digits).toLocaleString("vi-VN") : "";
      }
      if (e.target.id === "msg") autosize(e.target);
    });

    $("#btn-loc-toggle").addEventListener("click", () => toggleLocBar($("#loc-bar").hidden));
    $("#btn-loc-close").addEventListener("click", () => toggleLocBar(false));
    $("#btn-gps").addEventListener("click", requestGPS);
    $("#loc-place-select").addEventListener("change", (e) => {
      const p = S.byId[e.target.value];
      if (p) setStartPoint({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, source: "place" }, `Điểm xuất phát: ${p.name}.`, "ok");
    });
    $("#btn-sort-near").addEventListener("click", () => {
      if (!S.startPoint) { toggleLocBar(true); return; }
      S.sortNear = !S.sortNear;
      renderCatalogue();
    });

    document.addEventListener("mouseover", (e) => { const s = e.target.closest?.(".stop"); if (s) hot(s.dataset.id, true); });
    document.addEventListener("mouseout", (e) => { const s = e.target.closest?.(".stop"); if (s && !s.contains(e.relatedTarget)) hot(s.dataset.id, false); });

    $("#composer").addEventListener("submit", (e) => {
      e.preventDefault();
      const t = $("#msg"); const v = t.value; t.value = ""; autosize(t); send(v);
    });
    $("#msg").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("#composer").requestSubmit(); }
    });
    $("#chat-toggle").addEventListener("click", () => openChat(!chatOpen()));
    $("#ai-fab").addEventListener("click", () => openChat(true));
    $("#chat-close").addEventListener("click", () => openChat(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && chatOpen() && $("#chat").contains(document.activeElement)) openChat(false);
    });
    $("#btn-new").addEventListener("click", async (e) => {
      const b = e.currentTarget;
      if (!resetArmed) {
        resetArmed = true; b.textContent = "Bỏ lịch này? Bấm lần nữa";
        resetTimer = setTimeout(() => { resetArmed = false; b.textContent = "＋ Lập lịch mới"; }, 3500);
        return;
      }
      clearTimeout(resetTimer); resetArmed = false; b.textContent = "＋ Lập lịch mới";
      await api("/api/reset", {});
      S.thread = []; renderThread(); notice(null);
      setPlan(null, false);
      map?.setView([21.03, 105.845], 13);
    });
    $$(".tabs button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.tab)));
    bindDrag();
  }

  function autosize(t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 110) + "px"; }

  /* ------------------------------------------------------------ khởi động */
  async function boot() {
    initMap();
    bind();
    try {
      const saved = sessionStorage.getItem("vt-start");
      if (saved) S.startPoint = JSON.parse(saved);
    } catch {}
    const data = await api("/api/places").catch(() => null);
    if (!data || !data.places) {
      $("#plan-empty").innerHTML = `<div class="zone-card"><h3>Không tải được danh mục</h3><p class="zone-sub">Server web chưa chạy hoặc mất kết nối. Chạy <code>python3 codebase/web.py</code> rồi tải lại trang.</p></div>`;
      return;
    }
    S.places = data.places;
    S.byId = Object.fromEntries(data.places.map((p) => [p.id, p]));
    S.cats = data.categories;
    renderFilters();
    const st = await api("/api/state").catch(() => ({ plan: null }));
    S.plan = st.plan || null;
    renderAll(null, true);
  }

  boot();
})();
