/* Eli's World — mini-game "สวนผักน้อง eli" (a cosy Hay Day-style vegetable farm; design gen/farm/farm_mock_raw.png).
   Loop: tap an empty plot → pick a seed → ELi plants it → it grows in real time (keeps growing while the app is closed)
         → water it to halve the time left → tap (or swipe across) ripe plots to harvest → fill market orders → farm XP / level.
   Health twist: watering cans come from today's real steps (every 1,000 steps = 1 can, up to 10 a day).
   ELi = the original drawings only, moved by code. Times are short for the demo (Hay Day uses minutes to hours). */
const CROPS = {
  lettuce: { n: 'ผักกาด', sec: 20, xp: 2, lv: 1 },
  carrot: { n: 'แครอท', sec: 40, xp: 3, lv: 1 },
  tomato: { n: 'มะเขือเทศ', sec: 60, xp: 4, lv: 2 },
  corn: { n: 'ข้าวโพด', sec: 90, xp: 5, lv: 3 },
};
const ORDERS = [
  { n: 'สลัดเพื่อสุขภาพ', need: { lettuce: 2, tomato: 1 }, xp: 30 },
  { n: 'น้ำแครอทสดชื่น', need: { carrot: 3 }, xp: 25 },
  { n: 'ซุปข้าวโพด', need: { corn: 2, carrot: 1 }, xp: 40 },
  { n: 'ผัดผักรวมมิตร', need: { lettuce: 1, carrot: 1, corn: 1 }, xp: 35 },
  { n: 'ซอสมะเขือเทศโฮมเมด', need: { tomato: 3 }, xp: 30 },
  { n: 'แซนด์วิชผักกาด', need: { lettuce: 2 }, xp: 15 },
];
const FARM_PLOTS = [[284, 752], [512, 752], [740, 752], [284, 908], [512, 908], [740, 908]];   // soil centres on the 1024×1536 background (fm_bg); the field
// is wider than a phone shows, so the columns stay inside the always-visible middle (x 157…867)
const FARM_HOME = [612, 1196];                                                                   // ELi's spot on the stone path below the field
const farmLv = xp => Math.floor(xp / 100) + 1;
const farmCans = () => Math.max(0, Math.min(10, Math.floor(G.today.steps / 1000)) - (G.today.water || 0));
const farmState = () => {
  if (!G.farm) {
    const now = Date.now();
    G.farm = { plots: [{ c: 'carrot', t0: now - 41000, dur: 40000 }, { c: 'tomato', t0: now - 61000, dur: 60000 }, { c: 'lettuce', t0: now - 5000, dur: 20000 }, null, null, null],
      basket: { lettuce: 1, carrot: 2, tomato: 0, corn: 0 }, xp: 140, orders: [0, 1, 4] };
    saveG();
  }
  return G.farm;
};

LIFE.farm = pg => {
  pg.classList.add('w-farm');
  const F = farmState(), cv = (x, y) => coverPt(x, y);
  const [, , ck] = cv(0, 0), psz = Math.round(208 * ck);   // plot width follows the background scale
  const ex = (appW - 390) / 2;   // full-screen: the field is wider than the centred column, so plots + effects live in .fm-in (never column-shifted)
  pg.innerHTML = `<img class="wbg" src="assets/fm_bg.webp" alt="">
    <div class="fm-field" id="fmField"><div class="fm-in">${F.plots.map((p, i) => { const [x, y] = cv(...FARM_PLOTS[i]); return `<button class="fm-plot" data-i="${i}" style="left:${x + ex}px;top:${y}px;--ps:${psz}px" aria-label="แปลงผัก ${i + 1}"><img class="soil" src="assets/fm_soil.png" alt=""><img class="crop" alt=""><span class="tm"></span><i class="rp"></i></button>`; }).join('')}</div></div>
    <div class="fm-top">
      <button class="fm-back press" id="fmBack" aria-label="กลับ"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4 1.4-1.4-6-6 6-6z"/></svg></button>
      <div class="fm-ttl"><img class="tt" src="assets/fi_title.png" alt="สวนผักน้อง eli"><span class="lv"><em id="fmLv">Lv.1</em><i class="xp"><i id="fmXp"></i></i></span></div>
      <div class="fm-chips">
        <button class="fm-chip water press" id="fmWaterChip"><img src="assets/fi_drop.png" alt=""><b id="fmCans">0</b><small>จากก้าวเดิน</small></button>
        <button class="fm-chip basket press" id="fmBasketChip"><img src="assets/fi_basket.png" alt=""><b id="fmBasket">0</b></button>
      </div>
    </div>
    <nav class="fm-tools">
      <button class="fm-tool press" id="fmSeeds"><img src="assets/fi_seeds.png" alt=""><span>เมล็ดพันธุ์</span></button>
      <button class="fm-tool press" id="fmWater"><img src="assets/fi_can.png" alt=""><span>รดน้ำ</span></button>
      <button class="fm-tool press" id="fmOrders"><img src="assets/fi_board.png" alt=""><span>ออร์เดอร์</span><i class="dot" id="fmOrdDot"></i></button>
    </nav>`;
  const field = $('#fmField', pg), fx = $('.fm-in', pg), plots = $$('.fm-plot', pg);
  const [hx, hy0] = cv(...FARM_HOME), hy = Math.min(hy0, appH - 128);   // wide screens crop the bottom of the picture: stay above the toolbar
  const eli = new Eli(pg, { size: Math.round(196 * ck), x: hx, y: hy }); eli.pose('ready1');
  let busy = 0;

  /* ── view ── */
  const stage = p => { if (!p) return 'empty'; const f = (Date.now() - p.t0) / p.dur; return f >= 1 ? 'ripe' : f < .12 ? 'seed' : f < .45 ? 'sprout' : 'grow'; };
  const left = p => Math.max(0, Math.ceil((p.t0 + p.dur - Date.now()) / 1000));
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const paintPlot = i => {
    const p = F.plots[i], b = plots[i], st = stage(p), crop = $('.crop', b);
    b.dataset.st = st; b.classList.toggle('wet', !!(p && p.wet));
    $('.soil', b).src = `assets/${p && p.wet ? 'fm_soil_wet' : st === 'seed' ? 'fm_seeded' : 'fm_soil'}.png`;
    const src = st === 'sprout' ? 'fm_sprout' : st === 'grow' ? `fm_${p.c}1` : st === 'ripe' ? `fm_${p.c}2` : '';
    if (src) { if (!crop.src.endsWith(src + '.png')) crop.src = `assets/${src}.png`; crop.hidden = false; } else crop.hidden = true;
    $('.tm', b).textContent = p && st !== 'ripe' ? mmss(left(p)) : '';
  };
  const basketN = () => Object.values(F.basket).reduce((a, b) => a + b, 0);
  const canDeliver = o => Object.entries(ORDERS[o].need).every(([c, n]) => (F.basket[c] || 0) >= n);
  const hud = () => {
    const L = farmLv(F.xp);
    $('#fmLv', pg).textContent = 'Lv.' + L; $('#fmXp', pg).style.width = F.xp % 100 + '%';
    $('#fmCans', pg).textContent = farmCans(); $('#fmBasket', pg).textContent = basketN();
    $('#fmOrdDot', pg).classList.toggle('on', F.orders.some(canDeliver));
  };
  const paint = () => { plots.forEach((_, i) => paintPlot(i)); hud(); };
  paint(); every(500, paint);

  /* ── ELi walks to a plot, does the job, walks home when idle ── */
  let homeT = 0;
  const goTo = async i => {
    clearTimeout(homeT); const [x, y] = cv(...FARM_PLOTS[i]), tx = x - psz * .5, ty = y + psz * .3;
    eli.setFace(tx < eli.x ? -1 : 1); eli.loop(RUNF, 13); await eli.moveTo(tx, ty, Math.min(900, 250 + Math.hypot(tx - eli.x, ty - eli.y) * 2.2)); eli.stop().setFace(1);
  };
  const goHome = () => { clearTimeout(homeT); homeT = setTimeout(async () => { if (busy || cur !== 'farm') return; eli.setFace(hx < eli.x ? -1 : 1); eli.loop(RUNF, 11); await eli.moveTo(hx, hy, 900); eli.stop().setFace(1).pose('ready1'); }, 3500); };
  cleanup.push(() => clearTimeout(homeT));
  const at = i => { const r = relLocal(plots[i], pg); return [r.x, r.y]; };

  /* ── actions ── */
  const plant = async (i, c) => {
    if (F.plots[i]) return;
    F.plots[i] = { c, t0: Date.now(), dur: CROPS[c].sec * 1000 }; saveG(); paintPlot(i);
    busy++; await goTo(i); eli.pose('ready4'); eli.squash(.18, 360); SFX.pop(); buzz(10);
    const [x, y] = at(i); puff(fx, x, y + 6, 4); plots[i].animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.08,.94)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 320 });
    busy--; eli.pose('ready1'); goHome();
  };
  const water = async i => {
    const p = F.plots[i]; if (!p || p.wet || stage(p) === 'ripe') return false;
    if (farmCans() <= 0) { toast('น้ำหมดแล้ว · เดินเพิ่มทุก 1,000 ก้าว ได้น้ำ 1 กระป๋อง 💧'); eli.say('ไปเดินเล่นกันไหม? ได้น้ำมารดผักด้วย', 1800); return false; }
    G.today.water = (G.today.water || 0) + 1;
    const rest = p.t0 + p.dur - Date.now(); p.t0 -= rest / 2; p.wet = true; saveG();
    busy++; await goTo(i); eli.pose('cheer5'); eli.tilt(-10, 500);
    const [x, y] = at(i); floatUp(fx, x, y - psz * .4, '💧', 5); SFX.tone(880, .12, 'sine', .05, 0, .6); SFX.tone(660, .14, 'sine', .04, .08, .7); buzz(12);
    paintPlot(i); hud(); busy--; eli.pose('ready1'); goHome(); return true;
  };
  const harvest = async (i, walk = true) => {
    const p = F.plots[i]; if (!p || stage(p) !== 'ripe') return;
    F.plots[i] = null; F.basket[p.c] = (F.basket[p.c] || 0) + 1; const L0 = farmLv(F.xp); F.xp += CROPS[p.c].xp; saveG();
    const [x, y] = at(i); paintPlot(i);
    burst(fx, x, y - psz * .2, { n: 10, dist: 50, size: 6, colors: ['#F6C343', '#fff', '#7BC86C'], shape: 'star' });
    flyTo(plots[i], $('#fmBasketChip', pg), `<img src="assets/fi_${p.c}.png" style="width:34px;height:34px" alt="">`, 1, () => { hud(); $('#fmBasketChip', pg).animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 300 }); });
    popNum(fx, x, y - psz * .35, `+${CROPS[p.c].xp} XP`, 'gold'); SFX.coin(); buzz(15);
    if (walk) { busy++; await goTo(i); eli.pose('cheer1'); await eli.jump(36, 420); busy--; eli.pose('ready1'); goHome(); }
    if (farmLv(F.xp) > L0) levelUpFarm();
  };
  const levelUpFarm = () => {
    const L = farmLv(F.xp), un = Object.entries(CROPS).filter(([, c]) => c.lv === L).map(([, c]) => c.n);
    SFX.levelup(); buzz([40, 60, 40]); confetti(90); eli.pose('cheer2'); eli.jump(90, 640).then(() => eli.pose('ready1'));
    eli.say(`สวนผักเลเวล ${L}! 🎉`, 2200); toast(`สวนผักเลเวล ${L}${un.length ? ` · ปลดล็อก${un.join(', ')}แล้ว` : ''}`);
  };

  /* ── plots: tap = the obvious action; swipe across ripe plots = harvest them all ── */
  let sweep = false;
  field.addEventListener('pointerdown', e => {
    const b = e.target.closest('.fm-plot'); if (!b) return;
    const i = +b.dataset.i, p = F.plots[i], st = stage(p);
    if (st === 'ripe') { sweep = true; try { field.setPointerCapture(e.pointerId); } catch (x) {} harvest(i); return; }
    if (st === 'empty') return seedSheet(i);
    if (!p.wet && farmCans() > 0) return water(i);
    toast(`${CROPS[p.c].n} · อีก ${mmss(left(p))} ${p.wet ? '(รดน้ำแล้ว)' : farmCans() ? '' : '· เดินเพิ่มเพื่อได้น้ำ'}`); b.animate([{ transform: 'translate(-50%,-50%) rotate(0)' }, { transform: 'translate(-50%,-50%) rotate(-3deg)' }, { transform: 'translate(-50%,-50%) rotate(3deg)' }, { transform: 'translate(-50%,-50%) rotate(0)' }], { duration: 300 });
  });
  field.addEventListener('pointermove', e => {
    if (!sweep) return;
    const b = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fm-plot');
    if (b && stage(F.plots[+b.dataset.i]) === 'ripe') harvest(+b.dataset.i, false);
  });
  ['pointerup', 'pointercancel'].forEach(n => field.addEventListener(n, () => { sweep = false; }));

  /* ── sheets ── */
  const seedSheet = (only = -1) => {
    const L = farmLv(F.xp), empty = F.plots.map((p, i) => p ? -1 : i).filter(i => i >= 0);
    if (!empty.length) return toast('แปลงเต็มแล้ว · เก็บผักที่สุกก่อนนะ');
    openSheet(`<h4 class="fm-h">เลือกเมล็ดพันธุ์</h4><p class="fm-sub">${only >= 0 ? 'ปลูกในแปลงที่เลือก' : `ปลูกในแปลงว่างทั้งหมด ${empty.length} แปลง`}</p>
      <div class="fm-seeds">${Object.entries(CROPS).map(([k, c]) => `<button class="fm-seed ${L < c.lv ? 'lock' : ''}" data-c="${k}"><span class="pk"><img class="bag" src="assets/fi_packet.png" alt=""><img class="veg" src="assets/fi_${k}.png" alt=""></span><b>${c.n}</b><span>${c.sec < 60 ? c.sec + ' วิ' : c.sec / 60 + ' นาที'}</span>${L < c.lv ? `<em>🔒 Lv.${c.lv}</em>` : `<em>+${c.xp} XP</em>`}</button>`).join('')}</div>`, sh => {
      $$('.fm-seed', sh).forEach(b => b.onclick = () => {
        const c = b.dataset.c; if (L < CROPS[c].lv) { SFX.sad(); return toast(`ปลดล็อก${CROPS[c].n}ที่สวนผักเลเวล ${CROPS[c].lv}`); }
        closeSheet(); (only >= 0 ? [only] : empty).forEach((i, k) => later(k * 160, () => plant(i, c)));
      });
    });
  };
  let pick = -1;
  const orderSheet = () => {
    if (!F.orders.includes(pick)) pick = F.orders.find(canDeliver) ?? F.orders[0];
    const card = o => { const O = ORDERS[o], ok = canDeliver(o), cs = Object.keys(O.need);
      return `<button class="fm-ord ${ok ? 'ok' : ''} ${o === pick ? 'on' : ''}" data-o="${o}"><span class="ic">${cs.slice(0, 2).map(c => `<img src="assets/fi_${c}.png" alt="">`).join('')}</span>
        <span class="tx"><b>${O.n}</b><small>${Object.entries(O.need).map(([c, n]) => `<i class="${(F.basket[c] || 0) >= n ? 'have' : ''}">${CROPS[c].n} ${Math.min(F.basket[c] || 0, n)}/${n}</i>`).join(' + ')}</small></span><em>+${O.xp} XP</em></button>`; };
    openSheet(`<h4 class="fm-h">ออร์เดอร์วันนี้</h4>
      <div class="fm-ords">${F.orders.map(card).join('')}</div>
      <div class="fm-inv"><img class="bk" src="assets/fi_basket.png" alt="">${Object.keys(CROPS).map(c => `<span><img src="assets/fi_${c}.png" alt=""><b>x${F.basket[c] || 0}</b></span>`).join('')}</div>
      <button class="fm-send press" id="fmSend" ${canDeliver(pick) ? '' : 'disabled'}>${canDeliver(pick) ? 'ส่งของ' : 'ผักยังไม่ครบ · ไปปลูกเพิ่มกัน'}</button>`, sh => {
      $$('.fm-ord', sh).forEach(b => b.onclick = () => { pick = +b.dataset.o; SFX.pop(); $$('.fm-ord', sh).forEach(x => x.classList.toggle('on', x === b)); const ok = canDeliver(pick), s = $('#fmSend', sh); s.disabled = !ok; s.textContent = ok ? 'ส่งของ' : 'ผักยังไม่ครบ · ไปปลูกเพิ่มกัน'; });
      $('#fmSend', sh).onclick = () => {
        const o = pick, O = ORDERS[o]; if (!canDeliver(o)) return;
        Object.entries(O.need).forEach(([c, n]) => F.basket[c] -= n);
        const L0 = farmLv(F.xp); F.xp += O.xp;
        const pool = ORDERS.map((_, k) => k).filter(k => !F.orders.includes(k)); F.orders[F.orders.indexOf(o)] = pool[Math.random() * pool.length | 0]; pick = -1; saveG();
        SFX.levelup(); buzz([20, 30, 20]); confetti(40);
        const r = relLocal($('#fmSend', sh), $('#app')); popNum($('#app'), r.x, r.y - 30, `+${O.xp} XP`, 'gold');
        eli.pose('cheer2'); eli.jump(60, 520).then(() => eli.pose('ready1')); eli.say('ส่งของสำเร็จ! ลูกค้าชอบมากเลย', 1800);
        hud(); later(450, () => { closeSheet(); later(320, orderSheet); });
        if (farmLv(F.xp) > L0) later(900, levelUpFarm);
      };
    });
  };
  $('#fmSeeds', pg).onclick = () => { SFX.pop(); seedSheet(); };
  $('#fmOrders', pg).onclick = () => { SFX.pop(); orderSheet(); };
  $('#fmWater', pg).onclick = async () => {
    const todo = F.plots.map((p, i) => p && !p.wet && stage(p) !== 'ripe' ? i : -1).filter(i => i >= 0);
    if (!todo.length) return toast('ไม่มีแปลงที่ต้องรดน้ำตอนนี้ 🌱');
    if (!farmCans()) return water(todo[0]);
    for (const i of todo) { if (!farmCans() || cur !== 'farm') break; await water(i); }
  };
  $('#fmWaterChip', pg).onclick = () => openSheet(`<h4>💧 น้ำจากก้าวเดิน</h4><p class="wsheet-p">เดินครบทุก 1,000 ก้าว ได้น้ำ 1 กระป๋อง (สูงสุด 10 กระป๋องต่อวัน) รดแล้วผักโตเร็วขึ้นครึ่งหนึ่ง<br><br>วันนี้เดินแล้ว <b>${fmt(G.today.steps)} ก้าว</b> · ใช้น้ำไปแล้ว ${G.today.water || 0} · เหลือ <b>${farmCans()} กระป๋อง</b></p><button class="btn btn-d press" data-close>เข้าใจแล้ว</button>`);
  $('#fmBasketChip', pg).onclick = orderSheet;
  $('#fmBack', pg).onclick = () => go('world');
  // first visit: ELi explains
  later(700, () => eli.say(F.plots.some(p => stage(p) === 'ripe') ? 'ผักสุกแล้ว! แตะหรือปัดนิ้วเก็บได้เลย' : 'แตะแปลงว่างเพื่อปลูกผักกันเถอะ 🌱', 2600));
  cleanup.push(() => eli.remove());
};
