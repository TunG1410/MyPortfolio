/* =========================================================
   NEURAL-LINK // giao diện "hoàng hôn neon": hiệu ứng, HUD và nội dung cho mọi trang.
   Bạn không cần sửa file này — thông tin cá nhân nằm trong data.js
   ========================================================= */
(function(){
  "use strict";
  const P = PROFILE, games = P.games || [];
  const PAGE = document.body.dataset.page || "home";
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const pad = (n, k = 2) => String(n).padStart(k, "0");
  // Hiệu ứng luôn bật mặc định (kể cả khi máy đặt "giảm chuyển động"); người xem tắt bằng nút FX trên HUD
  const reduce = document.documentElement.classList.contains("fx-off");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ss = { get(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { sessionStorage.setItem(k,v); } catch(e){} }, del(k){ try { sessionStorage.removeItem(k); } catch(e){} } };
  const ls = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };
  const getSet = k => { try { return new Set(JSON.parse(ss.get(k) || "[]")); } catch(e){ return new Set(); } };
  const putSet = (k, s) => ss.set(k, JSON.stringify([...s]));
  const initials = n => n.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(-2).join("").toUpperCase();
  const isDev = g => g.status === "dev";
  const stText = g => isDev(g) ? "Đang phát triển" : "Đã phát hành";
  const released = games.filter(g => !isDev(g)).length;
  const ID = `${initials(P.name)}-${pad(P.level, 4)}`;
  const YEAR = new Date().getFullYear();
  const trophy = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>`;

  /* ---------- màu & ngẫu nhiên ---------- */
  const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rgb = h => { h = String(h).replace("#",""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16) || 0); };
  const mix = (a,b,t) => { const A = rgb(a), B = rgb(b); return "#" + A.map((v,i) => Math.round(v + (B[i]-v)*t).toString(16).padStart(2,"0")).join(""); };
  const rgba = (h,a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

  /* =========================================================
     ĐỒ HỌA "hoàng hôn neon": bầu trời sao, mặt trời sọc, núi,
     thành phố, lưới sàn — dùng cho trang chủ và ảnh minh họa game
     ========================================================= */
  const C = { pink:"#FF4F9A", gold:"#FFC65C", orange:"#FF7A45", violet:"#8B6CFF", lilac:"#BBA9FF", mint:"#5EF0C8", blue:"#62B6FF", ink:"#0B0918" };
  const mkCanvas = (W, H) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(W)); c.height = Math.max(1, Math.ceil(H)); return c; };
  // đốm sáng mềm (dùng cho đom đóm / bụi sáng), vẽ sẵn một lần cho mỗi màu
  const SPR = {};
  const sprite = col => SPR[col] || (SPR[col] = (() => {
    const c = mkCanvas(32, 32), x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.12, rgba(col, 1)); g.addColorStop(.4, rgba(col, .35)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
  })());

  function skyline(W, H, r, o){
    const c = mkCanvas(W, H), x = c.getContext("2d"), s = o.scale || 1;
    let px = -r()*o.maxW;
    while (px < W){
      const bw = o.minW + r()*(o.maxW - o.minW), bh = o.minH + r()*(o.maxH - o.minH), top = o.base - bh;
      x.fillStyle = o.fill; x.fillRect(px, top, bw, o.base - top + 2);
      if (r() < .35){ const iw = bw*(.4 + r()*.3), ih = bh*(.08 + r()*.12); x.fillRect(px + (bw - iw)/2, top - ih, iw, ih + 1); }
      if (r() < .25){ x.fillRect(px + bw*.5, top - bh*.25, Math.max(1, s), bh*.25); if (o.blink){ x.fillStyle = "#FF5C6C"; x.fillRect(px + bw*.5 - s, top - bh*.25 - s, 3*s, 3*s); } }
      if (o.rim){ x.fillStyle = o.rim; x.fillRect(px, top, Math.max(1, s), o.base - top); }
      const ws = 5*s, ww = Math.max(1, 2*s);
      for (let wy = top + ws; wy < o.base - ws; wy += ws)
        for (let wx = px + 3*s; wx < px + bw - 3*s; wx += ws)
          if (r() < o.winP){ x.fillStyle = rgba(o.wins[Math.floor(r()*o.wins.length)], o.winA*(.35 + r()*.65)); x.fillRect(wx, wy, ww, ww); }
      if (o.signP && r() < o.signP && bh > o.maxH*.4){
        const col = o.wins[Math.floor(r()*o.wins.length)], sw = Math.max(4*s, bw*.16), sh = bh*(.2 + r()*.25), sx = px + (r() < .5 ? 2*s : bw - sw - 2*s), sy = top + bh*(.1 + r()*.3);
        x.save(); x.shadowColor = col; x.shadowBlur = 16*s; x.fillStyle = rgba(col, .9); x.fillRect(sx, sy, sw, sh); x.restore();
        x.fillStyle = "rgba(10,4,20,.38)"; for (let k = sy + 3*s; k < sy + sh - 2*s; k += 5*s) x.fillRect(sx + sw*.2, k, sw*.6, 2*s);
      }
      px += bw + r()*o.gap;
    }
    return c;
  }
  // đĩa mặt trời tô chuyển màu từ trên xuống
  function sunDisc(R, stops){
    const c = mkCanvas(R*2, R*2), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, R*2);
    stops.forEach((s,i) => g.addColorStop(i/(stops.length - 1), s));
    x.fillStyle = g; x.beginPath(); x.arc(R, R, R, 0, Math.PI*2); x.fill();
    return c;
  }
  // cắt các sọc ngang ở nửa dưới mặt trời; off (0..1) làm sọc trôi xuống
  function stripeSun(base, R, off = 0, out){
    const c = out || mkCanvas(base.width, base.height);
    if (c.width !== base.width || c.height !== base.height){ c.width = base.width; c.height = base.height; }
    const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); x.drawImage(base, 0, 0);
    x.globalCompositeOperation = "destination-out";
    const N = 10, top = R*.62;
    for (let i = 0; i < N; i++){ const t = (i + off)/N; x.fillRect(0, top + t*R*1.42, R*2, .5 + t*t*R*.16); }
    x.globalCompositeOperation = "source-over";
    return c;
  }
  // dãy núi (midpoint displacement) có viền sáng trên sống núi
  function mountains(W, H, r, o){
    const c = mkCanvas(W, H), x = c.getContext("2d"), n = o.n || 7, N = 1 << n, v = new Array(N + 1).fill(0), s = o.scale || 1;
    v[0] = r(); v[N] = r();
    for (let step = N, a = 1; step > 1; step /= 2, a *= (o.rough || .55)){ const h = step/2; for (let i = h; i < N; i += step) v[i] = (v[i-h] + v[i+h])/2 + (r() - .5)*a; }
    const lo = Math.min(...v), hi = Math.max(...v), pts = v.map((y,i) => [i/N*W, o.base - o.amp*(.15 + .85*(y - lo)/((hi - lo) || 1))]);
    const g = x.createLinearGradient(0, o.base - o.amp, 0, o.base); g.addColorStop(0, o.top); g.addColorStop(1, o.bottom || o.top);
    x.beginPath(); x.moveTo(0, o.base + 2); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(W, o.base + 2); x.closePath(); x.fillStyle = g; x.fill();
    if (o.rim){ x.save(); x.shadowColor = o.rim; x.shadowBlur = 10*s; x.strokeStyle = o.rim; x.lineWidth = 1.3*s; x.beginPath(); pts.forEach((p,i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.restore(); }
    return c;
  }
  function floorGrid(x, W, H, hz, color, off = 0, alpha = .6, floorTop = null){
    const vx = W/2, N = 18;
    x.lineWidth = 1; x.strokeStyle = rgba(color, alpha*.5);
    x.beginPath(); for (let k = -28; k <= 28; k++){ x.moveTo(vx + k*W*.012, hz); x.lineTo(vx + k*W*.17, H); } x.stroke();
    for (let i = 0; i < N; i++){ const t = ((i + off) % N)/N, y = hz + (H - hz)*t*t; x.strokeStyle = rgba(color, alpha*Math.min(1, t*1.4)); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    if (floorTop){ const g = x.createLinearGradient(0, hz, 0, hz + (H - hz)*.35); g.addColorStop(0, rgba(floorTop, .9)); g.addColorStop(1, rgba(floorTop, 0)); x.fillStyle = g; x.fillRect(0, hz, W, (H - hz)*.35); }
  }
  function reflect(x, sx, hz, H, w, color){
    for (let k = 0; k < 14; k++){ const t = k/14, y = hz + (H - hz)*Math.pow(t, 1.4) + 2, ww = w*(1 - t*.7);
      x.fillStyle = rgba(color, .38*(1 - t)); x.fillRect(sx - ww/2, y, ww, Math.max(1.5, (H - hz)*.012*(1 + t*2))); }
  }
  const horizon = (x, W, hz, color, a = .85) => { const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, rgba(color, 0)); g.addColorStop(.5, rgba(color, a)); g.addColorStop(1, rgba(color, 0)); x.fillStyle = g; x.fillRect(0, hz - 1, W, 2); };
  // ảnh minh họa tự vẽ: hoàng hôn neon theo màu "color" của game
  function duskArt(seed, color, W, H, o = {}){
    const c = mkCanvas(W, H), x = c.getContext("2d"), r = rng(hash(seed)), s = Math.max(1, W/700), hz = H*(o.hz ?? .64);
    let g = x.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, "#110C2A"); g.addColorStop(.42, mix("#23164E", color, .1)); g.addColorStop(.78, mix("#552371", color, .22)); g.addColorStop(1, mix("#B03A78", color, .42));
    x.fillStyle = g; x.fillRect(0, 0, W, hz);
    for (let i = 0; i < W*hz/2600; i++){ x.fillStyle = `rgba(255,240,255,${.15 + r()*.6})`; const z = r() < .12 ? 2*s : s; x.fillRect(r()*W, r()*hz*.7, z, z); }
    const sR = H*(.2 + r()*.08), sx = W*(o.sx ?? (.28 + r()*.44)), sy = hz - sR*.62;
    x.globalCompositeOperation = "lighter";
    g = x.createRadialGradient(sx, sy, sR*.5, sx, sy, sR*2.8); g.addColorStop(0, rgba(color, .5)); g.addColorStop(.5, rgba(mix(color, C.pink, .5), .16)); g.addColorStop(1, rgba(color, 0));
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "source-over";
    x.drawImage(stripeSun(sunDisc(sR, [mix(color, "#FFFFFF", .3), color, color, mix(color, C.pink, .7)]), sR, r()), sx - sR, sy - sR);
    if (r() < .75) x.drawImage(mountains(W, H, r, { base:hz, amp:H*(.1 + r()*.08), top:mix("#3A1E66", color, .12), bottom:mix("#241444", color, .06), rim:rgba(mix(color, "#FFFFFF", .3), .55), scale:s }), 0, 0);
    g = x.createLinearGradient(0, hz - H*.14, 0, hz); g.addColorStop(0, rgba(color, 0)); g.addColorStop(1, rgba(color, .2));
    x.fillStyle = g; x.fillRect(0, hz - H*.14, W, H*.14);
    x.drawImage(skyline(W, H, r, { base:hz, minW:W*.025, maxW:W*.06, minH:H*.04, maxH:H*.15, gap:3*s, fill:mix("#1E1440", color, .08), wins:[color, C.gold], winP:.1, winA:.5, scale:s }), 0, 0);
    x.drawImage(skyline(W, H, r, { base:hz + 2, minW:W*.04, maxW:W*.1, minH:H*.06, maxH:H*.3, gap:8*s, fill:"#100A22", wins:[color, "#FFFFFF", C.gold, C.pink], winP:.15, winA:.9, signP:.4, blink:true, scale:s }), 0, 0);
    g = x.createLinearGradient(0, hz, 0, H); g.addColorStop(0, mix("#22103E", color, .12)); g.addColorStop(1, "#0B0918");
    x.fillStyle = g; x.fillRect(0, hz, W, H - hz);
    floorGrid(x, W, H, hz, color, r()*18, .75);
    reflect(x, sx, hz, H, sR*1.3, color);
    horizon(x, W, hz, mix(color, "#FFFFFF", .4), .8);
    x.globalCompositeOperation = "lighter";
    for (let i = 0; i < W*H/9000; i++){ const z = (3 + r()*9)*s; x.globalAlpha = .25 + r()*.6; x.drawImage(sprite(r() < .6 ? color : C.gold), r()*W, hz*.55 + r()*(H - hz*.55), z, z); }
    x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    const v = x.createRadialGradient(W/2, H/2, Math.min(W,H)*.3, W/2, H/2, Math.max(W,H)*.75);
    v.addColorStop(0, "rgba(5,3,14,0)"); v.addColorStop(1, "rgba(5,3,14,.55)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }
  const gameArt = (g, W, H, o) => {
    if (g.image){ const im = new Image(); im.src = g.image; im.alt = `Ảnh game ${g.title}`; im.loading = "lazy"; return im; }
    const cv = duskArt(g.title, g.color || C.pink, W, H, o); cv.setAttribute("role","img"); cv.setAttribute("aria-label", `Ảnh minh họa cho ${g.title}`); return cv;
  };
  const portrait = (el, size) => {
    if (P.avatar){ const im = new Image(); im.src = P.avatar; im.alt = `Ảnh đại diện của ${P.name}`; el.append(im); return; }
    el.append(duskArt(P.name + "-id", C.pink, size, size, { hz:.7, sx:.5 }));
    const d = document.createElement("div"); d.className = "ini"; d.textContent = initials(P.name); el.append(d);
  };

  /* =========================================================
     ÂM THANH UI (tự tổng hợp — không cần file)
     ========================================================= */
  const Snd = {
    on: ls.get("sound") === "1", ctx: null, last: 0,
    ensure(){ if (!this.ctx){ try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },
    tone(f, d, type = "square", vol = .03, to = null, delay = 0){
      if (!this.on || !this.ctx || this.ctx.state !== "running") return;
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + d + .02);
    },
    hover(){ const n = performance.now(); if (n - this.last < 45) return; this.last = n; this.tone(2000, .025, "sine", .02); },
    click(){ this.tone(600, .05, "square", .025); this.tone(1200, .07, "sine", .03, null, .045); },
    move(){ this.tone(1400, .03, "square", .015); },
    swap(){ this.tone(180, .3, "sawtooth", .025, 1400); },
    type(){ this.tone(1100 + Math.random()*500, .012, "square", .007); },
    obj(){ this.tone(880, .08, "sine", .04); this.tone(1320, .12, "sine", .04, null, .07); },
    ach(){ [784,1047,1319,1568].forEach((f,i) => this.tone(f, .14, "triangle", .05, null, i*.07)); },
    boot(){ this.tone(55, 1, "sawtooth", .05, 880); [440,660,880].forEach((f,i) => this.tone(f, .5, "sine", .04, null, .35 + i*.08)); }
  };
  addEventListener("pointerdown", () => Snd.ensure(), { once:true });
  addEventListener("keydown", () => Snd.ensure(), { once:true });

  /* =========================================================
     KHUNG TRANG CHUNG: HUD, thanh hệ thống, nền, chuyển trang
     ========================================================= */
  const NAV = [["home","index.html","Trang chủ"],["games","games.html","Game"],["profile","profile.html","Hồ sơ"],["journey","journey.html","Nhiệm vụ"],["contact","contact.html","Liên hệ"]];
  const CUR = PAGE === "game" ? "games" : PAGE;
  const SECTOR = { home:"Trung tâm", games:"Thư viện game", game:"Chi tiết game", profile:"Hồ sơ nhân vật", journey:"Nhật ký nhiệm vụ", contact:"Kênh liên lạc", "404":"Vùng mất tín hiệu" }[PAGE] || "";
  const OBJ = [["games","Truy cập thư viện game"],["detail","Xem chi tiết một game"],["profile","Mở hồ sơ nhân vật"],["quest","Đọc một nhiệm vụ trong nhật ký"],["talk","Nói chuyện với NPC ở trang Liên hệ"],["cmd","Chạy một lệnh trong terminal"]];
  const ACH = {
    boot:      ["Kết nối thành công", "Hoàn tất khởi động hệ thống"],
    netrunner: ["Netrunner", "Ghé đủ 5 khu vực trên bản đồ mạng"],
    collector: ["Nhà sưu tầm", "Xem chi tiết 3 game"],
    hacker:    ["Hacker", "Chạy lệnh trong terminal bảo mật"],
    link:      ["Kết nối mạng lưới", "Mở một kênh liên lạc"],
    campaign:  ["Hoàn thành chiến dịch", "Xong toàn bộ mục tiêu"],
    secret:    ["Mã bí mật", "↑↑↓↓←→←→ B A — đúng chất game thủ"]
  };
  const NODES = { home:[38,78], games:[128,30], profile:[128,126], journey:[230,30], contact:[230,126] };
  const LINKS = [["home","games"],["home","profile"],["games","profile"],["games","journey"],["profile","contact"],["journey","contact"]];

  const visited = getSet("visited"); if (NAV.some(([k]) => k === CUR)){ visited.add(CUR); putSet("visited", visited); }

  document.body.insertAdjacentHTML("afterbegin", `
    <div class="bg" aria-hidden="true"></div><canvas id="rain" aria-hidden="true"></canvas>
    <div class="fx fx-scan" aria-hidden="true"></div><div class="fx fx-vig" aria-hidden="true"></div><div class="fx fx-flash" id="flash" aria-hidden="true"></div>
    <header class="hud" id="hud">
      <a class="plate" href="index.html" aria-label="Về trang chủ">
        <span class="plate-av">${esc(initials(P.name))}</span><span class="plate-lv">LV${esc(P.level)}</span>
        <span><span class="plate-name">${esc(P.name)}</span>
          <span class="bars" aria-hidden="true"><span class="bar hp">HP<i style="--v:100%"></i></span><span class="bar mp">MP<i id="mp" style="--v:80%"></i></span></span></span>
      </a>
      <nav class="tabs" id="tabs" aria-label="Điều hướng chính">
        ${NAV.map(([k,h,t],i) => `<a href="${h}" class="${k === CUR ? "on" : ""}" ${k === CUR ? 'aria-current="page"' : ""}><kbd>${i+1}</kbd><span data-scr>${t}</span></a>`).join("")}
      </nav>
      <div class="hud-tools">
        <div class="qwrap">
          <button class="ibtn" id="qBtn" aria-expanded="false" aria-controls="tracker"><span class="qlabel">Mục tiêu</span><span class="cnt" id="qCnt">0/0</span></button>
          <div class="panel tracker" id="tracker">
            <p class="ptag">Bản đồ mạng <span>// M</span></p>
            <svg class="netmap" id="netmap" viewBox="0 0 270 160" role="img" aria-label="Bản đồ các trang"></svg>
            <p class="ptag">Mục tiêu</p>
            <ul class="objs" id="objs"></ul>
            <p class="hint">Phím 1–5 chuyển trang · M mở bản đồ</p>
          </div>
        </div>
        <button class="ibtn fxbtn" id="fxBtn" aria-pressed="${!reduce}" title="Bật/tắt hiệu ứng chuyển động">FX<span class="fx-dot"></span></button>
        <button class="ibtn" id="sndBtn" aria-pressed="false" aria-label="Bật âm thanh"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path id="sOn" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path id="sOff" d="m22 9-6 6m0-6 6 6"/></svg></button>
        ${P.cvFile ? `<a class="ibtn cv" href="${esc(P.cvFile)}" download>Tải CV</a>` : ""}
        <button class="ibtn burger" id="burger" aria-expanded="false" aria-controls="tabs" aria-label="Mở menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18M3 12h12M3 17h18"/></svg></button>
      </div>
    </header>
    <div class="toasts" id="toasts" aria-live="polite"></div>
    <div class="tip" id="tip" role="tooltip"></div>
    <div class="cur cur-r" id="curR" aria-hidden="true"></div><div class="cur cur-d" id="curD" aria-hidden="true"></div><div class="cur cur-t" id="curT" aria-hidden="true"></div>
    <div class="tr" id="tr" aria-hidden="true">${Array.from({length:8}, (_,k) => `<i style="--k:${k}"></i>`).join("")}</div><div class="tr-txt" id="trTxt" aria-hidden="true"><span id="trLbl"></span><div class="tr-bar"><i id="trBar"></i></div><div class="tr-meta"><b id="trPct">000%</b><span id="trHex"></span></div></div><div class="tr-wipe" id="trWipe" aria-hidden="true"></div><div class="sprog" id="sprog" aria-hidden="true"></div>`);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot">
      ${PAGE !== "contact" && PAGE !== "404" ? `<div class="wrap foot-big"><h2>Cùng làm<span>game tiếp theo?</span></h2><a class="btn btn-p" href="contact.html">Mở kênh liên lạc</a></div>` : ""}
      <div class="wrap foot-in">
        <span>© ${YEAR} ${esc(P.name)} // ${esc(P.role)}</span>
        <nav aria-label="Liên kết chân trang">${NAV.map(([k,h,t]) => `<a href="${h}" class="${k === CUR ? "on" : ""}">${t}</a>`).join("")}</nav>
        <span>Node ${esc(ID)} // trực tuyến</span>
      </div>
    </footer>
    <div class="sysbar" aria-hidden="true">
      <span class="sys-sec">Sector // <b>${esc(SECTOR)}</b></span>
      <div class="sync"><span>Đồng bộ</span><div class="sync-t"><i id="syncI"></i></div><b id="syncP">0%</b></div>
      <span class="sys-fps">FPS <b id="fps">--</b></span>
      <span><b id="clock">--:--:--</b></span>
    </div>`);

  /* ---------- thông báo, mục tiêu, thành tựu ---------- */
  const toast = (html, cls = "") => {
    const t = document.createElement("div"); t.className = "toast " + cls; t.innerHTML = html; $("toasts").append(t);
    setTimeout(() => { t.classList.add("bye"); setTimeout(() => t.remove(), 420); }, cls ? 3000 : 4200);
  };
  const unlock = id => {
    const got = getSet("ach"); if (got.has(id) || !ACH[id]) return; got.add(id); putSet("ach", got);
    toast(`<div class="toast-ic">${trophy}</div><div><small>Thành tựu mở khóa · ${got.size}/${Object.keys(ACH).length}</small><b>${ACH[id][0]}</b><span>${ACH[id][1]}</span></div>`);
    Snd.ach();
  };
  const objDone = getSet("obj");
  const renderTracker = () => {
    $("objs").innerHTML = OBJ.map(([k,t]) => `<li class="${objDone.has(k) ? "done" : ""}"><span>${t}</span></li>`).join("");
    $("qCnt").textContent = `${objDone.size}/${OBJ.length}`;
    let s = LINKS.map(([a,b]) => { const on = visited.has(a) && visited.has(b); return `<line class="${on ? "ln-on" : ""}" x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}"/>`; }).join("");
    NAV.forEach(([k,h,t],i) => { const [cx,cy] = NODES[k], hx = Array.from({length:6}, (_,j) => { const a = Math.PI/3*j + Math.PI/6; return `${cx + Math.cos(a)*12},${cy + Math.sin(a)*12}`; }).join(" ");
      s += `<g class="${k === CUR ? "here" : visited.has(k) ? "seen" : ""}" data-h="${h}" tabindex="0" role="link" aria-label="${t}">${k === CUR ? `<circle class="pulse" cx="${cx}" cy="${cy}" r="12"/>` : ""}<polygon points="${hx}"/><text x="${cx}" y="${cy + (cy > 80 ? 28 : -19)}" text-anchor="middle">${i+1}·${t}</text></g>`; });
    $("netmap").innerHTML = s;
    const p = Math.round((visited.size + objDone.size)/(NAV.length + OBJ.length)*100);
    $("syncI").style.width = p + "%"; $("syncP").textContent = p + "%";
  };
  const completeObj = k => {
    if (objDone.has(k)) return; objDone.add(k); putSet("obj", objDone); renderTracker();
    const t = OBJ.find(o => o[0] === k);
    toast(`<div class="toast-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></div><div><small>Mục tiêu hoàn thành · ${objDone.size}/${OBJ.length}</small><b>${t ? t[1] : ""}</b></div>`, "obj");
    Snd.obj(); $("qBtn").classList.remove("ping"); void $("qBtn").offsetWidth; $("qBtn").classList.add("ping");
    if (objDone.size === OBJ.length) setTimeout(() => unlock("campaign"), 1200);
  };
  renderTracker();
  if (visited.size >= NAV.length) setTimeout(() => unlock("netrunner"), 1400);

  const tracker = $("tracker");
  const setTracker = o => { tracker.classList.toggle("open", o); $("qBtn").setAttribute("aria-expanded", o); };
  $("qBtn").addEventListener("click", e => { e.stopPropagation(); setTracker(!tracker.classList.contains("open")); Snd.click(); });
  document.addEventListener("click", e => { if (!e.target.closest(".qwrap")) setTracker(false); });
  $("netmap").addEventListener("click", e => { const g = e.target.closest("g[data-h]"); if (g) go(g.dataset.h); });
  $("netmap").addEventListener("keydown", e => { const g = e.target.closest("g[data-h]"); if (g && e.key === "Enter") go(g.dataset.h); });

  /* ---------- âm thanh, menu, đồng hồ ---------- */
  const setSound = on => {
    Snd.on = on; if (on) Snd.ensure(); ls.set("sound", on ? "1" : "0");
    $("sndBtn").setAttribute("aria-pressed", on); $("sndBtn").setAttribute("aria-label", on ? "Tắt âm thanh" : "Bật âm thanh");
    $("sOn").style.display = on ? "" : "none"; $("sOff").style.display = on ? "none" : "";
  };
  setSound(Snd.on);
  $("fxBtn").addEventListener("click", () => { ls.set("fx", reduce ? "1" : "0"); Snd.click(); location.reload(); });
  $("sndBtn").addEventListener("click", () => { setSound(!Snd.on); Snd.click(); });
  document.addEventListener("pointerover", e => { const el = e.target.closest("a,button,.item"); if (el && !el.contains(e.relatedTarget)) Snd.hover(); });
  const hud = $("hud");
  $("burger").addEventListener("click", () => { const o = hud.classList.toggle("open"); $("burger").setAttribute("aria-expanded", o); Snd.click(); });
  const tick = () => { const d = new Date(); $("clock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  tick(); setInterval(tick, 1000);

  // chữ giải mã khi rê chuột
  const GLYPH = "▓▒░█<>/\\_=+*#01アイウエオカキクケコ";
  const scramble = (el, text = el.dataset.t || el.textContent, dur = 480) => {
    if (reduce){ el.textContent = text; return; }
    el.dataset.t = text; const st = performance.now(), ch = [...text], at = ch.map(() => Math.random()*.7);
    cancelAnimationFrame(el._r);
    const step = n => { const k = (n - st)/dur; el.textContent = ch.map((c,i) => c === " " ? " " : k > at[i] + .3 ? c : GLYPH[Math.floor(Math.random()*GLYPH.length)]).join(""); if (k < 1.05) el._r = requestAnimationFrame(step); else el.textContent = text; };
    el._r = requestAnimationFrame(step);
  };
  document.querySelectorAll("[data-scr]").forEach(el => { el.dataset.t = el.textContent; el.closest("a").addEventListener("pointerenter", () => scramble(el)); });

  /* ---------- chuyển trang ---------- */
  const tr = $("tr"), trLbl = $("trLbl");
  const labelFor = href => { const f = href.split("?")[0].split("/").pop() || "index.html"; const n = NAV.find(([,h]) => h === f); return n ? n[2] : f === "game.html" ? "Chi tiết game" : "Trang mới"; };
  let leaving = false;
  const hex = () => "0x" + Math.floor(Math.random()*0xFFFFFF).toString(16).toUpperCase().padStart(6, "0");
  // thanh tải trong màn chuyển trang: chạy từ `from` đến `to` phần trăm
  const trLoad = (from, to, dur) => {
    const t0 = performance.now();
    const step = n => { const k = clamp((n - t0)/dur, 0, 1), v = Math.round(from + (to - from)*(1 - Math.pow(1 - k, 2)));
      $("trBar").style.width = v + "%"; $("trPct").textContent = pad(v, 3) + "%"; $("trHex").textContent = `ADDR ${hex()} // PKT ${pad(Math.floor(v*1.27), 3)}`;
      if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  function go(href){
    if (leaving) return; leaving = true;
    if (reduce){ location.href = href; return; }
    ss.set("transit","1"); trLbl.dataset.t = `>> Đang truy cập: ${labelFor(href)}`; scramble(trLbl, trLbl.dataset.t, 380);
    document.body.classList.remove("arrive"); document.body.classList.add("leaving");
    tr.classList.remove("out","cover"); void tr.offsetWidth; tr.classList.add("in"); Snd.swap();
    trLoad(0, 72, 560);
    setTimeout(() => location.href = href, 600);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href") || "";
    if (a.target === "_blank" || a.hasAttribute("download") || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
    e.preventDefault(); hud.classList.remove("open"); go(href);
  });
  if (document.documentElement.classList.contains("transit")){
    tr.classList.add("cover"); trLbl.textContent = ">> Kết nối thiết lập"; $("trBar").style.width = "72%"; $("trPct").textContent = "072%";
    document.documentElement.classList.remove("transit"); ss.del("transit");
    document.body.classList.add("arrive"); trLoad(72, 100, 260);
    setTimeout(() => { tr.classList.remove("cover"); tr.classList.add("out"); }, 200);
    setTimeout(() => document.body.classList.remove("arrive"), 1600);
  }
  addEventListener("pageshow", e => { if (e.persisted){ leaving = false; document.body.classList.remove("leaving"); tr.classList.remove("in","cover"); tr.classList.add("out"); } });

  /* ---------- con trỏ ---------- */
  const cur = { x:-100, y:-100, rx:-100, ry:-100 };
  if (finePointer && !reduce){
    document.body.classList.add("has-cursor");
    addEventListener("pointermove", e => { cur.x = e.clientX; cur.y = e.clientY; document.body.classList.add("cur-on"); $("curR").classList.toggle("hot", !!e.target.closest("a,button,input,.item,.slot,g[data-h]")); }, { passive:true });
    addEventListener("pointerdown", e => { const r = document.createElement("div"); r.className = "ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; document.body.append(r); setTimeout(() => r.remove(), 520); });
    document.addEventListener("mouseleave", () => { cur.x = cur.rx = cur.y = cur.ry = -100; document.body.classList.remove("cur-on"); });
  }

  /* ---------- bụi sáng bay lơ lửng + vòng lặp chung ---------- */
  const rain = $("rain"), rx = rain.getContext("2d"), MCOL = [C.pink, C.gold, C.lilac, C.pink, C.mint];
  let motes = [];
  const newMote = any => ({ x:Math.random()*innerWidth, y:any ? Math.random()*innerHeight : innerHeight + 20, r:.8 + Math.random()*2.2, v:.12 + Math.random()*.4, ph:Math.random()*6.28, a:.2 + Math.random()*.5, c:MCOL[Math.floor(Math.random()*MCOL.length)] });
  const sizeRain = () => { rain.width = innerWidth; rain.height = innerHeight; motes = Array.from({length: Math.round(innerWidth*innerHeight/24000)}, () => newMote(true)); };
  sizeRain(); addEventListener("resize", () => { sizeRain(); if (reduce) drawRain(); });
  const drawRain = (t = 0) => {
    rx.clearRect(0, 0, rain.width, rain.height); rx.globalCompositeOperation = "lighter";
    for (const m of motes){
      const z = m.r*8; rx.globalAlpha = m.a*(.55 + .45*Math.sin(m.ph + t*.0018));
      rx.drawImage(sprite(m.c), m.x + Math.sin(m.ph + t*.0005)*16 - z/2, m.y - z/2, z, z);
      if (!reduce){ m.y -= m.v; if (m.y < -24) Object.assign(m, newMote(false)); }
    }
    rx.globalAlpha = 1; rx.globalCompositeOperation = "source-over";
  };
  const frameHooks = [];
  let lastRain = 0, fpsN = 0, fpsT = performance.now();
  const loop = now => {
    if (now - lastRain > 33){ drawRain(now); lastRain = now; }
    cur.rx += (cur.x - cur.rx)*.25; cur.ry += (cur.y - cur.ry)*.25;
    $("curR").style.transform = `translate(${cur.rx}px,${cur.ry}px)`; $("curD").style.transform = `translate(${cur.x}px,${cur.y}px)`; $("curT").style.transform = `translate(${cur.x}px,${cur.y}px)`;
    if (finePointer) $("curT").textContent = `${pad(Math.round(cur.x),4)}:${pad(Math.round(cur.y),4)}`;
    $("mp").style.setProperty("--v", `${70 + Math.sin(now/1400)*14}%`);
    frameHooks.forEach(f => f(now));
    fpsN++; if (now - fpsT > 1000){ $("fps").textContent = fpsN; fpsN = 0; fpsT = now; }
    requestAnimationFrame(loop);
  };
  if (!reduce) requestAnimationFrame(loop); else drawRain();

  /* ---------- bàn phím chung ---------- */
  const KON = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let kp = 0;
  let pageKeys = null;
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kp = k === KON[kp] ? kp + 1 : (k === KON[0] ? 1 : 0);
    if (kp === KON.length){ kp = 0; unlock("secret"); const f = $("flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); document.querySelectorAll(".glitch").forEach(g => { g.classList.remove("burst"); void g.offsetWidth; g.classList.add("burst"); }); }
    if (/input|textarea/i.test(e.target.tagName) || $("boot")) return;
    if (/^[1-9]$/.test(k) && CHOICE_KEYS && CHOICE_KEYS(+k)) return;
    if (/^[1-5]$/.test(k)){ const n = NAV[+k - 1]; if (n && n[0] !== CUR) go(n[1]); return; }
    if (k === "m"){ setTracker(!tracker.classList.contains("open")); Snd.click(); return; }
    if (k === "Escape"){ setTracker(false); hud.classList.remove("open"); return; }
    if (pageKeys) pageKeys(e, k);
  });

  /* ---------- tiện ích nội dung ---------- */
  const main = $("main");
  const pageHead = (key, title, sub, hint = "") => `
    <header class="wrap phead">
      <div class="crumb"><a href="index.html">Root</a> / <b>${esc(key)}</b></div>
      <h1 class="glitch" data-text="${esc(title)}">${esc(title)}</h1>
      ${sub ? `<p>${esc(sub)}</p>` : ""}
      ${hint ? `<div class="keyhint" style="margin-top:18px">${hint}</div>` : ""}
      <div class="phead-side" aria-hidden="true"><div class="hexid">${Array.from({length:24}, (_,i) => `<i style="--o:${(.15 + rng(hash(key) + i)()*.85).toFixed(2)}"></i>`).join("")}</div><span>SEC://${esc(key.toUpperCase())}<br>${esc(ID)} // ${YEAR}</span></div>
    </header>`;
  const ytEmbed = u => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : null; };
  const reveal = () => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); if (e.target._onIn) e.target._onIn(); } }), { threshold:.12 });
    document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
  };
  const countUp = root => root.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count; if (reduce){ el.textContent = pad(to); return; }
    const t0 = performance.now(), step = n => { const k = clamp((n - t0)/1300, 0, 1); el.textContent = pad(Math.round(to*(1 - Math.pow(1-k,3)))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  const bk = '<span class="bk" aria-hidden="true"></span>';
  const pages = {};

  /* =========================================================
     TRANG CHỦ — menu chính
     ========================================================= */
  pages.home = () => {
    document.title = `${P.name} — ${P.role}`;
    const fi = Math.max(0, games.findIndex(g => g.featured)), fg = games[fi];
    const menu = [["Bắt đầu","games.html","Thư viện game"],["Hồ sơ nhân vật","profile.html","Kỹ năng & túi đồ"],["Nhật ký nhiệm vụ","journey.html","Kinh nghiệm"],["Kênh liên lạc","contact.html","Liên hệ"], P.cvFile ? ["Tải CV",P.cvFile,"File PDF",1] : null].filter(Boolean);
    const notes = [...games].map((g,i) => ({...g, i})).sort((a,b) => (b.year||0) - (a.year||0));
    const words = [...P.tools, ...P.skills.map(s => s.name)];
    main.innerHTML = `
      <section class="hero" id="hero">
        <canvas id="city" aria-hidden="true"></canvas><div class="hero-ov"></div>
        <div class="wrap hero-grid">
          <div>
            <p class="hero-k seq">Hồ sơ nhà phát triển // đã xác thực</p>
            <h1 class="hero-name glitch seq" data-text="${esc(P.name)}" style="--d:.1s">${esc(P.name)}</h1>
            <p class="hero-role seq" style="--d:.2s"><span id="roleTxt"></span><span class="caret"></span></p>
            <p class="hero-p seq" style="--d:.3s">${esc(P.tagline)}</p>
            <ul class="mmenu" id="mmenu">${menu.map(([t,h,s,dl],i) => `<li class="seq" style="--d:${.4 + i*.07}s"><a href="${esc(h)}" ${dl ? "download" : ""}>${esc(t)}<small>${esc(s)}</small></a></li>`).join("")}</ul>
            <div class="keyhint seq" style="--d:.85s"><kbd>↑</kbd><kbd>↓</kbd> chọn <kbd>Enter</kbd> xác nhận <kbd>1</kbd>–<kbd>5</kbd> chuyển trang</div>
          </div>
          ${fg ? `<aside class="panel news seq" style="--d:.7s" aria-label="Tin mới">
            <p class="ptag live">Tin mới <span>// live</span></p>
            <a href="game.html?id=${fi}"><div class="news-art" id="newsArt"></div><b>${esc(fg.title)}</b><p>${stText(fg)} · ${esc((fg.genres||[]).join(", "))}</p></a>
            <div class="stats3"><div><b data-count="${P.level}">00</b><span>Năm KN</span></div><div><b data-count="${released}">00</b><span>Phát hành</span></div><div><b data-count="${games.length - released}">00</b><span>Đang làm</span></div></div>
          </aside>` : ""}
        </div>
      </section>
      <section class="wrap sec">
        <div class="sec-h" data-reveal><div><small>// Dự án tiêu điểm</small><h2>Game nổi bật</h2></div><a class="more" href="games.html">Mở thư viện</a></div>
        <div class="home-grid">
          ${fg ? `<a class="panel feature brk" href="game.html?id=${fi}" data-reveal style="--ac:${esc(fg.color)}">${bk}
            <div class="feature-art" id="featArt"><span class="st ${isDev(fg) ? "dev" : "released"}" style="z-index:2">${stText(fg)}</span></div>
            <div class="feature-body"><small>#${pad(fi+1)} // ${esc(fg.engine || "")} // ${esc(fg.year || "")}</small><h3>${esc(fg.title)}</h3><p>${esc(fg.desc)}</p><span class="go">Xem chi tiết</span></div>
          </a>` : ""}
          <div class="panel patch" data-reveal style="--d:.1s">
            <p class="ptag">Nhật ký cập nhật</p>
            <ol>${notes.map(g => `<li><time>${esc(g.year || "—")}</time><div><b>${esc(g.title)}</b><span>${stText(g)}${g.engine ? ` · ${esc(g.engine)}` : ""}</span></div></li>`).join("")}</ol>
          </div>
        </div>
      </section>
      <div class="marquee" aria-hidden="true"><div>${[...words, ...words].map(w => `<span>${esc(w)}</span>`).join("")}</div></div>`;
    if (fg){ $("newsArt").append(gameArt(fg, 640, 360)); $("featArt").prepend(gameArt(fg, 1200, 600)); }

    // menu chính điều khiển bằng phím
    const links = [...$("mmenu").querySelectorAll("a")]; let sel = 0;
    const setSel = (i, snd = true) => { sel = (i + links.length) % links.length; links.forEach((a,k) => a.classList.toggle("sel", k === sel)); if (snd) Snd.move(); };
    setSel(0, false);
    links.forEach((a,i) => { a.addEventListener("pointerenter", () => setSel(i, false)); a.addEventListener("focus", () => setSel(i, false)); });
    pageKeys = (e, k) => {
      if (scrollY > innerHeight*.5) return;
      if (k === "ArrowDown" || k === "ArrowUp"){ e.preventDefault(); setSel(sel + (k === "ArrowDown" ? 1 : -1)); links[sel].focus({ preventScroll:true }); }
      else if (k === "Enter" && !e.target.closest("a,button")){ Snd.click(); links[sel].click(); }
    };

    // cảnh hoàng hôn neon: sao, mặt trời sọc, núi, thành phố, lưới sàn, đom đóm
    const cv = $("city"), x = cv.getContext("2d"), mouse = { x:0, y:0, tx:0, ty:0 };
    let W, H, hz, s, R, sky, floor, sunBase, sunWork = null, layers = [], stars = [], flies = [], visible = true, shoot = null, nextShoot = 6;
    const build = () => {
      W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; hz = W < 700 ? Math.min(H*.5, innerHeight*.44) : H*.66;
      s = Math.max(1, W/1100); const r = rng(2077), LW = Math.ceil(W*1.12);
      R = W < 700 ? W*.27 : Math.min(W*.16, H*.27);
      sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, "#0B0918"); sky.addColorStop(.38, "#1A1242"); sky.addColorStop(.7, "#43205F"); sky.addColorStop(.9, "#92306F"); sky.addColorStop(1, "#C9446F");
      floor = x.createLinearGradient(0, hz, 0, H); floor.addColorStop(0, "#26103F"); floor.addColorStop(1, "#0B0918");
      sunBase = sunDisc(R, ["#FFF1BE", C.gold, C.orange, C.pink, "#C93A8E"]);
      layers = [
        mountains(LW, H, r, { base:hz, amp:hz*.2, top:"#3B1F68", bottom:"#28154A", rim:"rgba(255,150,200,.6)", scale:s }),
        skyline(LW, H, r, { base:hz, minW:W*.018, maxW:W*.045, minH:hz*.05, maxH:hz*.17, gap:3*s, fill:"#1D1338", wins:[C.pink, C.gold, C.lilac], winP:.1, winA:.45, scale:s }),
        skyline(LW, H, r, { base:hz + 2, minW:W*.03, maxW:W*.07, minH:hz*.07, maxH:hz*.33, gap:7*s, fill:"#110A24", wins:[C.pink, "#FFFFFF", C.gold, C.violet], winP:.15, winA:.85, signP:.45, blink:true, scale:s }),
        edgeTowers(LW, H, r, s)
      ];
      stars = Array.from({length: Math.round(W*hz/2400)}, () => ({ x:Math.random()*W*1.05, y:Math.random()*hz*.78, z:(Math.random() < .1 ? 2 : 1)*s, p:Math.random()*6.28, v:.5 + Math.random()*1.8 }));
      flies = Array.from({length: Math.round(W*H/15000)}, () => ({ x:Math.random()*W, y:hz*.55 + Math.random()*(H - hz*.55), z:(5 + Math.random()*13)*s, v:(.12 + Math.random()*.45)*s, p:Math.random()*6.28, c:Math.random() < .55 ? C.gold : Math.random() < .6 ? C.pink : C.lilac }));
    };
    // lớp gần nhất: vài tòa tháp cao ở hai mép khung hình
    function edgeTowers(LW, H, r, s){
      const c = mkCanvas(LW, H), x2 = c.getContext("2d"), o = { base:H + 4, minW:W*.05, maxW:W*.09, minH:H*.42, maxH:H*.66, gap:W*.02, fill:"#08050F", wins:[C.pink, C.gold], winP:.05, winA:.6, signP:.8, scale:s };
      const side = Math.max(W*.1, 70*s);
      x2.drawImage(skyline(side, H, r, o), -side*.25, 0); x2.drawImage(skyline(side, H, r, o), LW - side*.9, 0);
      return c;
    }
    const D = [5, 10, 22, 46];
    const draw = t => {
      mouse.x += (mouse.tx - mouse.x)*.05; mouse.y += (mouse.ty - mouse.y)*.05;
      x.fillStyle = sky; x.fillRect(0, 0, W, hz + 2);
      for (const st of stars){ x.fillStyle = `rgba(255,240,255,${(.25 + .75*Math.abs(Math.sin(st.p + t*st.v)))*.85})`; x.fillRect(st.x - mouse.x*4, st.y - mouse.y*3, st.z, st.z); }
      // sao băng thỉnh thoảng lướt qua
      if (!reduce && t > nextShoot){ shoot = { x:W*(.15 + Math.random()*.55), y:H*(.06 + Math.random()*.18), t0:t }; nextShoot = t + 5 + Math.random()*7; }
      if (shoot){ const k = (t - shoot.t0)/1.1;
        if (k > 1) shoot = null;
        else { const L = 180*s, hx = shoot.x + k*W*.22, hy = shoot.y + k*W*.09, g = x.createLinearGradient(hx, hy, hx - L, hy - L*.41);
          g.addColorStop(0, `rgba(255,245,252,${Math.sin(k*Math.PI)})`); g.addColorStop(1, "rgba(255,141,193,0)"); x.strokeStyle = g; x.lineWidth = 1.6*s; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx - L, hy - L*.41); x.stroke(); } }
      const cx = W*(W < 700 ? .5 : W < 1000 ? .64 : .72) - mouse.x*10, cy = hz - R*.66 + mouse.y*5;
      x.save(); x.globalCompositeOperation = "lighter";
      let g = x.createRadialGradient(cx, cy, R*.5, cx, cy, R*3); g.addColorStop(0, "rgba(255,122,69,.5)"); g.addColorStop(.45, "rgba(255,79,154,.18)"); g.addColorStop(1, "rgba(255,79,154,0)");
      x.fillStyle = g; x.fillRect(cx - R*3, cy - R*3, R*6, R*6); x.restore();
      sunWork = stripeSun(sunBase, R, reduce ? .35 : (t*.11) % 1, sunWork);
      x.drawImage(sunWork, cx - R, cy - R);
      x.drawImage(layers[0], -W*.06 - mouse.x*D[0], mouse.y*D[0]*.3);
      g = x.createLinearGradient(0, hz - H*.16, 0, hz); g.addColorStop(0, "rgba(255,79,154,0)"); g.addColorStop(1, "rgba(255,79,154,.24)"); x.fillStyle = g; x.fillRect(0, hz - H*.16, W, H*.16);
      x.drawImage(layers[1], -W*.06 - mouse.x*D[1], mouse.y*D[1]*.3);
      x.drawImage(layers[2], -W*.06 - mouse.x*D[2], mouse.y*D[2]*.3);
      x.fillStyle = floor; x.fillRect(0, hz, W, H - hz);
      floorGrid(x, W, H, hz, C.pink, reduce ? 0 : (t*.6) % 18, .6, "#26103F");
      reflect(x, cx, hz, H, R*1.3, C.orange);
      horizon(x, W, hz, "#FFB3D4", .9);
      x.drawImage(layers[3], -W*.06 - mouse.x*D[3], mouse.y*D[3]*.3);
      x.save(); x.globalCompositeOperation = "lighter";
      for (const f of flies){
        x.globalAlpha = .3 + .6*Math.abs(Math.sin(f.p + t*1.3));
        x.drawImage(sprite(f.c), f.x + Math.sin(f.p + t*.6)*18*s - f.z/2 - mouse.x*D[2]*.6, f.y - f.z/2, f.z, f.z);
        if (!reduce){ f.y -= f.v; if (f.y < hz*.45){ f.y = H + 10; f.x = Math.random()*W; } }
      }
      x.restore();
    };
    build(); draw(4);
    addEventListener("resize", () => { build(); draw(4); });
    addEventListener("pointermove", e => { mouse.tx = e.clientX/innerWidth*2 - 1; mouse.ty = e.clientY/innerHeight*2 - 1; }, { passive:true });
    new IntersectionObserver(([e]) => visible = e.isIntersecting).observe($("hero"));
    const t0 = performance.now();
    frameHooks.push(n => { if (visible) draw((n - t0)/1000 + 4); });

    start = () => {
      $("hero").classList.add("ready"); countUp($("hero"));
      const el = $("roleTxt"), txt = P.role; if (reduce){ el.textContent = txt; return; }
      let i = 0; const ty = () => { el.textContent = txt.slice(0, ++i); Snd.type(); if (i < txt.length) setTimeout(ty, 55); }; setTimeout(ty, 450);
    };
  };

  /* =========================================================
     CHỌN GAME
     ========================================================= */
  pages.games = () => {
    document.title = `Thư viện game — ${P.name}`;
    completeObj("games");
    main.innerHTML = `${pageHead("Games", "Chọn game", "Duyệt qua các dự án. Chọn một game để xem trước, bấm vào để mở trang chi tiết.", `<kbd>←</kbd><kbd>→</kbd> đổi game <kbd>Enter</kbd> mở chi tiết`)}
      <section class="wrap select">
        <div class="pv brk" id="pv" data-reveal>${bk}
          <div class="pv-art" id="pvArt"></div>
          <div class="pv-hud"><span class="st" id="pvSt"></span><span class="pv-n" id="pvN"></span></div>
          <div class="pv-ret" aria-hidden="true"></div>
          <div class="pv-info" id="pvInfo"></div>
          <button class="pv-nav l" id="pvL" aria-label="Game trước">‹</button><button class="pv-nav r" id="pvR" aria-label="Game sau">›</button>
        </div>
        <div class="side" data-reveal style="--d:.1s">
          <div class="ftabs" role="tablist" aria-label="Lọc game"><button class="on" data-f="all" role="tab" aria-selected="true">Tất cả</button><button data-f="released" role="tab" aria-selected="false">Phát hành</button><button data-f="dev" role="tab" aria-selected="false">Đang làm</button></div>
          <div class="slots" id="slots" role="listbox" aria-label="Danh sách game">${games.map((g,i) => `
            <button class="slot" role="option" data-i="${i}" style="--ac:${esc(g.color || C.pink)}"><div class="slot-art"></div><div><small>SLOT ${pad(i+1)}</small><b>${esc(g.title)}</b><em>${stText(g)}</em></div></button>`).join("")}
          </div>
        </div>
      </section>`;
    if (!games.length){ $("pvInfo").innerHTML = `<h2>Chưa có game</h2><p class="pv-desc">Hãy thêm game vào file data.js.</p>`; return; }
    const slots = [...$("slots").querySelectorAll(".slot")];
    slots.forEach((s,i) => { s.querySelector(".slot-art").append(gameArt(games[i], 300, 190)); s.addEventListener("click", () => { if (i === gi) go(`game.html?id=${i}`); else show(i); }); });
    const big = new Map(); let gi = Math.max(0, games.findIndex(g => g.featured)), filter = "all";
    const visible = () => slots.filter(s => !s.hidden).map(s => +s.dataset.i);
    function show(i, snd = true){
      gi = i; const g = games[i], ac = g.color || C.pink;
      $("pv").style.setProperty("--ac", ac);
      slots.forEach((s,k) => { s.classList.toggle("sel", k === i); s.setAttribute("aria-selected", k === i); });
      if (!big.has(i)) big.set(i, gameArt(g, 1600, 900, { sx:.72 }));
      const el = big.get(i); [...$("pvArt").children].forEach(c => { if (c !== el) c.remove(); });
      el.classList.remove("enter"); void el.offsetWidth; if (!reduce) el.classList.add("enter"); $("pvArt").append(el);
      $("pvSt").className = "st " + (isDev(g) ? "dev" : "released"); $("pvSt").textContent = stText(g);
      $("pvN").innerHTML = `<b>${pad(i+1)}</b> / ${pad(games.length)}`;
      $("pvInfo").innerHTML = `
        <h2 class="glitch burst" data-text="${esc(g.title)}">${esc(g.title)}</h2>
        <div class="pv-meta">
          ${(g.genres||[]).length ? `<div>Thể loại<b>${esc(g.genres.join(" / "))}</b></div>` : ""}
          ${g.engine ? `<div>Engine<b>${esc(g.engine)}</b></div>` : ""}
          ${g.platform ? `<div>Nền tảng<b>${esc(g.platform)}</b></div>` : ""}
          ${g.year ? `<div>Năm<b>${esc(g.year)}</b></div>` : ""}
        </div>
        <p class="pv-desc">${esc(g.desc)}</p>
        <div class="pv-act"><a class="btn btn-p" href="game.html?id=${i}">Xem chi tiết</a>${g.itch ? `<a class="btn btn-o" href="${esc(g.itch)}" target="_blank" rel="noopener">${isDev(g) ? "Theo dõi" : "▶ Chơi ngay"}</a>` : ""}</div>`;
      if (snd) Snd.swap();
      if (finePointer) slots[i].scrollIntoView({ block:"nearest", inline:"nearest" });
    }
    const step = d => { const v = visible(); if (!v.length) return; const p = v.indexOf(gi); show(v[((p < 0 ? 0 : p + d) + v.length) % v.length]); };
    show(gi, false);
    $("pvL").addEventListener("click", () => step(-1)); $("pvR").addEventListener("click", () => step(1));
    document.querySelector(".ftabs").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; filter = b.dataset.f; Snd.click();
      document.querySelectorAll(".ftabs button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
      slots.forEach(s => { const g = games[+s.dataset.i]; s.hidden = !(filter === "all" || (filter === "dev") === isDev(g)); });
      const v = visible(); if (v.length && !v.includes(gi)) show(v[0]);
    });
    let sx = null;
    $("pv").addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive:true });
    $("pv").addEventListener("touchend", e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
    pageKeys = (e, k) => {
      if (k === "ArrowRight" || k === "ArrowDown"){ e.preventDefault(); step(1); }
      else if (k === "ArrowLeft" || k === "ArrowUp"){ e.preventDefault(); step(-1); }
      else if (k === "Enter" && !e.target.closest("a,button")) go(`game.html?id=${gi}`);
    };
  };

  /* =========================================================
     CHI TIẾT GAME
     ========================================================= */
  pages.game = () => {
    let id = parseInt(new URLSearchParams(location.search).get("id"), 10);
    if (!(id >= 0 && id < games.length)) id = Math.max(0, games.findIndex(g => g.featured));
    const g = games[id]; if (!g){ main.innerHTML = pageHead("Games", "Chưa có game", "Hãy thêm game vào file data.js."); return; }
    document.title = `${g.title} — ${P.name}`;
    completeObj("detail");
    const views = getSet("gviews"); views.add(id); putSet("gviews", views); if (views.size >= Math.min(3, games.length)) setTimeout(() => unlock("collector"), 1000);
    const ac = g.color || C.pink, yt = ytEmbed(g.trailer), pi = (id - 1 + games.length) % games.length, ni = (id + 1) % games.length;
    const play = g.itch ? `<a class="btn btn-p" href="${esc(g.itch)}" target="_blank" rel="noopener">${isDev(g) ? "Theo dõi trên itch.io" : "▶ Chơi ngay"}</a>` : "";
    const trl = g.trailer && !yt ? `<a class="btn btn-o" href="${esc(g.trailer)}" target="_blank" rel="noopener">Xem trailer</a>` : "";
    main.innerHTML = `
      <section class="gbanner" style="--ac:${esc(ac)}">
        <div class="gbanner-art" id="gArt"></div>
        <div class="wrap">
          <div class="crumb"><a href="index.html">Root</a> / <a href="games.html">Games</a> / <b>Slot ${pad(id+1)}</b></div>
          <h1 class="glitch" data-text="${esc(g.title)}">${esc(g.title)}</h1>
          <div class="row"><span class="st ${isDev(g) ? "dev" : "released"}">${stText(g)}</span>${(g.genres||[]).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          ${play || trl ? `<div class="actions">${play}${trl}</div>` : ""}
        </div>
      </section>
      <section class="wrap gdetail" style="--ac:${esc(ac)}">
        <div data-reveal>
          <p class="ptag">Giới thiệu</p>
          <p class="lead">${esc(g.desc)}</p>
          ${g.highlight ? `<div class="trophy">${trophy}${esc(g.highlight)}</div>` : ""}
          ${(g.features||[]).length ? `<ul class="feats">${g.features.map((t,k) => `<li><i>MOD.${pad(k+1)}</i>${esc(t)}</li>`).join("")}</ul>` : ""}
          ${yt ? `<div class="blk"><p class="ptag">Trailer</p><div class="video"><iframe src="${yt}" title="Trailer ${esc(g.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>` : ""}
          ${(g.screenshots||[]).length ? `<div class="blk"><p class="ptag">Hình ảnh</p><div class="shots">${g.screenshots.map((s,k) => `<a href="${esc(s)}" target="_blank" rel="noopener"><img src="${esc(s)}" alt="Ảnh ${k+1} của ${esc(g.title)}" loading="lazy"></a>`).join("")}</div></div>` : ""}
        </div>
        <aside class="panel spec brk" data-reveal style="--d:.1s">${bk}
          <p class="ptag">Thông số</p>
          <dl>
            <div><dt>Trạng thái</dt><dd style="color:${isDev(g) ? "var(--gold)" : "var(--mint)"}">${stText(g)}</dd></div>
            ${(g.genres||[]).length ? `<div><dt>Thể loại</dt><dd>${esc(g.genres.join(", "))}</dd></div>` : ""}
            ${g.engine ? `<div><dt>Engine</dt><dd>${esc(g.engine)}</dd></div>` : ""}
            ${g.platform ? `<div><dt>Nền tảng</dt><dd>${esc(g.platform)}</dd></div>` : ""}
            ${g.year ? `<div><dt>Năm</dt><dd>${esc(g.year)}</dd></div>` : ""}
          </dl>
          <div class="actions">${play}${trl}<a class="btn btn-o btn-sm" href="games.html">← Về thư viện</a></div>
        </aside>
      </section>
      ${games.length > 1 ? `<nav class="wrap pn" aria-label="Game khác">
        <a href="game.html?id=${pi}"><div class="pn-art" id="pnP"></div><div><small><kbd>←</kbd> Game trước</small><b>${esc(games[pi].title)}</b></div></a>
        <a class="nx" href="game.html?id=${ni}"><div class="pn-art" id="pnN"></div><div><small>Game sau <kbd>→</kbd></small><b>${esc(games[ni].title)}</b></div></a>
      </nav>` : ""}`;
    $("gArt").append(gameArt(g, 1800, 1000, { sx:.72 }));
    if (games.length > 1){
      $("pnP").append(gameArt(games[pi], 320, 200)); $("pnN").append(gameArt(games[ni], 320, 200));
      pageKeys = (e, k) => { if (k === "ArrowLeft") go(`game.html?id=${pi}`); else if (k === "ArrowRight") go(`game.html?id=${ni}`); else if (k === "Backspace") go("games.html"); };
    }
  };

  /* =========================================================
     HỒ SƠ NHÂN VẬT
     ========================================================= */
  const radarSVG = sk => {
    const n = sk.length, cx = 200, cy = 170, R = 118; if (n < 3) return "";
    const pt = (i, r) => { const a = -Math.PI/2 + i*2*Math.PI/n; return [cx + Math.cos(a)*r, cy + Math.sin(a)*r]; };
    let s = "";
    for (let l = 1; l <= 5; l++) s += `<polygon class="grid" points="${sk.map((_,i) => pt(i, R*l/5).join(",")).join(" ")}"/>`;
    sk.forEach((_,i) => { const [x,y] = pt(i, R); s += `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
    s += `<polygon class="data" points="${sk.map((k,i) => pt(i, R*clamp(+k.level,0,10)/10).join(",")).join(" ")}"/>`;
    sk.forEach((k,i) => { const [x,y] = pt(i, R*clamp(+k.level,0,10)/10); s += `<circle class="dot" cx="${x}" cy="${y}" r="4"/>`;
      const [lx,ly] = pt(i, R + 22); s += `<rect class="ax" x="${lx-13}" y="${ly-11}" width="26" height="22"/><text x="${lx}" y="${ly+5}" text-anchor="middle">${pad(i+1)}</text>`; });
    const defs = `<defs><linearGradient id="rdF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F9A" stop-opacity=".5"/><stop offset="1" stop-color="#8B6CFF" stop-opacity=".32"/></linearGradient><linearGradient id="rdS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8DC1"/><stop offset="1" stop-color="#FFC65C"/></linearGradient></defs>`;
    return `<svg class="radar" viewBox="40 10 320 320" role="img" aria-label="Biểu đồ kỹ năng: ${esc(sk.map(k => `${k.name} ${k.level}/10`).join(", "))}">${defs}${s}</svg>`;
  };
  pages.profile = () => {
    document.title = `Hồ sơ — ${P.name}`;
    completeObj("profile");
    const sk = P.skills.slice(0, 8), avg = sk.length ? sk.reduce((a,k) => a + +k.level, 0)/sk.length : 0;
    const rar = i => i < 2 ? ["r1","Huyền thoại","★★★"] : i < 4 ? ["r2","Sử thi","★★"] : ["r3","Hiếm","★"];
    main.innerHTML = `${pageHead("Profile", "Hồ sơ nhân vật", "Thẻ định danh, chỉ số kỹ năng và túi đồ công cụ mình dùng hằng ngày.")}
      <section class="wrap char">
        <article class="panel idcard brk" data-reveal>${bk}
          <div class="id-top">Thẻ định danh<span>${esc(ID)}</span></div>
          <div class="holo">
            <svg class="r1" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F9A"/><stop offset="1" stop-color="#FFC65C"/></linearGradient></defs><circle cx="100" cy="100" r="96" fill="none" stroke="url(#hg1)" stroke-opacity=".75" stroke-dasharray="2 6"/><path d="M100 1 104 9h-8zM100 199l4-8h-8z" fill="#FFC65C"/></svg>
            <svg class="r2" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="hg2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8B6CFF"/><stop offset="1" stop-color="#FF4F9A"/></linearGradient></defs><circle cx="100" cy="100" r="84" fill="none" stroke="url(#hg2)" stroke-opacity=".8" stroke-width="2" stroke-dasharray="40 14 6 14"/></svg>
            <div class="holo-pic" id="idPic"></div>
            <span class="holo-lbl" style="left:12px;top:12px">SCAN // OK</span>
            <span class="holo-lbl" style="right:12px;bottom:12px;text-align:right">BIO-ID<br>${esc(ID)}</span>
          </div>
          <div class="id-body">
            <h2>${esc(P.name)}</h2>
            <div class="role">> ${esc(P.role)}</div>
            <dl>
              <div><dt>Lớp</dt><dd>${esc(P.className)}</dd></div>
              <div><dt>Cấp độ</dt><dd>LV ${esc(P.level)}</dd></div>
              <div><dt>Dự án</dt><dd>${games.length} game</dd></div>
              <div><dt>Trạng thái</dt><dd class="ok">${esc(P.status || "Trực tuyến")}</dd></div>
            </dl>
            <div class="xpbar"><div><span>Chỉ số trung bình</span><span>${avg.toFixed(1)}/10</span></div><i style="--v:${avg*10}%"></i></div>
            ${P.cvFile ? `<a class="btn btn-p" href="${esc(P.cvFile)}" download>Tải CV (PDF)</a>` : ""}
          </div>
        </article>
        <div class="cmain">
          <div class="panel" data-reveal style="--d:.05s"><p class="ptag">Tiểu sử</p><p class="about">${esc(P.about)}</p></div>
          <div class="panel" data-reveal style="--d:.1s">
            <p class="ptag">Chỉ số kỹ năng</p>
            <div class="sk">${radarSVG(sk)}
              <div class="mods">${sk.map((k,i) => `
                <div><div class="mod-top"><span><i>${pad(i+1)}</i>${esc(k.name)}</span><b>${clamp(+k.level,0,10)}/10</b></div>
                <div class="mod-bar" style="--d:${.2 + i*.1}s">${Array.from({length:10}, (_,j) => `<i class="${j < k.level ? "on" : ""}${j >= 7 && j < k.level ? " hi" : ""}" style="--k:${j}"></i>`).join("")}</div></div>`).join("")}
              </div>
            </div>
          </div>
          <div class="panel" data-reveal style="--d:.15s">
            <p class="ptag">Túi đồ <span>// ${P.tools.length} vật phẩm</span></p>
            <div class="inv" id="inv">${P.tools.map((t,i) => { const [c,lab,st] = rar(i); return `<div class="item ${c}" tabindex="0" data-n="${esc(t)}" data-r="${lab}" data-k="${i+1}"><span class="stars">${st}</span><i>${esc(t.replace(/[^A-Za-zÀ-ỹ0-9]/g,"").slice(0,2).toUpperCase())}</i><span>${esc(t)}</span></div>`; }).join("")}</div>
            <div class="legend"><span style="--rc:var(--gold)">Huyền thoại · dùng chính</span><span style="--rc:var(--violet-2)">Sử thi · thường dùng</span><span style="--rc:var(--blue)">Hiếm · hỗ trợ</span></div>
          </div>
        </div>
      </section>`;
    portrait($("idPic"), 420);
    const tip = $("tip");
    const showTip = (el, x, y) => { tip.innerHTML = `<em>${esc(el.dataset.r)}</em><b>${esc(el.dataset.n)}</b>Vật phẩm #${pad(el.dataset.k)} trong túi đồ`; tip.classList.add("show"); tip.style.left = Math.min(x + 16, innerWidth - 240) + "px"; tip.style.top = (y + 18) + "px"; };
    $("inv").addEventListener("pointermove", e => { const it = e.target.closest(".item"); if (it) showTip(it, e.clientX, e.clientY); else tip.classList.remove("show"); });
    $("inv").addEventListener("pointerleave", () => tip.classList.remove("show"));
    $("inv").addEventListener("focusin", e => { const it = e.target.closest(".item"); if (it){ const r = it.getBoundingClientRect(); showTip(it, r.left, r.bottom - 10); } });
    $("inv").addEventListener("focusout", () => tip.classList.remove("show"));
  };

  /* =========================================================
     NHẬT KÝ NHIỆM VỤ
     ========================================================= */
  pages.journey = () => {
    document.title = `Nhật ký nhiệm vụ — ${P.name}`;
    const Q = P.quests.map((q,i) => {
      const ys = String(q.time).match(/\d{4}/g) || [], a = +ys[0] || YEAR, b = ys[1] ? +ys[1] : (/nay|now|hiện/i.test(q.time) ? YEAR : a);
      return { ...q, i, dur: Math.max(1, b - a), xp: Math.max(1, b - a)*500 };
    });
    let f = "all", sel = 0;
    main.innerHTML = `${pageHead("Journey", "Nhật ký nhiệm vụ", "Kinh nghiệm làm việc và học vấn, xếp như các nhiệm vụ đã nhận. Chọn một nhiệm vụ để xem chi tiết.", `<kbd>↑</kbd><kbd>↓</kbd> chọn nhiệm vụ`)}
      <section class="wrap qlog">
        <div data-reveal>
          <div class="qtabs" id="qtabs" role="tablist"><button class="on" data-f="all" role="tab" aria-selected="true">Tất cả</button><button data-f="run" role="tab" aria-selected="false">Đang làm</button><button data-f="fin" role="tab" aria-selected="false">Hoàn thành</button></div>
          <ul class="qlist" id="qlist"></ul>
        </div>
        <div class="panel qd brk" id="qd" data-reveal style="--d:.1s" aria-live="polite">${bk}<div id="qdIn"></div></div>
      </section>`;
    const list = () => Q.filter(q => f === "all" || (f === "fin") === !!q.done);
    const render = (snd = false) => {
      const L = list(); if (L.length && !L.some(q => q.i === sel)) sel = L[0].i;
      $("qlist").innerHTML = L.length ? L.map(q => `<li><button class="qitem ${q.i === sel ? "sel" : ""}" data-i="${q.i}"><span class="ic ${q.done ? "fin" : "run"}"></span><span><b>${esc(q.title)}</b><small>${esc(q.time)}</small></span><span class="xp">+${q.xp} XP</span></button></li>`).join("") : `<li style="color:var(--muted);padding:14px;font-family:var(--mono);font-size:13px">Không có nhiệm vụ nào ở mục này.</li>`;
      const q = Q[sel]; if (!q) return;
      $("qdIn").innerHTML = `<div class="swap">
        <span class="qd-st ${q.done ? "fin" : "run"}">${q.done ? "✓ Đã hoàn thành" : "◆ Đang thực hiện"}</span>
        <h2>${esc(q.title)}</h2>
        <div class="qd-place">@ ${esc(q.place)}</div>
        <dl class="qd-grid"><div><dt>Thời gian</dt><dd>${esc(q.time)}</dd></div><div><dt>Phần thưởng</dt><dd>+${q.xp} XP</dd></div></dl>
        ${q.desc ? `<div class="qd-sec"><h3>Mô tả nhiệm vụ</h3><p>${esc(q.desc)}</p></div>` : ""}
        <div class="prog"><div><span>Tiến độ</span><span>${q.done ? "100%" : "Đang chạy"}</span></div><i class="${q.done ? "" : "run"}" style="--v:${q.done ? 100 : 62}%"></i></div>
      </div>`;
      if (snd) Snd.click();
    };
    const pick = i => { sel = i; render(true); completeObj("quest"); };
    $("qlist").addEventListener("click", e => { const b = e.target.closest(".qitem"); if (b){ pick(+b.dataset.i); if (innerWidth < 900) $("qd").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"nearest" }); } });
    $("qtabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; f = b.dataset.f;
      [...$("qtabs").children].forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); render(true); });
    pageKeys = (e, k) => { if (k !== "ArrowDown" && k !== "ArrowUp") return; e.preventDefault(); const L = list(); if (!L.length) return; const p = L.findIndex(q => q.i === sel); pick(L[(p + (k === "ArrowDown" ? 1 : -1) + L.length) % L.length].i); };
    render();
  };

  /* =========================================================
     KÊNH LIÊN LẠC — hội thoại NPC + terminal
     ========================================================= */
  pages.contact = () => {
    document.title = `Liên hệ — ${P.name}`;
    const key = c => c.label.toLowerCase().replace(/[^a-z0-9]/g, "");
    const N = P.contacts.length;
    main.innerHTML = `${pageHead("Contact", "Kênh liên lạc", "Nói chuyện với NPC để chọn cách liên hệ, hoặc mở terminal bảo mật để gõ lệnh.", `<kbd>1</kbd>–<kbd>${N + 2}</kbd> chọn lựa chọn trong hội thoại`)}
      <section class="wrap">
        <div class="panel dialog brk" id="dialog" data-reveal>${bk}
          <div class="npc"><div class="npc-av" id="npcAv"></div><div><span class="npc-name">${esc(P.name)}</span><div class="wave" aria-hidden="true">${Array.from({length:9}, (_,k) => `<i style="--k:${k}"></i>`).join("")}</div></div></div>
          <div>
            <p class="say" id="say"></p>
            <ol class="choices" id="choices">
              ${P.contacts.map((c,i) => `<li style="--d:${i*.07}s"><a href="${esc(c.url)}" ${c.url.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener"'} data-ch><kbd>${i+1}</kbd><b>${esc(c.label)}</b><span>${esc(c.value)}</span></a></li>`).join("")}
              <li style="--d:${N*.07}s"><button type="button" id="openTerm"><kbd>${N+1}</kbd><b>Mở terminal bảo mật</b><span>Dành cho dân kỹ thuật</span></button></li>
              ${P.cvFile ? `<li style="--d:${(N+1)*.07}s"><a href="${esc(P.cvFile)}" download><kbd>${N+2}</kbd><b>Tải CV</b><span>File PDF</span></a></li>` : ""}
            </ol>
          </div>
        </div>
        <div class="panel term brk" id="term" hidden>${bk}
          <div class="term-bar"><i></i><i></i><i></i><span>khach@neural-link: ~/lien-he</span></div>
          <div class="term-out" id="tout" aria-live="polite"></div>
          <form class="term-in" id="tform" autocomplete="off"><label for="tin">khach@net:~$</label><input id="tin" spellcheck="false" aria-label="Nhập lệnh"></form>
          <div class="cmds" id="tcmds">${["help","whoami", ...P.contacts.map(key), "games", P.cvFile ? "cv" : null, "clear"].filter(Boolean).map(c => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        </div>
      </section>`;
    portrait($("npcAv"), 200);
    $("choices").addEventListener("click", e => { if (e.target.closest("[data-ch]")){ Snd.click(); unlock("link"); } });

    // hội thoại gõ chữ
    const line = `Chào người lữ khách! Bạn đang tìm đồng đội làm game, muốn hợp tác, hay chỉ muốn tán gẫu về game? Chọn một kênh bên dưới để liên lạc với mình nhé.`;
    let typed = false;
    const typeLine = () => {
      if (typed) return; typed = true; const el = $("say"), d = $("dialog");
      const end = () => { el.textContent = line; el.classList.add("done"); d.classList.remove("talking"); $("choices").classList.add("show"); completeObj("talk"); };
      if (reduce) return end();
      d.classList.add("talking"); let i = 0;
      const step = () => { i += 2; el.textContent = line.slice(0, i); if (i % 6 === 0) Snd.type(); if (i < line.length) setTimeout(step, 26); else end(); };
      step();
      d.addEventListener("click", function skip(){ if (!el.classList.contains("done")){ i = line.length; } d.removeEventListener("click", skip); });
    };
    $("dialog")._onIn = typeLine;

    // terminal
    const out = $("tout"), input = $("tin");
    const print = (html, cls = "") => { const p = document.createElement("p"); if (cls) p.className = cls; p.innerHTML = html; out.append(p); out.scrollTop = out.scrollHeight; };
    const open = c => { print(`Đang mở ${esc(c.label)}: <a href="${esc(c.url)}" ${c.url.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener"'}>${esc(c.value)}</a>`, "w"); unlock("link"); window.open(c.url, c.url.startsWith("mailto:") ? "_self" : "_blank", "noopener"); };
    const CMD = {
      help: () => { print("Các lệnh có sẵn:", "c"); print([["whoami","thông tin về mình"], ...P.contacts.map(c => [key(c), `mở ${c.label}`]), ["games","danh sách game"], ["game <số>","mở chi tiết game"], P.cvFile ? ["cv","tải CV"] : null, ["clear","xóa màn hình"]].filter(Boolean).map(([a,b]) => `  ${a.padEnd(11)} ${b}`).join("\n")); },
      whoami: () => { print(`${esc(P.name)} // ${esc(P.role)}`, "w"); print(`${esc(P.className)} · LV ${P.level} · ${games.length} dự án`); print(esc(P.tagline), "d"); },
      games: () => { games.forEach((g,i) => print(`  [${pad(i+1)}] ${esc(g.title.padEnd(22))} <span class="${isDev(g) ? "w" : "c"}">${stText(g)}</span>`)); print("Gõ: game 1, game 2… để mở chi tiết.", "d"); },
      cv: () => { if (!P.cvFile) return print("Chưa có file CV.", "e"); print("Đang tải CV…", "w"); const a = document.createElement("a"); a.href = P.cvFile; a.download = ""; document.body.append(a); a.click(); a.remove(); },
      clear: () => { out.innerHTML = ""; },
      sudo: () => print("Quyền bị từ chối. Nhưng bạn có thể tuyển mình — gõ 'hire'.", "e"),
      hire: () => { print("Tuyệt vời! Đang mở kênh liên lạc chính…", "w"); if (P.contacts[0]) open(P.contacts[0]); }
    };
    P.contacts.forEach(c => { CMD[key(c)] = () => open(c); });
    if (CMD.itchio) CMD.itch = CMD.itchio;
    const run = raw => {
      const l = raw.trim(); if (!l) return;
      print(`<span class="c">khach@net:~$</span> ${esc(l)}`);
      const [c, arg] = l.toLowerCase().split(/\s+/);
      if (c === "game" && arg){ const i = parseInt(arg, 10) - 1; if (games[i]){ print(`Mở ${esc(games[i].title)}…`, "w"); go(`game.html?id=${i}`); } else print("Không có game số đó.", "e"); }
      else if (CMD[c]) CMD[c]();
      else print(`Không tìm thấy lệnh: ${esc(c)}. Gõ <span class="c">help</span> để xem danh sách.`, "e");
      Snd.click(); completeObj("cmd"); unlock("hacker");
    };
    $("tform").addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
    $("tcmds").addEventListener("click", e => { const b = e.target.closest("button"); if (b){ run(b.dataset.c); input.focus({ preventScroll:true }); } });
    out.addEventListener("click", () => input.focus({ preventScroll:true }));
    let termOpen = false;
    const openTerm = () => {
      const t = $("term"); Snd.swap();
      if (!termOpen){ termOpen = true; t.hidden = false;
        [["NEURAL-LINK // kênh liên lạc bảo mật đã mở.","c"],[`Xin chào! Đây là terminal liên hệ của ${esc(P.name)}.`,""],['Gõ <span class="c">help</span> để xem lệnh, hoặc bấm các nút bên dưới.',"d"]].forEach(([s,c],i) => setTimeout(() => print(s, c), reduce ? 0 : 150 + i*300)); }
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"center" }); setTimeout(() => input.focus({ preventScroll:true }), 500);
    };
    $("openTerm").addEventListener("click", openTerm);
    const items = [...$("choices").querySelectorAll("a,button")];
    // trên trang này, phím số chọn lựa chọn trong hội thoại thay vì chuyển trang
    CHOICE_KEYS = n => { if (!$("choices").classList.contains("show") || !items[n-1]) return false; items[n-1].click(); return true; };
  };

  /* ---------- 404 ---------- */
  pages["404"] = () => {
    document.title = `Mất tín hiệu — ${P.name}`;
    main.innerHTML = `<section class="lost"><div>
      <div class="crumb" style="justify-content:center">Lỗi // 404</div>
      <h1 class="glitch" data-text="404">404</h1>
      <p>TÍN HIỆU BỊ MẤT — trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <a class="btn btn-p" href="index.html">Về trung tâm</a>
    </div></section>`;
  };

  /* =========================================================
     KHỞI ĐỘNG (lần đầu mỗi phiên)
     ========================================================= */
  let start = () => {};
  let CHOICE_KEYS = null;
  function boot(done){
    if (reduce || ss.get("booted")){ done(); return; }
    ss.set("booted","1");
    document.body.insertAdjacentHTML("beforeend", `<div class="boot" id="boot" role="dialog" aria-label="Khởi động"><div class="boot-in"><div class="boot-logo">${esc(initials(P.name))}</div><pre id="bootLog"></pre><div class="boot-bar"><i id="bootBar"></i></div><button class="btn btn-p boot-btn" id="bootBtn">[ Nhấn để kết nối ]</button></div></div>`);
    const lines = [
      [`NEURAL-LINK OS v${YEAR}.${P.level} // khởi động`, ""],
      ["Thiết lập kết nối mạng lưới", "OK"],
      [`Giải mã hồ sơ: ${P.name.toUpperCase()}`, "OK"],
      [`Nạp ${games.length} dự án game`, "OK"],
      [`Đồng bộ ${P.skills.length} kỹ năng, ${P.tools.length} vật phẩm`, "OK"],
      ["Truy cập được cấp phép.", "*"]
    ];
    const log = $("bootLog"); let li = 0;
    const next = () => {
      $("bootBar").style.width = (li/lines.length*100) + "%";
      if (li >= lines.length){ $("bootBtn").classList.add("show"); $("bootBtn").focus({ preventScroll:true }); return; }
      const [t, s] = lines[li++], row = document.createElement("div"); log.append(row);
      const full = `> ${t}`; let i = 0;
      const ty = () => { i += 2; row.textContent = full.slice(0, i); if (i < full.length) setTimeout(ty, 12); else {
        if (s === "OK") row.innerHTML = `${esc(full)} ${innerWidth < 640 ? "" : ".".repeat(Math.max(3, 46 - full.length))} <span class="ok">[OK]</span>`;
        else if (s === "*") row.innerHTML = `<span class="hi">${esc(full)}</span>`;
        setTimeout(next, 110); } };
      ty();
    };
    setTimeout(next, 250);
    const finish = () => {
      const b = $("boot"); if (!b || b.classList.contains("out")) return;
      setSound(ls.get("sound") !== "0"); Snd.ensure(); setTimeout(() => Snd.boot(), 30);
      b.classList.add("out"); setTimeout(() => b.remove(), 600); done(); setTimeout(() => unlock("boot"), 900);
    };
    $("bootBtn").addEventListener("click", finish);
    $("boot").addEventListener("pointerdown", e => { if ($("bootBtn").classList.contains("show") && e.target !== $("bootBtn")) finish(); });
    addEventListener("keydown", function k(e){ const bb = $("bootBtn"); if (bb && bb.classList.contains("show")){ e.preventDefault(); removeEventListener("keydown", k); finish(); } });
  }

  /* =========================================================
     HIỆU ỨNG CHUNG CHO MỌI TRANG
     ========================================================= */
  function fx(){
    // thanh tiến độ cuộn ngay dưới HUD
    const sp = $("sprog"); let spQ = false;
    const upd = () => { spQ = false; const h = document.documentElement.scrollHeight - innerHeight; sp.style.transform = `scaleX(${h > 0 ? clamp(scrollY/h, 0, 1) : 0})`; };
    addEventListener("scroll", () => { if (!spQ){ spQ = true; requestAnimationFrame(upd); } }, { passive:true }); upd();
    if (reduce) return;

    // tiêu đề trang tự giải mã khi vào trang
    document.querySelectorAll(".phead h1, .gbanner h1").forEach(h => {
      const t = h.textContent; setTimeout(() => scramble(h, t, 900), document.body.classList.contains("arrive") ? 380 : 120);
      h.addEventListener("pointerenter", () => scramble(h, t, 520));
    });
    // tiêu đề mục giải mã khi cuộn tới
    document.querySelectorAll(".sec-h[data-reveal]").forEach(s => { const h = s.querySelector("h2"); if (h){ const t = h.textContent; s._onIn = () => scramble(h, t, 700); } });

    // phần tử con hiện lần lượt khi khối cha xuất hiện
    const pn = document.querySelector(".pn"); if (pn) pn.setAttribute("data-reveal", "");
    [".patch li", ".feats li", ".spec dl > div", ".id-body dl > div", ".mods > div", ".inv .item", ".slots .slot", ".legend span", ".pn a", ".gbanner .row > *", ".gbanner .actions > *"].forEach(sel => {
      const els = [...document.querySelectorAll(sel)]; els.forEach((el,i) => { el.classList.add("stg"); el.style.setProperty("--i", i); });
    });
    document.querySelectorAll(".gbanner .stg").forEach(el => el.classList.add("now"));

    if (!finePointer) return;
    // đèn rọi theo chuột trên các khung + nghiêng 3D cho thẻ lớn
    const SPOT = "main .panel, .slot, .pn a, .feats li", TILT = ".feature, .idcard, .pn a";
    let tilted = null;
    const untilt = () => { if (!tilted) return; tilted.style.transition = "transform .6s var(--ease)"; tilted.style.transform = ""; tilted = null; };
    document.addEventListener("pointermove", e => {
      const s = e.target.closest(SPOT);
      if (s){ const r = s.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px"); }
      const t = e.target.closest(TILT), rv = t && t.closest("[data-reveal]");
      if (t !== tilted) untilt();
      if (t && (!rv || rv.classList.contains("in"))){
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
        t.style.transition = "transform .12s ease-out"; t.style.transform = `perspective(1000px) rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateZ(0)`; tilted = t;
      }
    }, { passive:true });
    document.addEventListener("pointerleave", untilt);

    // nút "nam châm" hút nhẹ theo con trỏ
    const mags = [...document.querySelectorAll(".btn, .more")].map(el => ({ el, x:0, y:0, tx:0, ty:0 }));
    addEventListener("pointermove", e => mags.forEach(m => {
      const r = m.el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2, dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width/2 + 40 && Math.abs(dy) < r.height/2 + 30;
      m.tx = near ? dx*.22 : 0; m.ty = near ? dy*.32 : 0;
    }), { passive:true });
    frameHooks.push(() => mags.forEach(m => { m.x += (m.tx - m.x)*.18; m.y += (m.ty - m.y)*.18; if (Math.abs(m.x) + Math.abs(m.y) > .05 || m.tx || m.ty) m.el.style.translate = `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`; }));
  }

  (pages[PAGE] || pages.home)();
  fx();
  reveal();
  boot(() => start());
})();
