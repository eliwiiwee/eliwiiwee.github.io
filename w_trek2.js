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
  // heart-rate zones (client 2026-10-18 "สรุป zone การวิ่ง"): % of max HR, max HR = 220 − real age
  ZONES: [
    { n: 'วอร์มอัพ', d: 'เบาสบาย ฟื้นตัว', lo: 0, hi: .6, c: '#9AA7C7' },
    { n: 'เผาผลาญไขมัน', d: 'คุยได้สบาย ๆ', lo: .6, hi: .7, c: '#4FA3E0' },
    { n: 'แอโรบิก', d: 'เพิ่มความอึด หัวใจแข็งแรง', lo: .7, hi: .8, c: '#36B44B' },
    { n: 'เทรสโฮลด์', d: 'หนักขึ้น เพิ่มความเร็ว', lo: .8, hi: .9, c: '#F6A623' },
    { n: 'สูงสุด', d: 'เต็มกำลัง ช่วงสั้น ๆ', lo: .9, hi: 9, c: '#E8453C' },
  ],
  hrMax: () => 220 - (G.citizen.age || 32),
  zoneOf: hr => { const r = hr / T2.hrMax(); return Math.max(0, T2.ZONES.findIndex(z => r >= z.lo && r < z.hi)); },
  // prototype heart rate: rises through the warm-up, then drifts up and down like a real run (so every zone shows up)
  hrSim: sec => Math.round(100 + Math.min(1, sec / 300) * 48 + Math.sin(sec / 90) * 14 + Math.sin(sec / 23) * 6 + Math.random() * 4),
  pace: (m, s) => m > 0 ? s / (m / 1000) : 0,                          // seconds per km
  paceTxt: (m, s) => { if (m < 50) return '–:––'; const p = Math.min(5999, Math.round(T2.pace(m, s))); return `${Math.floor(p / 60)}:${String(p % 60).padStart(2, '0')}`; },   // 6:08 (min/km)
  say(text) {   // spoken summary (Thai voice if the device has one), falls back silently
    if (window.NATIVE && NATIVE.say(text)) return;   // the app: the system voice (keeps talking with the screen off)
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
    T2.say('เริ่มบันทึก สู้ ๆ นะ');   // spoken inside the tap: iPhone Safari only allows speech that starts from a tap, this unlocks the 1-km announcements
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
    // ELi runs in the gap between the numbers card and the pause button, whatever the screen height
    const twoB = Math.max(198, Math.round(appH * .3)) + 76, ly = appH - 176, esz = Math.max(70, Math.min(118, ly - twoB - 8));
    rec.style.setProperty('--ly', ly + 'px');
    const re = new Eli(rec, { size: esz, x: 195, y: ly }); re.setFace(1); re.loop(RUNF, 13);
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
    burst(rec, 195, appH - 230, { n: 14, dist: 70, size: 6, colors: ['#F6C343', '#F28C28', '#2A3B9C', '#fff'], shape: 'star' });
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
  const real = RUN.m > 50, km = real ? RUN.m / 1000 : 2.07, sec = real ? RUN.sec : 760, pc = T2.paceTxt(km * 1000, sec);   // opened straight from a link → sample numbers
  const hr = RUN.hrN ? Math.round(RUN.hr / RUN.hrN) : RUN.native ? '–' : 142, steps = Math.round(km * 1283), lp = Math.max(12, Math.round(km * 14.3));
  // the zone summary: time in each heart-rate zone (opened straight from a link → a sample split)
  const zsec = RUN.zones && RUN.zones.some(Boolean) ? RUN.zones : [.08, .22, .38, .24, .08].map(f => Math.round(f * sec));
  const zoneCard = () => {
    if (RUN.native && !(RUN.zones && RUN.zones.some(Boolean))) return '';   // the app: no heart rate from a watch → no zone card
    const tot = zsec.reduce((a, b) => a + b, 0) || 1, mx = T2.hrMax(), top = zsec.indexOf(Math.max(...zsec)), Z = T2.ZONES;
    const bpm = z => z.lo === 0 ? `< ${Math.round(mx * z.hi)}` : z.hi > 1 ? `${Math.round(mx * z.lo)}+` : `${Math.round(mx * z.lo)}–${Math.round(mx * z.hi) - 1}`;
    return `<section class="pp-zone">
      <div class="zh"><b>สรุปโซนการวิ่ง</b><span>♥ สูงสุดของคุณ ${mx} bpm</span></div>
      <div class="zbar">${zsec.map((s, i) => s ? `<i style="flex:${s};background:${Z[i].c}"></i>` : '').join('')}</div>
      <div class="ztop" style="--c:${Z[top].c}"><i>Z${top + 1}</i><span>ส่วนใหญ่อยู่ใน <b>โซน ${top + 1} · ${Z[top].n}</b><small>${Z[top].d}</small></span></div>
      ${Z.map((z, i) => { const p = Math.round(zsec[i] / tot * 100); return `<div class="zr ${i === top ? 'on' : ''}">
        <i class="zn" style="background:${z.c}">Z${i + 1}</i><span class="zl"><b>${z.n}</b><small>${bpm(z)} bpm</small></span>
        <span class="zp"><i style="width:${p}%;background:${z.c}"></i></span><span class="zt"><b>${clock(zsec[i])}</b><small>${p}%</small></span></div>`; }).join('')}
    </section>`;
  };
  // ELi stickers on the picture (client 2026-10-15): the client's original drawings only — pick any, drag to move, pull the corner / pinch / slider to resize
  const STK = [['eli_happy', 'ยิ้ม'], ['eli_run', 'วิ่ง'], ['eli_music', 'ฟังเพลง'], ['eli_sick', 'ไม่สบาย']];
  const P = { photo: null, style: 'sticker', vis: 'pub', stk: [{ k: 0, x: 870, y: 820, s: 360 }], sel: -1 };   // starts where ELi sat on the card
  pg.innerHTML = `
    <div class="pp-bar"><button class="pp-x" id="ppX" aria-label="ปิด">✕</button><b>โพสต์กิจกรรม</b><button class="pp-ok" id="ppSave2">บันทึก</button></div>
    <div class="pp-scroll">
      <div class="pp-me"><img src="${safeImg(G.citizen.photo)}" alt=""><div><b>${esc(G.citizen.name)}</b><span>${RUN.sport} · วันนี้</span></div></div>
      <div class="pp-pic" id="ppPic"><canvas id="ppCv" width="1080" height="1350"></canvas><div class="pp-stk" id="ppStk"></div>
        <label class="pp-pick press">${T2.ic.photo}<span>เลือกรูปภาพ</span><input type="file" accept="image/*" id="ppFile" hidden></label></div>
      <div class="pp-stkbar"><div class="hd"><b>สติกเกอร์น้อง eli</b><span>แตะเพื่อใส่ในภาพ · ลากเพื่อย้าย</span></div>
        <div class="pp-stks" id="ppStks">${STK.map(([f, n], i) => `<button data-k="${i}" aria-label="ใส่สติกเกอร์น้อง eli ท่า${n}"><img src="assets/${f}.webp" alt=""></button>`).join('')}</div>
        <label class="pp-size off" id="ppSize"><span>ขนาดน้อง</span><input type="range" min="140" max="900" step="10" value="360" id="ppSz" disabled><em id="ppSzT">แตะที่น้องในภาพก่อน</em></label></div>
      <div class="pp-styles" id="ppStyles">
        <button data-s="sticker" class="on">การ์ด</button><button data-s="classic">คลาสสิก</button><button data-s="minimal">มินิมอล</button><button data-s="gold">ทอง</button></div>
      <div class="pp-stats">
        <div class="big"><b>${km.toFixed(2)}</b><span>กม.</span></div>
        <div><b>${clock(sec)}</b><span>เวลา</span></div><div><b>${pc}</b><span>เพซ /กม.</span></div><div><b>${hr}</b><span>♥ เฉลี่ย</span></div></div>
      ${zoneCard()}
      <label class="pp-cap"><textarea id="ppCap" rows="3" maxlength="300" placeholder="เขียนแคปชั่น… วันนี้รู้สึกยังไงบ้าง?"></textarea></label>
      <div class="pp-row"><b>การมองเห็น</b>
        <div class="pp-vis" id="ppVis"><button data-v="pub" class="on">${T2.ic.globe}สาธารณะ</button><button data-v="fr">${T2.ic.ppl}เพื่อน</button><button data-v="me">${T2.ic.lock}เฉพาะฉัน</button></div></div>
      <button class="pp-save press" id="ppSave">บันทึก</button>
    </div>`;
  const cv = $('#ppCv', pg), out = cv.getContext('2d');
  const bcv = document.createElement('canvas'); bcv.width = 1080; bcv.height = 1350; const cx = bcv.getContext('2d');   // base layer, redrawn only when the photo / style changes
  const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  let A = {};
  const load = async () => {
    const [map, mark, coin, ...stk] = await Promise.all([img('assets/r_map.webp'), img('assets/logo_mark.png'), img('assets/c3_face.png'), ...STK.map(([f]) => img(`assets/${f}.webp`))]);
    A = { map, mark, coin, stk: stk.map(im => im && outline(im)) }; draw(); buildStk();
  };
  const cover = (im, x, y, w, h) => { const k = Math.max(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k; cx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); };
  const tint = (im, col, w) => { const c = document.createElement('canvas'), h = w * im.height / im.width; c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, w, h); return c; };
  const rr = (x, y, w, h, r) => { cx.beginPath(); cx.roundRect(x, y, w, h, r); };
  const outline = im => {   // die-cut sticker look: a white border + soft shadow around the original drawing (the drawing itself is untouched)
    const w = 640, h = Math.round(w * im.height / im.width), pd = 34, c = document.createElement('canvas'); c.width = w + pd * 2; c.height = h + pd * 2;
    const g = c.getContext('2d'), sil = tint(im, '#fff', w);
    g.shadowColor = 'rgba(20,30,60,.28)'; g.shadowBlur = 18; g.shadowOffsetY = 8; g.drawImage(sil, pd, pd); g.shadowColor = 'transparent';
    for (let a = 0; a < 24; a++) g.drawImage(sil, pd + Math.cos(a / 24 * 2 * Math.PI) * 14, pd + Math.sin(a / 24 * 2 * Math.PI) * 14);
    g.drawImage(im, pd, pd, w, h); return c;
  };
  const sH = st => { const im = A.stk && A.stk[st.k]; return im ? st.s * im.height / im.width : st.s; };
  const paint = () => {   // the visible picture = base + ELi stickers (what is saved / shared)
    out.clearRect(0, 0, 1080, 1350); out.drawImage(bcv, 0, 0);
    P.stk.forEach(st => { const im = A.stk && A.stk[st.k]; if (im) out.drawImage(im, st.x - st.s / 2, st.y - sH(st) / 2, st.s, sH(st)); });
    placeStk();
  };
  const draw = () => { drawBase(); paint(); };
  // the GPS route (lat/lon points) fitted into a box, north up — like the runner's own track, no basemap
  const drawRoute = (pts, [x0, y0, x1, y1], col) => {
    const k = Math.cos(pts[0][0] * Math.PI / 180), xs = pts.map(p => p[1] * k), ys = pts.map(p => -p[0]);
    const mx = Math.min(...xs), my = Math.min(...ys), w = Math.max(...xs) - mx || 1e-9, h = Math.max(...ys) - my || 1e-9;
    const sc = Math.min((x1 - x0) / w, (y1 - y0) / h), ox = x0 + ((x1 - x0) - w * sc) / 2, oy = y0 + ((y1 - y0) - h * sc) / 2;
    const P2 = xs.map((x, i) => [ox + (x - mx) * sc, oy + (ys[i] - my) * sc]);
    const line = () => { cx.beginPath(); P2.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); };
    cx.lineJoin = cx.lineCap = 'round';
    line(); cx.strokeStyle = col === '#fff' ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.95)'; cx.lineWidth = 30; cx.stroke();
    line(); cx.strokeStyle = col; cx.lineWidth = 16; cx.stroke();
    const dot = ([x, y], fill) => { cx.beginPath(); cx.arc(x, y, 22, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.beginPath(); cx.arc(x, y, 14, 0, 7); cx.fillStyle = fill; cx.fill(); };
    dot(P2[0], '#2FB36B'); dot(P2[P2.length - 1], col === '#fff' ? '#2A3B9C' : col);   // start green, finish in the line colour
  };
  const drawBase = () => {
    const W = 1080, Hh = 1350, F = '"Comfortaa","Noto Sans Thai",sans-serif';
    cx.clearRect(0, 0, W, Hh);
    const real = RUN.native, route = real && RUN.route && RUN.route.length > 1 ? RUN.route : null;   // the app never shows the sample route
    if (P.photo) cover(P.photo, 0, 0, W, Hh);
    else {
      cx.fillStyle = '#F4EFE6'; cx.fillRect(0, 0, W, Hh);
      if (!real && A.map) cover(A.map, 0, 0, W, Hh);
      else { cx.fillStyle = 'rgba(42,59,156,.07)'; for (let y = 60; y < Hh; y += 60) for (let x = 60; x < W; x += 60) cx.fillRect(x - 3, y - 3, 6, 6); }   // dot grid under the real route
    }
    const st = P.style, light = st === 'minimal' && !P.photo;
    if (st === 'classic' || st === 'gold') { const g = cx.createLinearGradient(0, Hh * .45, 0, Hh); g.addColorStop(0, 'rgba(15,20,60,0)'); g.addColorStop(1, st === 'gold' ? 'rgba(40,25,0,.82)' : 'rgba(15,20,60,.85)'); cx.fillStyle = g; cx.fillRect(0, 0, W, Hh); }
    if (route) drawRoute(route, st === 'minimal' ? [150, 200, W - 150, 470] : [110, 210, W - 110, Hh - 470], P.photo ? '#fff' : st === 'gold' ? '#C99A1E' : '#2A3B9C');
    // brand watermark (logo, top-left)
    const wm = st === 'gold' ? '#F6C343' : (light || (real && !P.photo) ? '#2A3B9C' : '#fff');   // blue on the plain cream route background
    if (A.mark) { const m = tint(A.mark, wm, 110); cx.globalAlpha = .95; cx.drawImage(m, 60, 56); cx.globalAlpha = 1; }
    cx.fillStyle = wm; cx.font = `700 34px ${F}`; cx.fillText("eli's world", 186, 120);
    const kmS = km.toFixed(2), t = clock(sec), v = pc;
    if (st === 'sticker') {
      rr(60, Hh - 400, W - 120, 330, 60); cx.fillStyle = '#fff'; cx.shadowColor = 'rgba(20,30,60,.25)'; cx.shadowBlur = 30; cx.fill(); cx.shadowBlur = 0;
      cx.lineWidth = 10; cx.strokeStyle = '#fff'; cx.stroke();
      cx.fillStyle = '#2A3B9C'; cx.font = `700 150px ${F}`; cx.fillText(kmS, 110, Hh - 215); const kw = cx.measureText(kmS).width;
      cx.font = `700 52px ${F}`; cx.fillText('กม.', 130 + kw, Hh - 215);
      cx.fillStyle = '#5C5651'; cx.font = `700 44px ${F}`; cx.fillText(`${t}   ·   ${v} /กม.   ·   ♥ ${hr}`, 112, Hh - 130);
      if (A.coin) cx.drawImage(A.coin, W - 190, Hh - 210, 110, 110);
    } else if (st === 'classic' || st === 'gold') {
      const c = st === 'gold' ? '#F6C343' : '#fff';
      cx.fillStyle = c; cx.font = `700 190px ${F}`; cx.fillText(kmS, 80, Hh - 250); const kw = cx.measureText(kmS).width;
      cx.font = `700 64px ${F}`; cx.fillText('กม.', 100 + kw, Hh - 250);
      cx.font = `700 50px ${F}`; cx.fillStyle = st === 'gold' ? '#FFE9A8' : 'rgba(255,255,255,.92)';
      [[t, 'เวลา'], [v, 'เพซ /กม.'], [String(hr), '♥ เฉลี่ย']].forEach(([a, b], i) => { cx.font = `700 60px ${F}`; cx.fillText(a, 84 + i * 330, Hh - 140); cx.font = `600 34px ${F}`; cx.fillText(b, 86 + i * 330, Hh - 86); });
    } else {   // minimal
      const c = light ? '#2A3B9C' : '#fff';
      cx.fillStyle = c; cx.textAlign = 'center'; cx.font = `700 230px ${F}`; cx.fillText(kmS, W / 2, Hh / 2 + 60);
      cx.font = `700 60px ${F}`; cx.fillText('กิโลเมตร', W / 2, Hh / 2 + 150);
      cx.font = `600 42px ${F}`; cx.fillText(`${t} · ${v} /กม. · ♥ ${hr}`, W / 2, Hh / 2 + 230); cx.textAlign = 'left';
    }
  };
  /* ── sticker editing: DOM boxes over the canvas only catch the finger and show the frame; the canvas draws the sticker ── */
  const lay = $('#ppStk', pg), sz = $('#ppSz', pg), szT = $('#ppSzT', pg), MAXS = 6;
  const kk = () => cv.clientWidth / 1080 || 1;
  const buildStk = () => {
    lay.innerHTML = P.stk.map((st, i) => `<div class="stk ${i === P.sel ? 'on' : ''}" data-i="${i}"><button class="del" aria-label="เอาสติกเกอร์ออก">✕</button><i class="rz" aria-hidden="true"></i></div>`).join('');
    placeStk(); syncSize();
  };
  const placeStk = () => {
    const k = kk();
    $$('.stk', lay).forEach(b => { const st = P.stk[b.dataset.i]; if (!st) return; const w = st.s * k, h = sH(st) * k; Object.assign(b.style, { left: st.x * k - w / 2 + 'px', top: st.y * k - h / 2 + 'px', width: w + 'px', height: h + 'px' }); });
  };
  const syncSize = () => {
    const st = P.stk[P.sel], on = !!st;
    $('#ppSize', pg).classList.toggle('off', !on); sz.disabled = !on;
    if (on) sz.value = st.s; szT.textContent = on ? `${Math.round(st.s / 360 * 100)}%` : (P.stk.length ? 'แตะที่น้องในภาพก่อน' : 'ยังไม่มีน้องในภาพ');
  };
  const select = i => { P.sel = i; $$('.stk', lay).forEach(b => b.classList.toggle('on', +b.dataset.i === i)); syncSize(); };
  let raf = 0;   // one repaint per frame; the timeout covers browsers that pause animation frames (low-power mode, hidden previews)
  const repaint = () => { if (raf) return; const f = () => { cancelAnimationFrame(raf.a); clearTimeout(raf.t); raf = 0; paint(); syncSize(); }; raf = { a: requestAnimationFrame(f), t: setTimeout(f, 40) }; };
  const clampSt = st => { st.s = Math.max(140, Math.min(900, st.s)); st.x = Math.max(0, Math.min(1080, st.x)); st.y = Math.max(0, Math.min(1350, st.y)); };
  // drag = move, the corner handle or two fingers = resize
  const pts = new Map(); let g0 = null;
  lay.addEventListener('pointerdown', e => {
    const b = e.target.closest('.stk'); if (!b || e.target.closest('.del')) return;
    e.preventDefault(); const i = +b.dataset.i, st = P.stk[i]; if (P.sel !== i) select(i);
    try { b.setPointerCapture(e.pointerId); } catch (x) {}
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = b.getBoundingClientRect(), c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    if (pts.size === 2) { const [p, q] = [...pts.values()]; g0 = { i, mode: 'pinch', d: Math.hypot(p.x - q.x, p.y - q.y) || 1, s: st.s }; }
    else if (e.target.closest('.rz')) g0 = { i, mode: 'size', c, d: Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1, s: st.s };
    else g0 = { i, mode: 'move', px: e.clientX, py: e.clientY, x: st.x, y: st.y };
  });
  lay.addEventListener('pointermove', e => {
    if (!g0 || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const st = P.stk[g0.i], k = kk(); if (!st) return;
    if (g0.mode === 'pinch' && pts.size >= 2) { const [p, q] = [...pts.values()]; st.s = g0.s * Math.hypot(p.x - q.x, p.y - q.y) / g0.d; }
    else if (g0.mode === 'size') st.s = g0.s * Math.hypot(e.clientX - g0.c.x, e.clientY - g0.c.y) / g0.d;
    else if (g0.mode === 'move') { st.x = g0.x + (e.clientX - g0.px) / k; st.y = g0.y + (e.clientY - g0.py) / k; }
    clampSt(st); repaint();
  });
  const lift = e => { pts.delete(e.pointerId); if (!pts.size) g0 = null; else if (g0 && g0.mode === 'pinch') { const [p] = [...pts.values()], st = P.stk[g0.i]; g0 = { i: g0.i, mode: 'move', px: p.x, py: p.y, x: st.x, y: st.y }; } };
  ['pointerup', 'pointercancel'].forEach(n => lay.addEventListener(n, lift));
  lay.addEventListener('click', e => { const d = e.target.closest('.del'); if (!d) return; P.stk.splice(+d.closest('.stk').dataset.i, 1); P.sel = -1; SFX.pop(); buildStk(); paint(); });
  $('#ppPic', pg).addEventListener('pointerdown', e => { if (!e.target.closest('.stk,.pp-pick') && P.sel >= 0) select(-1); });
  sz.addEventListener('input', () => { const st = P.stk[P.sel]; if (!st) return; st.s = +sz.value; clampSt(st); repaint(); });
  $$('#ppStks button', pg).forEach(b => b.onclick = () => {
    if (P.stk.length >= MAXS) return toast(`ใส่น้องได้สูงสุด ${MAXS} ตัวต่อภาพนะ`);
    const n = P.stk.length; P.stk.push({ k: +b.dataset.k, x: 540 + (n % 3 - 1) * 150, y: 560 + (n % 2) * 120, s: 360 });
    P.sel = P.stk.length - 1; SFX.pop(); buzz(10); buildStk(); paint();
    $('#ppPic', pg).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  addEventListener('resize', placeStk); cleanup.push(() => removeEventListener('resize', placeStk));
  document.fonts?.ready.then(load); load();
  $('#ppFile', pg).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = async () => { P.photo = await img(rd.result); draw(); SFX.pop(); }; rd.readAsDataURL(f);
  };
  $$('#ppStyles button', pg).forEach(b => b.onclick = () => { P.style = b.dataset.s; $$('#ppStyles button', pg).forEach(x => x.classList.toggle('on', x === b)); draw(); SFX.pop(); });
  $$('#ppVis button', pg).forEach(b => b.onclick = () => { P.vis = b.dataset.v; $$('#ppVis button', pg).forEach(x => x.classList.toggle('on', x === b)); SFX.pop(); });
  $('#ppX', pg).onclick = () => go('trek');
  let saving = false;
  const save = async () => {
    if (saving) return; saving = true;
    if (!CLOUD.on) { G.today.steps += steps; G.total = (G.total || 0) + lp; G.coins += 1; saveG(); return celebrate(lp, 1); }
    // the app: the run is stored and rewarded by the server (Health already counts its steps)
    const bs = [$('#ppSave', pg), $('#ppSave2', pg)].filter(Boolean), was = bs.map(b => b.textContent);
    bs.forEach(b => { b.disabled = true; b.textContent = 'กำลังบันทึก…'; });
    try {
      const r = await CLOUD.run({ sec, meters: Math.round(RUN.m), sport: RUN.sport, started_at: RUN.t0 ? new Date(RUN.t0).toISOString() : null,
        hr_avg: RUN.hrN ? hr : null, zones: RUN.zones && RUN.zones.some(Boolean) ? RUN.zones : null, route: RUN.route || null,
        caption: $('#ppCap', pg)?.value || '', visibility: { pub: 'public', fr: 'friends', me: 'private' }[P.vis] || 'public' });
      celebrate(r.lp, r.coin);
    } catch (e) { saving = false; bs.forEach((b, i) => { b.disabled = false; b.textContent = was[i]; }); SFX.sad(); toast(e.message); }
  };
  $('#ppSave', pg).onclick = save; $('#ppSave2', pg).onclick = save;

  /* ── ELi celebrates (like a level-up), then share / save the picture ── */
  const celebrate = (gotLp, gotCoin) => {
    const ov = document.createElement('div'); ov.className = 't2-yay';
    ov.innerHTML = `<i class="rays"></i><div class="t">สุดยอดไปเลย!</div><div class="s">วันนี้คุณ${RUN.sport}ได้ <b>${km.toFixed(2)} กม.</b><br>น้อง eli ภูมิใจในตัวคุณมาก ๆ 💙</div>
      <div class="stage"></div><div class="gain">${gotLp ? `<span>+${gotLp} <small>Life Power</small></span>` : ''}${gotCoin ? `<span><img src="assets/c3_face.png" alt="">+${gotCoin} <small>coin</small></span>` : ''}${gotLp ? '' : '<span><small>วันนี้รับรางวัลการวิ่งครบ 3 ครั้งแล้ว</small></span>'}</div>
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
        const cap = $('#ppCap', pg)?.value || '';
        if (window.NATIVE) return NATIVE.shareImage(cv.toDataURL('image/png'), cap);   // the app: the system share sheet (IG, LINE, Facebook …)
        const b = await blob(), f = new File([b], 'eli-run.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], text: cap }); } catch (e) {} }
        else toast('อุปกรณ์นี้แชร์ไฟล์ไม่ได้ · กดบันทึกรูปลงเครื่องแทนนะ');
      };
      $('#ppDl', sh).onclick = async () => {
        if (window.NATIVE) return NATIVE.saveImage(cv.toDataURL('image/png')).then(ok => toast(ok ? 'บันทึกรูปลงเครื่องแล้ว ✓' : 'บันทึกรูปไม่สำเร็จ'));
        const b = await blob(), u = URL.createObjectURL(b), a = document.createElement('a');
        a.href = u; a.download = `eli-run-${new Date().toISOString().slice(0, 10)}.png`; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 4000); toast('บันทึกรูปแล้ว ✓');
      };
      $('#ppDone', sh).addEventListener('click', () => later(250, () => go('world')));
    });
  };
};
