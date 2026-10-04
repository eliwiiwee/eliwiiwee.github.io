/* Eli's World — welcome + home (design/nw_A.png, nh_A.png). ELi = original art only, moved by code. */

/* map a point of a 1024×1536 cover-scaled background to page coordinates */
const coverPt = (rx, ry) => { const k = Math.max(390 / 1024, appH / 1536); return [rx * k + (390 - 1024 * k) / 2, ry * k + (appH - 1536 * k) / 2, k]; };
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

/* ═════════ Eli's World home (nh_A) ═════════ */
LIFE.world = pg => {
  pg.classList.add('w-world');
  const t = G.today, L = LPX.level(G.total), lo = LPX.req(L), hi = LPX.req(L + 1), age = G.citizen.age, bio = bioAge();
  const qDone = (t.steps >= 7000) + (t.sleep >= 7);
  pg.innerHTML = `<img class="wbg" src="assets/w_park.webp" alt="">
    <div class="wcard wh-id rise" id="whId"><i class="wlogo"></i><i class="dv"></i><img class="av" src="assets/w_avatar.webp" alt="">
      <div class="nm">${G.citizen.name}${wi('w_tick')}</div><div class="cid">${G.citizen.id}</div><div class="lv">Lv.${L}</div><div class="lb"><i data-w="${(G.total - lo) / (hi - lo) * 100}"></i></div></div>
    <button class="wcard wh-coin coinchip2 press rise" style="--d:.05s" data-go="treasury">${wi('w_coin')}<b data-coins>${wcoins()}</b></button>
    <button class="wcard wh-gear press rise" style="--d:.08s" data-go="settings" aria-label="ตั้งค่า">${wi('w_gear')}</button>
    <button class="wcard wh-dq press rise" style="--d:.1s" id="whDq">${wi('w_target', 't')}Daily Quest <span id="whDqN">${qDone}/2</span>${wi('w_chev', 'c')}</button>
    <button class="wcard wh-age press rise" style="--d:.13s" id="whAge"><div><span>อายุจริง</span><b>${age}<small>ปี</small></b></div><div><span>Eli Bio-age</span><b><em id="whBio" style="font-style:normal">${bio}</em><small>ปี</small>${bio < age ? wi('w_down') : ''}</b></div></button>
    <button class="wcard wh-sync press rise" style="--d:.2s" id="whSync">${wi('w_link', 'l')}<span>Sync ก้าวเดิน Real-time จาก Health · <b id="whSt">${fmt(t.steps)}</b> ก้าว</span>${wi('w_chev', 'c')}</button>
    <div class="wcard wh-q s1 rise ${t.steps >= 7000 ? 'done' : ''}" style="--d:.24s" data-go="trek">${wi('w_shoe')}<span>Step quest</span><b><em style="font-style:normal" id="whS">${fmt(t.steps)}</em> <small>/ 7,000 ก้าว</small></b><div class="qb"><i id="whSb" data-w="${Math.min(100, t.steps / 70)}"></i></div></div>
    <div class="wcard wh-q s2 rise ${t.sleep >= 7 ? 'done' : ''}" style="--d:.28s" data-go="dream">${wi('w_moonz')}<span>Sleep recovery quest</span><b>${t.sleep} <small>/ 7 ชม.</small></b><div class="qb"><i data-w="${Math.min(100, t.sleep / 7 * 100)}"></i></div></div>
    <div class="wcard wh-sl rise" style="--d:.32s" data-go="dream">${wi('w_bed', 'b')}<span>ตรวจพบการนอนล่าสุด<b>23:40–06:10</b></span>${wi('w_chev', 'c')}</div>`;
  bindGo(pg);
  later(250, () => $$('[data-w]', pg).forEach(i => i.style.width = i.dataset.w + '%'));
  // ELi lives on the lawn; mood/pose follows the Bio-age (younger = bouncy, older = tired)
  const mood = bio <= age - 2 ? 'fit' : bio >= age + 2 ? 'tired' : 'ok';
  const [cx, cy] = coverPt(518, 790);
  const top = 190, bottom = appH - 205;          // free band between the top cards and the quest cards
  const fy = Math.max(top + 150, Math.min(bottom, cy));
  pg.insertAdjacentHTML('beforeend', `<i class="wh-glow" style="left:${cx}px;top:${fy}px"></i>`);
  const eli = new Eli(pg, { size: 158, x: cx, y: fy });
  const rest = mood === 'tired' ? 'sick' : 'ready1';
  eli.pose(rest);
  const glow = $('.wh-glow', pg);
  let busy = false, petting = false;
  const wander = async () => {
    if (busy || petting || cur !== 'world') return; busy = true;
    const nx = Math.max(90, Math.min(300, cx + (Math.random() - .5) * 170)), ny = Math.max(top + 150, Math.min(bottom, fy + (Math.random() - .5) * 60));
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
  // cards
  $('#whId', pg).onclick = () => openSheet(`<h4>Eli Citizen ID</h4><div class="wid-card"><img src="assets/w_avatar.webp" alt=""><div><b>${G.citizen.name}</b><span>${G.citizen.id}</span><span>Lv.${L} · ${LPX.tier(L).name}</span><span>${fmt(G.total)} / ${fmt(hi)} LP</span></div></div><button class="btn btn-d press" data-close>ปิด</button>`);
  $('#whDq', pg).onclick = () => openSheet(`<h4>Daily Quest ${qDone}/2</h4>
    <div class="wq-row ${t.steps >= 7000 ? 'ok' : ''}">${wi('w_shoe')}<div><b>Step quest</b><span>เดินครบ 7,000 ก้าว · ตอนนี้ ${fmt(t.steps)}</span></div><em>+1 coin</em></div>
    <div class="wq-row ${t.sleep >= 7 ? 'ok' : ''}">${wi('w_moonz')}<div><b>Sleep recovery quest</b><span>นอน 7–9 ชม. · เมื่อคืน ${t.sleep} ชม.</span></div><em>+1 coin</em></div>
    <button class="btn btn-d press" data-close>ปิด</button>`);
  $('#whAge', pg).onclick = () => openSheet(`<h4>Eli Bio-age ${bio} ปี</h4><p class="wsheet-p">อายุสุขภาพคำนวณจากการเดิน การนอน และการดูแลน้องวันนี้ ${bio < age ? `ตอนนี้ร่างกายคุณ <b>อ่อนกว่าอายุจริง ${age - bio} ปี</b> เยี่ยมมาก!` : bio > age ? `ตอนนี้ <b>มากกว่าอายุจริง ${bio - age} ปี</b> ลองเดินให้ครบและนอนให้พอนะ` : 'เท่ากับอายุจริงพอดี'}<br><br>ท่าทางของน้อง eli จะเปลี่ยนตาม Bio-age: ยิ่งฟิต น้องยิ่งกระโดดโลดเต้น</p><button class="btn btn-d press" data-close>เข้าใจแล้ว</button>`);
  $('#whSync', pg).onclick = () => {
    const b = $('#whSync', pg); if (b.classList.contains('busy')) return; b.classList.add('busy');
    later(900, () => {
      b.classList.remove('busy'); const add = 600 + Math.round(Math.random() * 900), was = G.today.steps;
      G.today.steps += add; saveG(); SFX.chime();
      $('#whS', pg).textContent = fmt(G.today.steps); $('#whSt', pg).textContent = fmt(G.today.steps);
      $('#whSb', pg).style.width = Math.min(100, G.today.steps / 70) + '%';
      $('#whBio', pg).textContent = bioAge();
      eli.say(`+${fmt(add)} ก้าว! 👟`, 1400); eli.pose('cheer1'); eli.jump(26, 380).then(() => eli.pose(rest));
      if (was < 7000 && G.today.steps >= 7000) { giveCoins(1, 'walk', $('.wh-q.s1', pg)); $('.wh-q.s1', pg).classList.add('done'); toast('🎉 Step quest สำเร็จ! +1 coin'); $('#whDqN', pg).textContent = `${(G.today.steps >= 7000) + (G.today.sleep >= 7)}/2`; }
    });
  };
};
