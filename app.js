/* ELi Run Club (v2) — activity-feed running prototype. Mock data only. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const A = n => `assets/${n}.webp`;
const fmt = n => n.toLocaleString('en-US');
const clock = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = Math.floor(s % 60); return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const paceStr = sPerKm => `${Math.floor(sPerKm / 60)}'${String(Math.round(sPerKm % 60)).padStart(2, '0')}"`;

const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14"/></svg>',
  rec: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
  group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14c2.4 0 4 1.5 4.6 4.5"/></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5c-3.6 0-6.5-2.1-6.5-4.6 0-2.7 3-5.4 6.5-5.4s6.5 2.7 6.5 5.4c0 2.5-2.9 4.6-6.5 4.6z"/><circle cx="5" cy="9" r="2"/><circle cx="9.2" cy="5" r="2"/><circle cx="14.8" cy="5" r="2"/><circle cx="19" cy="9" r="2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9.5 18h5"/></svg>',
  you: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-3.8 4.2-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9M10 21a2.2 2.2 0 0 0 4 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  thumb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M7 10v11H3.5V10zM7 10l4.2-7.2a1.8 1.8 0 0 1 3.3 1.3L13.6 9H19a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 17.6 21H7"/></svg>',
  cmt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  dots: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.2" height="16" rx="1.6"/><rect x="13.8" y="4" width="4.2" height="16" rx="1.6"/></svg>',
  chev: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
};

/* ── data ── */
const PEOPLE = { me: ['สายสุขภาพ', 'avatar'], p1: ['ณัฐ วิ่งเช้า', 'p1'], p2: ['ฟ้า ใส', 'p2'], p3: ['ลุงสมชาย', 'p3'], p4: ['มิ้นท์', 'p4'] };
const ROUTES = {
  river: 'M18 160 C50 150 70 128 104 124 S150 104 176 96 S226 70 256 66 S308 44 340 34',
  loop: 'M180 166 C120 166 88 136 92 100 S128 30 180 30 S268 52 268 98 S238 166 180 166',
  city: 'M30 44 L96 44 L96 92 L168 92 L168 150 L250 150 L250 70 L328 70',
  track: 'M120 50 H238 A48 48 0 0 1 238 146 H120 A48 48 0 0 1 120 50',
  new: 'M60 150 C80 110 120 120 140 90 S190 40 230 60 S300 120 320 80',
};
let FEED = [
  { id: 'a1', who: 'p2', when: 'วันนี้ 06:12 · กรุงเทพฯ', t: 'Morning Run ริมเจ้าพระยา 🌅', d: 'อากาศดีมาก ลมเย็น วิ่งเพลินจนลืมเวลา', km: 8.42, sec: 2931, elev: 24, r: 'river', mp: '20% 30%', ph: ['ph1'], ach: ['b_gold', '2 สถิติส่วนตัว (PR) · 5K เร็วสุด'], k: 24, c: 3 },
  { id: 'a2', who: 'me', when: 'เมื่อวาน 18:40 · สวนลุมพินี', t: 'วิ่งยามเย็นสบายๆ', d: '', km: 3.1, sec: 1625, elev: 8, r: 'loop', mp: '60% 70%', ph: ['ph3'], k: 12, c: 1 },
  { id: 'a3', who: 'p3', when: 'จ. 20:05 · สาทร', t: 'Night Run 10K 🌃', d: 'ครบ 10K ในวัย 52 ยังไหวอยู่!', km: 10.02, sec: 3757, elev: 31, r: 'city', mp: '40% 10%', ph: ['ph2'], ach: ['b_crown', 'Local Legend · ถนนสาทรใต้'], k: 58, c: 9 },
  { id: 'a4', who: 'p1', when: 'อา. 07:00 · สนามกีฬาแห่งชาติ', t: 'Track Intervals 8×400', d: '', km: 6.4, sec: 1888, elev: 2, r: 'track', mp: '80% 50%', ph: ['ph4'], k: 17, c: 2 },
];
const KUDO = {};
const ME = { weekKm: 18.7, weekSec: 8460, weekElev: 142, week: [5.2, 0, 4.1, 3.1, 0, 6.3, 0], streak: 5 };

/* ── router ── */
const SCREENS = [['welcome', 'หน้าต้อนรับ'], ['world', "Eli's World"], ['settings', 'ตั้งค่า'], ['trek', 'Step Trek'], ['trekdone', 'บันทึกกิจกรรม'], ['dream', 'Dream Land'], ['hall', 'Hero Hall'], ['treasury', 'Treasury'], ['redeem', 'แลกของรางวัล']];
const TABS = [['world', "Eli's World"], ['dream', 'Dream Land'], ['trek', 'Step Trek'], ['hall', 'Hero Hall'], ['treasury', 'Treasury']];   // Step Trek = the big "play" button in the middle
const TB_DEFAULT = 'D';
const WITH_TABS = ['world', 'trek', 'dream', 'hall', 'treasury'];
const ORDER = ['welcome', 'world', 'settings', 'trek', 'trekdone', 'dream', 'hall', 'treasury', 'redeem'];
let cur = null, cleanup = [], curAct = FEED[0];
const view = $('#view');

function go(name, opt = {}) {
  if (name === cur && !opt.force) return;
  cleanup.forEach(f => f()); cleanup = [];
  closeSheet(true);
  const old = view.firstElementChild;
  if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 320); }
  const dir = opt.dir === 'none' ? 'still' : opt.dir || (name === 'trekdone' || name === 'redeem' ? 'up' : ORDER.indexOf(name) < ORDER.indexOf(cur) ? 'back' : '');
  const pg = document.createElement('section');
  pg.className = `pg ${name} in ${dir}`;
  view.append(pg);
  cur = name;
  R[name](pg, opt);
  colTag(pg, pg);
  $('#tabbar').classList.toggle('hide', !WITH_TABS.includes(name));
  const ti = TABS.findIndex(t => t[0] === name);
  $$('#tabbar button').forEach((b, i) => b.classList.toggle('on', i === ti));
  if (ti >= 0) $('#tabbar .bar').style.transform = `translateX(${(ti + .5) * (390 - 12) / 5 + 6 - 20}px)`;
  $$('#jump button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  $('#sbar').classList.toggle('light', ['dream'].includes(name)); $('#tabbar').classList.toggle('dark', name === 'dream');
  history.replaceState(null, '', '#' + name);
}
const every = (ms, f) => { const t = setInterval(f, ms); cleanup.push(() => clearInterval(t)); return t; };
const later = (ms, f) => { const t = setTimeout(f, ms); cleanup.push(() => clearTimeout(t)); return t; };

/* ── helpers ── */
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 1800); }
function confetti(n = 70) {
  const fx = $('#fx'), cols = ['#FC5A1E', '#1F5BFF', '#FFC83D', '#1DB070', '#7A5CFF', '#fff'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'cf';
    c.style.cssText = `left:${50 + (Math.random() - .5) * 30}%;top:40%;background:${cols[i % 6]};--x:${(Math.random() - .5) * 440}px;--y:${-100 - Math.random() * 380}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * .15}s`;
    fx.append(c); setTimeout(() => c.remove(), 1900);
  }
}
function countUp(el, to, ms = 1000, f = v => fmt(Math.round(v))) {
  const t0 = performance.now(), id = el._cu = (el._cu || 0) + 1;   // a newer countUp/refresh on the same element cancels this one
  const s = t => { if (el._cu !== id) return; const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = f(to * e); if (k < 1) requestAnimationFrame(s); };
  requestAnimationFrame(s);
}
function drawPath(p, ms = 1400, delay = 0) {
  const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
  setTimeout(() => { p.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.45,0,.2,1)`; p.style.strokeDashoffset = 0; }, 30 + delay);
}
function onSeen(root, sel, fn) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), { root, threshold: .25 });
  $$(sel, root).forEach(el => io.observe(el)); cleanup.push(() => io.disconnect());
}
function openSheet(html, mount) {
  const w = $('#sheet'); w.hidden = false; w.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`;
  w.onclick = e => { if (e.target === w || e.target.closest('[data-close]')) closeSheet(); };
  mount && mount(w.firstElementChild);
}
function closeSheet(now) {
  const w = $('#sheet'); if (w.hidden) return;
  if (now) { w.hidden = true; w.innerHTML = ''; return; }
  w.firstElementChild.classList.add('close'); setTimeout(() => { w.hidden = true; w.innerHTML = ''; }, 280);
}
function bindGo(root) { $$('[data-go]', root).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); go(b.dataset.go); })); }
function stickyShadow(sc) { const tb = $('.topbar', sc); sc.addEventListener('scroll', () => tb && tb.classList.toggle('stuck', sc.scrollTop > 4)); }
const mapSvg = (a, extra = '') => `<svg viewBox="0 0 358 196" preserveAspectRatio="xMidYMid meet"><path class="route-bg" d="${ROUTES[a.r]}"/><path class="route" d="${ROUTES[a.r]}"/>${extra}</svg>`;

/* ── screens ── */
const R = {};

R.splash = pg => {
  pg.innerHTML = `
    <svg class="draw" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice"><path d="M-20 700 C60 640 40 560 120 540 S220 600 250 520 S200 380 290 340 S420 300 380 180"/></svg>
    <div class="c"><span class="mark l" style="color:#fff"></span><b class="wm">ELi</b><p>Every Step Makes You Better.</p></div>
    <img class="m" src="${A('eli_run')}" alt="">
    <button class="go press" data-go="eli">ไปหาน้อง ELi กัน</button>`;
  bindGo(pg);
  drawPath($('svg.draw path', pg), 1800, 100);
};

function actCard(a, k) {
  const [nm, av] = PEOPLE[a.who], on = KUDO[a.id];
  const faces = ['p1', 'p2', 'p3', 'p4'].filter(p => p !== a.who).slice(0, 3);
  return `<article class="card act reveal" data-id="${a.id}" style="transition-delay:${Math.min(k, 3) * 60}ms">
    <div class="hd"><img class="av" src="${A(av)}" alt=""><div class="who"><b>${nm}</b><span>${a.when}</span></div><button class="ib more" aria-label="เพิ่มเติม">${I.dots}</button></div>
    <h4>${a.t}</h4>${a.d ? `<p class="desc">${a.d}</p>` : ''}
    <div class="stats"><div><span>ระยะทาง</span><b class="num">${a.km.toFixed(2)} <small style="font-size:14px">กม.</small></b></div><div><span>เพซ</span><b class="num">${paceStr(a.sec / a.km)} <small style="font-size:14px">/กม.</small></b></div><div><span>เวลา</span><b class="num">${clock(a.sec)}</b></div></div>
    ${a.ach ? `<div class="ach"><img src="${A(a.ach[0])}" alt="">${a.ach[1]}</div>` : ''}
    <div class="media">
      <div class="mapbox"><img src="${A('bg_map')}" style="object-position:${a.mp}" alt="">${mapSvg(a)}</div>
      ${a.ph.map(p => `<div><img class="ph" src="${A(p)}" alt=""></div>`).join('')}
    </div>
    <div class="kud"><span class="faces">${faces.map(p => `<img src="${A(p)}" alt="">`).join('')}</span><span><b class="kc">${a.k + (on ? 1 : 0)}</b> คนให้กำลังใจ · ${a.c} ความคิดเห็น</span></div>
    <div class="acts"><button class="k ${on ? 'on' : ''}">${I.thumb}ให้กำลังใจ</button><button class="c">${I.cmt}คอมเมนต์</button><button class="s">${I.share}แชร์</button></div>
  </article>`;
}

R.feed = pg => {
  const wk = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  pg.innerHTML = `<div class="scroll">
    <div class="topbar"><span class="logo2"><span class="mark" style="width:24px;height:28px"></span><b>ELi</b></span><button class="ib" id="srch" aria-label="ค้นหา">${I.search}</button><button class="ib" id="bell" aria-label="แจ้งเตือน">${I.bell}<i class="dot"></i></button></div>
    <div class="seg" id="seg"><i class="ind"></i><button class="on">กำลังติดตาม</button><button>ของฉัน</button><button>คลับ</button></div>
    <div class="ptr" id="ptr"><img src="${A('eli_happy')}" alt=""></div>
    <div class="wrap" id="wrap">
      <section class="card snap rise">
        <h3>สัปดาห์นี้ของคุณ <span class="streak"><i>🔥</i>${ME.streak} วันติด</span></h3>
        <div class="trio"><div><span>ระยะทาง</span><b class="num" id="wk">0</b><small>กม.</small></div><div><span>เวลา</span><b class="num">${clock(ME.weekSec).replace(/:\d\d$/, '')}</b><small>ชม.</small></div><div><span>ความสูง</span><b class="num">${ME.weekElev}</b><small>ม.</small></div></div>
        <div class="week">${ME.week.map((v, i) => `<div class="${i === 5 ? 'today' : ''}"><i class="${v ? 'on' : ''}" data-h="${v ? 8 + v / 6.3 * 28 : 4}"></i>${wk[i]}</div>`).join('')}</div>
      </section>
      <div id="list">${[0, 1].map(() => `<div class="card skel"><div style="display:flex;gap:10px"><div class="sk" style="width:42px;height:42px;border-radius:50%"></div><div style="flex:1"><div class="sk" style="height:14px;width:50%;margin:4px 0 8px"></div><div class="sk" style="height:10px;width:30%"></div></div></div><div class="sk" style="height:18px;width:70%;margin:16px 0"></div><div class="sk" style="height:160px;border-radius:14px"></div></div>`).join('')}</div>
    </div></div>`;
  const sc = $('.scroll', pg), list = $('#list', pg);
  stickyShadow(sc);
  countUp($('#wk', pg), ME.weekKm, 1000, v => v.toFixed(1));
  setTimeout(() => $$('.week i', pg).forEach(i => i.style.height = i.dataset.h + 'px'), 150);
  // segmented control
  const seg = $('#seg', pg), ind = $('.ind', seg);
  const setSeg = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  requestAnimationFrame(() => setSeg($('button.on', seg)));
  $$('button', seg).forEach((b, i) => b.onclick = () => {
    $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); setSeg(b);
    render(i === 1 ? FEED.filter(a => a.who === 'me') : i === 2 ? FEED.filter(a => a.who !== 'me').reverse() : FEED);
  });
  const render = items => {
    list.innerHTML = items.map(actCard).join('') + `<div class="card tip reveal"><div style="flex:1;position:relative;z-index:1"><b>ELi ภูมิใจในตัวคุณ!</b><span>อีก 1.3 กม. จะครบเป้า 20 กม. สัปดาห์นี้</span></div><img src="${A('eli_happy')}" alt=""></div>`;
    onSeen(sc, '.reveal', el => { el.classList.add('seen'); const p = $('.route', el); if (p) drawPath(p, 1500, 200); });
  };
  later(650, () => render(FEED));
  // card interactions
  list.addEventListener('click', e => {
    const card = e.target.closest('.act'); if (!card) return;
    const a = FEED.find(x => x.id === card.dataset.id);
    if (e.target.closest('.k')) return kudos(e.target.closest('.k'), a, card);
    if (e.target.closest('.c')) return openSheet(`<h4>ความคิดเห็น</h4>${['p1', 'p3', 'p4'].slice(0, Math.max(1, Math.min(3, a.c))).map((p, i) => `<div class="nt"><img class="av" src="${A(p)}" alt=""><span><b>${PEOPLE[p][0]}</b> ${['สุดยอดไปเลย! 🔥', 'เพซดีมากครับ', 'พรุ่งนี้วิ่งด้วยกันนะ!'][i]}</span></div>`).join('')}<div style="height:14px"></div><button class="btn btn-d press" data-close>ปิด</button>`);
    if (e.target.closest('.s')) return go('share', { act: a, back: 'feed' });
    if (e.target.closest('.more')) return openSheet(`<h4>${a.t}</h4><button class="opt" data-close>ดูรายละเอียด</button><button class="opt" data-close>บันทึกเส้นทางนี้</button><button class="opt" data-close>ซ่อนจากฟีด</button>`);
    if (e.target.closest('.media') && !e.target.closest('.mapbox')) return;
    curAct = a; go('activity', { act: a });
  });
  $('#bell', pg).onclick = () => { $('.dot', pg)?.remove(); openSheet(`<h4>การแจ้งเตือน</h4>
    ${[['p2', 'ให้กำลังใจ <b>วิ่งยามเย็นสบายๆ</b> ของคุณ', '2 นาที'], ['p3', 'เริ่มติดตามคุณ', '1 ชม.'], ['p1', 'ท้าคุณเข้าร่วม <b>ชาเลนจ์ 50K ตุลาคม</b>', '3 ชม.'], ['me', '🏅 คุณได้เหรียญ <b>5 วันติด</b>', 'เมื่อวาน']].map(([p, t, w]) => `<div class="nt"><img class="av" src="${A(PEOPLE[p][1])}" alt=""><span><b>${PEOPLE[p][0]}</b> ${t}</span><small>${w}</small></div>`).join('')}`); };
  $('#srch', pg).onclick = () => go('maps');
  // pull to refresh
  const ptr = $('#ptr', pg), wrap = $('#wrap', pg); let y0 = null, dy = 0, busy = false;
  sc.addEventListener('pointerdown', e => { if (sc.scrollTop <= 0 && !busy) { y0 = e.clientY; dy = 0; } });
  sc.addEventListener('pointermove', e => {
    if (y0 == null) return; dy = Math.max(0, Math.min(140, (e.clientY - y0) * .55)); if (!dy) return;
    wrap.style.transform = `translateY(${dy}px)`; ptr.style.opacity = Math.min(1, dy / 70); ptr.style.transform = `translateY(${dy - 80}px) rotate(${dy * 3}deg) scale(${.6 + Math.min(.4, dy / 175)})`;
  });
  const end = () => {
    if (y0 == null) return; y0 = null;
    wrap.style.transition = ptr.style.transition = 'transform .4s cubic-bezier(.22,1,.36,1),opacity .3s';
    if (dy > 70) {
      busy = true; wrap.style.transform = 'translateY(70px)'; ptr.style.transform = 'translateY(-4px)'; ptr.classList.add('spin');
      setTimeout(() => {
        if (!FEED.find(a => a.id === 'a0')) FEED.unshift({ id: 'a0', who: 'p4', when: 'เมื่อสักครู่ · สวนเบญจกิติ', t: 'เดินเล่น 5K กับน้องหมา 🐶', d: '', km: 5.03, sec: 3120, elev: 6, r: 'new', mp: '30% 80%', ph: ['ph3'], k: 2, c: 0 });
        render(FEED); toast('มีกิจกรรมใหม่ 1 รายการ');
        wrap.style.transform = ''; ptr.style.transform = ''; ptr.style.opacity = 0; ptr.classList.remove('spin'); busy = false;
      }, 1100);
    } else { wrap.style.transform = ''; ptr.style.transform = ''; ptr.style.opacity = 0; }
    setTimeout(() => { wrap.style.transition = ''; }, 450);
  };
  sc.addEventListener('pointerup', end); sc.addEventListener('pointerleave', end);
};

function kudos(btn, a, card) {
  KUDO[a.id] = !KUDO[a.id];
  btn.classList.toggle('on', KUDO[a.id]);
  $('.kc', card).textContent = a.k + (KUDO[a.id] ? 1 : 0);
  if (!KUDO[a.id]) return;
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('i'); b.className = 'burst';
    const ang = i / 10 * Math.PI * 2; b.style.setProperty('--x', Math.cos(ang) * 34 + 'px'); b.style.setProperty('--y', Math.sin(ang) * 34 + 'px');
    b.style.background = i % 2 ? '#FC5A1E' : '#FFC83D'; btn.append(b); setTimeout(() => b.remove(), 750);
  }
  const p = document.createElement('span'); p.className = 'plus'; p.textContent = '+1'; btn.append(p); setTimeout(() => p.remove(), 950);
}

/* record */
const REC_PATH = 'M195 470 C215 440 250 430 262 400 S250 330 280 300 S340 270 330 220 S270 170 230 180 S160 200 140 160 S150 100 190 90';
const RUN = { state: 'idle', sec: 0, m: 0, sport: 'วิ่ง' };
R.record = pg => {
  pg.classList.add('rec-pg');
  Object.assign(RUN, { state: 'idle', sec: 0, m: 0, next: 500 });
  pg.innerHTML = `
    <img class="map" src="${A('bg_map')}" alt="">
    <svg class="trk" viewBox="0 0 390 844" preserveAspectRatio="xMidYMin slice"><path class="route-bg" d="${REC_PATH}" id="rbg"/><path class="route" d="${REC_PATH}" id="rp"/></svg>
    <div class="gps-me" id="me" style="left:195px;top:470px"></div>
    <div class="rec-top"><button class="pill press" data-go="feed" aria-label="ปิด" style="width:40px;padding:0;justify-content:center"><span style="width:20px;height:20px">${I.x}</span></button>
      <button class="pill press" id="sport">${RUN.sport} ${I.chev}</button><span style="flex:1"></span><div class="pill"><i class="gpsd" id="gd"></i><span id="gt">กำลังหา GPS…</span></div></div>
    <div class="recp" id="rp2">
      <div class="live">
        <div class="big"><span>เวลา</span><b class="num" id="rt">0:00</b></div>
        <div><span>ระยะทาง (กม.)</span><b class="num" id="rd">0.00</b></div>
        <div><span>เพซ (/กม.)</span><b class="num" id="rpc">-'--"</b></div>
        <div class="hr"><span>หัวใจ (bpm)</span><b class="num"><i>♥</i> <span id="rh" style="display:inline;font-size:inherit;color:inherit">--</span></b></div>
      </div>
      <div class="btns">
        <button class="side-btn press" id="rtBtn"><span><img src="${A('i_route')}" alt=""></span>เส้นทาง</button>
        <button class="go-btn press" id="go">เริ่ม</button>
        <button class="side-btn press" id="snBtn"><span><img src="${A('i_heart')}" alt=""></span>เซนเซอร์</button>
      </div>
      <div class="pz"><button class="res press" id="res">วิ่งต่อ</button><button class="fin" id="fin"><i></i><span style="position:relative">กดค้างเพื่อจบ</span></button></div>
    </div>`;
  bindGo(pg);
  const rp = $('#rp', pg), rbg = $('#rbg', pg), L = rp.getTotalLength(), me = $('#me', pg), panel = $('#rp2', pg);
  [rp, rbg].forEach(p => { p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const buddy = new Buddy(panel);
  panel.insertAdjacentHTML('beforeend', '<i class="buddy-hit" title="แตะน้อง ELi"></i>');
  $('.buddy-hit', panel).onclick = () => buddy.tap();
  cleanup.push(() => { sceneId++; buddy.destroy(); });
  later(1400, () => { $('#gd', pg).classList.add('ok'); $('#gt', pg).textContent = 'GPS พร้อม'; });
  $('#sport', pg).onclick = () => openSheet(`<h4>เลือกกิจกรรม</h4>${[['วิ่ง', 'i_run'], ['เดิน', 'i_feet'], ['วิ่งเทรล', 'b_mountain'], ['วิ่งบนลู่', 'i_shoe']].map(([n, ic]) => `<button class="opt ${n === RUN.sport ? 'on' : ''}" data-n="${n}"><img src="${A(ic)}" alt="">${n}<i class="ck"></i></button>`).join('')}`, sh => {
    $$('.opt', sh).forEach(o => o.onclick = () => { $$('.opt', sh).forEach(x => x.classList.toggle('on', x === o)); RUN.sport = o.dataset.n; $('#sport', pg).innerHTML = `${RUN.sport} ${I.chev}`; setTimeout(closeSheet, 250); });
  });
  $('#rtBtn', pg).onclick = () => toast('เส้นทางแนะนำ: ลุมพินีลูป 2.5 กม.');
  $('#snBtn', pg).onclick = () => toast('เชื่อมต่อสายคาดอก ELi HR แล้ว ♥');
  const tick = () => {
    if (RUN.state !== 'running') return;
    RUN.sec += 6; RUN.m += 6 * (1000 / 355) * (0.94 + Math.random() * .12);   // ~5'55"/km, sped up 12x
    $('#rt', pg).textContent = clock(RUN.sec);
    $('#rd', pg).textContent = (RUN.m / 1000).toFixed(2);
    $('#rpc', pg).textContent = RUN.m > 50 ? paceStr(RUN.sec / (RUN.m / 1000)) : "-'--\"";
    $('#rh', pg).textContent = 138 + Math.round(Math.sin(RUN.sec / 40) * 9 + Math.random() * 4);
    const k = Math.min(1, RUN.m / 1500), pt = rp.getPointAtLength(L * k);
    [rp, rbg].forEach(p => p.style.strokeDashoffset = L * (1 - k));
    me.style.left = pt.x + 'px'; me.style.top = pt.y + 'px';
    if (RUN.m >= RUN.next) { buddy.cheer(`ครบ ${(RUN.next / 1000).toFixed(1)} กม.! 💪`); RUN.next += 500; }
    else if (RUN.sec % 90 === 0) buddy.cheer(['สู้ๆ!', 'เพซกำลังดี!', 'หายใจลึกๆ นะ', 'ไปด้วยกัน!'][RUN.sec / 90 % 4]);
  };
  every(500, tick);
  $('#go', pg).onclick = () => {
    if (RUN.state === 'idle') {
      RUN.state = 'warmup';
      readyScene(pg).then(() => {
        if (cur !== 'record') return;
        RUN.state = 'running'; panel.classList.add('running'); $('#go', pg).innerHTML = I.pause; buddy.run(); tick();
        setTimeout(() => buddy.cheer('ไปกันเลย!'), 400);
      });
    } else if (RUN.state === 'running') { RUN.state = 'paused'; panel.classList.remove('running'); panel.classList.add('paused'); buddy.rest(); }
  };
  $('#res', pg).onclick = () => { RUN.state = 'running'; panel.classList.remove('paused'); panel.classList.add('running'); buddy.run(); buddy.cheer('ลุยต่อ!'); };
  const fin = $('#fin', pg); let ht;
  const hold = () => {
    fin.classList.add('hold');
    ht = setTimeout(() => {
      RUN.state = 'done'; const km = Math.max(RUN.m / 1000, 3.21), sec = Math.max(RUN.sec, 1140);
      finishScene(pg, { km, time: clock(sec), pace: paceStr(sec / km) }).then(() => cur === 'record' && go('save'));
    }, 900);
  };
  const rel = () => { fin.classList.remove('hold'); clearTimeout(ht); };
  fin.addEventListener('pointerdown', hold); fin.addEventListener('pointerup', rel); fin.addEventListener('pointerleave', rel);
};

R.save = pg => {
  const km = Math.max(RUN.m / 1000, 3.21), sec = Math.max(RUN.sec, 1140);
  pg.innerHTML = `<div class="scroll">
    <div class="hero" id="hero"><i class="rays"></i></div>
    <h2 class="rise">เยี่ยมมาก! วิ่งสำเร็จ 🎉</h2><p class="sub rise" style="--d:.05s">ทุกก้าววันนี้ทำให้คุณดีกว่าเมื่อวาน</p>
    <div class="g3"><div class="card pop" style="--d:.1s"><span>ระยะทาง</span><b class="num" id="sk">0</b></div><div class="card pop" style="--d:.18s"><span>เวลา</span><b class="num">${clock(sec)}</b></div><div class="card pop" style="--d:.26s"><span>เพซ</span><b class="num">${paceStr(sec / km)}</b></div></div>
    <div class="badges">${[['b_silver', '1K เร็วสุด<br>อันดับ 2'], ['b_streak', 'วิ่ง 6 วันติด'], ['b_sun', 'นักวิ่งยามเช้า']].map(([b, t], i) => `<div class="card pop" style="--d:${.4 + i * .15}s"><img src="${A(b)}" alt="">${t}</div>`).join('')}</div>
    <div class="card fld rise" style="--d:.2s"><label>ชื่อกิจกรรม</label><input id="ttl" value="${RUN.sport}ยามเช้าสดใส ☀️"></div>
    <div class="feel rise" style="--d:.25s">${[['😌', 'สบายๆ'], ['🙂', 'พอดี'], ['😤', 'เหนื่อย'], ['🥵', 'สุดแรง']].map(([e, t], i) => `<button class="${i === 1 ? 'on' : ''}"><b>${e}</b>${t}</button>`).join('')}</div>
    <button class="btn btn-o press" id="sv">บันทึกกิจกรรม</button><div style="height:10px"></div>
    <button class="btn btn-d press" id="svs">📸 บันทึก + แชร์สตอรี่ด้วยรูปของฉัน</button><div style="height:10px"></div>
    <button class="btn btn-d press" data-go="record">ทิ้งกิจกรรมนี้</button><div style="height:40px"></div></div>`;
  bindGo(pg);
  cleanup.push(heroEli($('#hero', pg)));
  countUp($('#sk', pg), km, 1000, v => v.toFixed(2));
  later(500, () => confetti(90));
  $$('.feel button', pg).forEach(b => b.onclick = () => $$('.feel button', pg).forEach(x => x.classList.toggle('on', x === b)));
  const saveAct = share => {
    const a = { id: 'n' + Date.now(), who: 'me', when: 'เมื่อสักครู่ · กรุงเทพฯ', t: $('#ttl', pg).value || 'วิ่ง', d: '', km, sec, elev: 12, r: 'new', mp: '50% 40%', ph: ['ph1'], ach: ['b_silver', '1K เร็วสุดอันดับ 2'], k: 0, c: 0 };
    FEED.unshift(a); ME.weekKm = +(ME.weekKm + km).toFixed(1); ME.week[5] += km; ME.streak++;
    curAct = a; if (share) go('share', { act: a, back: 'activity' }); else { go('activity', { act: a, dir: 'up' }); toast('บันทึกแล้ว · แชร์ลงฟีดเรียบร้อย'); }
  };
  $('#sv', pg).onclick = () => saveAct(false);
  $('#svs', pg).onclick = () => saveAct(true);
};

R.activity = (pg, opt) => {
  pg.classList.add('det');
  const a = opt.act || curAct, [nm, av] = PEOPLE[a.who];
  const n = Math.max(1, Math.floor(a.km)), base = a.sec / a.km;
  const splits = Array.from({ length: n }, (_, i) => base * (1 + Math.sin(i * 1.7 + a.km) * .05 + (i === n - 1 ? -.04 : 0)));
  const best = splits.indexOf(Math.min(...splits));
  const elev = Array.from({ length: 40 }, (_, i) => 6 + a.elev * (.5 + .5 * Math.sin(i / 5 + a.km)) + Math.sin(i * 1.3) * 2);
  const W = 340, H = 120, mx = Math.max(...elev) + 4;
  const pts = elev.map((v, i) => [i / (elev.length - 1) * W, H - v / mx * (H - 16)]);
  const line = 'M' + pts.map(p => p.map(x => x.toFixed(1)).join(' ')).join(' L');
  pg.innerHTML = `<div class="scroll">
    <div class="hmap mapbox"><img src="${A('bg_map')}" style="object-position:${a.mp}" alt="">${mapSvg(a, '<g id="kms"></g>')}
      <button class="back press" data-go="feed" aria-label="กลับ">${I.back}</button><button class="back share press" id="shr" aria-label="แชร์">${I.share}</button></div>
    <div class="body">
      <div style="display:flex;gap:10px;align-items:center" class="rise"><img class="av" src="${A(av)}" alt=""><div><b>${nm}</b><div style="font-size:12px;color:var(--muted)">${a.when}</div></div></div>
      <h2 style="margin:12px 4px 0;font-size:24px" class="rise">${a.t}</h2>
      <div class="card grid6 rise" style="--d:.1s">
        <div><span>ระยะทาง</span><b class="num" data-n="${a.km}" data-f="2">0</b></div><div><span>เพซเฉลี่ย</span><b class="num">${paceStr(base)}</b></div><div><span>เวลาเคลื่อนที่</span><b class="num">${clock(a.sec)}</b></div>
        <div><span>ความสูงสะสม</span><b class="num" data-n="${a.elev}">0</b></div><div><span>แคลอรี่</span><b class="num" data-n="${Math.round(a.km * 68)}">0</b></div><div><span>หัวใจเฉลี่ย</span><b class="num" data-n="146">0</b></div>
      </div>
      ${a.ach ? `<h5>ความสำเร็จ</h5><div class="badges" style="margin:0">${[a.ach[0], 'b_streak', 'b_shoe'].map((b, i) => `<div class="card pop" style="--d:${.3 + i * .12}s"><img src="${A(b)}" alt="">${[a.ach[1].split('·')[0], '5 วันติด', 'ครบ 100 กม.'][i]}</div>`).join('')}</div>` : ''}
      <h5>สปลิต (ต่อกิโลเมตร)</h5>
      <div class="card splits" id="spl"><div class="r h"><span>กม.</span><span>เพซ</span><span></span><small>ความสูง</small></div>
        ${splits.map((s, i) => `<div class="r ${i === best ? 'best' : ''}"><b class="num">${i + 1}</b><span class="num">${paceStr(s)}</span><i data-w="${(Math.min(...splits) / s) ** 3 * 100}"></i><small>${Math.round(elev[i * 3 % 40] - 6) >= 0 ? '+' : ''}${Math.round(elev[i * 3 % 40] - 6)}</small></div>`).join('')}</div>
      <h5>ความสูง</h5>
      <div class="card elev"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FC5A1E" stop-opacity=".35"/><stop offset="1" stop-color="#FC5A1E" stop-opacity="0"/></linearGradient><clipPath id="ec"><rect id="ecr" width="0" height="${H}"/></clipPath></defs>
        <g clip-path="url(#ec)"><path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#eg)"/><path d="${line}" fill="none" stroke="#FC5A1E" stroke-width="2.5" stroke-linejoin="round"/></g></svg></div>
      <h5>โซนหัวใจ</h5>
      <div class="card zones" id="zn">${[['Z5', 6, '#F0435A'], ['Z4', 22, '#FC5A1E'], ['Z3', 41, '#FFC83D'], ['Z2', 24, '#1DB070'], ['Z1', 7, '#8FB0FF']].map(([z, p, c]) => `<div class="z"><b class="num">${z}</b><i style="background:${c}" data-w="${p / 41 * 100}"></i><small class="num">${p}%</small></div>`).join('')}</div>
      <h5>ให้กำลังใจ ${a.k + (KUDO[a.id] ? 1 : 0)} คน</h5>
      <div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:10px"><span class="faces">${['p1', 'p2', 'p3', 'p4'].map(p => `<img src="${A(p)}" alt="" style="width:34px;height:34px">`).join('')}</span><span style="flex:1"></span><button class="btn btn-o press" id="kd" style="width:auto;height:40px;padding:0 18px;margin:0;font-size:14px">${KUDO[a.id] ? 'ให้แล้ว ✓' : '👍 ให้กำลังใจ'}</button></div>
    </div></div>`;
  bindGo(pg);
  const sc = $('.scroll', pg);
  pg.insertAdjacentHTML('beforeend', '<i class="sbarbg"></i>');
  sc.addEventListener('scroll', () => $('.sbarbg', pg).classList.toggle('on', sc.scrollTop > 280));
  drawPath($('.route', pg), 1600, 250); drawPath($('.route-bg', pg), 1600, 250);
  // km markers appear as the route draws
  const rp = $('.route', pg), L = rp.getTotalLength(), g = $('#kms', pg);
  for (let i = 1; i <= Math.min(n, 9); i++) {
    const p = rp.getPointAtLength(L * i / (a.km)); if (i / a.km > 1) break;
    later(250 + 1600 * i / a.km, () => g.insertAdjacentHTML('beforeend', `<g style="transform-origin:${p.x}px ${p.y}px;animation:pop .5s cubic-bezier(.34,1.56,.64,1) both"><circle class="km" cx="${p.x}" cy="${p.y}" r="8"/><text class="kmt" x="${p.x}" y="${p.y}">${i}</text></g>`));
  }
  $$('.grid6 b[data-n]', pg).forEach(b => countUp(b, +b.dataset.n, 1100, v => b.dataset.f ? v.toFixed(2) : fmt(Math.round(v))));
  onSeen(sc, '#spl', el => $$('i', el).forEach((i, k) => setTimeout(() => i.style.width = i.dataset.w + '%', k * 60)));
  onSeen(sc, '.elev', () => { const r = $('#ecr', pg); r.style.transition = 'width 1.4s cubic-bezier(.45,0,.2,1)'; requestAnimationFrame(() => r.setAttribute('width', W)); });
  onSeen(sc, '#zn', el => $$('i', el).forEach((i, k) => setTimeout(() => i.style.width = i.dataset.w + '%', k * 90)));
  $('#kd', pg).onclick = e => { if (KUDO[a.id]) return; KUDO[a.id] = true; e.currentTarget.textContent = 'ให้แล้ว ✓'; e.currentTarget.classList.add('hop'); confetti(30); };
  $('#shr', pg).onclick = () => go('share', { act: a, back: 'activity' });
};

const SEGS = [
  { n: 'สปรินต์ริมบึงลุมพินี', d: '0.8 กม.', g: '0%', my: "3'42\"", lead: ['p1', "3'05\""], b: 'b_crown', p: 'M60 520 C120 500 180 510 230 470', mine: false },
  { n: 'ทางขึ้นสะพานพระราม 8', d: '1.2 กม.', g: '4%', my: "6'10\"", lead: ['p3', "4'51\""], b: 'b_mountain', p: 'M250 300 C280 260 300 230 340 200', mine: true },
  { n: 'ลูปสวนเบญจกิติ', d: '2.5 กม.', g: '1%', my: "14'20\"", lead: ['p2', "11'02\""], b: 'b_gold', p: 'M120 640 C80 600 90 560 140 560 S200 610 160 650 Z', mine: false },
];
R.maps = pg => {
  const heat = ['M-10 380 C80 360 140 400 200 380 S330 330 400 350', 'M60 900 C80 760 60 640 120 560 S230 470 240 380 S250 200 300 120', 'M-10 200 C70 220 150 180 250 200 S360 260 400 240', 'M200 -10 C190 100 220 200 230 300 S260 480 250 600 S220 760 240 860', 'M-10 640 C60 620 120 660 180 640 S300 600 400 620', 'M120 640 C80 600 90 560 140 560 S200 610 160 650 Z', 'M60 520 C120 500 180 510 230 470', 'M250 300 C280 260 300 230 340 200'];
  pg.innerHTML = `<img class="map" src="${A('bg_map')}" alt="">
    <svg class="heat" viewBox="0 0 390 844" preserveAspectRatio="xMidYMin slice">${heat.map((d, i) => `<path d="${d}" stroke-width="${3 + i % 3 * 2}" opacity="${.35 + i % 3 * .15}"/><path class="flow" d="${d}" style="animation-delay:${-i * .3}s"/>`).join('')}<path class="sel" id="sel" d=""/></svg>
    <div class="search">${I.search}ค้นหาเส้นทาง เซกเมนต์ สถานที่</div>
    <div class="chips">${['🔥 ฮีทแมป', 'เซกเมนต์', 'เส้นทางแนะนำ', 'ใกล้ฉัน', 'ทางเรียบ'].map((c, i) => `<button class="${i ? '' : 'on'}">${c}</button>`).join('')}</div>
    <div class="segs" id="segs">${SEGS.map((s, i) => `<button class="card sgc rise ${i ? '' : 'on'}" style="--d:${.1 + i * .08}s" data-i="${i}"><b>${s.n}</b>
      <div class="m"><span>ระยะ <em>${s.d}</em></span><span>ความชัน <em>${s.g}</em></span><span>ของฉัน <em>${s.my}</em></span></div>
      <div class="lead"><img class="b" src="${A(s.b)}" alt=""><img class="av" src="${A(s.lead[0])}" alt=""><span>${PEOPLE[s.lead[0]][0]} ครองอันดับ 1</span><b class="num">${s.lead[1]}</b></div>
      <svg class="elevmini" viewBox="0 0 270 34" preserveAspectRatio="none"><path d="M0 30 ${Array.from({ length: 12 }, (_, k) => `L${(k + 1) * 22.5} ${30 - (Math.sin(k * .9 + i) * .5 + .5) * (i === 1 ? 26 : 10) - (i === 1 ? k * 1.5 : 0)}`).join(' ')} L270 34 L0 34Z" fill="#FFE7DC"/></svg></button>`).join('')}</div>`;
  const sel = $('#sel', pg), cards = $$('.sgc', pg), segs = $('#segs', pg);
  const pick = i => { cards.forEach((c, k) => c.classList.toggle('on', k === i)); sel.setAttribute('d', SEGS[i].p); drawPath(sel, 900); };
  later(400, () => pick(0));
  cards.forEach((c, i) => c.onclick = () => { pick(i); c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); });
  let st; segs.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { const i = Math.round(segs.scrollLeft / 310); if (!cards[i].classList.contains('on')) pick(i); }, 120); });
  $$('.chips button', pg).forEach(b => b.onclick = () => { $$('.chips button', pg).forEach(x => x.classList.toggle('on', x === b)); toast(b.textContent.trim()); });
  $('.search', pg).onclick = () => toast('พิมพ์ชื่อสถานที่เพื่อค้นหา');
};

const CHAL = [
  { n: 'วิ่งครบ 5K', s: 'สัปดาห์นี้ · 12,408 คน', p: 1, b: 'b_shoe', j: true },
  { n: 'ปีนสะสม 500 ม.', s: 'ตุลาคม · 3,210 คน', p: .28, b: 'b_mountain', j: false },
  { n: 'นักวิ่งยามเช้า 10 วัน', s: 'ก่อน 7 โมง · 8,005 คน', p: .6, b: 'b_sun', j: true },
  { n: 'วิ่ง 7 วันติด', s: 'ต่อเนื่อง · 21,774 คน', p: 5 / 7, b: 'b_streak', j: true },
];
R.groups = pg => {
  pg.innerHTML = `<div class="scroll">
    <div class="topbar"><h1>กลุ่ม</h1><button class="ib" aria-label="ค้นหา">${I.search}</button></div>
    <div class="seg" id="seg"><i class="ind"></i><button class="on">ชาเลนจ์</button><button>คลับ</button></div>
    <div class="wrap" id="gw"></div></div>`;
  const sc = $('.scroll', pg), gw = $('#gw', pg); stickyShadow(sc);
  const seg = $('#seg', pg), ind = $('.ind', seg);
  const setSeg = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  requestAnimationFrame(() => setSeg($('button.on', seg)));
  const chal = () => {
    gw.innerHTML = `
      <section class="card chal rise"><div class="t">ชาเลนจ์เดือนนี้</div><b>ELi 50K ตุลาคม</b><div class="ds" style="font-size:13px;opacity:.9;position:relative;z-index:1">สะสม 50 กม. รับเหรียญดิจิทัล + สติกเกอร์น้อง ELi</div>
        <div class="cd"><span><b id="cdd">12</b>วัน</span><span><b id="cdh">08</b>ชม.</span><span><b id="cdm">41</b>นาที</span><span><b id="cds">20</b>วิ</span></div>
        <button class="jn press" id="jn">เข้าร่วม</button>
        <div class="ringw"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="8"/><circle id="rg" cx="48" cy="48" r="42" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="264" style="transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) .3s"/></svg><img src="${A('b_gold')}" alt=""></div></section>
      ${CHAL.map((c, i) => `<div class="card cl rise" style="--d:${.08 + i * .06}s"><img src="${A(c.b)}" alt=""><div class="tx"><b>${c.n}</b><span>${c.s}</span><div class="pb"><i data-w="${c.p * 100}"></i></div></div><button class="jb ${c.j ? 'on' : ''}" data-i="${i}">${c.j ? (c.p >= 1 ? 'สำเร็จ ✓' : 'เข้าร่วมแล้ว') : 'เข้าร่วม'}</button></div>`).join('')}
      <h5 style="margin:18px 6px 10px;font-size:16px">อันดับเพื่อนสัปดาห์นี้</h5>
      <div class="card lb">${[['p3', 32.4], ['p2', 27.9], ['me', ME.weekKm], ['p1', 15.2], ['p4', 9.8]].sort((a, b) => b[1] - a[1]).map(([p, v], i, arr) => `<div class="r ${p === 'me' ? 'me' : ''}"><span class="rk">${i + 1}</span><img class="av" src="${A(PEOPLE[p][1])}" alt="" style="width:36px;height:36px"><div class="nm">${p === 'me' ? 'คุณ' : PEOPLE[p][0]}<i data-w="${v / arr[0][1] * 100}"></i></div><span class="v">${v.toFixed(1)} กม.</span></div>`).join('')}</div>`;
    setTimeout(() => { $$('.pb i,.lb .nm i', gw).forEach(i => i.style.width = i.dataset.w + '%'); const rg = $('#rg', gw); if (rg) rg.style.strokeDashoffset = 264 * (1 - ME.weekKm / 50); }, 120);
    let left = 12 * 86400 + 8 * 3600 + 41 * 60 + 20;
    every(1000, () => { left--; const d = $('#cdd', gw); if (!d) return; d.textContent = Math.floor(left / 86400); $('#cdh', gw).textContent = String(Math.floor(left / 3600) % 24).padStart(2, '0'); $('#cdm', gw).textContent = String(Math.floor(left / 60) % 60).padStart(2, '0'); $('#cds', gw).textContent = String(left % 60).padStart(2, '0'); });
    $('#jn', gw).onclick = e => { const b = e.currentTarget; if (b.classList.contains('on')) return; b.classList.add('on'); b.textContent = 'เข้าร่วมแล้ว ✓'; confetti(60); toast('เข้าร่วม ELi 50K แล้ว!'); };
    $$('.jb', gw).forEach(b => b.onclick = () => { const c = CHAL[b.dataset.i]; if (c.p >= 1) return toast('ชาเลนจ์นี้สำเร็จแล้ว 🏅'); c.j = !c.j; b.classList.toggle('on', c.j); b.textContent = c.j ? 'เข้าร่วมแล้ว' : 'เข้าร่วม'; b.classList.add('hop'); setTimeout(() => b.classList.remove('hop'), 600); });
  };
  const clubs = () => {
    gw.innerHTML = [['ELi Run Club Bangkok', '48,210 สมาชิก · วิ่งทุกเสาร์ 6 โมง', 'b_shoe'], ['สายเทรลเชียงใหม่', '6,882 สมาชิก', 'b_mountain'], ['วิ่งเช้าก่อนทำงาน', '12,004 สมาชิก', 'b_sun'], ['Lumpini Night Runners', '3,560 สมาชิก', 'b_streak']].map(([n, s, b], i) =>
      `<div class="card cl rise" style="--d:${i * .06}s"><img src="${A(b)}" alt=""><div class="tx"><b>${n}</b><span>${s}</span></div><button class="jb ${i ? '' : 'on'}">${i ? 'เข้าร่วม' : 'สมาชิก'}</button></div>`).join('');
    $$('.jb', gw).forEach(b => b.onclick = () => { b.classList.toggle('on'); b.textContent = b.classList.contains('on') ? 'สมาชิก' : 'เข้าร่วม'; });
  };
  $$('button', seg).forEach((b, i) => b.onclick = () => { $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); setSeg(b); cleanup.forEach(f => f()); cleanup = []; (i ? clubs : chal)(); });
  chal();
};

R.you = pg => {
  const wk = [8, 12, 5, 14, 16, 11, 18, 9, 20, 17, 22, ME.weekKm], W = 340, H = 150, mx = 25;
  const pts = wk.map((v, i) => [10 + i / (wk.length - 1) * (W - 20), H - 10 - v / mx * (H - 30)]);
  const line = 'M' + pts.map(p => p.map(x => x.toFixed(1)).join(' ')).join(' L');
  pg.innerHTML = `<div class="scroll">
    <div class="topbar"><h1>ฉัน</h1><button class="ib" aria-label="แชร์">${I.share}</button></div>
    <div class="ph rise"><img src="${A('avatar')}" alt=""><div><b>สายสุขภาพ</b><div style="font-size:13px;color:var(--ink2)">กรุงเทพฯ · นักวิ่งสายชิล</div><div class="ff"><span><em>128</em> ผู้ติดตาม</span><span><em>96</em> กำลังติดตาม</span></div></div></div>
    <div class="wrap">
      <section class="card chart rise" style="--d:.05s"><div class="h"><span style="font-size:13px;color:var(--muted)">12 สัปดาห์ล่าสุด</span><span><b class="num" id="ck">${ME.weekKm}</b> <small>กม.</small></span></div>
        <svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FC5A1E" stop-opacity=".28"/><stop offset="1" stop-color="#FC5A1E" stop-opacity="0"/></linearGradient></defs>
          ${[0, 1, 2].map(k => `<line x1="0" x2="${W}" y1="${20 + k * 40}" y2="${20 + k * 40}" stroke="#EEF0F4"/>`).join('')}
          <path id="ya" d="${line} L${W - 10} ${H} L10 ${H}Z" fill="url(#yg)" opacity="0" style="transition:opacity .8s .9s"/>
          <path id="yl" d="${line}" fill="none" stroke="#FC5A1E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
          ${pts.map((p, i) => `<circle class="pt" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 6 : 4}" fill="#fff" stroke="#FC5A1E" stroke-width="2.5" style="opacity:0;transition:opacity .3s ${.15 + i * .1}s"/>`).join('')}</svg>
        <div class="tt" id="tt"></div></section>
      <button class="card lvl rise press" style="--d:.1s;width:100%;text-align:left" data-go="eli"><img class="bob" src="${A('eli_happy')}" alt=""><div class="tx"><b>${LPX.tier(LPX.level(G.total)).ic} Lv.${LPX.level(G.total)} ${LPX.tier(LPX.level(G.total)).name}</b><div style="font-size:12px;color:var(--ink2)">${fmt(G.total)} / ${fmt(LPX.req(LPX.level(G.total) + 1))} LP · 🪙 ${G.coins} · 🔥 ${G.streak} วัน</div><div class="pb"><i data-w="${(G.total - LPX.req(LPX.level(G.total))) / (LPX.req(LPX.level(G.total) + 1) - LPX.req(LPX.level(G.total))) * 100}"></i></div></div></button>
      <h5 style="margin:16px 6px 10px;font-size:16px">ตู้ถ้วยรางวัล</h5>
      <section class="card troph rise" style="--d:.15s">${[['b_gold', '5K PR'], ['b_silver', '10K PR'], ['b_bronze', 'Half'], ['b_crown', 'Legend'], ['b_streak', '5 วันติด'], ['b_shoe', '100 กม.'], ['b_sun', 'ยามเช้า'], ['b_mountain', 'ปีนเขา', 1]].map(([b, t, l]) => `<button class="${l ? 'lock' : ''}"><img src="${A(b)}" alt="">${t}</button>`).join('')}</section>
      <h5 style="margin:16px 6px 10px;font-size:16px">สถิติที่ดีที่สุด</h5>
      <section class="card best rise" style="--d:.2s">${[['400 ม.', "1:52"], ['1 กม.', "5:21", 1], ['5 กม.', "28:40", 1], ['10 กม.', "1:02:11"]].map(([d, t, p]) => `<div class="r"><span>${d}</span><span><b class="num">${t}</b>${p ? '<span class="pr">PR ใหม่</span>' : ''}</span></div>`).join('')}</section>
    </div></div>`;
  stickyShadow($('.scroll', pg));
  bindGo(pg);
  drawPath($('#yl', pg), 1300, 150);
  setTimeout(() => { $('#ya', pg).style.opacity = 1; $$('.pt', pg).forEach(c => c.style.opacity = 1); $$('.lvl .pb i', pg).forEach(i => i.style.width = i.dataset.w + '%'); }, 60);
  const tt = $('#tt', pg), chart = $('.chart', pg), svg = $('svg', chart);
  const show = i => {
    const c = $(`.pt[data-i="${i}"]`, pg), r = svg.getBoundingClientRect(), cr = chart.getBoundingClientRect(), k = r.width / W;
    tt.style.left = Math.max(70, Math.min(chart.offsetWidth - 70, (r.left - cr.left + pts[i][0] * k) / (cr.width / chart.offsetWidth))) + 'px';
    tt.style.top = (r.top - cr.top + pts[i][1] * k) / (cr.width / chart.offsetWidth) + 'px';
    tt.textContent = `สัปดาห์ ${i + 1} · ${wk[i]} กม.`;
    $$('.pt', pg).forEach(p => p.setAttribute('r', p === c ? 7 : 4));
    $('#ck', pg).textContent = wk[i];
  };
  later(1500, () => show(wk.length - 1));
  $$('.pt', pg).forEach(c => c.onclick = () => show(+c.dataset.i));
  $$('.troph button', pg).forEach(b => b.onclick = () => b.classList.contains('lock') ? toast('ปีนสะสม 500 ม. เพื่อปลดล็อก') : (b.querySelector('img').classList.remove('hop'), void b.offsetWidth, b.querySelector('img').classList.add('hop')));
};

/* redesigned screens (life.js, welcome.js, onboard.js, home.js, hall.js, feed.js) replace the originals above */
Object.assign(R, LIFE);

/* ── boot ── */
/* tab icons: set '0' = the flat icons cut from mockup A; 'A'/'B'/'C' = generated 3D sets (assets/tb_<set>_<tab>.png).
   Pick with ?icons=A|B|C (remembered on this device). */
const TBSET = (() => { const v = new URLSearchParams(location.search).get('icons'); return ['0', 'A', 'B', 'C', 'D'].includes(v) ? v : TB_DEFAULT; })();   // ?icons=… only for comparing sets; not remembered
$('#tabbar').classList.add('set' + TBSET);
$('#tabbar').innerHTML = TABS.map(([k, l]) => {
  const n = TBSET === '0' ? 'assets/' + { world: 't_planet0', trek: 't_mount', dream: 't_moon', hall: 't_trophy', treasury: 't_chest' }[k] + '.png' : TBSET === 'D' ? `assets/${k === 'trek' ? 'hd_trek2' : 'hd_' + k}.png` : `assets/tb_${TBSET}_${k}.png`;
  return `<button data-go="${k}"${k === 'trek' ? ' class="play"' : ''}><span class="tb-i"><img class="mk" src="${n}" alt=""></span><span class="tb-l"${TBSET === 'D' ? ` data-fw="${{ world: 48.6, dream: 50, trek: 51, hall: 40.8, treasury: 36.6 }[k]}"` : ''}>${l}</span></button>`;
}).join('') + '<i class="bar"></i>' + (TBSET === 'D' ? spk('left:0;top:1.9px;width:16.4px;height:16.4px', -35) + spk('left:214.5px;top:-4px;width:14px;height:15px', 40, 2) : '');
if (TBSET === 'D') { const f = () => hdFit($('#tabbar')); f(); document.fonts?.ready.then(f); document.fonts?.addEventListener('loadingdone', f); setTimeout(f, 1500); }
bindGo($('#tabbar'));
$('#jump').innerHTML = SCREENS.map(([k, l], i) => `<button data-go="${k}"><b>0${i + 1}</b><span>${l}</span></button>`).join('');
bindGo($('#jump'));
/* Responsive: the UI is designed on a 390-pt-wide canvas.
   · phones (≤520 px wide): the whole app is scaled to the screen width (k = vw/390); its height becomes vh/k design points.
   · tablets / desktops / phones in landscape: FULL SCREEN — the app fills the window. k = min(vw/390, vh/720); the canvas
     becomes vw/k × vh/k points. Backgrounds are full-bleed, page content sits in a centred 390-pt column (CSS var --ex =
     the side margin), and the home HUD hugs the screen edges like a game HUD.
   · ?frame=1 keeps the old presentation (phone frame + screen list) for design reviews. */
/* full-screen mode: which page elements belong to the centred 390-pt design column?
   An element laid out inside x = 0…390 of the design (px-positioned) gets .col (shifted by --ex); anything wider —
   full-bleed backgrounds, left/right:0 bars, left:50% centred boxes, right-anchored chips — already sits right on the
   wide canvas, so it stays and its absolutely-positioned children are checked in turn. Flow content inside those is left alone. */
function colTag(box, pg) {
  for (const el of box.children) {
    if (el.classList.contains('col') || el.classList.contains('hud-l') || el.classList.contains('hud-r')) continue;
    const abs = /absolute|fixed/.test(getComputedStyle(el).position);
    if (!abs && box !== pg) continue;
    const pr = pg.getBoundingClientRect(), k = pr.width / pg.offsetWidth || 1, er = el.getBoundingClientRect();
    const l = (er.left - pr.left) / k, r = l + el.offsetWidth;   // where it sits on the page, in design points
    if (l >= -6 && r <= 396) el.classList.add('col');
    else if (abs) colTag(el, pg);
  }
}
new MutationObserver(ms => {   // ELi, particles, coins … added later go through the same check
  if (appW <= 392) return;
  for (const m of ms) {
    const box = m.target, pg = box.closest && box.closest('.pg');
    if (!pg || box.closest('.col')) continue;
    if (box === pg || /absolute|fixed/.test(getComputedStyle(box).position)) colTag(box, pg);
  }
}).observe($('#view'), { childList: true, subtree: true });
let appH = 844, appW = 390;
const FRAME = new URLSearchParams(location.search).has('frame');
function fit() {
  const w = $('#wrap'), app = $('#app');
  const mob = innerWidth <= 520, full = !mob && !FRAME;
  document.body.classList.toggle('mob', mob || full);   // the app is the screen: the mock 9:41 status bar is hidden
  document.body.classList.toggle('full', full);
  if (mob || full) {
    w.style.transform = '';
    // a host page may pad the root by the phone's safe-area insets (claude.ai artifacts do): fit inside that padding
    const rs = getComputedStyle(document.documentElement), pad = (parseFloat(rs.paddingTop) || 0) + (parseFloat(rs.paddingBottom) || 0);
    const vh = innerHeight - pad, k = mob ? innerWidth / 390 : Math.min(innerWidth / 390, vh / 720);
    const W = mob ? 390 : Math.round(innerWidth / k), H = Math.round(vh / k);
    Object.assign(app.style, { width: W + 'px', height: H + 'px', transform: `scale(${k})`, transformOrigin: '0 0' });
    setH(H, W);
  } else {
    app.style.cssText = '';
    w.style.transform = `scale(${Math.min(1, (innerHeight - 24) / 868, (innerWidth - 32) / 414)})`;
    setH(844, 390);
  }
}
function setH(H, W = 390) {
  const app = $('#app'), changed = Math.abs(H - appH) > 4 || Math.abs(W - appW) > 4;
  appH = H; appW = W;
  app.style.setProperty('--H', H + 'px'); app.style.setProperty('--W', W + 'px'); app.style.setProperty('--ex', (W - 390) / 2 + 'px');
  app.classList.toggle('short', H < 760);
  app.classList.toggle('wide', W > 430);
  if (changed && cur) go(cur, { force: true, dir: 'none' });   // screens that place things by size re-render
}
/* Auto-update: GitHub Pages lets browsers keep index.html for up to 10 min and in-app browsers (LINE, Facebook) even longer.
   On open and whenever the tab comes back, ask version.json (never cached) — if a newer build is live, reload into it. */
const checkBuild = () => {
  if (!window.BUILD || location.protocol === 'file:') return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.v || j.v === window.BUILD) return;
    const q = new URLSearchParams(location.search); if (q.get('b') === j.v) return;   // already tried this build — never loop
    q.set('b', j.v); location.replace(location.pathname + '?' + q + location.hash);
  }).catch(() => {});
};
checkBuild();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkBuild(); });
addEventListener('resize', fit); fit();
const start = location.hash.slice(1);
const AWQ = new URLSearchParams(location.search).get('away');   // preview the come-back notification
if (AWQ) setTimeout(() => awayDemo(AWQ), 1200);
go(R[start] ? start : 'welcome');
addEventListener('hashchange', () => { const h = location.hash.slice(1); if (R[h] && h !== cur) go(h); });
