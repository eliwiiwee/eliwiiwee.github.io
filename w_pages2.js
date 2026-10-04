/* Eli's World — Step Trek, activity record, Hero Hall, Treasury, Redeem, Settings (design/n*_A.png).
   ELi = the original art only, moved by code. Positions = mockup px × 0.381; the extra height of tall phones is absorbed in the middle. */

/* ═════════ Step Trek (nt_A) ═════════ */
// dashed loop painted on assets/k_map (crop 492×512) — the solid run line follows it
const TK_PATH = 'M158 396 C128 360 124 300 133 264 C140 250 200 256 218 249 C240 240 250 200 262 170 C280 135 330 100 381 79 C410 95 428 130 428 164 C428 200 412 230 400 260 C388 290 394 330 393 374 C392 400 380 414 360 412 C330 405 300 410 268 414 C240 425 200 440 178 429 C165 420 160 410 158 396 Z';
LIFE.trek = pg => {   // theme-A Step Trek; the warm-up/countdown before a run is the earlier scene (readyScene)
  pg.classList.add('w-trek');
  Object.assign(RUN, { state: 'idle', sec: 0, m: 0, next: 500, sport: RUN.sport || 'วิ่ง' });
  const H = appH, mh = Math.max(208, Math.min(250, H - 540)), stTop = H - 251, goTop = H - 163;
  pg.innerHTML = `
    <i class="wlogo tk-logo"></i><i class="tk-dv"></i>${wi('k_mount', 'tk-mt')}<b class="tk-ttl">Step Trek</b>
    <div class="tk-gps wait" id="tkGps">${wi('k_pin')}<span>หา GPS…</span></div>
    <button class="tk-sport press" id="tkSport">${wi('k_run')}<span>${RUN.sport}</span><i></i></button>
    <div class="tk-map rise" style="height:${mh}px;width:${Math.round(mh * .96)}px"><div class="mi"><img src="assets/k_map.webp" alt="">
      <svg viewBox="0 0 492 512" preserveAspectRatio="xMidYMid slice"><path class="run" id="tkRun" d="${TK_PATH}"/></svg><i class="tk-me" id="tkMe"></i></div></div>
    <div class="tk-st rise" style="top:${Math.max(101 + mh + 12, stTop - 92)}px;--d:.06s"><span>ก้าววันนี้</span><b id="tkSteps">${fmt(G.today.steps)}</b></div>
    <div class="tk-stats rise" style="top:${stTop}px;--d:.1s">
      <div>${wi('k_clock')}<span>เวลา</span><b id="tkT">0:00</b></div>
      <div>${wi('k_pin2')}<span>ระยะทาง</span><b><em style="font-style:normal" id="tkD">0.00</em> <small>กม.</small></b></div>
      <div>${wi('k_gauge')}<span>เพซ</span><b><em style="font-style:normal" id="tkP">-'--"</em> <small>/กม.</small></b></div>
      <div>${wi('k_heart')}<span>หัวใจ</span><b><em style="font-style:normal" id="tkH">--</em> <small>bpm</small></b></div></div>
    <button class="tk-go press" id="tkGo" style="top:${goTop}px"><span class="i0">${wi('k_runw')}</span><span class="i0">เริ่มบันทึก</span><span class="i1"><em><i></i><i></i></em>พัก</span></button>
    <div class="tk-pz" style="top:${goTop + 17}px"><button class="res press" id="tkRes">วิ่งต่อ</button><button class="end" id="tkEnd"><i></i><span>กดค้างเพื่อจบ</span></button></div>`;
  // map geometry: path coords (492×512, cover-fitted) → px inside .mi
  const mi = $('.tk-map .mi', pg), run = $('#tkRun', pg), me = $('#tkMe', pg), L = run.getTotalLength();
  run.style.strokeDasharray = L; run.style.strokeDashoffset = L;
  const toPx = p => { const w = mi.clientWidth, h = mi.clientHeight, k = Math.max(w / 492, h / 512); return [p.x * k + (w - 492 * k) / 2, p.y * k + (h - 512 * k) / 2]; };
  const putMe = f => { const [x, y] = toPx(run.getPointAtLength(L * f)); me.style.left = x + 'px'; me.style.top = y + 'px'; };
  requestAnimationFrame(() => putMe(0));
  later(1300, () => { const g = $('#tkGps', pg); g.classList.remove('wait'); $('span', g).textContent = 'GPS พร้อม'; });
  // ELi warms up beside the map
  const ex = 286, ey = Math.min(H - 290, 101 + mh + 95);
  pg.insertAdjacentHTML('beforeend', `<i class="tk-glow" style="left:${ex}px;top:${ey}px"></i>`);
  const eli = new Eli(pg, { size: 132, x: ex, y: ey });
  eli.pose('ready5'); eli.setFace(-1);
  let busy = false;
  const warm = async () => {
    if (busy || RUN.state !== 'idle' || cur !== 'trek') return; busy = true;
    const k = Math.random() * 3 | 0;
    if (k === 0) { eli.pose('ready2'); await eli.stretch(760); } else if (k === 1) { eli.pose('ready6'); await eli.squash(.12, 420); eli.pose('ready5'); await eli.jump(20, 360); } else await eli.tilt(-7, 560);
    eli.pose('ready5'); busy = false;
  };
  every(3800, warm);
  later(800, () => eli.say('พร้อมวิ่งไปด้วยกันไหม? 🏃', 2000));
  pg.insertAdjacentHTML('beforeend', `<i style="position:absolute;left:${ex - 55}px;top:${ey - 115}px;width:120px;height:125px;z-index:6;cursor:pointer" id="tkHit"></i>`);
  $('#tkHit', pg).onclick = () => { SFX.pop(); eli.pose('cheer1'); eli.jump(34, 430).then(() => eli.pose(RUN.state === 'running' ? 'run1' : 'ready5')); eli.say(['สู้ๆ!', 'วอร์มอัพก่อนนะ', 'วันนี้ไปไกลแค่ไหนดี?'][Math.random() * 3 | 0], 1300); };
  $('#tkSport', pg).onclick = () => openSheet(`<h4>เลือกกิจกรรม</h4>${['วิ่ง', 'เดิน', 'วิ่งเทรล', 'วิ่งบนลู่'].map(n => `<button class="opt ${n === RUN.sport ? 'on' : ''}" data-n="${n}">${n}<i class="ck"></i></button>`).join('')}`, sh => {
    $$('.opt', sh).forEach(o => o.onclick = () => { RUN.sport = o.dataset.n; $('#tkSport span', pg).textContent = RUN.sport; setTimeout(closeSheet, 200); });
  });
  const tick = () => {
    if (RUN.state !== 'running') return;
    RUN.sec += 6; RUN.m += 6 * (1000 / 355) * (.94 + Math.random() * .12);
    $('#tkT', pg).textContent = clock(RUN.sec);
    $('#tkD', pg).textContent = (RUN.m / 1000).toFixed(2);
    $('#tkP', pg).textContent = RUN.m > 50 ? paceStr(RUN.sec / (RUN.m / 1000)) : "-'--\"";
    $('#tkH', pg).textContent = 138 + Math.round(Math.sin(RUN.sec / 40) * 9 + Math.random() * 4);
    $('#tkSteps', pg).textContent = fmt(G.today.steps + Math.round(RUN.m * 1.3));
    const f = (RUN.m / 1600) % 1; run.style.strokeDashoffset = L * (1 - Math.min(1, RUN.m / 1600)); putMe(f);
    if (RUN.m >= RUN.next) { eli.say(`ครบ ${(RUN.next / 1000).toFixed(1)} กม.! 💪`, 1400); burst(pg, eli.x, eli.y - 80, { n: 10, dist: 50, size: 5 }); RUN.next += 500; }
  };
  every(500, tick);
  let dust;
  const setRun = () => {
    RUN.state = 'running'; pg.classList.remove('paused'); pg.classList.add('running');
    eli.hush(); eli.setFace(1); eli.loop(RUNF, 12);
    clearInterval(dust); dust = setInterval(() => puff(pg, eli.x - 30, eli.y - 3, 1), 300);
  };
  cleanup.push(() => clearInterval(dust));
  $('#tkGo', pg).onclick = async () => {
    if (RUN.state === 'idle') { RUN.state = 'count'; eli.hush(); $('#tabbar').classList.add('hide'); await readyScene(pg); if (cur !== 'trek') return; $('#tabbar').classList.remove('hide'); setRun(); tick(); eli.say('ไปกันเลย!', 1200); }
    else if (RUN.state === 'running') { RUN.state = 'paused'; pg.classList.remove('running'); pg.classList.add('paused'); clearInterval(dust); eli.stop().pose('ready4'); eli.say('พักหายใจแป๊บนึงนะ~', 0); }
  };
  $('#tkRes', pg).onclick = () => { setRun(); eli.say('ลุยต่อ!', 1200); };
  const end = $('#tkEnd', pg); let ht;
  end.addEventListener('pointerdown', () => { end.classList.add('hold'); buzz(10); ht = setTimeout(() => { RUN.state = 'done'; clearInterval(dust); SFX.levelup(); go('trekdone'); }, 900); });
  const rel = () => { end.classList.remove('hold'); clearTimeout(ht); };
  end.addEventListener('pointerup', rel); end.addEventListener('pointerleave', rel);
};
// 5-4-3-2-1 transition (Canva brief p.6): ELi warms up big in the middle while the numbers count down
async function countdown(pg) {
  const ov = document.createElement('div'); ov.className = 'tk-cd';
  ov.innerHTML = '<b class="tk-cdn"></b><span class="tk-cdl">เตรียมตัว…</span><button class="tk-cds">ข้าม ›</button>';
  pg.append(ov); setTimeout(() => ov.classList.add('on'), 20);
  const e = new Eli(ov, { size: 210, x: 195, y: appH * .62 }); e.pose('ready1');
  let skip = false; $('.tk-cds', ov).onclick = () => { skip = true; };
  const moves = [['ready2', () => e.stretch(700)], ['ready4', () => e.squash(.14, 500)], ['ready3', () => e.tilt(-8, 600)], ['ready6', () => e.squash(.1, 400)], ['ready5', () => e.jump(30, 450)]];
  for (let n = 5; n >= 1 && !skip; n--) {
    const b = $('.tk-cdn', ov); b.textContent = n; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    $('.tk-cdl', ov).textContent = ['ยืดเส้น', 'ย่อเข่า', 'บิดตัว', 'หายใจลึกๆ', 'พร้อม!'][5 - n];
    SFX.tone(n === 1 ? 880 : 660, .14, 'triangle', .05); buzz(15);
    const [p, f] = moves[5 - n]; e.pose(p); f(); await w8(900);
  }
  $('.tk-cdn', ov).textContent = 'GO!'; $('.tk-cdl', ov).textContent = ''; SFX.levelup(); e.pose('cheer1'); e.loop(RUNF, 16);
  await e.moveTo(560, e.y, 600, 'ease-in'); ov.classList.remove('on'); await w8(350); ov.remove();
}

/* ═════════ Activity record (nr_A) ═════════ */
LIFE.trekdone = pg => {
  pg.classList.add('w-done');
  const km = Math.max(RUN.m / 1000, 3.21), sec = Math.max(RUN.sec, 1140), steps = Math.round(km * 1283), kcal = Math.round(km * 73.5);
  const lp = Math.max(12, Math.round(km * 14.3)), H = appH, mapH = Math.max(98, Math.min(200, H - 505));
  const chipTop = 322 + mapH + 10, nameTop = chipTop + 47, btnTop = Math.max(H - 61, nameTop + 66);
  pg.innerHTML = `
    <i class="wlogo dn-logo"></i><b class="dn-tag">STEP TREK</b>
    <h1 class="dn-h rise">ทำได้ดีมาก ดีใจด้วย!</h1><p class="dn-sub rise" style="--d:.05s">อีกก้าวเล็ก ๆ ที่สร้างสุขภาพที่ดีขึ้นในทุกวัน</p>
    <section class="dn-card rise" style="--d:.1s">
      <div class="r" style="left:19px;top:20px">${wi('r_pin')}</div><div class="r" style="left:49px;top:19px"><div><span>ระยะทาง</span><b><em style="font-style:normal" id="dnK">0</em> <small>กม.</small></b></div></div>
      <i class="vl" style="left:126px;top:16px;height:42px"></i>
      <div class="r" style="left:140px;top:20px">${wi('r_clock')}</div><div class="r" style="left:172px;top:19px"><div><span>เวลา</span><b>${clock(sec)}</b></div></div>
      <i class="vl" style="left:236px;top:16px;height:42px"></i>
      <div class="r" style="left:247px;top:22px">${wi('r_gauge')}</div><div class="r" style="left:283px;top:19px"><div><span>เพซ</span><b>${paceStr(sec / km)}<small>/กม.</small></b></div></div>
      <i class="hl"></i>
      <div class="r" style="left:22px;top:83px">${wi('r_shoe')}</div><div class="r" style="left:66px;top:82px"><div><span>ก้าว</span><b id="dnS">0</b></div></div>
      <i class="vl" style="left:180px;top:80px;height:42px"></i>
      <div class="r" style="left:205px;top:81px">${wi('r_flame')}</div><div class="r" style="left:245px;top:82px"><div><span>แคลอรี่</span><b>${kcal}</b></div></div>
    </section>
    <div class="dn-map rise" style="top:322px;height:${mapH}px;--d:.15s"><img src="assets/r_map.webp" alt=""></div>
    <div class="dn-chip rise" style="left:15px;width:175px;top:${chipTop}px;--d:.2s">${wi('r_bolt')}<span>+${lp} <small>Life Power</small></span></div>
    <div class="dn-chip rise" style="left:200px;width:176px;top:${chipTop}px;--d:.24s">${wi('r_coins')}<span>+1 <small>coin</small></span></div>
    <label class="dn-name rise" style="top:${nameTop}px;--d:.28s">${wi('r_doc')}<div><label for="dnTitle">ชื่อกิจกรรม</label><input id="dnTitle" value="${RUN.sport}ยามเช้าสดใส"></div></label>
    <button class="dn-save press" id="dnSave" style="top:${btnTop}px">บันทึกกิจกรรม</button>
    <button class="dn-share press" id="dnShare" style="top:${btnTop}px">${wi('r_share')}แชร์</button>
    <i style="position:absolute;left:0;top:${btnTop + 60}px;height:1px;width:1px"></i>`;
  // dimensions of the icon set (mockup px × 0.381)
  [['r_pin', 21, 26], ['r_clock', 24, 25], ['r_gauge', 27, 22], ['r_shoe', 30, 30], ['r_flame', 25, 33], ['r_bolt', 19, 25], ['r_coins', 20, 25], ['r_doc', 20, 25], ['r_share', 17, 21]]
    .forEach(([n, w, h]) => $$(`img[src*="${n}."]`, pg).forEach(i => { i.style.width = w + 'px'; i.style.height = h + 'px'; }));
  countUp($('#dnK', pg), km, 900, v => v.toFixed(2));
  countUp($('#dnS', pg), steps, 1100, v => fmt(Math.round(v)));
  // ELi celebrates on the painted spot at the top right
  const eli = new Eli(pg, { size: 112, x: 322, y: 158 });
  eli.pose('cheer1');
  (async () => {
    await w8(300); confetti(70); SFX.levelup();
    for (let i = 0; i < 3; i++) { eli.pose(i % 2 ? 'cheer6' : 'cheer1'); await eli.jump(34, 440); await eli.squash(.14, 260); }
    eli.pose('cheer2'); eli.say('ทำได้ดีมาก ดีใจด้วย! 🎉', 2200);
    every(3000, () => { eli.pose('cheer6'); eli.jump(22, 380).then(() => eli.pose('cheer2')); });
  })();
  $('#dnSave', pg).onclick = () => {
    G.today.steps += steps; G.coins += 1; saveG();
    toast(`บันทึก "${$('#dnTitle', pg).value || 'วิ่ง'}" แล้ว · +${lp} Life Power · +1 coin`); go('world');
  };
  $('#dnShare', pg).onclick = () => openSheet(`<h4>แชร์กิจกรรม</h4><button class="opt" data-close>📸 สตอรี่ Instagram</button><button class="opt" data-close>💬 LINE</button><button class="opt" data-close>🔗 คัดลอกลิงก์</button>`, sh => $$('.opt', sh).forEach(o => o.addEventListener('click', () => toast('แชร์แล้ว ✓'))));
};

/* ═════════ Hero Hall (nhh_A) ═════════ */
const HH = {
  week: { top: [['ฟ้า ใส', 1720, 'h_av1'], ['ต้นกล้า', 1640, 'h_av2'], ['มินท์', 1580, 'h_av3']], rows: [['f4', 'แพรว', 1310, 'h_av4'], ['me', 'คุณ', 1121, 'h_av5'], ['f6', 'บอส', 610, 'h_av6'], ['f7', 'นุ่น', 280, 'h_av7']], from: 4 },
  all: { top: [['ต้นกล้า', 48200, 'h_av2'], ['ฟ้า ใส', 46950, 'h_av1'], ['แพรว', 41300, 'h_av4']], rows: [['f3', 'มินท์', 39820, 'h_av3'], ['me', 'คุณ', 35400, 'h_av5'], ['f7', 'นุ่น', 22100, 'h_av7'], ['f6', 'บอส', 18760, 'h_av6']], from: 4 },
};
LIFE.hall = pg => {
  pg.classList.add('w-hall');
  let mode = 'week';
  pg.innerHTML = `<img class="wbg" src="assets/w_hall_bg.webp" alt="">
    <i class="wlogo hh-logo"></i><b class="hh-ttl">Hero Hall</b>
    <div class="hh-seg" id="hhSeg"><i class="ind"></i><button class="on" data-m="week">สัปดาห์นี้</button><button data-m="all">ตลอดกาล</button></div>
    <section class="hh-top rise" id="hhTop"></section>
    <section class="hh-list rise" style="--d:.1s"><div class="hh-lh"><b>อันดับ Life Power</b><span>กดหัวใจส่งพลังใจให้เพื่อน</span></div><div class="hh-rows" id="hhRows"></div></section>`;
  const draw = () => {
    const d = HH[mode], mx = d.top[0][1];
    $('#hhTop', pg).innerHTML = `<b class="t1">Top 3 ${mode === 'week' ? 'แห่งสัปดาห์' : 'ตลอดกาล'}</b><span class="t2">ผู้พิชิต Life Power สูงสุด</span>
      <img class="hh-lr l" src="assets/h_laurl.png" alt=""><img class="hh-lr r" src="assets/h_laurr.png" alt="">
      ${[[1, 0], [2, 1], [3, 2]].map(([n, i]) => `<div class="hh-av a${n}" data-i="${i}"><img src="assets/${d.top[i][2]}.webp" alt=""></div><img class="hh-cr c${n}" src="assets/h_crown${n}.png" alt="">
        <div class="hh-nm n${n}"><b>${d.top[i][0]}</b><em>${fmt(d.top[i][1])} LP</em></div>`).join('')}
      <div class="hh-pd p2">2</div><div class="hh-pd p1">1</div><div class="hh-pd p3">3</div>
      <i class="hh-sp" style="left:56px;top:95px">✦</i><i class="hh-sp" style="left:146px;top:30px;animation-delay:.8s">✦</i><i class="hh-sp" style="left:203px;top:30px;animation-delay:1.4s">✦</i><i class="hh-sp" style="left:325px;top:66px;animation-delay:.4s">✦</i>`;
    $('#hhRows', pg).innerHTML = d.rows.map(([id, nm, lp, av], k) => `<div class="hh-row ${id === 'me' ? 'me' : ''}" style="animation-delay:${k * .06}s" data-id="${id}">
      <span class="rk">${d.from + k}</span><span class="av"><img src="assets/${av}.webp" alt=""></span><span class="nm">${nm}</span>
      <span class="bar"><i data-w="${lp / mx * 100}"></i></span><span class="lp">${fmt(lp)}</span>
      <button class="ht ${id === 'me' ? 'self' : G.today.sentTo[id] ? 'on' : ''}" aria-label="ส่งพลังใจ">${wi(id === 'me' || G.today.sentTo[id] ? 'h_heart1' : 'h_heart0')}</button></div>`).join('') +
      '<button class="hh-inv press" id="hhInv">＋ ชวนเพื่อนมาแข่งใน Hero Hall</button>';
    later(80, () => $$('.hh-row .bar i', pg).forEach(i => i.style.width = i.dataset.w + '%'));
    $$('.hh-av', pg).forEach(a => a.onclick = () => { a.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.12)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 450 }); toast(`${d.top[a.dataset.i][0]} · ${fmt(d.top[a.dataset.i][1])} LP`); });
    $('#hhInv', pg).onclick = () => toast('ส่งลิงก์ชวนเพื่อนแล้ว 💌');
  };
  draw();
  $$('#hhSeg button', pg).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('#hhSeg button', pg).forEach(x => x.classList.toggle('on', x === b)); $('#hhSeg', pg).classList.toggle('all', mode === 'all'); draw(); });
  $('#hhRows', pg).addEventListener('click', e => {
    const b = e.target.closest('.ht'); if (!b || b.classList.contains('self')) return;
    const id = b.closest('.hh-row').dataset.id;
    if (G.today.sentTo[id]) return toast('ส่งพลังใจให้เพื่อนคนนี้แล้ววันนี้ 💙');
    G.today.sentTo[id] = true; const first = !G.today.sent; G.today.sent = true; saveG();
    b.classList.add('on'); b.innerHTML = wi('h_heart1'); SFX.chime(); buzz(20);
    const r = relLocal(b, pg); floatUp(pg, r.x, r.y - 10, '💙', 5);
    toast(first ? 'ส่งพลังใจแล้ว! +10 Life Power ✨' : 'ส่งพลังใจแล้ว 💙');
  });
};

/* ═════════ Treasury (ntr_A) ═════════ */
const SHOPW = {
  orig: [{ id: 'shorts', n: 'กางเกงวิ่ง eli', c: 1200, img: 'p_shorts', nw: 1 }, { id: 'tee', n: 'เสื้อ eli Everyday', c: 900, img: 'p_tee' }, { id: 'cap', n: 'หมวกวิ่ง eli', c: 600, img: 'p_cap' }, { id: 'socks', n: 'ถุงเท้าวิ่ง', c: 300, img: 'p_socks' }],
  fr: [{ id: 'shoe10', n: 'คูปองรองเท้าวิ่ง 10%', c: 500, img: 'i_sneaker', ext: 'webp' }, { id: 'bottle', n: 'ขวดน้ำ Sport', c: 450, img: 'it_bottle', ext: 'webp' }, { id: 'smoothie', n: 'สมูทตี้ฟรี 1 แก้ว', c: 250, img: 'it_gift', ext: 'webp' }, { id: 'gym', n: 'ฟิตเนส 1 เดือน', c: 1500, img: 'it_medal', ext: 'webp' }],
};
const shopItem = id => [...SHOPW.orig, ...SHOPW.fr].find(x => x.id === id);
const pimg = it => `assets/${it.img}.${it.ext || 'webp'}`;
LIFE.treasury = pg => {
  pg.classList.add('w-tr');
  let tab = 'orig';
  const H = appH, cartTop = H - 116;
  pg.innerHTML = `<i class="wlogo tr-logo"></i><b class="tr-ttl">Treasury</b><span class="tr-sub">แลกของรางวัล เพื่อสุขภาพที่ดีกว่า</span>
    <div class="tr-coins coinchip2">${wi('w_coin')}<span><b data-coins>${wcoins()}</b> <small>coins</small></span></div>
    <img class="tr-hero" src="assets/tr_hero.webp" alt="">
    <div class="tr-tabs" id="trTabs"><i class="ind"></i><button class="on" data-t="orig">Eli Originals</button><button data-t="fr">Eli friends</button></div>
    <div class="tr-grid" id="trGrid" style="height:${cartTop - 246}px"></div>
    <button class="tr-cart press" id="trCart" style="top:${cartTop}px"><span class="ci">${wi('tr_cartbar')}<b id="trN">0</b></span><i class="dv"></i><span id="trTxt"></span><i class="ar">→</i></button>`;
  const eli = new Eli(pg, { size: 84, x: 291, y: 180 }); eli.pose('ready1');
  every(3400, () => { eli.pose('cheer2'); eli.jump(18, 360).then(() => eli.pose('ready1')); });
  const cartInfo = () => { const n = G.cart.length, sum = G.cart.reduce((a, id) => a + shopItem(id).c, 0); return { n, sum }; };
  const paintCart = () => { const { n, sum } = cartInfo(); $('#trN', pg).textContent = n; $('#trTxt', pg).textContent = n ? `ตะกร้า ${n} ชิ้น · รวม ${fmt(sum)} coins · ยืนยันการแลก` : 'ตะกร้าว่าง · กด + เพื่อเลือกของรางวัล'; $('#trCart', pg).classList.toggle('empty', !n); };
  const draw = () => {
    $('#trGrid', pg).innerHTML = SHOPW[tab].map((it, k) => `<div class="tr-card" style="animation-delay:${k * .05}s" data-id="${it.id}">
      <div class="pi"><img src="${pimg(it)}" alt=""></div>${it.nw ? '<span class="nw">NEW</span>' : ''}
      <span class="nm">${it.n}</span><span class="pr">${wi('w_coin')}${fmt(it.c)} <small>coins</small></span>
      <button class="add ${G.cart.includes(it.id) ? 'in' : ''}" aria-label="ใส่ตะกร้า">${wi('tr_cart')}</button></div>`).join('');
  };
  draw(); paintCart();
  $$('#trTabs button', pg).forEach(b => b.onclick = () => { tab = b.dataset.t; $$('#trTabs button', pg).forEach(x => x.classList.toggle('on', x === b)); $('#trTabs', pg).classList.toggle('fr', tab === 'fr'); draw(); });
  $('#trGrid', pg).addEventListener('click', e => {
    const b = e.target.closest('.add'); const card = e.target.closest('.tr-card'); if (!card) return;
    const it = shopItem(card.dataset.id);
    if (!b) return openSheet(`<h4>${it.n}</h4><div style="display:grid;place-items:center;padding:6px 0 10px"><img src="${pimg(it)}" style="max-height:150px" alt=""></div><p class="wsheet-p">แลกด้วย <b>${fmt(it.c)} coins</b> · ${tab === 'orig' ? 'สินค้าจากแบรนด์ eli จัดส่งถึงบ้าน' : 'สิทธิพิเศษจากพาร์ทเนอร์ของ eli'}</p><button class="btn btn-o press" data-close id="shAdd">ใส่ตะกร้า</button>`, sh => $('#shAdd', sh).onclick = () => { if (!G.cart.includes(it.id)) { G.cart.push(it.id); saveG(); draw(); paintCart(); } });
    const i = G.cart.indexOf(it.id);
    if (i >= 0) { G.cart.splice(i, 1); b.classList.remove('in'); SFX.pop(); }
    else { G.cart.push(it.id); b.classList.add('in'); SFX.coin(); buzz(12); b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380 }); eli.pose('cheer1'); eli.jump(26, 380).then(() => eli.pose('ready1')); eli.say('ของดีเลย! 🛒', 1100); }
    saveG(); paintCart(); const c = $('#trCart', pg); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  });
  $('#trCart', pg).onclick = () => {
    const { n, sum } = cartInfo(); if (!n) return toast('เลือกของรางวัลก่อนนะ');
    openSheet(`<h4>ยืนยันการแลก</h4>${G.cart.map(id => { const it = shopItem(id); return `<div class="tr-sheet-row"><img src="${pimg(it)}" alt=""><b>${it.n}</b><em>${fmt(it.c)}</em></div>`; }).join('')}
      <div class="tr-sum"><span>รวม</span><b>${fmt(sum)} coins</b></div><div class="tr-sum" style="margin-top:-6px"><span>คงเหลือหลังแลก</span><b style="color:${G.coins - sum < 0 ? '#C42B37' : 'var(--wi)'}">${fmt(G.coins - sum)} coins</b></div>
      <button class="btn btn-o press" id="shOk">ยืนยันการแลก</button><div style="height:8px"></div><button class="btn btn-d press" data-close>เลือกเพิ่ม</button>`, sh => $('#shOk', sh).onclick = () => {
      if (G.coins < sum) { closeSheet(); return toast(`เหรียญไม่พอ ขาดอีก ${fmt(sum - G.coins)} coins`); }
      G.coins -= sum; const order = { items: [...G.cart], sum, code: 'ELI-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase() };
      G.redeemed.unshift(order); G.cart = []; saveG(); closeSheet(); SFX.levelup(); confetti(60); go('redeem', { order });
    });
  };
};

/* ═════════ Redeem (nrd_A) ═════════ */
LIFE.redeem = (pg, opt) => {
  pg.classList.add('w-rd');
  const order = opt.order || G.redeemed[0] || { items: ['shorts'], sum: 1200, code: 'ELI-7F3K-92QD' };
  const it = shopItem(order.items[0]), more = order.items.length - 1, H = appH, okTop = Math.max(H - 52, 560);
  pg.innerHTML = `<img class="wbg" src="assets/w_rd_bg.webp" alt="">
    <button class="rd-back press" data-go="treasury" aria-label="กลับ">${wi('rd_back')}</button><i class="wlogo rd-logo"></i><b class="rd-ttl">แลกของรางวัล</b>
    <section class="rd-pc rise"><div class="th"><img src="${it.id === 'shorts' ? 'assets/rd_shorts.webp' : pimg(it)}" alt=""></div>${wi('rd_check', 'ck')}<span class="ok">แลกสำเร็จแล้ว</span>
      <h3>${it.n}${more ? ` +${more}` : ''}</h3><div class="use">${wi('rd_coin')}ใช้ <b>${fmt(order.sum)}</b> <small>coins</small></div></section>
    <section class="rd-code rise" style="--d:.08s">${wi('rd_rays_l', 'rl')}${wi('rd_rays_r', 'rr')}<div class="pill" id="rdCode">${order.code}</div><button class="cp press" id="rdCp" aria-label="คัดลอกโค้ด">${wi('rd_copy')}</button><p>แสดงโค้ดนี้ หรือใช้เลขสิทธิประโยชน์ที่ร้านค้า</p></section>
    <form class="rd-form rise" style="--d:.14s" id="rdForm" autocomplete="off"><h4>${wi('rd_truck')}กรอกที่อยู่ในการจัดส่ง</h4>
      <label class="rd-f">${wi('rd_user')}<input id="rdN" placeholder="ชื่อ"></label>
      <label class="rd-f">${wi('rd_phone')}<input id="rdP" placeholder="เบอร์โทร" inputmode="tel"></label>
      <label class="rd-f">${wi('rd_pin')}<input id="rdA" placeholder="ที่อยู่"></label>
      <label class="rd-f">${wi('rd_note')}<input id="rdR" placeholder="หมายเหตุ"></label></form>
    <button class="rd-ok press" id="rdOk" style="top:${okTop}px">ยืนยัน</button><i style="position:absolute;top:${okTop + 50}px;height:1px;width:1px"></i>`;
  bindGo(pg);
  $('#rdCp', pg).onclick = async () => { try { await navigator.clipboard.writeText(order.code); toast('คัดลอกโค้ดแล้ว ✓'); } catch (e) { toast(`โค้ด: ${order.code}`); } SFX.pop(); };
  $('#rdForm', pg).onsubmit = e => e.preventDefault();
  $('#rdOk', pg).onclick = () => {
    const n = $('#rdN', pg).value.trim(), p = $('#rdP', pg).value.replace(/\D/g, ''), a = $('#rdA', pg).value.trim();
    const bad = !n ? '#rdN' : p.length < 9 ? '#rdP' : !a ? '#rdA' : null;
    if (bad) { const f = $(bad, pg).closest('.rd-f'); f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 }); $(bad, pg).focus(); return toast(bad === '#rdP' ? 'กรอกเบอร์โทรให้ครบนะ' : 'กรอกข้อมูลให้ครบก่อนนะ'); }
    SFX.levelup(); confetti(50);
    openSheet(`<h4>ยืนยันการจัดส่งแล้ว 🎉</h4><p class="wsheet-p">${it.n} จะส่งถึงคุณ ${n} ภายใน 3–5 วันทำการ<br>โค้ดอ้างอิง <b>${order.code}</b></p><button class="btn btn-o press" id="shBack">กลับไป Treasury</button>`, sh => $('#shBack', sh).onclick = () => { closeSheet(); go('treasury'); });
  };
};

/* ═════════ Settings (ns_A) ═════════ */
LIFE.settings = pg => {
  pg.classList.add('w-set');
  G.set = G.set || { health: true, notif: true, steps: 7000, sleep: 7, unit: 'กม.', lang: 'ไทย' };
  const S = G.set, row = (ic, b, right, sub = '', id = '') => `<div class="st-row" ${id ? `id="${id}"` : ''}><span class="ic">${wi(ic)}</span><div><b>${b}</b>${sub ? `<small>${sub}</small>` : ''}</div>${right}</div>`;
  const tg = (k) => `<i class="st-tg ${S[k] ? 'on' : ''}" data-k="${k}"></i>`, ch = v => `${v ? `<em>${v}</em>` : ''}${wi('st_chev', 'ch')}`;
  pg.innerHTML = `<img class="wbg" src="assets/w_set_bg.webp" alt="">
    <button class="st-back press" data-go="world" aria-label="กลับ">${wi('st_back')}</button><b class="st-ttl">ตั้งค่า</b>
    <section class="st-pf rise" id="stPf"><span class="av"><img src="assets/w_avatar.webp" alt=""></span><span class="bd"><i></i></span><b>${G.citizen.name}</b><span>Eli Citizen ID • ${G.citizen.id}</span>${wi('st_chev', 'ch')}</section>
    <section class="st-g rise" style="top:192px;--d:.04s">${row('st_health', 'เชื่อมต่อ Health', tg('health'), 'Apple Health / Google Fit')}${row('st_bell', 'การแจ้งเตือน', tg('notif'))}</section>
    <section class="st-g rise" style="top:294px;--d:.08s">${row('st_shoe', 'เป้าหมายก้าวต่อวัน', ch(fmt(S.steps)), '', 'stSteps')}${row('st_moon', 'เป้าหมายการนอน', ch(S.sleep + ' ชม.'), '', 'stSleep')}</section>
    <section class="st-g rise" style="top:389px;--d:.12s">${row('st_ruler', 'หน่วยระยะทาง', ch(S.unit), '', 'stUnit')}${row('st_globe', 'ภาษา', ch(S.lang), '', 'stLang')}</section>
    <section class="st-g rise" style="top:480px;--d:.16s">${row('st_lock', 'ความเป็นส่วนตัว', ch(''), '', 'stPriv')}${row('st_help', 'ช่วยเหลือ', ch(''), '', 'stHelp')}</section>
    <button class="st-out press" id="stOut" style="top:${Math.max(584, appH - 70)}px">ออกจากระบบ</button><i style="position:absolute;top:${Math.max(584, appH - 70) + 40}px;height:1px;width:1px"></i>`;
  bindGo(pg);
  $$('.st-row', pg).forEach(r => r.querySelector('.st-tg') && (r.onclick = () => { const t = r.querySelector('.st-tg'); S[t.dataset.k] = !S[t.dataset.k]; t.classList.toggle('on', S[t.dataset.k]); saveG(); SFX.pop(); }));
  const pick = (ttl, key, opts, fmtv = v => v) => openSheet(`<h4>${ttl}</h4>${opts.map(v => `<button class="opt ${S[key] === v ? 'on' : ''}" data-v="${v}">${fmtv(v)}<i class="ck"></i></button>`).join('')}`, sh => $$('.opt', sh).forEach(o => o.onclick = () => { const v = isNaN(+o.dataset.v) ? o.dataset.v : +o.dataset.v; S[key] = v; saveG(); setTimeout(() => { closeSheet(); go('settings', { force: true, dir: 'none' }); }, 200); }));
  $('#stSteps', pg).onclick = () => pick('เป้าหมายก้าวต่อวัน', 'steps', [5000, 7000, 10000], v => fmt(v) + ' ก้าว');
  $('#stSleep', pg).onclick = () => pick('เป้าหมายการนอน', 'sleep', [6, 7, 8], v => v + ' ชม.');
  $('#stUnit', pg).onclick = () => pick('หน่วยระยะทาง', 'unit', ['กม.', 'ไมล์']);
  $('#stLang', pg).onclick = () => pick('ภาษา', 'lang', ['ไทย', 'English']);
  $('#stPriv', pg).onclick = () => openSheet('<h4>ความเป็นส่วนตัว</h4><p class="wsheet-p">ข้อมูลก้าวเดินและการนอนใช้เพื่อคำนวณ Life Power และ Eli Bio-age เท่านั้น คุณเลือกซ่อนอันดับใน Hero Hall ได้ทุกเมื่อ</p><button class="btn btn-d press" data-close>ปิด</button>');
  $('#stHelp', pg).onclick = () => openSheet('<h4>ช่วยเหลือ</h4><p class="wsheet-p">ติดต่อทีม eli ได้ที่ LINE @eliofficial หรือ eliofficialth.store</p><button class="btn btn-d press" data-close>ปิด</button>');
  $('#stPf', pg).onclick = () => $('#whId') ? null : toast(`${G.citizen.name} · ${G.citizen.id}`);
  $('#stOut', pg).onclick = () => { SFX.pop(); go('welcome'); };
};
