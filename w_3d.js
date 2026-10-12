/* Eli's World — 3D interactive layer (plain CSS 3D, no library).
   ELi is never redrawn or reshaped: it is the same original drawing, only turned a little in 3D space.
   The real 3D objects are built in code: spinning coins (a stack of discs with the coin art on both faces)
   and the brand mark extruded into a solid block.
   One shared "lean" (-1…1) comes from the phone's tilt (gyro) or from the finger / mouse. */
const T3 = (() => {
  const L = { x: 0, y: 0, tx: 0, ty: 0, gyro: false };
  const cl = v => Math.max(-1, Math.min(1, v));
  // gyro: a slow-moving baseline, so however the phone is held, "now" is the centre
  let bg = null, bb = null;
  addEventListener('deviceorientation', e => {
    if (e.gamma == null || e.beta == null) return;
    if (bg == null) { bg = e.gamma; bb = e.beta; }
    bg += (e.gamma - bg) * .02; bb += (e.beta - bb) * .02;
    L.gyro = true; L.tx = cl((e.gamma - bg) / 18); L.ty = cl((e.beta - bb) / 18);
  });
  // iOS asks once for motion access; it has to come from a tap
  let asked = false;
  const ask = () => {
    if (asked) return; asked = true;
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {});
  };
  addEventListener('touchend', ask, { once: true }); addEventListener('click', ask, { once: true });
  // finger / mouse: lean toward the pointer; let go → drift back to centre
  let held = false;
  const app = () => (document.getElementById('app') || document.body).getBoundingClientRect();
  addEventListener('pointermove', e => {
    if (L.gyro || (e.pointerType !== 'mouse' && !held)) return;
    const r = app(); L.tx = cl(((e.clientX - r.left) / r.width - .5) * 2); L.ty = cl(((e.clientY - r.top) / r.height - .5) * 2);
  });
  addEventListener('pointerdown', () => held = true);
  const off = () => { held = false; if (!L.gyro) { L.tx = 0; L.ty = 0; } };
  addEventListener('pointerup', off); addEventListener('pointercancel', off);
  document.documentElement.addEventListener('mouseleave', off);
  // one frame loop for every 3D thing on the current page (rAF, with a timer fallback for hidden panes)
  const subs = new Set();
  let running = false;
  const frame = () => {
    L.x += (L.tx - L.x) * .1; L.y += (L.ty - L.y) * .1;
    const t = performance.now();
    subs.forEach(f => f(L, t));
  };
  const loop = () => {
    if (!subs.size) { running = false; return; }
    let ran = false;
    const go = () => { if (ran) return; ran = true; frame(); loop(); };
    requestAnimationFrame(go); setTimeout(go, 40);
  };
  const on = f => { subs.add(f); cleanup.push(() => subs.delete(f)); if (!running) { running = true; loop(); } return f; };

  /* a 3D coin: two faces with the coin art + a stack of gold discs for the rim */
  const coin = (parent, { x, y, size = 46, cls = '' } = {}) => {
    const c = document.createElement('div');
    c.className = 'c3 ' + cls;
    const N = 24, R = size * .44, th = size * .14, w = 2 * Math.PI * R / N + .8;
    c.style.cssText = `left:${x}px;top:${y}px;--cs:${size}px;--ct:${(th / 2).toFixed(1)}px;--bd:${(-Math.random() * 2.6).toFixed(2)}s;--sp:${(3 + Math.random()).toFixed(2)}s`;
    const rim = Array.from({ length: N }, (_, i) => `<i class="rim" style="width:${w.toFixed(1)}px;height:${th.toFixed(1)}px;margin:${(-th / 2).toFixed(1)}px 0 0 ${(-w / 2).toFixed(1)}px;transform:rotateZ(${i * 360 / N}deg) translateY(${-R.toFixed(1)}px) rotateX(90deg)"></i>`).join('');
    c.innerHTML = `<i class="c3-sh"></i><div class="c3-b"><div class="c3-spin">${rim}<i class="face f"></i><i class="face b"></i></div></div>`;
    parent.append(c);
    return c;
  };

  const mix = (a, b, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - k) + parseInt(b.substr(i, 2), 16) * k).toString(16).padStart(2, '0')).join('');
  /* the brand mark as a solid: N copies of the mark pushed back in depth, the back ones darker */
  const mark = (parent, { x, y, w, n = 10, depth = 1.4 } = {}) => {
    const h = w * 630 / 540, m = document.createElement('div');
    m.className = 'm3';
    m.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    m.innerHTML = `<div class="m3-r">${Array.from({ length: n }, (_, i) =>
      `<i class="${i === n - 1 ? 'top' : ''}" style="transform:translateZ(${((i - n + 1) * depth).toFixed(1)}px);--c:${mix('#121A4E', '#24338A', i / (n - 1))}"></i>`).join('')}</div>`;
    parent.append(m);
    // it sways on its own, turns with the lean, and a tap sends it round once
    const r = m.firstChild; let spin0 = -1e9;
    m.spin = () => { spin0 = performance.now(); SFX.tone(660, .25, 'triangle', .05, 0, 1.6); buzz(12); };
    m.addEventListener('click', m.spin);
    on((L, t) => {
      const k = Math.min(1, (t - spin0) / 950), e = k < 1 ? 1 - Math.pow(1 - k, 3) : 0;
      const ry = Math.sin(t / 1500) * 14 + L.x * 30 + e * 360, rx = -L.y * 18 + Math.sin(t / 2100) * 4;
      r.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    });
    return m;
  };

  /* ELi leans in 3D (same drawing): toward the lean, plus an extra push from a touch */
  const eliLean = (eli, { amt = 14, push = null } = {}) => {
    const t3 = eli.el.querySelector('.eli-3d'); if (!t3) return;
    on(L => {
      const p = push ? push() : { x: 0, y: 0 };
      const ry = L.x * amt + p.x * 14, rx = -(L.y * amt * .5) + p.y * 9;
      t3.style.transform = `perspective(700px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    });
  };
  return { L, on, coin, mark, eliLean, ask };
})();
