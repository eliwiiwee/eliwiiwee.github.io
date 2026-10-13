/* Eli's World — Step Trek v2 (client feedback 2026-10-13):
   open → GPS pop-up (location permission, status yellow → green) → ONE start button, no 3-2-1 →
   recorder with only distance (biggest) · time · average speed → one yellow pause button →
   paused: continue (yellow) / finish (brand blue) → a post composer like Instagram / Facebook
   (photo + brand watermark + style, caption, visibility) → save → ELi celebrates like a level-up →
   share / save the picture to the phone. Every full km: a chime + a spoken summary.
   ELi = the original art only, moved by code. */
const T2 = {
  ic: {
    pin: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.4 0-1.8l-10-6.4C8.9 4.3 8 4.8 8 5.6z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.6" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.6" fill="currentColor"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 3a1 1 0 0 0-1 1v17a1 1 0 0 0 2 0v-6.2c2.6-1.1 4.6.9 7.3.9 1.5 0 2.7-.4 3.7-1V4.6c-1 .6-2.2 1-3.7 1C11.6 5.6 9.6 3.6 7 4.7V4a1 1 0 0 0-1-1z"/></svg>',
    photo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 5h3l1.5-2h5L16 5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm7 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.6 7.3 7.3l1.4 1.4L11 6.4V15h2V6.4l2.3 2.3 1.4-1.4zM5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h-2v8H7v-8z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 3h2v9.6l3.3-3.3 1.4 1.4L12 16.4l-5.7-5.7 1.4-1.4 3.3 3.3zM5 19h14v2H5z"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.4-6A8 8 0 0 1 18.9 11zM12 4.1c.9 1.2 1.7 3.6 1.9 6.9h-3.8c.2-3.3 1-5.7 1.9-6.9zM9.5 5a15 15 0 0 0-1.4 6h-3A8 8 0 0 1 9.5 5zm-4.4 8h3a15 15 0 0 0 1.4 6 8 8 0 0 1-4.4-6zm6.9 6.9c-.9-1.2-1.7-3.6-1.9-6.9h3.8c-.2 3.3-1 5.7-1.9 6.9zm2.5-.9a15 15 0 0 0 1.4-6h3a8 8 0 0 1-4.4 6z"/></svg>',
    ppl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 19c0-3 3.1-5 7-5s7 2 7 5v1H2zm15.5 1v-1c0-1.7-.7-3.2-1.9-4.3 3.2.2 6.4 1.7 6.4 4.3v1z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
  },
  speed: (m, s) => s > 0 ? (m / 1000) / (s / 3600) : 0,               // km/h
  say(text) {   // spoken summary (Thai voice if the device has one), falls back silently
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'th-TH'; u.rate = 1.02;
      const v = speechSynthesis.getVoices().find(v => /th/i.test(v.lang)); if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  },
  thTime: s => { const m = Math.floor(s / 60), x = Math.round(s % 60); return `${m ? m + ' นาที ' : ''}${x} วินาที`; },
};

LIFE.trek = pg => {
  pg.classList.add('w-trek', 't2');
  Object.assign(RUN, { state: 'idle', sec: 0, m: 0, next: 1000, hr: 0, hrN: 0, laps: [], sport: RUN.sport || 'วิ่ง' });
  const H = appH, mh = Math.max(190, Math.min(250, H - 586)), stTop = H - 297;
  pg.innerHTML = `
    <i class="wlogo tk-logo"></i><i class="tk-dv"></i>${wi('k_mount', 'tk-mt')}<b class="tk-ttl">Step Trek</b>
    <button class="tk-gps wait press" id="tkGps">${wi('k_pin')}<span>หา GPS…</span></button>
    <button class="tk-sport press" id="tkSport">${wi('k_run')}<span>${RUN.sport}</span><i></i></button>
    <div class="tk-map rise" style="height:${mh}px;width:${Math.round(mh * .96)}px"><div class="mi"><img src="assets/k_map.webp" alt="">
      <svg viewBox="0 0 492 512" preserveAspectRatio="xMidYMid slice"><path class="run" id="tkRun" d="${TK_PATH}"/></svg><i class="tk-me" id="tkMe"></i></div></div>
    <div class="tk-st rise" style="top:${Math.max(101 + mh + 12, stTop - 92)}px;--d:.06s"><span>ก้าววันนี้</span><b id="tkSteps">${fmt(G.today.steps)}</b></div>
    <button class="t2-go press" id="t2Go" style="top:${stTop + 18}px"><i class="b">${T2.ic.play}</i><span>เริ่ม</span></button>`;
  const mi = $('.tk-map .mi', pg), runP = $('#tkRun', pg), me = $('#tkMe', pg), L = runP.getTotalLength();
  runP.style.strokeDasharray = L; runP.style.strokeDashoffset = L;
  const toPx = p => { const w = mi.clientWidth, h = mi.clientHeight, k = Math.max(w / 492, h / 512); return [p.x * k + (w - 492 * k) / 2, p.y * k + (h - 512 * k) / 2]; };
  const putMe = f => { const [x, y] = toPx(runP.getPointAtLength(L * f)); me.style.left = x + 'px'; me.style.top = y + 'px'; };
  later(30, () => putMe(0));
  // ELi warms up beside the map
  const ex = 286, ey = Math.min(H - 290, 101 + mh + 95);
  pg.insertAdjacentHTML('beforeend', `<i class="tk-glow" style="left:${ex}px;top:${ey}px"></i>`);
  const eli = new Eli(pg, { size: 132, x: ex, y: ey });
  eli.pose('ready5'); eli.setFace(-1);
  every(3800, async () => { if (RUN.state !== 'idle' || cur !== 'trek' || $('.t2-gpsov', pg)) return; eli.pose('ready2'); await eli.stretch(760); eli.pose('ready5'); });
  $('#tkSport', pg).onclick = () => openSheet(`<h4>เลือกกิจกรรม</h4>${['วิ่ง', 'เดิน', 'วิ่งเทรล', 'วิ่งบนลู่'].map(n => `<button class="opt ${n === RUN.sport ? 'on' : ''}" data-n="${n}">${n}<i class="ck"></i></button>`).join('')}`, sh => {
    $$('.opt', sh).forEach(o => o.onclick = () => { RUN.sport = o.dataset.n; $('#tkSport span', pg).textContent = RUN.sport; setTimeout(closeSheet, 200); });
  });

  /* ── GPS pop-up: permission → searching (yellow) → ready (green) → start ── */
  const gpsChip = st => { const g = $('#tkGps', pg); g.classList.toggle('wait', st !== 'ok'); $('span', g).textContent = st === 'ok' ? 'GPS พร้อม' : 'หา GPS…'; };
  const gpsPop = () => {
    if ($('.t2-gpsov', pg)) return;
    const ov = document.createElement('div'); ov.className = 't2-gpsov';
    ov.innerHTML = `<div class="t2-gps">
      <div class="rad"><i></i><i></i><i></i><b>${T2.ic.pin}</b></div>
      <b class="h">เชื่อมต่อ GPS</b>
      <div class="st" id="t2St"><i class="dot"></i><span></span></div>
      <p class="note" id="t2Note"></p>
      <button class="t2-allow press" id="t2Allow">${T2.ic.pin}อนุญาตให้เข้าถึงตำแหน่ง</button>
      <button class="t2-start press" id="t2Start" disabled><i class="b">${T2.ic.play}</i><span>เริ่ม</span></button>
      <button class="t2-later" id="t2Later">ไว้ทีหลัง</button></div>`;
    pg.append(ov); later(20, () => ov.classList.add('on'));
    const set = (st, txt, note = '') => {
      ov.dataset.st = st; $('#t2St span', ov).textContent = txt; $('#t2Note', ov).textContent = note;
      $('#t2Start', ov).disabled = st !== 'ok'; gpsChip(st);
      if (st === 'ok') { SFX.chime(); buzz(15); }
    };
    const search = () => {
      set('search', 'กำลังค้นหาสัญญาณ GPS…', 'ยืนในที่โล่งจะเจอสัญญาณเร็วขึ้น');
      let done = false;
      const ok = acc => { if (done) return; done = true; G.gpsOk = true; saveG(); later(900, () => cur === 'trek' && set('ok', 'GPS พร้อมแล้ว', `ความแม่นยำ ±${acc} ม. · กดเริ่มได้เลย`)); };
      try {
        navigator.geolocation.getCurrentPosition(p => ok(Math.max(3, Math.round(p.coords.accuracy))), () => ok(5), { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 });
      } catch (e) { ok(5); }
      later(4500, () => ok(5));   // prototype: never get stuck on a laptop without GPS
    };
    if (G.gpsOk) search();
    else set('perm', 'ขอสิทธิ์เข้าถึงตำแหน่ง', 'ใช้ตำแหน่งเพื่อบันทึกเส้นทางและระยะทางของคุณ');
    $('#t2Allow', ov).onclick = () => { SFX.pop(); search(); };
    $('#t2Later', ov).onclick = () => { ov.classList.remove('on'); later(300, () => ov.remove()); };
    $('#t2Start', ov).onclick = () => { if (ov.dataset.st !== 'ok') return; ov.classList.remove('on'); later(250, () => ov.remove()); startRun(); };
  };
  $('#t2Go', pg).onclick = () => { SFX.pop(); gpsPop(); };
  $('#tkGps', pg).onclick = gpsPop;
  later(350, gpsPop);   // opening Step Trek goes straight to the GPS pop-up

  /* ── recorder: distance · time · average speed, one pause button ── */
  let rec, dust;
  const startRun = () => {
    SFX.levelup(); buzz([20, 30, 20]);
    $('#tabbar').classList.add('hide');
    rec = document.createElement('div'); rec.className = 't2-rec';
    rec.innerHTML = `
      <div class="t2-top"><i class="dot"></i><span>กำลังบันทึก · ${RUN.sport}</span><b id="t2Gps">${T2.ic.pin}GPS</b></div>
      <div class="t2-km"><b id="t2D">0.00</b><span>กิโลเมตร</span></div>
      <div class="t2-two"><div><b id="t2T">0:00</b><span>เวลา</span></div><i></i><div><b id="t2V">0.0</b><span>ความเร็วเฉลี่ย (กม./ชม.)</span></div></div>
      <div class="t2-lane"><i class="ln"></i></div>
      <div class="t2-btns">
        <button class="t2-pause press" id="t2Pause"><i class="b">${T2.ic.pause}</i><span>หยุดชั่วคราว</span></button>
        <button class="t2-res press" id="t2Res"><i class="b">${T2.ic.play}</i><span>ดำเนินการต่อ</span></button>
        <button class="t2-fin press" id="t2Fin"><i class="b">${T2.ic.flag}</i><span>เสร็จสิ้น</span></button>
      </div>
      <div class="t2-kmtoast" id="t2Lap"></div>`;
    pg.append(rec); later(20, () => rec.classList.add('on'));
    const ly = Math.round(appH * .64);
    const re = new Eli(rec, { size: 118, x: 195, y: ly }); re.setFace(1); re.loop(RUNF, 13);
    clearInterval(dust); dust = setInterval(() => RUN.state === 'running' && puff(rec, re.x - 30, re.y - 3, 1), 320);
    cleanup.push(() => clearInterval(dust));
    RUN.state = 'running'; RUN.eli = re;
    $('#t2Pause', rec).onclick = () => {
      RUN.state = 'paused'; rec.classList.add('paused'); re.stop().pose('ready4'); SFX.tone(440, .18, 'triangle', .05); buzz(15);
    };
    $('#t2Res', rec).onclick = () => { RUN.state = 'running'; rec.classList.remove('paused'); re.loop(RUNF, 13); SFX.tone(660, .18, 'triangle', .05); buzz(15); };
    $('#t2Fin', rec).onclick = () => { RUN.state = 'done'; clearInterval(dust); SFX.levelup(); $('#tabbar').classList.remove('hide'); go('trekdone', { dir: 'up' }); };
  };
  const lap = () => {
    const km = RUN.next / 1000, spd = T2.speed(RUN.m, RUN.sec), hr = RUN.hrN ? Math.round(RUN.hr / RUN.hrN) : 0;
    RUN.laps.push({ km, sec: RUN.sec });
    const t = $('#t2Lap', rec);
    t.innerHTML = `<b>ครบ ${km} กม.!</b><span>${clock(RUN.sec)} · ${spd.toFixed(1)} กม./ชม. · ♥ ${hr}</span>`;
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    [0, .14, .28].forEach((d, i) => SFX.tone([784, 988, 1318][i], .22, 'sine', .05, d)); buzz([30, 40, 30]);
    burst(rec, 195, appH * .64 - 90, { n: 14, dist: 70, size: 6, colors: ['#F6C343', '#F28C28', '#2A3B9C', '#fff'], shape: 'star' });
    RUN.eli && (RUN.eli.pose('cheer1'), RUN.eli.jump(40, 460).then(() => RUN.state === 'running' && RUN.eli.loop(RUNF, 13)));
    later(500, () => T2.say(`ระยะทาง ${km} กิโลเมตร. เวลา ${T2.thTime(RUN.sec)}. ความเร็วเฉลี่ย ${spd.toFixed(1)} กิโลเมตรต่อชั่วโมง. อัตราการเต้นของหัวใจเฉลี่ย ${hr} ครั้งต่อนาที`));
    RUN.next += 1000;
  };
  every(500, () => {
    if (RUN.state !== 'running' || !rec) return;
    RUN.sec += 6; RUN.m += 6 * (1000 / 355) * (.94 + Math.random() * .12);   // prototype: a sped-up run (≈1 km every 30 s)
    const hr = 138 + Math.round(Math.sin(RUN.sec / 40) * 9 + Math.random() * 4); RUN.hr += hr; RUN.hrN++;
    $('#t2D', rec).textContent = (RUN.m / 1000).toFixed(2);
    $('#t2T', rec).textContent = clock(RUN.sec);
    $('#t2V', rec).textContent = T2.speed(RUN.m, RUN.sec).toFixed(1);
    const f = (RUN.m / 1600) % 1; runP.style.strokeDashoffset = L * (1 - Math.min(1, RUN.m / 1600)); putMe(f);
    $('#tkSteps', pg).textContent = fmt(G.today.steps + Math.round(RUN.m * 1.3));
    if (RUN.m >= RUN.next) lap();
  });
};

/* ═════════ After the run: the post composer (like Instagram / Facebook) ═════════ */
LIFE.trekdone = pg => {
  pg.classList.add('t2-post');
  const real = RUN.m > 50, km = real ? RUN.m / 1000 : 2.07, sec = real ? RUN.sec : 760, spd = T2.speed(km * 1000, sec);   // opened straight from a link → sample numbers
  const hr = RUN.hrN ? Math.round(RUN.hr / RUN.hrN) : 142, steps = Math.round(km * 1283), lp = Math.max(12, Math.round(km * 14.3));
  const P = { photo: null, style: 'sticker', vis: 'pub' };
  pg.innerHTML = `
    <div class="pp-bar"><button class="pp-x" id="ppX" aria-label="ปิด">✕</button><b>โพสต์กิจกรรม</b><button class="pp-ok" id="ppSave2">บันทึก</button></div>
    <div class="pp-scroll">
      <div class="pp-me"><img src="${G.citizen.photo || 'assets/w_avatar.webp'}" alt=""><div><b>${G.citizen.name}</b><span>${RUN.sport} · วันนี้</span></div></div>
      <div class="pp-pic"><canvas id="ppCv" width="1080" height="1350"></canvas>
        <label class="pp-pick press">${T2.ic.photo}<span>เลือกรูปภาพ</span><input type="file" accept="image/*" id="ppFile" hidden></label></div>
      <div class="pp-styles" id="ppStyles">
        <button data-s="sticker" class="on">สติกเกอร์</button><button data-s="classic">คลาสสิก</button><button data-s="minimal">มินิมอล</button><button data-s="gold">ทอง</button></div>
      <div class="pp-stats">
        <div class="big"><b>${km.toFixed(2)}</b><span>กม.</span></div>
        <div><b>${clock(sec)}</b><span>เวลา</span></div><div><b>${spd.toFixed(1)}</b><span>กม./ชม.</span></div><div><b>${hr}</b><span>♥ เฉลี่ย</span></div></div>
      <label class="pp-cap"><textarea id="ppCap" rows="3" maxlength="300" placeholder="เขียนแคปชั่น… วันนี้รู้สึกยังไงบ้าง?"></textarea></label>
      <div class="pp-row"><b>การมองเห็น</b>
        <div class="pp-vis" id="ppVis"><button data-v="pub" class="on">${T2.ic.globe}สาธารณะ</button><button data-v="fr">${T2.ic.ppl}เพื่อน</button><button data-v="me">${T2.ic.lock}เฉพาะฉัน</button></div></div>
      <button class="pp-save press" id="ppSave">บันทึก</button>
    </div>`;
  const cv = $('#ppCv', pg), cx = cv.getContext('2d');
  const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  let A = {};
  const load = async () => {
    const [map, mark, coin, eliA] = await Promise.all([img('assets/r_map.webp'), img('assets/logo_mark.png'), img('assets/c3_face.png'), img(spr('cheer1'))]);
    A = { map, mark, coin, eliA }; draw();
  };
  const cover = (im, x, y, w, h) => { const k = Math.max(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k; cx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); };
  const tint = (im, col, w) => { const c = document.createElement('canvas'), h = w * im.height / im.width; c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, w, h); return c; };
  const rr = (x, y, w, h, r) => { cx.beginPath(); cx.roundRect(x, y, w, h, r); };
  const draw = () => {
    const W = 1080, Hh = 1350, F = '"Comfortaa","Noto Sans Thai",sans-serif';
    cx.clearRect(0, 0, W, Hh);
    if (P.photo) cover(P.photo, 0, 0, W, Hh);
    else { cx.fillStyle = '#F4EFE6'; cx.fillRect(0, 0, W, Hh); if (A.map) cover(A.map, 0, 0, W, Hh); }
    const st = P.style, light = st === 'minimal' && !P.photo;
    if (st === 'classic' || st === 'gold') { const g = cx.createLinearGradient(0, Hh * .45, 0, Hh); g.addColorStop(0, 'rgba(15,20,60,0)'); g.addColorStop(1, st === 'gold' ? 'rgba(40,25,0,.82)' : 'rgba(15,20,60,.85)'); cx.fillStyle = g; cx.fillRect(0, 0, W, Hh); }
    // brand watermark (logo, top-left)
    const wm = st === 'gold' ? '#F6C343' : (light ? '#2A3B9C' : '#fff');
    if (A.mark) { const m = tint(A.mark, wm, 110); cx.globalAlpha = .95; cx.drawImage(m, 60, 56); cx.globalAlpha = 1; }
    cx.fillStyle = wm; cx.font = `700 34px ${F}`; cx.fillText("eli's world", 186, 120);
    const kmS = km.toFixed(2), t = clock(sec), v = spd.toFixed(1);
    if (st === 'sticker') {
      rr(60, Hh - 400, W - 120, 330, 60); cx.fillStyle = '#fff'; cx.shadowColor = 'rgba(20,30,60,.25)'; cx.shadowBlur = 30; cx.fill(); cx.shadowBlur = 0;
      cx.lineWidth = 10; cx.strokeStyle = '#fff'; cx.stroke();
      cx.fillStyle = '#2A3B9C'; cx.font = `700 150px ${F}`; cx.fillText(kmS, 110, Hh - 215); const kw = cx.measureText(kmS).width;
      cx.font = `700 52px ${F}`; cx.fillText('กม.', 130 + kw, Hh - 215);
      cx.fillStyle = '#5C5651'; cx.font = `700 44px ${F}`; cx.fillText(`${t}   ·   ${v} กม./ชม.   ·   ♥ ${hr}`, 112, Hh - 130);
      if (A.eliA) { const s = 330; cx.drawImage(A.eliA, W - s - 40, Hh - 400 - s * .78, s, s); }
      if (A.coin) cx.drawImage(A.coin, W - 190, Hh - 210, 110, 110);
    } else if (st === 'classic' || st === 'gold') {
      const c = st === 'gold' ? '#F6C343' : '#fff';
      cx.fillStyle = c; cx.font = `700 190px ${F}`; cx.fillText(kmS, 80, Hh - 250); const kw = cx.measureText(kmS).width;
      cx.font = `700 64px ${F}`; cx.fillText('กม.', 100 + kw, Hh - 250);
      cx.font = `700 50px ${F}`; cx.fillStyle = st === 'gold' ? '#FFE9A8' : 'rgba(255,255,255,.92)';
      [[t, 'เวลา'], [v, 'กม./ชม.'], [String(hr), '♥ เฉลี่ย']].forEach(([a, b], i) => { cx.font = `700 60px ${F}`; cx.fillText(a, 84 + i * 330, Hh - 140); cx.font = `600 34px ${F}`; cx.fillText(b, 86 + i * 330, Hh - 86); });
    } else {   // minimal
      const c = light ? '#2A3B9C' : '#fff';
      cx.fillStyle = c; cx.textAlign = 'center'; cx.font = `700 230px ${F}`; cx.fillText(kmS, W / 2, Hh / 2 + 60);
      cx.font = `700 60px ${F}`; cx.fillText('กิโลเมตร', W / 2, Hh / 2 + 150);
      cx.font = `600 42px ${F}`; cx.fillText(`${t} · ${v} กม./ชม. · ♥ ${hr}`, W / 2, Hh / 2 + 230); cx.textAlign = 'left';
    }
  };
  document.fonts?.ready.then(load); load();
  $('#ppFile', pg).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = async () => { P.photo = await img(rd.result); draw(); SFX.pop(); }; rd.readAsDataURL(f);
  };
  $$('#ppStyles button', pg).forEach(b => b.onclick = () => { P.style = b.dataset.s; $$('#ppStyles button', pg).forEach(x => x.classList.toggle('on', x === b)); draw(); SFX.pop(); });
  $$('#ppVis button', pg).forEach(b => b.onclick = () => { P.vis = b.dataset.v; $$('#ppVis button', pg).forEach(x => x.classList.toggle('on', x === b)); SFX.pop(); });
  $('#ppX', pg).onclick = () => go('trek');
  const save = () => {
    G.today.steps += steps; G.total = (G.total || 0) + lp; G.coins += 1; saveG();
    celebrate();
  };
  $('#ppSave', pg).onclick = save; $('#ppSave2', pg).onclick = save;

  /* ── ELi celebrates (like a level-up), then share / save the picture ── */
  const celebrate = () => {
    const ov = document.createElement('div'); ov.className = 't2-yay';
    ov.innerHTML = `<i class="rays"></i><div class="t">สุดยอดไปเลย!</div><div class="s">วันนี้คุณ${RUN.sport}ได้ <b>${km.toFixed(2)} กม.</b><br>น้อง eli ภูมิใจในตัวคุณมาก ๆ 💙</div>
      <div class="stage"></div><div class="gain"><span>+${lp} <small>Life Power</small></span><span><img src="assets/c3_face.png" alt="">+1 <small>coin</small></span></div>
      <button class="go press">ไปแชร์กัน!</button>`;
    $('#app').append(ov); later(20, () => ov.classList.add('on'));
    const e = new Eli($('.stage', ov), { size: 210, x: 195, y: 230 });
    SFX.levelup(); buzz([40, 60, 40]); confetti(140);
    later(700, () => [0, .12, .24, .36].forEach((d, i) => SFX.tone([1046, 1318, 1568, 2093][i], .3, 'sine', .04, d)));
    let alive = true;
    (async () => { while (alive) for (const p of ['cheer2', 'cheer1', 'cheer4', 'cheer6']) { if (!alive) break; e.pose(p); await (p === 'cheer2' ? e.jump(110, 700) : e.squash(.18, 420)); } })();
    later(1200, () => burst($('.stage', ov), 195, 140, { n: 26, dist: 150, size: 9, colors: ['#F6C343', '#F28C28', '#fff', '#7B95F4'], shape: 'star' }));
    $('.go', ov).onclick = () => { alive = false; e.remove(); ov.remove(); shareSheet(); };
  };
  const blob = () => new Promise(r => cv.toBlob(r, 'image/png'));
  const shareSheet = () => {
    openSheet(`<h4>แชร์ความสำเร็จ</h4><img class="pp-thumb" src="${cv.toDataURL('image/jpeg', .8)}" alt="">
      <button class="pp-sh press" id="ppSh">${T2.ic.share}แชร์ไปยังแอปอื่น</button>
      <button class="pp-dl press" id="ppDl">${T2.ic.down}บันทึกรูปลงเครื่อง</button>
      <button class="pp-done" data-close id="ppDone">เสร็จแล้ว</button>`, sh => {
      $('#ppSh', sh).onclick = async () => {
        const b = await blob(), f = new File([b], 'eli-run.png', { type: 'image/png' }), cap = $('#ppCap', pg)?.value || '';
        if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], text: cap }); } catch (e) {} }
        else toast('อุปกรณ์นี้แชร์ไฟล์ไม่ได้ · กดบันทึกรูปลงเครื่องแทนนะ');
      };
      $('#ppDl', sh).onclick = async () => {
        const b = await blob(), u = URL.createObjectURL(b), a = document.createElement('a');
        a.href = u; a.download = `eli-run-${new Date().toISOString().slice(0, 10)}.png`; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 4000); toast('บันทึกรูปแล้ว ✓');
      };
      $('#ppDone', sh).addEventListener('click', () => later(250, () => go('world')));
    });
  };
};
