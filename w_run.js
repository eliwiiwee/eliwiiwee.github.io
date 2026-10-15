/* Eli's World — mini-game "ELi Run" (a Cookie Run-style side-scrolling auto-runner; design gen/run/run_mock_raw.png).
   ELi runs by itself: jump (double jump in the air) over cones, hurdles and pits, slide under hanging signs, collect water-drop jellies
   and fruit. The energy bar drains all the time — fruit and water bottles refill it; a hit costs energy, a pit ends the run.
   Health twist: 7,000+ steps today = start with a shield that saves you from one hit or one fall.
   ELi = the original drawings only (run / happy / sick), moved by code. Drawn on a canvas for a smooth 60 fps. */
const RUNG = {
  IMG: ['rn_bg', 'rn_ground', 'rn_cone', 'rn_hurdle', 'rn_hurdle2', 'rn_sign', 'rn_drop', 'rn_apple', 'rn_banana', 'rn_bottle', 'rn_star', 'rn_shield', 'eli_run', 'eli_happy', 'eli_sick'],
  img: {},
  load() { return Promise.all(this.IMG.map(n => this.img[n] ? 1 : new Promise(r => { const i = new Image(); i.onload = () => { this.img[n] = i; r(); }; i.onerror = r; i.src = `assets/${n}.${/^(rn_bg|rn_ground|eli_)/.test(n) ? 'webp' : 'png'}`; }))); },
};
LIFE.erun = pg => {
  pg.classList.add('w-run');
  const W = appW, H = appH, GY = Math.round(H * .74), EX = Math.round(Math.min(W, 390) * .24 + (W - Math.min(W, 390)) / 2), ES = 92;
  const shieldOk = G.today.steps >= 7000;
  pg.innerHTML = `<canvas class="rn-cv" id="rnCv"></canvas>
    <div class="rn-hud" id="rnHud">
      <div class="rn-en"><img src="assets/rn_heart.png" alt=""><span class="lb">ENERGY</span><i class="bar"><i id="rnEn"></i></i></div>
      <div class="rn-sc"><b id="rnScore">0</b><span><img src="assets/rn_drop.png" alt=""><em id="rnJelly">0</em></span></div>
      <button class="rn-pause press" id="rnPause" aria-label="หยุดเกม"><i></i><i></i></button>
      <i class="rn-shd" id="rnShd" hidden><img src="assets/rn_shield.png" alt=""></i>
    </div>
    <button class="rn-btn jump" id="rnJump" aria-label="กระโดด"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.5 4.5 11h4.6v9.5h5.8V11h4.6z"/></svg><span>กระโดด</span></button>
    <button class="rn-btn slide" id="rnSlide" aria-label="สไลด์"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 20.5 19.5 13h-4.6V3.5H9.1V13H4.5z"/></svg><span>สไลด์</span></button>
    <div class="rn-ov rn-start" id="rnStart">
      <img class="ttl" src="assets/rn_title.png" alt="ELi Run">
      <div class="best"><span>สถิติสูงสุด</span><b>${fmt(G.runBest || 0)}</b></div>
      <div class="boost ${shieldOk ? 'on' : ''}"><img src="assets/rn_shield.png" alt=""><span>${shieldOk ? 'เดินครบ 7,000 ก้าววันนี้ ได้โล่กันชน 1 ครั้ง!' : `เดินครบ 7,000 ก้าว ได้โล่กันชน 1 ครั้ง (วันนี้ ${fmt(G.today.steps)})`}</span></div>
      <button class="rn-go press" id="rnGo"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.8v14.4c0 .9 1 1.4 1.7.9l11.2-7.2c.7-.4.7-1.4 0-1.8L8.7 3.9C8 3.4 7 3.9 7 4.8z"/></svg><span>เริ่มวิ่ง</span></button>
      <button class="rn-back" id="rnBack">กลับ</button>
    </div>
    <div class="rn-ov rn-end" id="rnEnd" hidden></div>`;
  const cv = $('#rnCv', pg), cx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cx.scale(dpr, dpr);
  const I = RUNG.img;

  /* ── state ── */
  let S, raf = 0, last = 0, alive = false, paused = false;
  const reset = () => {
    S = { t: 0, speed: 270, dist: 0, score: 0, jelly: 0, energy: 100, y: GY, vy: 0, air: false, jumps: 0, slide: false, hurt: 0, shield: shieldOk, land: 0,
      ground: [[-200, W + 600]], items: [], fx: [], next: W + 200, bgx: 0 };
  };
  reset();
  const onGround = x => S.ground.some(([a, b]) => x >= a && x <= b);
  /* ── level chunks: placed ahead of the screen as the world scrolls ── */
  const JH = 46;   // jelly height above the ground
  const chunk = () => {
    const x = S.next, r = Math.random(), lv = Math.min(1, S.t / 90), gap = 150 + S.speed * .45;
    const jellyRow = (x0, n, y = GY - JH, dx = 34) => { for (let i = 0; i < n; i++) S.items.push({ k: 'rn_drop', x: x0 + i * dx, y, w: 26, h: 30, pick: 'jelly' }); };
    const arc = (x0, n, h) => { for (let i = 0; i < n; i++) { const f = i / (n - 1); S.items.push({ k: 'rn_drop', x: x0 + i * 34, y: GY - JH - Math.sin(f * Math.PI) * h, w: 26, h: 30, pick: 'jelly' }); } };
    let len;
    if (r < .22) { len = 260; jellyRow(x + 20, 7); }
    else if (r < .40) { len = 300; S.items.push({ k: 'rn_cone', x: x + 150, y: GY, w: 36, h: 46, hit: 1 }); arc(x + 60, 7, 130); }
    else if (r < .55) { len = 320; S.items.push({ k: 'rn_hurdle', x: x + 160, y: GY, w: 78, h: 54, hit: 1 }); arc(x + 70, 7, 140); }
    else if (r < .66 && lv > .2) { len = 380; S.items.push({ k: 'rn_hurdle2', x: x + 190, y: GY, w: 92, h: 110, hit: 1 }); arc(x + 80, 9, 230); }
    else if (r < .80) { len = 320; S.items.push({ k: 'rn_sign', x: x + 160, y: GY - 62, w: 104, h: 130, hit: 1, top: true }); jellyRow(x + 60, 7, GY - 22); }
    else { const pw = Math.round(110 + lv * 70); len = 260 + pw; S.ground[S.ground.length - 1][1] = x + 90; S.ground.push([x + 90 + pw, x + len + 2000]); arc(x + 50, 8, 150); }
    if (Math.random() < .36) { const r2 = Math.random(), k = r2 < .4 ? 'rn_apple' : r2 < .75 ? 'rn_banana' : 'rn_bottle'; S.items.push({ k, x: x + len - 40, y: GY - JH - 70, w: 34, h: k === 'rn_bottle' ? 46 : 36, pick: k }); }
    S.next = x + len + gap * (Math.random() * .4 + .4);
    const g = S.ground[S.ground.length - 1]; if (g[1] < S.next + 400) g[1] = S.next + 2000;
  };
  /* ── input ── */
  const jump = () => {
    if (!alive || paused) return;
    if (!S.air) { S.vy = -880; S.air = true; S.jumps = 1; S.slide = false; SFX.tone(660, .1, 'triangle', .05, 0, 1.6); buzz(8); }
    else if (S.jumps < 2) { S.vy = -800; S.jumps = 2; SFX.tone(880, .1, 'triangle', .05, 0, 1.6); buzz(8); spark(EX, S.y - 10, '#fff', 6); }
  };
  const slide = on => { if (!alive || paused) return; S.slide = on && !S.air; if (on && S.air) S.vy = Math.max(S.vy, 900); };
  const jb = $('#rnJump', pg), sb = $('#rnSlide', pg);
  jb.addEventListener('pointerdown', e => { e.preventDefault(); jb.classList.add('on'); jump(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => jb.addEventListener(n, () => jb.classList.remove('on')));
  sb.addEventListener('pointerdown', e => { e.preventDefault(); sb.classList.add('on'); slide(true); try { sb.setPointerCapture(e.pointerId); } catch (x) {} });
  ['pointerup', 'pointercancel'].forEach(n => sb.addEventListener(n, () => { sb.classList.remove('on'); slide(false); }));
  const key = e => {
    if (cur !== 'erun') return;
    if (e.type === 'keydown' && (e.code === 'Space' || e.code === 'ArrowUp')) { e.preventDefault(); if (!e.repeat) jump(); }
    if (e.code === 'ArrowDown') { e.preventDefault(); slide(e.type === 'keydown'); }
  };
  addEventListener('keydown', key); addEventListener('keyup', key);
  cleanup.push(() => { removeEventListener('keydown', key); removeEventListener('keyup', key); cancelAnimationFrame(raf); });

  /* ── effects ── */
  const spark = (x, y, c, n = 5) => { for (let i = 0; i < n; i++) S.fx.push({ x, y, vx: (Math.random() - .5) * 220, vy: -Math.random() * 220, t: 0, life: .5, c }); };
  const floatTxt = (x, y, txt, c = '#fff') => S.fx.push({ x, y, vx: 0, vy: -60, t: 0, life: .8, txt, c });
  const hurt = (dmg, why) => {
    if (S.hurt > 0) return;
    if (S.shield) { S.shield = false; S.hurt = 1.2; $('#rnShd', pg).hidden = true; SFX.tone(520, .25, 'sine', .06, 0, 1.5); floatTxt(EX, S.y - ES, 'โล่ช่วยไว้!', '#7FD3FF'); return 'shield'; }
    S.energy -= dmg; S.hurt = 1.2; SFX.sad(); buzz([30, 30, 30]); floatTxt(EX, S.y - ES, `−${dmg}`, '#FF6B6B');
    pg.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 220 });
  };

  /* ── simulation ── */
  const step = dt => {
    S.t += dt; S.speed = Math.min(560, 270 + S.t * 6); const dx = S.speed * dt;
    S.dist += dx; S.bgx += dx; S.score += dx * .1;
    S.energy -= dt * (1.5 + S.t / 90);   // drains a little faster the longer you run
    S.hurt = Math.max(0, S.hurt - dt); S.land = Math.max(0, S.land - dt);
    // world scroll
    S.ground.forEach(g => { g[0] -= dx; g[1] -= dx; }); S.ground = S.ground.filter(g => g[1] > -100);
    S.items.forEach(o => o.x -= dx); S.items = S.items.filter(o => o.x > -150 && !o.gone);
    S.next -= dx; while (S.next < W + 300) chunk();
    // ELi physics
    const supported = onGround(EX);
    if (S.air || !supported) {
      S.vy += 2700 * dt; S.y += S.vy * dt; S.air = true;
      if (S.vy > 0 && S.y >= GY && onGround(EX) && S.y - S.vy * dt <= GY + 4) { S.y = GY; S.vy = 0; S.air = false; S.jumps = 0; S.land = .18; }
    }
    if (S.y > H + 80) {   // fell into a pit
      if (hurt(0) === 'shield') { S.y = GY - 260; S.vy = -300; S.air = true; S.jumps = 1; const g = S.ground.find(g => g[0] > EX); if (g) S.ground.unshift([EX - 60, g[0] + 10]); }
      else return over('ตกหลุม');
    }
    // collisions
    const eh = S.slide ? ES * .5 : ES * .86, box = { l: EX - ES * .32, r: EX + ES * .32, t: S.y - eh, b: S.y - 4 };
    for (const o of S.items) {
      const ob = o.top ? { l: o.x - o.w / 2, r: o.x + o.w / 2, t: o.y - o.h, b: o.y + 8 } : { l: o.x - o.w / 2, r: o.x + o.w / 2, t: o.y - o.h, b: o.y };
      if (box.r < ob.l || box.l > ob.r || box.b < ob.t || box.t > ob.b) continue;
      if (o.pick) {
        o.gone = true;
        if (o.pick === 'jelly') { S.jelly++; S.score += 10; spark(o.x, o.y - 14, '#7FD3FF', 3); if (S.jelly % 3 === 0) SFX.tone(1318 + (S.jelly % 9) * 40, .06, 'sine', .03); }
        else { const add = o.pick === 'rn_bottle' ? 25 : 12; S.energy = Math.min(100, S.energy + add); S.score += 50; floatTxt(o.x, o.y - 30, `+${add} พลัง`, '#7BE07B'); SFX.chime(); buzz(10); }
      } else if (o.hit && !o.done) { o.done = true; hurt(15); }
    }
    for (const p of S.fx) { p.t += dt; p.x += (p.vx - S.speed * .2) * dt; p.y += p.vy * dt; if (!p.txt) p.vy += 600 * dt; }
    S.fx = S.fx.filter(p => p.t < p.life);
    if (S.energy <= 0) { S.energy = 0; return over('พลังหมด'); }
  };

  /* ── drawing ── */
  const tile = (im, off, y, h, k) => { if (!im) return; const w = im.width * h / im.height; let x = -((off * k) % (w * 2)); for (let n = 0; x < W; n++, x += w) { cx.save(); if (n % 2) { cx.translate(x + w, 0); cx.scale(-1, 1); cx.drawImage(im, 0, y, w, h); } else cx.drawImage(im, x, y, w, h); cx.restore(); } };
  const draw = () => {
    cx.clearRect(0, 0, W, H);
    // sky + far park (mirror-tiled so the seams match), slow parallax
    if (I.rn_bg) tile(I.rn_bg, S.bgx, 0, GY + 30, .18); else { cx.fillStyle = '#BFE6FF'; cx.fillRect(0, 0, W, H); }
    // the river shows through the pits (as in the design)
    const wg = cx.createLinearGradient(0, GY, 0, H); wg.addColorStop(0, '#5CC0EE'); wg.addColorStop(1, '#2D74C4'); cx.fillStyle = wg; cx.fillRect(0, GY + 10, W, H - GY);
    cx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 6; i++) { const x = ((i * 97 - S.bgx * .6) % (W + 60) + W + 60) % (W + 60) - 30; cx.fillRect(x, GY + 40 + (i % 3) * 46, 26, 3); }
    // ground platforms
    const gh = H - GY + 10;
    for (const [a, b] of S.ground) {
      const l = Math.max(a, -10), r = Math.min(b, W + 10); if (r <= l) continue;
      cx.save(); cx.beginPath(); cx.rect(l, GY - 18, r - l, gh + 20); cx.clip();
      if (I.rn_ground) { const im = I.rn_ground, th = gh + 22, tw = im.width * th / im.height; for (let x = a - ((a % tw) + tw) % tw - tw; x < r; x += tw) if (x + tw > l) cx.drawImage(im, x, GY - 18, tw, th); }
      else { cx.fillStyle = '#7CC456'; cx.fillRect(l, GY - 8, r - l, 16); cx.fillStyle = '#B07A45'; cx.fillRect(l, GY + 8, r - l, gh); }
      cx.restore();
    }
    // items
    const bob = Math.sin(S.t * 6) * 3;
    for (const o of S.items) {
      const im = I[o.k], y = o.pick ? o.y + bob : o.y;
      if (im) {
        const h = o.h * (o.pick ? 1 : 1.1), w = im.width * h / im.height, top = o.top ? o.y - o.h : y - h;
        if (o.top) { cx.strokeStyle = '#A0743F'; cx.lineWidth = 3; cx.beginPath(); [.4, .64].forEach(f => { cx.moveTo(o.x - w / 2 + w * f, 0); cx.lineTo(o.x - w / 2 + w * f, top + 6); }); cx.stroke(); }   // ropes up to the top of the screen
        cx.drawImage(im, o.x - w / 2, top, w, h);
      }
      else { cx.fillStyle = o.pick ? '#4FB6FF' : '#F28C28'; cx.fillRect(o.x - o.w / 2, o.top ? o.y - o.h : y - o.h, o.w, o.h); }
    }
    // ELi: run = hop cycle, air = tilt, slide = squash, hurt = sick face + blink
    const im = S.hurt > .8 ? I.eli_sick : S.air && S.vy < 0 ? I.eli_happy : I.eli_run;
    if (im && !(S.hurt > 0 && Math.floor(S.t * 14) % 2)) {
      const hop = S.air ? 0 : Math.abs(Math.sin(S.t * 13)) * 7, sq = S.slide ? [1.25, .55] : S.land > 0 ? [1.15, .86] : [1, 1];
      const w = ES * (im.width / im.height) * sq[0], h = ES * sq[1], rot = S.air ? Math.max(-.35, Math.min(.35, S.vy / 2400)) : S.slide ? .08 : Math.sin(S.t * 13) * .04;
      cx.save(); cx.globalAlpha = .25; cx.fillStyle = '#1B3A1B'; cx.beginPath(); cx.ellipse(EX, GY + 2, ES * .34 * (S.air ? Math.max(.4, 1 - (GY - S.y) / 400) : 1), 7, 0, 0, 7); if (onGround(EX)) cx.fill(); cx.restore();
      cx.save(); cx.translate(EX, S.y - hop); cx.rotate(rot); cx.drawImage(im, -w / 2, -h, w, h); cx.restore();
      if (S.shield) { cx.save(); cx.globalAlpha = .35 + Math.sin(S.t * 5) * .1; cx.strokeStyle = '#7FD3FF'; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(EX, S.y - h / 2 - hop, w * .62, h * .62, 0, 0, 7); cx.stroke(); cx.restore(); }
    }
    for (const p of S.fx) {
      const a = 1 - p.t / p.life; cx.save(); cx.globalAlpha = a;
      if (p.txt) { cx.font = '800 18px "Comfortaa","Noto Sans Thai",sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(20,30,70,.85)'; cx.strokeText(p.txt, p.x, p.y); cx.fillStyle = p.c; cx.fillText(p.txt, p.x, p.y); }
      else { cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, 4 * a + 1, 0, 7); cx.fill(); }
      cx.restore();
    }
  };
  const hud = () => {
    $('#rnEn', pg).style.width = Math.max(0, S.energy) + '%';
    $('#rnEn', pg).style.background = S.energy > 50 ? 'linear-gradient(90deg,#5FD068,#9BE35A)' : S.energy > 25 ? 'linear-gradient(90deg,#F6C343,#F2A23A)' : 'linear-gradient(90deg,#E8453C,#F27A5A)';
    $('#rnScore', pg).textContent = fmt(Math.floor(S.score)); $('#rnJelly', pg).textContent = S.jelly;
  };
  const frame = t => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, (t - (last || t)) / 1000); last = t;
    if (alive && !paused) { step(dt); hud(); }
    draw();
  };
  window.__erun = { step: (dt = 1 / 60, n = 1) => { for (let i = 0; i < n && alive; i++) step(dt); hud(); draw(); return S; }, jump, slide, get S() { return S; } };   // test hook

  /* ── start / pause / end ── */
  const start = () => {
    reset(); alive = true; paused = false; $('#rnStart', pg).hidden = true; $('#rnEnd', pg).hidden = true; $('#rnShd', pg).hidden = !S.shield;
    pg.classList.add('playing'); SFX.levelup(); buzz([20, 30, 20]); last = 0;
  };
  const over = why => {
    alive = false; pg.classList.remove('playing');
    const score = Math.floor(S.score), best = G.runBest || 0, rec = score > best, m = Math.floor(S.dist / 10);
    if (rec) { G.runBest = score; saveG(); }
    const stars = score >= 6000 ? 3 : score >= 2500 ? 2 : score >= 800 ? 1 : 0;
    SFX[rec ? 'levelup' : 'sad'](); buzz([40, 60, 40]); if (rec) confetti(80);
    const end = $('#rnEnd', pg); end.hidden = false;
    end.innerHTML = `<div class="card"><div class="why">${why}</div><b class="m">วิ่งได้ ${fmt(m)} ม.</b>
      <b class="sc">${fmt(score)}</b><span class="jl"><img src="assets/rn_drop.png" alt="">${S.jelly}</span>
      ${rec ? '<span class="rib">✦ สถิติใหม่! ✦</span>' : `<span class="bst">สถิติสูงสุด ${fmt(best)}</span>`}
      <div class="stars">${[0, 1, 2].map(i => `<i class="${i < stars ? 'on' : ''}" style="animation-delay:${.25 + i * .15}s"></i>`).join('')}</div>
      <button class="rn-again press" id="rnAgain">เล่นอีกครั้ง</button><button class="rn-home press" id="rnHome">กลับ</button></div>`;
    $('#rnAgain', end).onclick = start; $('#rnHome', end).onclick = () => go('world');
  };
  $('#rnGo', pg).onclick = start;
  $('#rnBack', pg).onclick = () => go('world');
  $('#rnPause', pg).onclick = () => {
    if (!alive) return; paused = true;
    openSheet(`<h4 style="text-align:center">หยุดพัก</h4><p class="wsheet-p" style="text-align:center">คะแนน ${fmt(Math.floor(S.score))} · หยดน้ำ ${S.jelly}</p>
      <button class="btn btn-o press" id="rnRes">วิ่งต่อ</button><div style="height:8px"></div><button class="btn btn-d press" id="rnQuit">ออกจากเกม</button>`, sh => {
      $('#rnRes', sh).onclick = () => { closeSheet(); paused = false; last = 0; };
      $('#rnQuit', sh).onclick = () => { closeSheet(); go('world'); };
      $('#sheet').onclick = e => { if (e.target === $('#sheet')) { closeSheet(); paused = false; last = 0; } };
    });
  };
  RUNG.load().then(() => { if (cur === 'erun') draw(); });
  raf = requestAnimationFrame(frame);
};
