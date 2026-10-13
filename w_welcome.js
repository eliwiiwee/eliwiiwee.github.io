/* Eli's World — welcome intro (client brief 2026-10-12): only the logo, ELi and "welcome to eli's world".
   An intro sequence plays: the logo assembles from its three original pieces on indigo, the cream world opens out of it,
   the words spring in and ELi bursts out of the pedestal. Then:
     member     → straight into Eli's World
     not member → a pop-up to sign up / log in.
   ELi = the original art only, moved by code. Prototype only: nothing typed in the forms leaves the page. */
LIFE.welcome = pg => {
  pg.classList.add('w-wel');
  const BGS = 1.18, [px0, py0] = coverPt(512, 978);
  const px = 195 + (px0 - 195) * BGS, py = py0 * BGS;   // top of the painted podium (bg scaled from the top, so ELi stands lower)
  const lx = 195, ly = 92, LW = 74, LH = LW * 630 / 540;   // logo's resting place (centre x, top y, size)
  const word = s => [...s].map((c, i) => c === ' ' ? '<i class="sp"></i>' : `<span style="--i:${i}">${c}</span>`).join('');
  pg.innerHTML = `
    <div class="wl-back"><i class="wl-glow"></i>${Array.from({ length: 22 }, (_, k) => `<i class="wl-star" style="left:${(k * 37) % 100}%;top:${(k * 53) % 100}%;--d:${(k % 7) * .4}s"></i>`).join('')}</div>
    <div class="wl-stage" id="wlStage">
      <img class="wbg" src="assets/w_welcome_bg2.webp" alt="">
      <i class="wl-rays" style="left:${px}px;top:${py - 120}px"></i>
      <i class="wl-portal" style="left:${px}px;top:${py}px"></i>
      <div class="wl-title" style="top:${ly + LH + 22}px"><div class="t1">${word('welcome to')}</div><div class="t2">${word("eli's world")}</div></div>
      <div class="wl-motes">${Array.from({ length: 14 }, (_, k) => `<i style="left:${8 + (k * 61) % 84}%;--d:${(k % 5) * 1.1}s;--t:${7 + k % 4}s;--s:${4 + k % 3 * 2}px"></i>`).join('')}</div>
    </div>
    <div class="wl-logo" id="wlLogo"><i class="lp u"></i><i class="lp s"></i><i class="lp d"></i></div>
    <i class="wl-ring" id="wlRing"></i>`;
  const stage = $('#wlStage', pg), logo = $('#wlLogo', pg), ring = $('#wlRing', pg);
  const [pu, ps, pd] = $$('.lp', logo);
  // the logo starts big and white in the middle of the indigo screen
  const BW = 150, BH = BW * 630 / 540, cx = 195, cy = appH * .42;
  Object.assign(logo.style, { left: cx - BW / 2 + 'px', top: cy - BH / 2 + 'px', width: BW + 'px', height: BH + 'px' });
  const eli = new Eli(stage, { size: 206, x: px, y: py + 6 });
  const m3 = T3.mark(pg, { x: lx - LW / 2, y: ly, w: LW });   // the solid 3D mark that takes over once the intro is done
  eli.pose('ready5'); eli.el.style.opacity = 0;
  let done = false, skip = false;
  later(0, () => $('#sbar').classList.add('light'));          // white status bar while the screen is indigo
  const A = (el, kf, o) => el.animate(kf, { fill: 'both', ...o });
  const intro = async () => {
    // 1 · the three pieces of the mark fly together; the dot lands with a thump
    A(pu, [{ transform: 'translateY(70px) scaleY(.2)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)', delay: 120 });
    A(ps, [{ transform: 'translate(60px,-70px) rotate(28deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.34,1.56,.64,1)', delay: 260 });
    A(pd, [{ transform: 'translateY(-260px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: .5 }, { transform: 'translateY(-46px)', offset: .68 }, { transform: 'translateY(0)', offset: .82 }, { transform: 'translateY(-12px)', offset: .91 }, { transform: 'translateY(0)' }], { duration: 760, easing: 'ease-in', delay: 420 });
    await w8(800); if (skip) return;
    SFX.pop(); buzz(18);
    Object.assign(ring.style, { left: cx + BW * .22 + 'px', top: cy - BH * .34 + 'px' });
    A(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(5)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)' });
    A(logo, [{ transform: 'scale(1)' }, { transform: 'scale(1.08,.94)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
    await w8(520); if (skip) return;
    // 2 · the cream world opens out of the logo, the logo flies up to its place and turns indigo
    later(450, () => $('#sbar').classList.remove('light'));
    const sx0 = cx + (appW - 390) / 2;   // the stage is full-bleed; the logo sits in the centred column
    A(stage, [{ clipPath: `circle(0px at ${sx0}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(appW, appH)}px at ${sx0}px ${cy}px)` }], { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)' });
    const sx = LW / BW, tx = lx - LW / 2 - (cx - BW / 2), ty = ly - (cy - BH / 2);
    A(logo, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${tx}px,${ty}px) scale(${sx})` }], { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)' });
    [pu, ps, pd].forEach(p => A(p, [{ background: '#fff' }, { background: '#2A3B9C' }], { duration: 500, delay: 380, easing: 'linear' }));
    SFX.tone(392, .5, 'sine', .04, 0, 2.2);
    await w8(760); if (skip) return;
    // 3 · the words spring in, letter by letter
    pg.classList.add('words');
    SFX.chime();
    await w8(520); if (skip) return;
    // 4 · the portal flashes and ELi bursts out of the pedestal
    pg.classList.add('portal');
    await w8(160);
    eli.el.style.opacity = 1;
    eli.pose('cheer6');
    A(eli.el, [{ transform: 'translateY(70px) scale(.15)', filter: 'brightness(3)' }, { transform: 'translateY(-90px) scale(1.12)', filter: 'brightness(1.2)', offset: .55 }, { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' }], { duration: 760, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
    SFX.levelup(); buzz([25, 40, 25]);
    await w8(560);
    eli.squash(.2, 360);
    burst(stage, px, py - 70, { n: 26, dist: 130, size: 8, colors: ['#2A3B9C', '#F2C14E', '#E3D9CB', '#FFFFFF', '#7B95F4'] });
    burst(stage, px, py - 70, { n: 12, dist: 70, size: 5, colors: ['#F2C14E', '#FFFFFF'], shape: 'star' });
    await w8(380);
    eli.pose('cheer1');
  };
  const finish = () => {
    if (done) return; done = true;
    pg.classList.add('words', 'portal', 'ready');
    // jump the pieces to their final state (skip / end of intro)
    logo.getAnimations().forEach(a => a.finish()); [pu, ps, pd, stage, ring].forEach(e => e.getAnimations().forEach(a => a.finish()));
    const sx = LW / BW, tx = lx - LW / 2 - (cx - BW / 2), ty = ly - (cy - BH / 2);
    logo.style.transform = `translate(${tx}px,${ty}px) scale(${sx})`; [pu, ps, pd].forEach(p => p.style.background = '#2A3B9C');
    stage.style.clipPath = 'none'; eli.el.style.opacity = 1; $('#sbar').classList.remove('light');
    idle(); orbit();
    if (G.member) later(900, enterWorld); else later(500, openJoin);
  };
  intro().then(() => later(900, finish));
  // after the intro: ELi bounces on the pedestal, tap = a happy jump
  let idling = false;
  const idle = () => {
    if (idling) return; idling = true;
    eli.pose('ready1');
    every(2800, () => { if (!$('.wl-join.on', pg)) { eli.pose('cheer2'); eli.jump(24, 380).then(() => eli.pose('ready1')); } });
  };
  stage.insertAdjacentHTML('beforeend', `<i class="wl-hit" style="left:${px - 80}px;top:${py - 190}px"></i>`);
  $('.wl-hit', pg).onclick = () => { if (!done) return; SFX.giggle(); buzz(10); eli.pose('cheer6'); eli.jump(46, 480).then(() => eli.pose('ready1')); burst(stage, px, py - 120, { n: 10, dist: 60, size: 6, colors: ['#2A3B9C', '#F2C14E', '#fff'] }); };
  // 3D: the world leans with the phone (gyro) or the finger / mouse; the words and the mark turn with it
  T3.on(L => { pg.style.setProperty('--px', L.x.toFixed(3)); pg.style.setProperty('--py', L.y.toFixed(3)); });
  // ELi turns in 3D toward the lean; pressing on ELi pushes it back like a soft toy (same drawing, only turned)
  const hit = $('.wl-hit', pg), push = { x: 0, y: 0, tx: 0, ty: 0 };
  const aim = e => { const r = hit.getBoundingClientRect(); push.tx = ((e.clientX - r.left) / r.width - .5) * 2; push.ty = ((e.clientY - r.top) / r.height - .5) * 2; };
  hit.addEventListener('pointerdown', e => { if (done) aim(e); });
  hit.addEventListener('pointermove', e => { if (done && e.buttons) aim(e); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => hit.addEventListener(n, () => { push.tx = push.ty = 0; }));
  T3.eliLean(eli, { push: () => { push.x += (push.tx - push.x) * .18; push.y += (push.ty - push.y) * .18; return push; } });
  // 3D coins orbit ELi — round the back (behind ELi, smaller) and round the front; tap one to catch it
  const orbit = () => {
    if ($('.c3', stage)) return;
    const ox = px, oy = py - 96, RX = 138, RY = 24;
    const coins = [0, 1, 2].map(i => { const c = T3.coin(stage, { x: ox, y: oy, size: 40, cls: 'pop' }); c.style.animationDelay = i * .12 + 's'; c.addEventListener('animationend', () => c.classList.remove('pop'), { once: true }); return c; });
    coins.forEach(c => c.addEventListener('click', () => {
      if (c.classList.contains('got')) return;
      SFX.coin(); buzz(12); c.classList.add('got');
      burst(stage, parseFloat(c.style.left), parseFloat(c.style.top), { n: 10, dist: 46, size: 5, colors: ['#F2C14E', '#FFE59A', '#fff'], shape: 'star' });
      later(1800, () => { c.classList.remove('got'); c.classList.add('pop'); c.addEventListener('animationend', () => c.classList.remove('pop'), { once: true }); });
    }));
    T3.on((L, t) => coins.forEach((c, i) => {
      const a = t / 2300 + i * 2.094, d = Math.sin(a);
      c.style.left = (ox + Math.cos(a) * RX + L.x * 10 * d).toFixed(1) + 'px'; c.style.top = (oy + d * RY).toFixed(1) + 'px';
      c.style.scale = (.8 + .22 * d).toFixed(3); c.classList.toggle('front', d > 0);
    }));
  };
  // members go straight in: ELi dashes off and the world zooms open
  const enterWorld = () => {
    later(300, () => {
      eli.setFace(1); eli.loop(RUNF, 14); eli.moveTo(195 + appW / 2 + 140, eli.y, 650, 'ease-in');
      pg.classList.add('leave'); SFX.tone(523, .35, 'triangle', .05, 0, 1.8);
      later(620, () => go('world', { dir: 'none' }));
    });
  };
  // the join pop-up: sign up / log in / continue with Apple (prototype — nothing is sent anywhere)
  // sign-in pop-up (client 2026-10-13): LINE · TikTok · Facebook · Apple first, e-mail as a small link. Prototype — nothing leaves the page.
  const SOC = [
    ['line', 'LINE', '<path d="M12 3.4C6.7 3.4 2.4 6.9 2.4 11.2c0 3.9 3.4 7.1 8 7.7.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.2 1 .9.5 1.1-.5 5.8-3.4 7.9-5.8 1.5-1.6 2.1-3.2 2.1-4.9 0-4.3-4.3-7.8-9.6-7.8z"/>'],
    ['tiktok', 'TikTok', '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/>'],
    ['fb', 'Facebook', '<path d="M13.6 21.5v-7.6h2.6l.4-3h-3V9c0-.9.2-1.5 1.5-1.5h1.6V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6v7.6z"/>'],
    ['apple', 'Apple', '<path d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.6c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/>'],
  ];
  pg.insertAdjacentHTML('beforeend', `<div class="wl-join" id="wlJoin">
    <div class="jc">
      <i class="grab"></i>
      <div class="v v0 on">
        <b class="h">เข้าสู่ eli's world</b>
        ${SOC.map(([k, n, d]) => `<button class="jb so ${k} press" data-so="${k}" data-n="${n}"><svg viewBox="0 0 24 24" fill="currentColor">${d}</svg><span>ดำเนินการต่อด้วย ${n}</span></button>`).join('')}
        <button class="jb t sm" type="button" data-v="2">หรือ เข้าสู่ระบบด้วยอีเมล</button>
      </div>
      <form class="v v1" autocomplete="off">
        <b class="h">สมัครด้วยอีเมล</b>
        <label class="jf"><span>ชื่อเล่น</span><input name="n" placeholder="เช่น สายสุขภาพ"></label>
        <label class="jf"><span>อีเมล</span><input name="e" type="email" placeholder="you@email.com"></label>
        <label class="jf"><span>รหัสผ่าน</span><input name="p" type="password" placeholder="อย่างน้อย 6 ตัว"></label>
        <button class="jb p press" type="submit">สร้างบัญชี</button>
        <button class="jb t" type="button" data-v="2">‹ มีบัญชีแล้ว เข้าสู่ระบบ</button>
      </form>
      <form class="v v2" autocomplete="off">
        <b class="h">เข้าสู่ระบบด้วยอีเมล</b>
        <label class="jf"><span>อีเมล</span><input name="e" type="email" placeholder="you@email.com"></label>
        <label class="jf"><span>รหัสผ่าน</span><input name="p" type="password" placeholder="รหัสผ่าน"></label>
        <button class="jb p press" type="submit">เข้าสู่ระบบ</button>
        <button class="jb t" type="button" data-v="1">ยังไม่มีบัญชี? สมัครด้วยอีเมล</button>
        <button class="jb t" type="button" data-v="0">‹ ย้อนกลับ</button>
      </form>
    </div></div>`);
  const join = $('#wlJoin', pg);
  // while the pop-up is open the world slides up (podium + ELi stay visible above it); the title and the logo stay put
  const title = $('.wl-title', pg), tTop = title.offsetTop;
  const lift = () => {
    const on = join.classList.contains('on'), jt = on ? appH - $('.jc', join).offsetHeight : appH;
    const d = on ? Math.max(0, py - (jt - 26)) : 0;   // keep the rim of the podium in sight
    stage.style.transform = d ? `translateY(${-d}px)` : '';
    title.style.top = (tTop + d) + 'px';   // (layout move, not a transform: a transform would break the gradient text)
    // ELi shrinks a little if it would touch the title; on very short screens the title steps aside (the pop-up names the app anyway)
    let room = py - d - (tTop + title.offsetHeight + 14), hide = d && room / 206 < .7;
    if (hide) room = py - d - (ly + LH + 12);
    title.style.opacity = hide ? '0' : '';
    eli.el.style.scale = d ? String(Math.max(.5, Math.min(1, room / 206))) : '';
  };
  const view = v => { $$('.v', join).forEach(x => x.classList.toggle('on', x.classList.contains('v' + v))); if (v) setTimeout(() => $(`.v${v} input`, join)?.focus(), 350); later(30, lift); };
  const openJoin = () => { join.classList.add('on'); SFX.pop(); lift(); };
  $$('[data-v]', join).forEach(b => b.onclick = () => { SFX.pop(); view(+b.dataset.v); });
  // the first login creates the Eli Citizen ID: 6 digits, a running number (on the real backend the server hands it out)
  const newId = () => { let n = 1; try { n = +(localStorage.getItem('eli_cid_seq') || 0) + 1; localStorage.setItem('eli_cid_seq', n); } catch (e) {} return String(n).padStart(6, '0'); };
  const welcomeIn = (name, isNew = true) => {
    G.member = true; if (name) G.citizen.name = name;
    if (isNew || !/^\d{6}$/.test(G.citizen.id)) G.citizen.id = newId();
    saveG();
    join.classList.remove('on'); lift();
    const card = document.createElement('div'); card.className = 'wl-cid';
    card.innerHTML = `<div class="cc"><i class="wlogo"></i><span class="k">Eli Citizen ID</span><b class="id">${[...G.citizen.id].map((d, i) => `<i style="--i:${i}">${d}</i>`).join('')}</b><span class="nm">${G.citizen.name}</span></div>`;
    pg.append(card); later(20, () => card.classList.add('on'));
    SFX.levelup(); buzz([20, 40, 20]); later(500, () => confetti(80));
    eli.pose('cheer1'); eli.jump(50, 500).then(() => eli.pose('cheer6'));
    let gone = false;
    const go2 = () => { if (gone) return; gone = true; card.classList.remove('on'); eli.setFace(1); eli.loop(RUNF, 14); eli.moveTo(195 + appW / 2 + 140, eli.y, 650, 'ease-in'); pg.classList.add('leave'); later(620, () => go('world', { dir: 'none' })); };
    card.onclick = go2; later(2800, () => cur === 'welcome' && go2());
  };
  const shake = el => el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
  $('.v1', join).onsubmit = e => {
    e.preventDefault(); const f = e.target, n = f.n.value.trim(), m = f.e.value.trim(), p = f.p.value;
    const bad = !n ? f.n : !/^\S+@\S+\.\S+$/.test(m) ? f.e : p.length < 6 ? f.p : null;
    if (bad) { shake(bad.closest('.jf')); bad.focus(); return toast(bad === f.p ? 'รหัสผ่านอย่างน้อย 6 ตัวนะ' : bad === f.e ? 'อีเมลยังไม่ถูกต้อง' : 'ตั้งชื่อเล่นก่อนนะ'); }
    welcomeIn(n);
  };
  $('.v2', join).onsubmit = e => {
    e.preventDefault(); const f = e.target, m = f.e.value.trim(), p = f.p.value;
    const bad = !/^\S+@\S+\.\S+$/.test(m) ? f.e : !p ? f.p : null;
    if (bad) { shake(bad.closest('.jf')); bad.focus(); return toast('กรอกอีเมลและรหัสผ่านก่อนนะ'); }
    welcomeIn(null, false);
  };
  $$('[data-so]', join).forEach(b => b.onclick = () => {
    if (join.classList.contains('busy')) return; join.classList.add('busy'); b.classList.add('wait'); SFX.pop();
    $('span', b).textContent = `กำลังเชื่อมต่อ ${b.dataset.n}…`;
    later(1000, () => { join.classList.remove('busy'); welcomeIn(null, true); });
  });
};
