/* ELi character animation — ONLY the owner's original ELi artwork is used (4 drawings: happy, run, music, sick).
   No redrawn/AI poses: every pose name maps to one original drawing + a code "pose" (transform preset); all motion is code.
   Scenes: readyScene (warm-up → countdown → dash), finishScene (finish tape → celebration), Buddy (runs with you). */
const ORIG = { happy: 'eli_happy', run: 'eli_run', music: 'eli_music', sick: 'eli_sick' };
const POSE = {
  ready1: ['happy'], ready2: ['happy', 'stretch'], ready3: ['happy', 'lean'], ready4: ['happy', 'low'], ready5: ['run'], ready6: ['run', 'crouch'],
  run1: ['run'], run2: ['run'], run3: ['run'], run4: ['run'], run5: ['run'], run6: ['run'],
  cheer1: ['happy', 'up'], cheer2: ['happy', 'star'], cheer3: ['happy'], cheer4: ['run', 'proud'], cheer5: ['happy', 'hug'], cheer6: ['run', 'up'],
  pet1: ['happy'], pet2: ['happy', 'tiltL'], pet3: ['happy', 'tiltR'], pet4: ['happy', 'giggle'], pet5: ['music', 'sleepy'], pet6: ['sick', 'sad'],
};
const poseOf = n => POSE[n] || [ORIG[n] ? n : 'happy'];
const spr = n => `assets/${ORIG[poseOf(n)[0]]}.webp`;
/* .fin = resolves when a Web Animation ends, or after its duration if frames are throttled (hidden tab, low-power mode) */
Object.defineProperty(Animation.prototype, 'fin', { get() {
  return Promise.race([this.finished.catch(() => {}), new Promise(r => setTimeout(r, (this.effect.getComputedTiming().endTime || 0) + 60))]);
} });
const RUNF = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6'];

/* cancellable timeline: every scene gets a token; leaving the page or pressing skip cancels pending waits */
let sceneId = 0;
const CANCEL = Symbol('cancel');
function timeline() {
  const id = ++sceneId;
  const alive = () => id === sceneId;
  const wait = ms => new Promise((res, rej) => setTimeout(() => alive() ? res() : rej(CANCEL), ms));
  const run = p => p.then(() => { if (!alive()) throw CANCEL; });
  return { alive, wait, run, cancel: () => { if (alive()) sceneId++; } };
}

class Eli {
  constructor(parent, { size = 240, x = 195, y = 640, face = 1 } = {}) {
    this.x = x; this.y = y; this.face = face;
    const el = this.el = document.createElement('div');
    el.className = 'eli-m';   // not 'eli': that is also the ELi-home page class
    el.style.cssText = `left:${x}px;top:${y}px;--s:${size}px`;
    el.innerHTML = '<i class="eli-sh"></i><div class="eli-mv"><div class="eli-sq"><div class="eli-pz"><img alt="น้อง ELi"></div></div></div><div class="eli-say"></div>';
    parent.append(el);
    [this.mv, this.sq, this.img, this.sh, this.bub] = ['.eli-mv', '.eli-sq', 'img', '.eli-sh', '.eli-say'].map(s => el.querySelector(s));
    this.setFace(face);
  }
  pose(n) { this.cur = n; const [art, pz = ''] = poseOf(n), src = spr(n); if (!this.img.src.endsWith(src)) this.img.src = src; this.el.dataset.pz = pz; return this; }
  // the only loop is running: same drawing, code-driven hop/lean cycle
  loop(names, fps = 10) { this.stop(); this.pose(names[0]); this.el.classList.add('mo-run'); this.el.style.setProperty('--rs', (6 / fps).toFixed(2) + 's'); return this; }
  stop() { this.el.classList.remove('mo-run'); return this; }
  setFace(f) { this.face = f; this.img.style.transform = `scaleX(${f})`; return this; }
  moveTo(x, y = this.y, ms = 800, easing = 'cubic-bezier(.3,.7,.4,1)') {
    const a = this.el.animate([{ left: this.x + 'px', top: this.y + 'px' }, { left: x + 'px', top: y + 'px' }], { duration: ms, easing, fill: 'forwards' });
    this.x = x; this.y = y; return a.fin;
  }
  jump(h = 80, ms = 560) {
    this.sh.animate([{ transform: 'translateX(-50%) scale(1)', opacity: 1 }, { transform: 'translateX(-50%) scale(.45)', opacity: .4 }, { transform: 'translateX(-50%) scale(1)', opacity: 1 }], { duration: ms, easing: 'ease-in-out' });
    return this.mv.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-h}px)`, easing: 'cubic-bezier(.2,.8,.4,1)' }, { transform: 'translateY(0)', easing: 'cubic-bezier(.6,0,.8,.2)' }], { duration: ms, easing: 'linear' }).fin
      .then(() => this.squash(.16, 240));
  }
  squash(k = .16, ms = 300) {
    return this.sq.animate([{ transform: 'scale(1,1)' }, { transform: `scale(${1 + k},${1 - k})` }, { transform: `scale(${1 - k * .45},${1 + k * .45})` }, { transform: 'scale(1,1)' }], { duration: ms, easing: 'ease-out' }).fin;
  }
  stretch(ms = 700) { return this.sq.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(.93,1.09)', offset: .4 }, { transform: 'scale(.93,1.09)', offset: .75 }, { transform: 'scale(1,1)' }], { duration: ms, easing: 'ease-in-out' }).fin; }
  tilt(deg = 8, ms = 450) { return this.sq.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg)` }, { transform: 'rotate(0)' }], { duration: ms, easing: 'ease-in-out' }).fin; }
  shake(ms = 400, px = 4) { return this.sq.animate([0, 1, 2, 3, 4, 5, 6].map(i => ({ transform: `translateX(${i % 2 ? px : -px}px)` })).concat({ transform: 'none' }), { duration: ms }).fin; }
  spin(ms = 700) { return this.sq.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }], { duration: ms, easing: 'linear' }).fin; }
  say(text, ms = 1600) {
    const b = this.bub; b.innerHTML = text; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(this.st); if (ms) this.st = setTimeout(() => b.classList.remove('on'), ms);
  }
  hush() { this.bub.classList.remove('on'); }
  remove() { this.stop(); this.el.remove(); }
}

/* particles inside a stage element (coords in the 390x844 app space) */
function puff(stage, x, y, n = 3, dir = -1) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'puff';
    const s = 14 + Math.random() * 18; p.style.cssText = `left:${x + (Math.random() - .5) * 30}px;top:${y - Math.random() * 10}px;width:${s}px;height:${s}px`;
    stage.append(p);
    p.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: .9 }, { transform: `translate(${-50 + dir * (40 + Math.random() * 60)}%,-${90 + Math.random() * 80}%) scale(1.4)`, opacity: 0 }], { duration: 600 + Math.random() * 300, easing: 'ease-out' }).fin.then(() => p.remove());
  }
}
function burst(stage, x, y, { n = 18, colors = ['#FC5A1E', '#FFC83D', '#1F5BFF', '#1DB070', '#fff'], dist = 110, size = 8, ms = 900, shape = 'dot' } = {}) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'spk ' + shape;
    p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
    stage.append(p);
    const a = i / n * Math.PI * 2 + Math.random() * .3, d = dist * (.6 + Math.random() * .5);
    p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d + 30}px)) scale(.2) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: ms, easing: 'cubic-bezier(.1,.7,.3,1)' }).fin.then(() => p.remove());
  }
}
function floatUp(stage, x, y, char, n = 6) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'flt'; p.textContent = char;
    p.style.cssText = `left:${x + (Math.random() - .5) * 120}px;top:${y}px;font-size:${18 + Math.random() * 18}px`;
    stage.append(p);
    p.animate([{ transform: 'translate(-50%,0) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1)', opacity: 1, offset: .2 }, { transform: `translate(calc(-50% + ${(Math.random() - .5) * 60}px),-${160 + Math.random() * 120}px) scale(.8)`, opacity: 0 }], { duration: 1600 + Math.random() * 700, delay: i * 120, easing: 'ease-out', fill: 'backwards' }).fin.then(() => p.remove());
  }
}
function bigText(stage, text, cls = '') {
  const b = document.createElement('div'); b.className = 'bigt ' + cls; b.textContent = text; stage.append(b);
  const ring = document.createElement('i'); ring.className = 'shock'; stage.append(ring);
  ring.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(2.6)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).fin.then(() => ring.remove());
  return b.animate([{ transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(.92)', opacity: 1, offset: .35 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .5 }, { transform: 'translate(-50%,-50%) scale(1.05)', opacity: 1, offset: .8 }, { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }], { duration: 880, easing: 'ease-out' }).fin.then(() => b.remove());
}

/* scenes are composed on a 390×844 stage; on shorter screens the stage scales down (background stays full-bleed),
   on taller screens it keeps its size and sits on the bottom so the ground line stays at the bottom */
function sceneShell(host, cls, bg, bgExtra, html) {
  const wrap = document.createElement('div'); wrap.className = 'scene ' + cls;
  wrap.innerHTML = `<img class="sc-bg" src="${bg}" alt="">${bgExtra}<div class="sc-in">${html}</div>`;
  host.append(wrap);
  const st = wrap.querySelector('.sc-in'), H = typeof appH === 'number' ? appH : 844;
  st.style.setProperty('--ss', Math.min(1, H / 844)); st.style.top = Math.max(0, H - 844) + 'px';
  return { wrap, st };
}

/* ── start: ELi runs in, warms up, crouches, counts down, dashes off ── */
async function readyScene(host) {
  const T = timeline();
  const { wrap, st } = sceneShell(host, 'sc-ready', 'assets/bg_track.webp', '', `<i class="sc-sun"></i>
    <div class="sc-cap"><small>วอร์มอัพกับ ELi</small><b id="cap">เตรียมตัว</b><div class="dots">${'<i></i>'.repeat(5)}</div></div>
    <div class="speed"></div><button class="sc-skip">ข้าม ›</button>`);
  const eli = new Eli(st, { size: 250, x: 540, y: 690 });
  const cap = (t, i) => { const c = st.querySelector('#cap'); c.textContent = t; c.animate([{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' }); st.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k <= i)); };
  let done;
  const finished = new Promise(r => done = r);
  const end = async () => {
    T.cancel(); eli.stop();
    await wrap.animate([{ clipPath: 'circle(150% at 50% 60%)' }, { clipPath: 'circle(0% at 50% 80%)' }], { duration: 520, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }).fin;
    eli.remove(); wrap.remove(); done();
  };
  st.querySelector('.sc-skip').onclick = end;
  wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  (async () => {
    try {
      // run in
      eli.loop(RUNF, 13);
      const dust = setInterval(() => puff(st, parseFloat(getComputedStyle(eli.el).left) + 40, 692, 1, 1), 130);
      await T.run(eli.moveTo(195, 690, 1300, 'cubic-bezier(.25,.8,.35,1)'));
      clearInterval(dust); eli.stop().pose('ready1'); puff(st, 195, 692, 5, 1); await T.run(eli.squash(.2, 380));
      eli.say('วอร์มอัพกันก่อนนะ!', 1400); await T.wait(1200);
      // 1 stretch up
      cap('ยืดตัวให้สูง', 0);
      for (let i = 0; i < 2; i++) { eli.pose('ready2'); await T.run(eli.stretch(760)); eli.pose('ready1'); await T.wait(180); }
      // 2 side bends
      cap('โยกตัวซ้าย-ขวา', 1); eli.pose('ready3');
      for (let i = 0; i < 4; i++) { eli.pose(i % 2 ? 'pet2' : 'pet3'); await T.run(eli.tilt(i % 2 ? -6 : 6, 480)); }
      eli.pose('ready1');
      // 3 toe touch
      cap('ย่อตัว-ยืดตัว', 2);
      for (let i = 0; i < 2; i++) { eli.pose('ready4'); await T.run(eli.squash(.1, 420)); await T.wait(260); eli.pose('ready1'); await T.wait(200); }
      // 4 hops
      cap('กระโดดเบาๆ', 3); eli.say('ฮึบ! ฮึบ!', 1600); eli.pose('ready5');
      for (let i = 0; i < 3; i++) { await T.run(eli.jump(72, 520)); puff(st, 195, 692, 3, i % 2 ? 1 : -1); }
      // 5 ready crouch + countdown
      cap('เข้าจุดสตาร์ท', 4); eli.pose('ready6'); await T.run(eli.squash(.22, 420));
      wrap.querySelector('.sc-bg').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }], { duration: 3600, easing: 'ease-in', fill: 'forwards' });
      eli.say('พร้อม!', 900); await T.wait(700);
      for (const n of ['3', '2', '1']) { bigText(st, n); eli.shake(380, 3); eli.squash(.08, 380); await T.wait(900); }
      // GO: dash off to the right
      bigText(st, 'GO!', 'go'); eli.hush(); puff(st, 200, 692, 8, 1); st.querySelector('.speed').classList.add('on');
      eli.loop(RUNF, 20); eli.sq.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.18,.9) skewX(8deg)' }], { duration: 300, fill: 'forwards' });
      await T.run(eli.moveTo(-220, 690, 750, 'cubic-bezier(.5,0,.9,.4)'));
      await end();
    } catch (e) { if (e !== CANCEL) throw e; }
  })();
  return finished;
}

/* ── finish: breaks the tape, cheers, jumps, spins, gets a medal, hugs a heart ── */
function finishScene(host, { km, time, pace }) {
  const T = timeline();
  const { wrap, st } = sceneShell(host, 'sc-fin', 'assets/ph4.webp', '<i class="sc-dim"></i>', `
    <div class="arch"><span>FINISH</span></div>
    <i class="post l"></i><i class="post r"></i><i class="tape l"></i><i class="tape r"></i>
    <div class="fstats">${[['ระยะทาง', km.toFixed(2), 'กม.'], ['เวลา', time, ''], ['เพซ', pace, '/กม.']].map(([l, v, u]) => `<div><span>${l}</span><b class="num">${v}</b><small>${u}</small></div>`).join('')}</div>
    <div class="facts"><button class="fbtn main">ดูสรุปผล</button><button class="fbtn">เต้นอีกรอบ</button></div>
    <button class="sc-skip">ข้าม ›</button>`);
  const eli = new Eli(st, { size: 250, x: 560, y: 700 });
  const medal = document.createElement('img'); medal.className = 'drop'; medal.src = 'assets/b_gold.webp'; st.append(medal);
  let done; const finished = new Promise(r => done = r);
  const end = () => { T.cancel(); eli.stop(); wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).fin.then(() => { eli.remove(); wrap.remove(); done(); }); };
  st.querySelector('.sc-skip').onclick = end;
  st.querySelector('.fbtn.main').onclick = end;
  const dance = async () => {
    eli.pose('cheer1'); await T.run(eli.jump(90, 560)); eli.pose('cheer3'); await T.run(eli.spin(600));
    eli.pose('cheer2'); burst(st, 195, 420, { n: 22, dist: 150 }); await T.run(eli.jump(150, 760)); eli.pose('cheer6'); await T.run(eli.squash(.18, 340));
  };
  st.querySelector('.fbtn:not(.main)').onclick = () => dance().catch(() => {});
  (async () => {
    try {
      // run in and break the tape
      eli.loop(RUNF, 14);
      const dust = setInterval(() => puff(st, parseFloat(getComputedStyle(eli.el).left) + 40, 702, 1, 1), 120);
      const mv = eli.moveTo(140, 700, 1250, 'cubic-bezier(.3,.6,.5,1)');
      await T.wait(760);
      st.querySelectorAll('.tape').forEach(t => t.classList.add('snap')); burst(st, 195, 600, { n: 16, dist: 90, colors: ['#FC5A1E', '#fff', '#FFC83D'] });
      await T.run(mv); clearInterval(dust);
      // cheer
      eli.stop().pose('cheer1'); puff(st, 140, 702, 5, -1); await T.run(eli.squash(.22, 380));
      confetti(120); eli.say('ถึงเส้นชัยแล้ว!!', 1500);
      await T.run(eli.moveTo(195, 700, 500)); await T.wait(700);
      // star jump + fireworks
      eli.pose('cheer2');
      [[90, 260], [300, 220], [200, 150]].forEach(([x, y], i) => setTimeout(() => T.alive() && burst(st, x, y, { n: 26, dist: 120, size: 7 }), i * 260));
      await T.run(eli.jump(170, 820)); eli.pose('cheer1'); await T.wait(250);
      // spin
      eli.pose('cheer3'); await T.run(eli.spin(700)); await T.run(eli.spin(500));
      // medal drops onto ELi
      eli.pose('cheer1'); eli.say('เอ๊ะ! อะไรตกมา?', 1100);
      await T.run(medal.animate([{ transform: 'translate(-50%,-640px) rotate(-30deg)' }, { transform: 'translate(-50%,0) rotate(10deg)', offset: .7, easing: 'ease-in' }, { transform: 'translate(-50%,-40px) rotate(-6deg)', offset: .85 }, { transform: 'translate(-50%,0) rotate(0)' }], { duration: 1100, easing: 'ease-in', fill: 'forwards' }).fin);
      medal.animate([{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,-250px) scale(1.25)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' }).fin.then(() => medal.classList.add('hover'));
      eli.pose('cheer4'); burst(st, 195, 300, { n: 20, dist: 100, colors: ['#FFD54F', '#FFF3B0', '#fff'], shape: 'star', size: 12 });
      await T.run(eli.jump(60, 480)); eli.say('ได้เหรียญด้วย! 🏅', 1500);
      st.querySelector('.fstats').classList.add('on');
      await T.wait(1500);
      // hug heart
      eli.pose('cheer5'); floatUp(st, 195, 560, '🧡', 9); await T.run(eli.squash(.12, 500));
      eli.say(`เก่งมาก! วันนี้วิ่ง ${km.toFixed(2)} กม.`, 2200); await T.wait(2100);
      // peace + idle loop
      eli.pose('cheer6'); await T.run(eli.squash(.18, 340));
      st.querySelector('.facts').classList.add('on');
      const idle = ['cheer6', 'cheer1', 'cheer4', 'cheer5'];
      for (let i = 0; ; i++) {
        await T.wait(1500); eli.pose(idle[i % idle.length]);
        if (i % 2) await T.run(eli.jump(50, 460)); else await T.run(eli.squash(.14, 360));
      }
    } catch (e) { if (e !== CANCEL) throw e; }
  })();
  return finished;
}

/* ── buddy: small ELi running on top of the record panel ── */
class Buddy {
  constructor(parent) {
    this.stage = parent;
    this.e = new Eli(parent, { size: 96, x: 64, y: 4 });
    this.e.el.classList.add('buddy');
    this.e.pose('ready1');
    this.mode = 'idle';
  }
  run() {
    if (this.mode === 'run') return; this.mode = 'run';
    this.e.hush(); this.e.el.classList.remove('rest'); this.e.loop(RUNF, 11);
    clearInterval(this.dt); this.dt = setInterval(() => puff(this.stage, this.e.x - 26, 6, 1), 260);
    this.wander();
  }
  wander() {
    clearTimeout(this.wt);
    if (this.mode !== 'run') return;
    this.e.moveTo(50 + Math.random() * 90, 4, 2600, 'ease-in-out');
    this.wt = setTimeout(() => this.wander(), 2700);
  }
  rest() {
    this.mode = 'rest'; clearInterval(this.dt); clearTimeout(this.wt); this.e.stop().pose('ready1'); this.e.el.classList.add('rest');
    this.e.say('พักหายใจแป๊บนึงนะ~', 0);
  }
  async cheer(text) {
    if (this.mode !== 'run' || this.busy) return; this.busy = true;
    this.e.stop().pose('cheer1'); this.e.say(text, 1800); burst(this.stage, this.e.x, -40, { n: 12, dist: 60, size: 6 });
    await this.e.jump(46, 480); this.e.pose('cheer6'); await this.e.squash(.14, 300);
    this.busy = false; if (this.mode === 'run') this.e.loop(RUNF, 11);
  }
  tap() {
    if (this.mode === 'rest') { this.e.pose('cheer5'); this.e.squash(.15, 360); floatUp(this.stage, this.e.x, -30, '💙', 4); setTimeout(() => this.mode === 'rest' && this.e.pose('ready1'), 900); }
    else this.cheer(['สู้ๆ!', 'เพซดีมาก!', 'หายใจลึกๆ', 'ไปด้วยกัน!'][Math.floor(Math.random() * 4)]);
  }
  destroy() { clearInterval(this.dt); clearTimeout(this.wt); this.e.remove(); }
}

/* ── idle celebration used on the save screen hero ── */
function heroEli(host) {
  const e = new Eli(host, { size: 230, x: host.clientWidth / 2 || 195, y: 290 });
  const seq = ['cheer1', 'cheer6', 'cheer4', 'cheer2', 'cheer5'];
  let i = 0, t;
  const step = async () => {
    const n = seq[i++ % seq.length]; e.pose(n);
    if (n === 'cheer2') { burst(host, e.x, 120, { n: 16, dist: 90 }); await e.jump(90, 620); } else await e.squash(.14, 380);
    t = setTimeout(step, 1300);
  };
  e.pose('cheer4'); t = setTimeout(step, 900);
  e.el.style.pointerEvents = 'auto'; e.el.style.cursor = 'pointer';
  e.el.onclick = async () => { e.pose('cheer3'); await e.spin(600); e.pose('cheer1'); e.say(['วิ่งพรุ่งนี้อีกนะ!', 'ภูมิใจในตัวคุณ!', 'เย้~!'][Math.floor(Math.random() * 3)], 1400); burst(host, e.x, 150, { n: 14, dist: 80 }); };
  return () => { clearTimeout(t); e.remove(); };
}
