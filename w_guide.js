/* Eli's World — how to play (client feedback 2026-11-06: "a friend opened the app and didn't know what it is, how to play,
   what each button is or what to do — other apps explain it, with Next, Next…").
   · tours: the first time on Eli's World, Dream Land, Step Trek, Hero Hall and Treasury, ELi points at each button in turn —
     the screen dims, a hole shows the button, a speech card says what it does (ถัดไป / ข้าม). Settings → ดูวิธีเล่นอีกครั้ง.
   · beginner missions: 5 small things to try on day one (chip on Eli's World); all done → the welcome coins, once per account
     (the app: paid by the server, claim('welcome')).
   · the intro cards before signing up live on the welcome page (w_welcome.js) and only use st().intro from here.
   Loaded after the screens (it wraps them) and before app.js. */
const GUIDE = (() => {
  const st = () => G.guide || (G.guide = { intro: false, tours: {}, m: {} });
  const paid = () => CLOUD.on ? !!G.welcomePaid : !!st().paid;

  /* ── beginner missions ── */
  const MIS = [
    ['pet', 'ลูบน้อง ELi', 'กดค้างที่ตัวน้องแล้วถูไปมา จนน้องชาร์จพลังเต็ม', 'assets/eli_happy.webp'],
    ['dq', 'เปิดดู Daily Quest', 'แตะกล่อง Daily Quest ด้านล่างหน้าบ้าน', 'assets/hd_dq.png'],
    ['trek', 'ลองเข้า Step Trek', 'ปุ่มสีเหลืองตรงกลางแถบล่าง ไว้บันทึกการเดินและวิ่ง', 'assets/hd_trek2.png'],
    ['dream', 'แวะ Dream Land', 'ดูการนอนเมื่อคืน และหีบเหรียญของคืนนี้', 'assets/hd_dream.png'],
    ['treasury', 'ดูของรางวัลใน Treasury', 'ของจริงที่แลกได้ด้วย Eli Coins', 'assets/hd_treasury.png'],
  ];
  const nDone = () => MIS.filter(([k]) => st().m[k]).length;
  const done = (k, quiet) => {
    const s = st(); if (s.m[k] || paid() || !G.member) return;
    s.m[k] = true; saveG(); paintChip();
    if (quiet) return;
    const n = nDone();
    SFX.chime(); buzz(12);
    toast(n >= MIS.length ? '🎉 ภารกิจมือใหม่ครบ! รับเหรียญที่หน้าบ้านได้เลย' : `✓ ภารกิจมือใหม่ ${n}/${MIS.length} · ${MIS.find(m => m[0] === k)[1]}`);
  };
  // the chip on Eli's World, under the coins (gone once the welcome coins are paid)
  const paintChip = () => {
    const c = $('#gdChip'); if (!c) return;
    if (paid()) return c.remove();
    const n = nDone(), all = n >= MIS.length;
    c.classList.toggle('ready', all);
    $('small', c).textContent = all ? 'รับรางวัล!' : `${n}/${MIS.length}`;
  };
  const chip = pg => {
    if (paid() || !G.member) return;
    pg.insertAdjacentHTML('beforeend', `<button class="gd-chip hud-r press" id="gdChip" aria-label="ภารกิจมือใหม่"><img src="assets/mk_gift.png" alt=""><span><b>มือใหม่</b><small></small></span></button>`);
    $('#gdChip', pg).onclick = () => { SFX.pop(); missions(); };
    paintChip();
  };
  const missions = () => {
    const s = st(), n = nDone(), all = n >= MIS.length, coins = gRules().welcome;
    openSheet(`<h4>ภารกิจมือใหม่ ${n}/${MIS.length}</h4>
      <p class="wsheet-p">ทำครบทุกข้อ รับ <b>${coins} Eli Coins</b> ต้อนรับ (ครั้งเดียว) · แตะข้อไหนก็ได้เพื่อไปทำเลย</p>
      <div class="gd-mis">${MIS.map(([k, t, d, img]) => `<button class="gd-mi ${s.m[k] ? 'ok' : ''}" data-k="${k}"><img src="${img}" alt=""><span><b>${t}</b><small>${d}</small></span><i></i></button>`).join('')}</div>
      ${all ? `<button class="btn btn-o press" id="gdClaim">รับ ${coins} เหรียญต้อนรับ</button>` : ''}
      <button class="btn btn-d press" id="gdReplay" style="margin-top:8px">ดูวิธีเล่นอีกครั้ง</button>`, sh => {
      $$('.gd-mi', sh).forEach(b => b.onclick = () => {
        const k = b.dataset.k; closeSheet(); SFX.pop();
        if (k === 'pet') return setTimeout(() => cur === 'world' && tour('world', [WORLD[0]], { mark: false }), 350);
        if (k === 'dq') return setTimeout(() => $('#whDq') && $('#whDq').click(), 350);
        go(k);
      });
      $('#gdReplay', sh).onclick = () => { closeSheet(); replay(); };
      if (all) $('#gdClaim', sh).onclick = e => claim(e.currentTarget);
    });
  };
  const claim = async btn => {
    if (btn.disabled) return; btn.disabled = true;
    let n = gRules().welcome;
    if (CLOUD.on) {   // the server pays (once per account)
      try { n = await CLOUD.claim('welcome'); }
      catch (e) { btn.disabled = false; if (/welcome_done/.test(String(e.raw && e.raw.message))) { G.welcomePaid = true; saveG(); closeSheet(); paintChip(); } return toast(e.message); }
    } else { st().paid = true; saveG(); }
    closeSheet();
    const c = $('#gdChip');
    giveCoins(n, 'ภารกิจมือใหม่', c || $('.coinchip2'));
    SFX.levelup(); confetti(90);
    setTimeout(paintChip, 700);
  };

  /* ── tours ── */
  let T = null;   // the tour on screen
  // where an element is, in the app's design points (the app may be scaled to the screen)
  const box = el => { const a = $('#app').getBoundingClientRect(), k = a.width / appW, r = el.getBoundingClientRect(); return { x: (r.left - a.left) / k, y: (r.top - a.top) / k, w: r.width / k, h: r.height / k }; };
  const shown = el => { if (!el || !el.getClientRects().length) return false; const b = box(el); return b.w > 0 && b.y + b.h > 40 && b.y < appH - 20; };
  const targets = q => (typeof q === 'function' ? [].concat(q() || []) : $$(q)).filter(shown);
  // overlapping highlights become one (two holes over each other would cancel out in the even-odd cut)
  const merge = bs => {
    const out = [];
    for (let b of bs) {
      for (let k = 0; k < out.length; k++) {
        const o = out[k];
        if (b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h) {
          const x = Math.min(b.x, o.x), y = Math.min(b.y, o.y);
          b = { x, y, w: Math.max(b.x + b.w, o.x + o.w) - x, h: Math.max(b.y + b.h, o.y + o.h) - y };
          out.splice(k, 1); k = -1;
        }
      }
      out.push(b);
    }
    return out;
  };
  const val = v => typeof v === 'function' ? v() : v;
  // a tour: steps = [{ el: selector | () => element(s), t: title, p: text (HTML), pad, r: corner radius, when: () => bool, last: button text }]
  const tour = (page, steps, { mark = true } = {}) => {
    if (T) T.end(false);
    steps = steps.filter(s => (!s.when || s.when()) && targets(s.el).length);   // only what is on screen now, so the n/N count is right
    if (!steps.length) return;
    let i = -1, ended = false;
    const ov = document.createElement('div'); ov.className = 'gd-tour';
    ov.innerHTML = `<i class="gd-dim"></i><div class="gd-rings"></div>
      <div class="gd-card" role="dialog" aria-live="polite"><img class="gd-eli" src="assets/eli_happy.webp" alt="น้อง ELi"><b class="gd-t"></b><p class="gd-p"></p>
        <div class="gd-ft"><button class="gd-skip" type="button">ข้าม</button><span class="gd-n"></span><button class="gd-next press" type="button">ถัดไป</button></div></div>`;
    $('#app').append(ov);
    const card = $('.gd-card', ov), dim = $('.gd-dim', ov), rings = $('.gd-rings', ov);
    // keep n rings without restarting their pulse
    const kids = (host, n, make) => { while (host.children.length > n) host.lastChild.remove(); while (host.children.length < n) host.append(make()); return [...host.children]; };
    // the dim layer with rounded holes cut out (even-odd path; plain CSS, so it draws the same in every WebView)
    const hole = ({ x, y, w, h }, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    const place = () => {
      if (ended) return;
      if (cur !== page) return end(false);
      const s = steps[i], tg = targets(s.el);
      if (!tg.length) return next(true);   // the button went away (the page changed under us): go on
      const pad = s.pad ?? 8, r = s.r ?? 18;
      const bs = merge(tg.map(box).map(b => ({ x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 })));
      const rnd = n => Math.round(n * 10) / 10;
      dim.style.clipPath = `path(evenodd, "M0 0H${appW}V${appH}H0Z${bs.map(b => hole({ x: rnd(b.x), y: rnd(b.y), w: rnd(b.w), h: rnd(b.h) }, rnd(Math.min(r, b.h / 2, b.w / 2)))).join('')}")`;
      kids(rings, bs.length, () => document.createElement('i')).forEach((g, k) => {
        const b = bs[k]; Object.assign(g.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', borderRadius: Math.min(r, b.h / 2) + 'px' });
      });
      // the card goes where there is more room: under the highlighted part, or above it
      const top = Math.min(...bs.map(b => b.y)), bot = Math.max(...bs.map(b => b.y + b.h));
      const cx = (Math.min(...bs.map(b => b.x)) + Math.max(...bs.map(b => b.x + b.w))) / 2, ch = card.offsetHeight, cw = card.offsetWidth;
      const below = appH - bot - 30 > top - 60;
      card.style.top = (below ? Math.min(appH - ch - 16, bot + 14) : Math.max(52, top - 14 - ch)) + 'px';
      card.style.left = Math.max(12, Math.min(appW - cw - 12, cx - cw / 2)) + 'px';
      card.classList.toggle('up', !below);
    };
    const show = k => {
      i = k; const s = steps[i], last = i === steps.length - 1;
      $('.gd-t', card).innerHTML = val(s.t); $('.gd-p', card).innerHTML = val(s.p);
      $('.gd-n', card).textContent = steps.length > 1 ? `${i + 1}/${steps.length}` : '';
      $('.gd-next', card).textContent = last ? s.last || 'เข้าใจแล้ว!' : 'ถัดไป';
      $('.gd-skip', card).style.visibility = last ? 'hidden' : '';
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
      place();
    };
    // the next step whose button is on screen (quiet = moved on by itself, no sound)
    const next = quiet => {
      for (let k = i + 1; k < steps.length; k++) if (targets(steps[k].el).length) { if (!quiet) { SFX.pop(); buzz(8); } return show(k); }
      end(true);
    };
    const tick = setInterval(place, 250);   // the targets move (ELi wanders, coins pop) and the page may re-render
    const end = finished => {
      if (ended) return; ended = true; T = null;
      clearInterval(tick); ov.classList.add('out'); setTimeout(() => ov.remove(), 260);
      if (mark && finished && i >= 0) { st().tours[page] = true; saveG(); }
      if (finished && page === 'world' && CLOUD.on) setTimeout(() => CLOUD.greet(), 600);   // news from the eli team waited for the tour
    };
    $('.gd-next', card).onclick = () => next();
    $('.gd-skip', card).onclick = () => { SFX.pop(); end(true); };
    T = { end, page };
    next(true);
    if (!ended) { SFX.chime(); ov.classList.add('on'); }
  };
  // start a page's tour once it has settled — not over a sheet, the level-up, the profile wizard or a notification
  const free = () => $('#sheet').hidden && !$('.lvup, .wl-setup, .wl-cid, .push, .gd-tour');
  const start = (page, steps, ms = 900, ok = () => true) => {
    if (!G.member || st().tours[page] || T) return;
    let tries = 0;
    const go1 = () => {
      if (cur !== page || st().tours[page] || T) return;
      if (!free() || !ok()) { if (++tries < 40) later(700, go1); return; }
      tour(page, steps);
    };
    later(ms, go1);
  };
  const replay = () => { st().tours = {}; saveG(); if (cur === 'world') go('world', { force: true, dir: 'none' }); else go('world'); };

  /* ── what each page's tour says ── */
  const WORLD = [
    { el: '.w-world .pet-hit', r: 70, pad: 2, t: 'นี่คือน้อง ELi 💙', p: 'เพื่อนซี้ที่เติบโตไปกับสุขภาพของคุณ<br><b>กดค้างแล้วถูตัวน้อง</b> วันละครั้ง ได้ +10 Life Power' },
    { el: () => [$('#whId'), $('.w-world .hd-av')], t: 'การ์ดของคุณ', p: 'ชื่อ เลเวล และหลอด Life Power<br>แตะการ์ดเพื่อแก้โปรไฟล์และตั้งค่า' },
    { el: '.w-world .hd-coin', t: 'Eli Coins ของคุณ', p: 'เหรียญที่เก็บได้ เอาไปแลกของรางวัลจริงใน <b>Treasury</b>' },
    { el: '#whAge', t: 'Eli Bio-age', p: 'อายุสุขภาพของคุณวันนี้ ยิ่งเดินและนอนดี ยิ่ง<b>อ่อนกว่าอายุจริง</b>' },
    { el: '.w-world .hd-dqp', t: 'Daily Quest ภารกิจประจำวัน', p: 'เดินครบ <b>7,000 ก้าว</b> และนอน <b>7–9 ชม.</b> ได้ข้อละ 1 เหรียญ + Life Power<br>ก้าวและการนอนดึงจากแอปสุขภาพในมือถือให้เอง' },
    { el: () => [...$$('.w-world .c3:not(.got)'), $('#whSprout')], t: 'เหรียญงอกจากก้าวเดิน 🌱',
      p: () => `เดินครบทุก <b>${fmt(gRules().gardenSteps)} ก้าว</b> จะมีเหรียญงอกในสวน แตะเก็บได้วันละ ${gRules().gardenMax} เหรียญ` },
    { el: '.w-world .wh-farm, .w-world .wh-run', t: 'มินิเกม', p: '<b>สวนผักน้อง eli</b> และ <b>ELi Run</b> แวะเล่นเพลิน ๆ ได้ทุกเมื่อ' },
    { el: () => [$('#tabbar'), $('#tabbar .play')], pad: 0, r: 0, t: 'เมนูด้านล่าง', p: '🌙 <b>Dream Land</b> การนอน + หีบเหรียญ<br>▶️ <b>Step Trek</b> บันทึกการเดิน / วิ่ง<br>🏆 <b>Hero Hall</b> อันดับกับเพื่อน<br>🎁 <b>Treasury</b> แลกของรางวัล' },
    { el: '#gdChip', when: () => !paid(), t: 'เริ่มจากตรงนี้เลย!', p: () => `ทำ <b>ภารกิจมือใหม่</b> ครบ ${MIS.length} ข้อ รับ ${gRules().welcome} Eli Coins ต้อนรับ`, last: 'ไปกันเลย!' },
  ];
  const DREAM = [
    { el: () => [$('#drChest'), $('#drLbl')], t: 'Dream Chest หีบเหรียญ', p: 'นอนครบ <b>7 ชม.</b> แตะเปิดหีบรับเหรียญ คืนละครั้ง' },
    { el: '.w-dream .dr-panel', t: 'การนอนเมื่อคืน', p: 'หลับลึก หลับตื้น REM และคุณภาพการนอน ดึงจากแอปสุขภาพในมือถือ<br>นอน 7–9 ชม. ได้ +1 เหรียญใน Daily Quest' },
  ];
  const TREK = [
    { el: '#t4Gps', t: 'เปิด GPS ก่อน', p: 'แอปใช้ตำแหน่งเพื่อวัดระยะทางที่คุณเดินหรือวิ่ง' },
    { el: '#t4Go', r: 40, t: 'กดเริ่ม แล้วออกไปได้เลย', p: 'ปิดจอแล้วเปิดเพลงฟังได้ แอปบันทึกต่อให้ ครบทุก 1 กม. มีเสียงบอก<br>จบแล้วได้ Life Power ตามระยะทาง + เหรียญ' },
  ];
  const HALL = [
    { el: '#hhSeg', t: 'Hero Hall อันดับ Life Power', p: 'ดูอันดับ <b>สัปดาห์นี้</b> (เริ่มใหม่ทุกวันจันทร์) หรือ <b>ตลอดกาล</b>' },
    { el: () => $('.w-hall2 .h2-row:not(.me) .ht'), r: 20, t: 'ส่งพลังใจ 💙', p: 'ส่งให้เพื่อนได้ทุกวัน ส่งครั้งแรกของวัน คุณได้ +10 Life Power ด้วย' },
    { el: '#hhInv', t: 'ชวนเพื่อนมาแข่ง', p: 'ส่งรหัสเชิญให้เพื่อน แล้วมาแข่งกันในตารางนี้' },
  ];
  const TREASURY = [
    { el: '.w-tr .tr-coins', t: 'เหรียญที่คุณมี', p: 'ได้จากการเดิน การนอน เหรียญในสวน และการวิ่ง' },
    { el: () => $('#trGrid .tr-card'), t: 'เลือกของรางวัล', p: 'แตะปุ่มตะกร้าที่การ์ดเพื่อเลือก<br><b>Eli Originals</b> ของจากแบรนด์ eli<br><b>Eli friends</b> คูปองจากร้านพาร์ทเนอร์' },
    { el: '#trBar', t: 'แลกของ', p: 'กด <b>แลกเลย</b> แล้วกรอกที่อยู่จัดส่ง (คูปองได้โค้ดทันที)' },
    { el: '#trHist', r: 26, t: 'ของที่แลกแล้ว', p: 'ดูสถานะการจัดส่งและเลขพัสดุได้ที่นี่' },
  ];

  /* ── hook into the screens ── */
  const PAGES = {
    world: pg => {
      chip(pg);
      if (G.today.pet) done('pet', true);   // already petted today
      $('#whDq', pg).addEventListener('click', () => done('dq'));
      start('world', WORLD, 1700);
    },
    dream: () => { done('dream'); start('dream', DREAM); },
    trek: () => { done('trek'); start('trek', TREK, 900, () => RUN.state === 'idle'); },
    hall: () => start('hall', HALL, 1300),
    treasury: () => { done('treasury'); start('treasury', TREASURY); },
  };
  for (const k in PAGES) { const f = LIFE[k]; LIFE[k] = (pg, opt) => { f(pg, opt); try { PAGES[k](pg); } catch (e) { console.warn('guide', e); } }; }

  return { st, done, tour, replay, missions, busy: () => !!T };
})();
