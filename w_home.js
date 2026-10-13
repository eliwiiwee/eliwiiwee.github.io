/* Eli's World — welcome + home (design/nw_A.png, nh_A.png). ELi = original art only, moved by code. */

/* map a point of a 1024×1536 cover-scaled background to page coordinates */
const coverPt = (rx, ry) => { const k = Math.max(appW / 1024, appH / 1536); return [rx * k + (appW - 1024 * k) / 2 - (appW - 390) / 2, ry * k + (appH - 1536 * k) / 2, k]; };   // in the centred 390-pt column
const w8 = ms => new Promise(r => later(ms, r));

/* ═════════ Welcome (nw_A) ═════════ */
LIFE.welcome = pg => {
  pg.classList.add('w-welcome');
  pg.innerHTML = `<img class="wbg" src="assets/w_welcome_bg.webp" alt="">
    <i class="wlogo wl-logo"></i>
    <h1>welcome to Eli's World</h1>
    <p class="wl-th">โลกเล็กๆ ที่เติบโตไปพร้อมสุขภาพของคุณ</p>
    <div class="wl-dots">${'<i></i>'.repeat(4)}</div>
    <button class="wbtn p press" id="wlGo">เริ่มใช้งาน</button>
    <button class="wbtn s press" id="wlIn">เข้าสู่ระบบ</button>`;
  const [px, py] = coverPt(512, 985);           // top of the painted pedestal
  const eli = new Eli(pg, { size: 178, x: -90, y: py + 4 });
  eli.pose('run1'); eli.setFace(1);
  const dots = $$('.wl-dots i', pg); let d = 0;
  const dot = () => dots.forEach((x, i) => x.classList.toggle('on', i === d % 4));
  dot();
  (async () => {   // runs in, hops onto the pedestal, waves hello
    eli.loop(RUNF, 12); await w8(250);
    await eli.moveTo(px, py + 4, 1300, 'cubic-bezier(.2,.7,.3,1)');
    eli.stop().pose('cheer1'); puff(pg, px - 40, py, 4, 1); await eli.jump(36, 420); await eli.squash(.16, 320);
    eli.pose('ready1'); eli.say("สวัสดี! ยินดีต้อนรับสู่ Eli's World", 2200);
    every(2600, () => { d++; dot(); if (d % 3 === 0) { eli.pose('cheer2'); eli.jump(22, 380).then(() => eli.pose('ready1')); } });
  })();
  pg.insertAdjacentHTML('beforeend', `<i style="position:absolute;left:${px - 70}px;top:${py - 160}px;width:140px;height:160px;z-index:6;cursor:pointer" id="wlHit"></i>`);
  $('#wlHit', pg).onclick = () => { SFX.giggle(); buzz(10); eli.pose('cheer6'); eli.jump(40, 460).then(() => eli.pose('ready1')); eli.say(['ไปเดินเล่นกันเถอะ!', 'วันนี้นอนครบไหม?', 'มาสร้างโลกของเรากัน 🌱'][Math.random() * 3 | 0], 1600); };
  const enter = () => { SFX.pop(); buzz(12); go('world'); };
  $('#wlGo', pg).onclick = enter; $('#wlIn', pg).onclick = enter;
};

/* HUD D helpers: yellow "sparkle tick" stickers, and text fitted to the width it has in the mockup */
const spk = (pos, rot = 0, n = 3, col = '#F6C343') => `<svg class="hd-spk" style="${pos};transform:rotate(${rot}deg)" viewBox="0 0 24 24"><g fill="none" stroke-linecap="round"><path stroke="#fff" stroke-width="7.6" d="${n === 2 ? 'M8 4 9.5 11M16 6 13.5 12' : 'M5 7 8.5 12M12 3v7M19 7l-3.5 5'}"/><path stroke="${col}" stroke-width="4.3" d="${n === 2 ? 'M8 4 9.5 11M16 6 13.5 12' : 'M5 7 8.5 12M12 3v7M19 7l-3.5 5'}"/></g></svg>`;
function hdFit(root) {
  $$('[data-fw]', root).forEach(el => {
    const fw = +el.dataset.fw, r = document.createRange(); let lo = 4, hi = 40;
    r.selectNodeContents(el);
    const w = () => { const b = el.getBoundingClientRect(); return b.width ? r.getBoundingClientRect().width * el.offsetWidth / b.width : 0; };   // content width in layout px (the app may be scaled)
    for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; el.style.fontSize = m + 'px'; if (w() > fw) hi = m; else lo = m; }
    el.style.fontSize = lo.toFixed(2) + 'px';
  });
}

/* ═════════ Eli's World home (HUD D) ═════════ */
LIFE.world = pg => {
  pg.classList.add('w-world');
  const t = G.today, L = LPX.level(G.total), lo = LPX.req(L), hi = LPX.req(L + 1), age = G.citizen.age, bio = bioAge();
  const qDone = (t.steps >= 7000) + (t.sleep >= 7);
  // HUD D (client pick 2026-10-13): sticker-game HUD. Every box below is measured on design/hd_D (1024×1536) → 390 pt:
  // top group = mockup px × .381 + 22 (status bar); bottom group is anchored to the bottom of the screen.
  const K = .381, T = 22, H = appH;
  const at = (x0, y0, x1, y1) => `left:${(x0 * K).toFixed(1)}px;top:${(y0 * K + T).toFixed(1)}px;width:${((x1 - x0) * K).toFixed(1)}px;height:${((y1 - y0) * K).toFixed(1)}px`;
  const ab = (x0, y0, x1, y1) => `left:${(x0 * K).toFixed(1)}px;top:${(H - (1536 - y0) * K).toFixed(1)}px;width:${((x1 - x0) * K).toFixed(1)}px;height:${((y1 - y0) * K).toFixed(1)}px`;
  const tx = (pos, fw, cls, html, id = '') => `<span class="hd-t ${cls}" ${id ? `id="${id}"` : ''} data-fw="${(fw * K).toFixed(1)}" style="${pos}">${html}</span>`;
  pg.innerHTML = `<img class="wbg" src="assets/hdD_bg.webp" alt="">
    <button class="hd-card hd-me press" id="whId" data-go="settings" aria-label="โปรไฟล์และการตั้งค่า" style="${at(150, 102, 492, 236)}"></button>
    <i class="hd-av" style="${at(67, 77, 235, 245)}"><img src="${G.citizen.photo || 'assets/w_avatar.webp'}" alt=""></i>
    <img class="hd-ic hd-avg" src="assets/hd_gear.png" style="${at(186, 186, 246, 246)}" alt="">
    ${tx(at(250, 118, 367, 154), 117, 'nm', G.citizen.name)}
    ${tx(at(250, 160, 339, 178), 89, 'cid', 'ID ' + G.citizen.id)}
    ${tx(at(239, 189, 300, 215), 61, 'lv', 'Lv.' + L)}
    <i class="hd-bar" style="${at(311, 194, 473, 216)}"><i data-w="${(G.total - lo) / (hi - lo) * 100}"></i></i>
    <img class="hd-ic" src="assets/hd_leaf.png" style="${at(436, 82, 502, 150)}" alt="">
    ${spk(at(45, 58, 98, 108), -30)}
    <button class="hd-card hd-coin coinchip2 press" style="${at(738, 115, 960, 212)};--d:.05s" data-go="treasury"></button>
    <img class="hd-ic" src="assets/hd_coin.png" style="${at(750, 122, 833, 205)}" alt="">
    ${tx(at(840, 140, 940, 178), 100, 'coin', `<b data-coins>${wcoins()}</b>`)}
    ${spk(at(714, 118, 754, 170), -70, 2)}
    <button class="hd-card hd-age press" id="whAge" style="${at(537, 250, 960, 395)};--d:.13s"></button>
    <i class="hd-pill green" style="${at(552, 264, 818, 381)}"></i><i class="hd-dv" style="${at(830, 284, 833, 362)}"></i>
    ${tx(at(574, 272, 744, 298), 150, 'agl bio l', 'Eli Bio-age')}
    ${tx(at(574, 302, 806, 374), 196, 'agn bio l', `<em id="whBio">${bio}</em><small>ปี</small>${bio < age ? '<i class="tri"></i>' : ''}`)}
    ${tx(at(842, 288, 948, 312), 92, 'agl sm', 'อายุจริง')}
    ${tx(at(842, 318, 948, 356), 78, 'agn sm', `${age}<small>ปี</small>`)}
    ${spk(at(922, 236, 964, 288), 70, 2, '#3DBE57')}
    <div class="hd-card hd-dqp" style="${ab(36, 1036, 988, 1306)}"></div>
    <img class="hd-ic" src="assets/hd_dq.png" style="${ab(26, 990, 150, 1100)}" alt="">
    ${spk(ab(126, 994, 166, 1036), 25, 2)}
    ${tx(ab(156, 1048, 470, 1086), 262, 'dqh', `Daily Quest <span id="whDqN">${qDone}/2</span>`)}
    ${tx(ab(620, 1052, 962, 1082), 300, 'dqs r', 'ภารกิจประจำวัน 2 อย่าง')}
    <img class="hd-ic" src="assets/hd_shoe.png" style="${ab(50, 1100, 156, 1196)}" alt="">
    ${tx(ab(172, 1108, 420, 1136), 168, 'qh', 'Step quest')}
    ${tx(ab(560, 1104, 962, 1140), 236, 'qn r', `<b id="whS">${fmt(t.steps)}</b> / 7,000 ก้าว`)}
    <i class="hd-bar q ${t.steps >= 7000 ? 'done' : ''}" style="${ab(172, 1152, 962, 1180)}"><i id="whSb" data-w="${Math.min(100, t.steps / 70)}"></i></i>
    <i class="hd-dv" style="${ab(172, 1198, 962, 1200)}"></i>
    <img class="hd-ic" src="assets/hd_sleep.png" style="${ab(48, 1204, 158, 1300)}" alt="">
    ${tx(ab(172, 1212, 520, 1240), 250, 'qh', 'Sleep recovery quest')}
    ${tx(ab(700, 1208, 962, 1244), 150, 'qn r', `<b>${t.sleep}</b> / 7 ชม.`)}
    <i class="hd-bar q ${t.sleep >= 7 ? 'done' : ''}" style="${ab(172, 1256, 962, 1284)}"><i data-w="${Math.min(100, t.sleep / 7 * 100)}"></i></i>
    <button class="hd-hit" id="whDq" style="${ab(36, 1036, 988, 1098)}" aria-label="Daily Quest"></button>
    <button class="hd-hit" data-go="trek" style="${ab(36, 1098, 988, 1199)}" aria-label="Step quest"></button>
    <button class="hd-hit" data-go="dream" style="${ab(36, 1199, 988, 1306)}" aria-label="Sleep recovery quest"></button>`;
  hdFit(pg); document.fonts?.ready.then(() => hdFit(pg));
  // full-screen mode: the top HUD hugs the screen corners (left group → left edge, right group → right edge)
  [...pg.children].forEach(el => { if (el.offsetTop < 190 && !el.classList.contains('wbg')) el.classList.add(el.offsetLeft < 195 ? 'hl' : 'hr'); });
  bindGo(pg);
  later(250, () => $$('[data-w]', pg).forEach(i => i.style.width = i.dataset.w + '%'));
  // ELi lives on the lawn; mood/pose follows the Bio-age (younger = bouncy, older = tired)
  const mood = bio <= age - 2 ? 'fit' : bio >= age + 2 ? 'tired' : 'ok';
  const [cx, cy] = coverPt(520, 900);
  const top = 175, bottom = appH - 200;          // free band between the top HUD and the Daily Quest panel
  const esz = Math.round(Math.max(100, Math.min(158, (bottom - top) * .74)));   // short phones (browser bars showing) → a smaller ELi
  const fy = Math.max(top + esz, Math.min(bottom, cy));
  pg.insertAdjacentHTML('beforeend', `<i class="wh-glow" style="left:${cx}px;top:${fy}px"></i>`);
  const eli = new Eli(pg, { size: esz, x: cx, y: fy });
  const rest = mood === 'tired' ? 'sick' : 'ready1';
  eli.pose(rest);
  const glow = $('.wh-glow', pg);
  let busy = false, petting = false;
  const wander = async () => {
    if (busy || petting || cur !== 'world') return; busy = true;
    const nx = Math.max(90, Math.min(300, cx + (Math.random() - .5) * 170)), ny = Math.max(top + esz, Math.min(bottom, fy + (Math.random() - .5) * 60));
    eli.setFace(nx < eli.x ? -1 : 1);
    if (mood !== 'tired') eli.loop(RUNF, mood === 'fit' ? 12 : 9);
    glow.style.transition = 'left 1.6s ease-in-out, top 1.6s ease-in-out'; glow.style.left = nx + 'px'; glow.style.top = ny + 'px';
    await eli.moveTo(nx, ny, mood === 'tired' ? 2600 : 1600, 'ease-in-out');
    eli.stop().pose(rest);
    if (mood === 'fit' && Math.random() < .5) { eli.pose('cheer1'); await eli.jump(30, 420); eli.pose(rest); }
    busy = false;
  };
  every(mood === 'tired' ? 7000 : 4200, wander);
  later(900, () => eli.say(mood === 'fit' ? `Bio-age ${bio} ปี! วันนี้ฟิตมาก 💪` : mood === 'tired' ? 'เหนื่อยจัง… ไปนอนพักกันไหม' : 'ลูบหัวน้องหน่อยสิ~', 2200));
  // petting: hold & rub ELi for ~2 s → +10 Life Power once a day
  const hit = document.createElement('i'); hit.className = 'pet-hit'; pg.append(hit);
  const place = () => { hit.style.cssText = `left:${eli.x - 70}px;top:${eli.y - 150}px;width:140px;height:150px`; };
  place(); every(200, place);
  let acc = 0, last = null;
  hit.addEventListener('pointerdown', e => { petting = true; last = performance.now(); try { hit.setPointerCapture(e.pointerId); } catch (x) {} eli.stop().pose('cheer5'); SFX.giggle(); });
  hit.addEventListener('pointermove', () => {
    if (!petting) return; const n = performance.now(); acc += Math.min(80, n - last); last = n;
    if (Math.random() < .12) floatUp(pg, eli.x + (Math.random() - .5) * 60, eli.y - 120, '💙', 1);
    if (acc > 2000 && !G.today.pet) { G.today.pet = true; saveG(); SFX.levelup(); buzz([20, 30, 20]); eli.say('ชาร์จพลังใจเต็มแล้ว! +10 Life Power', 2000); burst(pg, eli.x, eli.y - 90, { n: 16, dist: 70, size: 6 }); $('#whBio', pg).textContent = bioAge(); }
  });
  const up = () => { if (!petting) return; petting = false; eli.pose(rest); eli.squash(.12, 320); acc = Math.max(0, acc - 400); };
  hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up); hit.addEventListener('pointerleave', up);
  hit.addEventListener('click', () => { if (acc < 300) { eli.pose('cheer6'); eli.jump(34, 440).then(() => eli.pose(rest)); SFX.pop(); } });
  // 3D: the park tilts with the phone (gyro) or the finger / mouse, ELi turns toward it,
  // and pressing on ELi pushes it back like a soft toy (same original drawing, only turned in space)
  const wbg = $('.wbg', pg), push = { x: 0, y: 0, tx: 0, ty: 0 };
  T3.on(L => { wbg.style.transform = `perspective(1100px) rotateX(${(-L.y * 3).toFixed(2)}deg) rotateY(${(L.x * 4).toFixed(2)}deg) translate(${(-L.x * 6).toFixed(1)}px,${(-L.y * 5).toFixed(1)}px) scale(1.1)`; });
  const aim = e => { const r = hit.getBoundingClientRect(); push.tx = ((e.clientX - r.left) / r.width - .5) * 2; push.ty = ((e.clientY - r.top) / r.height - .5) * 2; };
  hit.addEventListener('pointerdown', aim); hit.addEventListener('pointermove', e => { if (petting) aim(e); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => hit.addEventListener(n, () => { push.tx = push.ty = 0; }));
  T3.eliLean(eli, { amt: 12, push: () => { push.x += (push.tx - push.x) * .18; push.y += (push.ty - push.y) * .18; return push; } });
  // 3D coins wait on the lawn: tap → +1 Eli Coin (up to 5 a day)
  const CAP = 5, coins = [];
  const spot = () => {
    for (let k = 0; k < 30; k++) {
      const x = 50 + Math.random() * 290, y = top + 70 + Math.random() * Math.max(40, bottom - top - 80);
      if (Math.hypot(x - eli.x, y - eli.y + 60) > 90 && coins.every(c => Math.hypot(x - c.x, y - c.y) > 70)) return [x, y];
    }
    return [60 + Math.random() * 270, top + 90];
  };
  const drop = () => {
    if (cur !== 'world' || (G.today.c3 || 0) + coins.length >= CAP || coins.length >= 3) return;
    const [x, y] = spot(), c = T3.coin(pg, { x, y, size: 46, cls: 'pop' });
    c.x = x; c.y = y; coins.push(c);
    c.addEventListener('animationend', () => c.classList.remove('pop'), { once: true });
    c.addEventListener('click', () => {
      if (c.classList.contains('got')) return;
      c.classList.add('got'); coins.splice(coins.indexOf(c), 1);
      G.today.c3 = (G.today.c3 || 0) + 1; saveG(); buzz(12);
      popNum(pg, x, y - 44, '+1', 'gold');
      burst(pg, x, y - 30, { n: 16, dist: 60, size: 6, colors: ['#F2C14E', '#FFE59A', '#fff'], shape: 'star' });
      later(380, () => giveCoins(1, 'เก็บเหรียญในสวน', c));   // the coins fly to the counter from the top of the jump
      if (!busy && !petting) { eli.setFace(x < eli.x ? -1 : 1); eli.pose('cheer1'); eli.jump(26, 380).then(() => eli.pose(rest)); }
      if (G.today.c3 >= CAP) eli.say('เก็บครบแล้ววันนี้! พรุ่งนี้มาใหม่นะ', 1800);
      later(800, () => c.remove());
      later(5000, drop);
    });
  };
  later(1100, drop); later(1500, drop); later(1900, drop);
  // coins in front of / behind ELi depending on who is nearer
  T3.on(() => coins.forEach(c => c.classList.toggle('front', c.y > eli.y)));
  // cards
  $('#whDq', pg).onclick = () => openSheet(`<h4>Daily Quest ${qDone}/2</h4>
    <div class="wq-row ${t.steps >= 7000 ? 'ok' : ''}">${wi('w_shoe')}<div><b>Step quest</b><span>เดินครบ 7,000 ก้าว · ตอนนี้ ${fmt(t.steps)}</span></div><em>+1 coin</em></div>
    <div class="wq-row ${t.sleep >= 7 ? 'ok' : ''}">${wi('w_moonz')}<div><b>Sleep recovery quest</b><span>นอน 7–9 ชม. · เมื่อคืน ${t.sleep} ชม.</span></div><em>+1 coin</em></div>
    <button class="btn btn-d press" data-close>ปิด</button>`);
  $('#whAge', pg).onclick = () => openSheet(`<h4>Eli Bio-age ${bio} ปี</h4><p class="wsheet-p">อายุสุขภาพคำนวณจากการเดิน การนอน และการดูแลน้องวันนี้ ${bio < age ? `ตอนนี้ร่างกายคุณ <b>อ่อนกว่าอายุจริง ${age - bio} ปี</b> เยี่ยมมาก!` : bio > age ? `ตอนนี้ <b>มากกว่าอายุจริง ${bio - age} ปี</b> ลองเดินให้ครบและนอนให้พอนะ` : 'เท่ากับอายุจริงพอดี'}<br><br>ท่าทางของน้อง eli จะเปลี่ยนตาม Bio-age: ยิ่งฟิต น้องยิ่งกระโดดโลดเต้น</p><button class="btn btn-d press" data-close>เข้าใจแล้ว</button>`);
};
