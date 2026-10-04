/* Life Power system (spec: "Life power ในฟีเจอร์ hero hall.docx") + ELi home, Hero Hall, Treasury, story share editor.
   Loaded before app.js; screens are merged into R there. Mock/demo data, persisted in localStorage. */

/* ── spec formulas ── */
const TIERS = [
  { min: 1, key: 'sprout0', name: 'Sprout Life', ic: '🌱', aura: 'น้องปกติ ยังไม่มีออร่า' },
  { min: 2, key: 'sprout', name: 'Sprout Life', ic: '🌱', aura: 'ออร่าละอองประกายสีเขียวอ่อน' },
  { min: 5, key: 'vibrant', name: 'Vibrant Life', ic: '💧', aura: 'ออร่าละอองน้ำระยิบระยับสีฟ้า' },
  { min: 10, key: 'guardian', name: 'Guardian Life', ic: '🛡️', aura: 'เกราะประกายแสงสีน้ำเงิน · ปลดล็อกสิทธิ์ดีลสินเชื่อ' },
  { min: 20, key: 'champion', name: 'Champion Life', ic: '👑', aura: 'มงกุฎทองคำจิ๋ว + ออร่าเปลวไฟสีทอง' },
  { min: 30, key: 'eternal', name: 'Eternal Legend', ic: '🌟', aura: 'ออร่าแสงดาวประกายทอง · ปักหมุดใน Hero Hall ถาวร' },
];
const LPX = {
  walk: steps => Math.min(40, Math.floor(steps / 7000 * 40)),                       // S_Walk, max 40
  sleep: h => h == null ? 10 : h >= 7 ? 40 : h >= 6 ? 30 : h >= 5 ? 20 : 10,           // S_Sleep step function, max 40
  app: t => (t.pet ? 10 : 0) + (t.sent ? 10 : 0),                                     // S_App: petting 10 + send power 10
  mult: d => 1 + 0.05 * Math.min(d, 30),                                               // M_Streak, cap 2.5 at 30 days
  level: total => Math.floor(Math.sqrt(total / 100)) + 1,                              // quadratic progression
  req: L => 100 * (L - 1) ** 2,
  rate: n => n <= 3 ? 0 : n <= 7 ? 0.02 : n <= 14 ? 0.05 : 0.10,                      // decay rate on the n-th day away
  tier: L => TIERS.filter(t => L >= t.min).pop(),
};
const base = t => LPX.walk(t.steps) + LPX.sleep(t.sleep) + LPX.app(t);
const earn = (b, m) => Math.floor(b * m + 1e-6);            // ⌊LP_Base × M_Streak⌋ (epsilon guards 100 × 2.05 = 204.999…)
const earnedToday = () => earn(base(G.today), LPX.mult(G.streak));

/* ── state ── */
const newDay = (sleep = 6.6 + Math.random() * 1.6) => ({ steps: 0, sleep: +sleep.toFixed(1), pet: false, sent: false, sentTo: {}, petMs: 0, coinWalk: false, coinSleep: sleep >= 7 && sleep <= 9, chest: false });
const G0 = () => ({ v: 4, total: 3540, streak: 21, coins: 36, weekLP: 980, dow: 3, vital: 'happy', away: 0, revival: null, stickers: 3, owned: {}, theme: null, potions: 0, muted: false, preview: null,
  today: { ...newDay(7.4), steps: 3331 } });
let G;
try { G = JSON.parse(localStorage.getItem('eli_life')); } catch (e) { G = null; }
if (!G || G.v !== 4) G = G0();
const saveG = () => { try { localStorage.setItem('eli_life', JSON.stringify(G)); } catch (e) {} };

/* ── sound + haptics (WebAudio synth, no files) ── */
const SFX = {
  ctx: null,
  ac() { if (G.muted) return null; try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { return null; } return this.ctx; },
  tone(f, dur = .18, type = 'sine', vol = .07, at = 0, slide = 0) {
    const c = this.ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02);
  },
  chime() { const p = [1046, 1175, 1318, 1568, 1760, 2093]; this.tone(p[Math.random() * p.length | 0], .35, 'sine', .035); },
  giggle() { [0, .09, .18, .27].forEach((at, i) => this.tone(880 - i * 70, .08, 'triangle', .05, at, 1.25)); },
  coin() { this.tone(1318, .09, 'square', .03); this.tone(1976, .32, 'square', .03, .08); },
  pop() { this.tone(520, .12, 'sine', .06, 0, 1.8); },
  levelup() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, .22, 'triangle', .05, i * .09)); },
  sad() { this.tone(392, .4, 'sine', .04, 0, .8); },
};
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };


/* the character art is never altered: cosmetics are room themes (backgrounds), not outfits drawn on ELi */
const THEMES = { th_sunrise: ['ริมน้ำยามเช้า', 'ph1'], th_forest: ['สวนป่าร่มรื่น', 'ph3'], th_night: ['เมืองยามค่ำคืน', 'ph2'], th_stadium: ['สนามแชมป์', 'ph4'] };
const themeBg = () => G.theme && THEMES[G.theme] ? THEMES[G.theme][1] : 'bg_onboard';
const PET_LINES = ['งื้อออ สบายจังเลย ลูบพุงให้แหมได้ก่อ?', 'ชาร์จพลังใจเต็มร้อยแล้ว วันนี้ไปลุยกันเน้อ!', 'ม่วนใจ๋แต้ๆ เลยเจ้า~', 'อุ่นใจ๋ขนาด ขอบคุณเน้อ 💙'];
const EXTRA_LINES = ['ฮิๆ จั๊กจี้อ่ะ~', 'ลูบต่ออีกก็ได้น้า', 'วันนี้ได้แต้มแล้ว แต่ยังอยากเล่นด้วย!', 'คิกๆๆ'];

/* ── shared bits ── */
const appK = () => $('#app').getBoundingClientRect().width / 390;
const relPos = el => { const a = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect(), k = appK(); return { x: (r.left - a.left + r.width / 2) / k, y: (r.top - a.top + r.height / 2) / k }; };
function flyTo(fromEl, toEl, html, n = 6, cb) {
  const fx = $('#fx'), a = relPos(fromEl), b = relPos(toEl);
  for (let i = 0; i < n; i++) {
    const h = document.createElement('i'); h.className = 'fly-ic'; h.innerHTML = html; fx.append(h);
    const mx = (a.x + b.x) / 2 + (Math.random() - .5) * 160, my = Math.min(a.y, b.y) - 60 - Math.random() * 80;
    h.animate([{ transform: `translate(${a.x}px,${a.y}px) scale(.4)`, opacity: 0 }, { transform: `translate(${mx}px,${my}px) scale(1.1)`, opacity: 1, offset: .45 }, { transform: `translate(${b.x}px,${b.y}px) scale(.5)`, opacity: .9 }],
      { duration: 900 + i * 70, delay: i * 70, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }).fin.then(() => { h.remove(); if (i === n - 1 && cb) cb(); });
  }
}
function popNum(host, x, y, text, cls = '') {
  const p = document.createElement('div'); p.className = 'popnum ' + cls; p.innerHTML = text; p.style.left = x + 'px'; p.style.top = y + 'px'; host.append(p);
  p.animate([{ transform: 'translate(-50%,0) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1.15)', opacity: 1, offset: .25 }, { transform: 'translate(-50%,-44px) scale(1)', opacity: 1, offset: .75 }, { transform: 'translate(-50%,-80px) scale(.9)', opacity: 0 }], { duration: 1700, easing: 'ease-out' }).fin.then(() => p.remove());
}
const coinIc = '<img src="assets/i_coin.webp" alt="" style="width:22px;height:22px">';
const tierOf = total => LPX.tier(LPX.level(total));
const avTier = (img, total, extra = '') => `<span class="avt t-${tierOf(total).key} ${extra}"><img src="${A(img)}" alt=""></span>`;
function notify(title, text, img = 'pet5') {
  const n = document.createElement('div'); n.className = 'push';
  n.innerHTML = `<span class="pi"><span class="mark" style="width:16px;height:19px;color:#fff"></span></span><div><b>${title}</b><span>${text}</span></div><img src="${spr(img)}" alt="">`;
  $('#app').append(n); SFX.pop(); buzz(30);
  n.animate([{ transform: 'translateY(-130%)' }, { transform: 'translateY(0)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'both' });
  setTimeout(() => n.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-140%)' }], { duration: 400, fill: 'both' }).fin.then(() => n.remove()), 4200);
  n.onclick = () => n.remove();
}

/* award coins with the coin flying into the chip */
function giveCoins(n, why, fromEl) {
  G.coins += n; saveG();
  const chip = $('.coinchip2') || $('.coinchip');
  if (fromEl && chip) flyTo(fromEl, chip, coinIc, Math.min(n, 5), () => { $$('[data-coins]').forEach(e => e.textContent = fmt(G.coins)); chip.classList.remove('hop'); void chip.offsetWidth; chip.classList.add('hop'); });
  else $$('[data-coins]').forEach(e => e.textContent = fmt(G.coins));
  SFX.coin(); toast(`🪙 +${n} Eli Coins · ${why}`);
}

/* ── level up overlay ── */
function levelUp(fromL, toL) {
  const t0 = LPX.tier(fromL), t1 = LPX.tier(toL), bonus = Math.floor(toL / 5) - Math.floor(fromL / 5);
  const ov = document.createElement('div'); ov.className = 'lvup';
  ov.innerHTML = `<i class="rays"></i><div class="lv-t">LEVEL UP!</div><div class="lv-n num">Lv.${fromL} → <b>Lv.${toL}</b></div>
    <div class="lv-stage"></div>
    ${t1.key !== t0.key ? `<div class="lv-tier">${t1.ic} ${t1.name}<small>${t1.aura}</small></div>` : ''}
    ${bonus > 0 ? `<div class="lv-bonus">${coinIc} โบนัสเลเวล +${bonus * 5} Coins</div>` : ''}
    <button class="btn btn-o press">เย้!</button>`;
  $('#app').append(ov);
  const e = new Eli($('.lv-stage', ov), { size: 200, x: 195, y: 210 });
  SFX.levelup(); buzz([40, 60, 40]); confetti(120);
  (async () => { for (const p of ['cheer2', 'cheer1', 'cheer4', 'cheer6']) { e.pose(p); await (p === 'cheer2' ? e.jump(110, 700) : e.squash(.18, 420)); } })();
  if (bonus > 0) { G.coins += bonus * 5; saveG(); }
  $('.btn', ov).onclick = () => { e.remove(); ov.remove(); if (cur === 'eli') go('eli', { force: true, dir: 'none' }); };
}

/* ── day / absence simulation (time machine) ── */
function commitDay(sim) {
  if (sim) Object.assign(G.today, { steps: Math.max(G.today.steps, 7200 + Math.round(Math.random() * 3000)), pet: true, sent: true });
  const L0 = LPX.level(G.total), e = earnedToday();
  if (G.today.steps >= 7000 && !G.today.coinWalk) { G.coins += 1; }
  G.total += e; G.weekLP += e; G.streak += 1;
  if (G.revival) { G.revival.days = G.today.steps >= 7000 ? G.revival.days + 1 : 0; if (G.revival.days >= 3) { G.total += G.revival.back; toast(`🌈 ฟื้นฟูพลังชีวิตสำเร็จ! ได้คืน +${fmt(G.revival.back)} LP`); G.revival = null; } }
  G.dow += 1; G.today = newDay(); G.vital = 'happy';
  let weekEnd = false; if (G.dow >= 7) { weekEnd = true; G.dow = 0; }
  saveG();
  toast(`จบวัน · +${fmt(e)} LP (×${LPX.mult(G.streak - 1).toFixed(2)}) · Streak ${G.streak} วัน`);
  const L1 = LPX.level(G.total);
  if (L1 > L0) setTimeout(() => levelUp(L0, L1), 500);
  if (weekEnd) setTimeout(() => weekResult(), L1 > L0 ? 2600 : 600);
  else if (cur === 'eli' || cur === 'hall') go(cur, { force: true, dir: 'none' });
}
function goAway(n) {
  const before = G.total; let t = G.total;
  for (let i = 1; i <= n; i++) t = Math.max(100, t * (1 - LPX.rate(i)));    // exponential decay after the grace period, floor 100 LP
  t = Math.round(t);
  const lost = before - t;
  G.away = n; G.total = t; G.today = newDay();
  G.vital = n >= 7 ? 'lonely' : n >= 3 ? 'sleepy' : 'happy';
  G.shield = { d: G.streak, n };                       // streak shield decision pending on return
  if (n >= 7) G.weekLP = 0;
  if (lost > 0) G.revival = { back: Math.round(lost * .5), days: 0 };
  saveG();
  go('eli', { force: true, dir: 'none' });
  setTimeout(() => {
    if (n >= 7) notify('น้อง ELi', 'นั่งกอดเข่ารอคุณอยู่นะ... กลับมาก่อนพลังจะสลายหมด 🥺', 'pet6');
    else if (n >= 3) notify('น้อง ELi', 'น้อง ELi เริ่มง่วงแล้วน้า แวะมาลูบตัวเติม Life Power ด่วน!', 'pet5');
  }, 500);
  setTimeout(() => shieldSheet(lost), n >= 3 ? 1800 : 600);
}
function shieldSheet(lost) {
  const s = G.shield; if (!s) return;
  const half = Math.floor(s.d / 2 ** Math.min(s.n, 12)), canPotion = s.n <= 3;
  openSheet(`<div class="shd"><img src="assets/it_potion.webp" alt="" onerror="this.src='assets/i_drop.webp'"><h4>Streak Shield 🛡️</h4>
    <p>คุณหายไป <b>${s.n} วัน</b> · Streak <b>${s.d} วัน</b> (×${LPX.mult(s.d).toFixed(2)}) กำลังจะลดลง<br>${lost > 0 ? `พลังชีวิตสลายไป <b style="color:var(--red)">−${fmt(lost)} LP</b> (เหลือ ${fmt(G.total)} LP)` : 'ยังอยู่ในช่วงปลอดการลด (Grace Period) LP ไม่ลด'}</p>
    <div class="shd-o">
      <button class="opt2 ${canPotion && G.coins >= 10 ? '' : 'dis'}" id="potion"><b>🧪 ใช้น้ำยาฟื้นฟู</b><span>${canPotion ? `−10 Eli Coins · รักษา Streak ${s.d} วันไว้ (มี ${G.coins})` : 'ใช้ได้เฉพาะหายไปไม่เกิน 3 วัน'}</span></button>
      <button class="opt2" id="halve"><b>✂️ รับ Streak ลดลง</b><span>${s.d} → ${half} วัน (ลดครึ่งต่อวันที่หาย)</span></button>
    </div></div>`, sh => {
    $('#potion', sh).onclick = () => {
      if (!canPotion || G.coins < 10) return $('#potion', sh).classList.add('shake');
      G.coins -= 10; G.shield = null; saveG(); closeSheet(); SFX.levelup(); confetti(50); toast('🧪 Streak ปลอดภัย! ยังคง ×' + LPX.mult(G.streak).toFixed(2));
      go('eli', { force: true, dir: 'none' });
    };
    $('#halve', sh).onclick = () => { G.streak = half; G.shield = null; saveG(); closeSheet(); SFX.sad(); toast(`Streak ลดเหลือ ${half} วัน · เริ่มสะสมใหม่กัน!`); go('eli', { force: true, dir: 'none' }); };
  });
}
function weekResult() {
  const rows = hallRows('week'), rank = rows.findIndex(r => r.me) + 1;
  const up = rank <= 3, down = rank >= rows.length - 1;
  openSheet(`<div class="wk"><div class="wk-b">${up ? '🏆' : down ? '😢' : '🎖️'}</div><h4>สรุป Hero Hall สัปดาห์นี้</h4>
    <p>คุณได้อันดับ <b>#${rank}</b> ด้วย <b>${fmt(G.weekLP)} LP</b><br>${up ? 'ยินดีด้วย! เลื่อนขึ้น <b>ลีกเพชร 💎</b> + สติกเกอร์ลิมิเต็ด' : down ? 'อยู่โซนตกชั้น... สัปดาห์หน้าสู้ใหม่นะ' : 'รักษาลีกทองคำไว้ได้! 🥇'}</p>
    <button class="btn btn-o press" data-close>เริ่มสัปดาห์ใหม่</button></div>`);
  if (up) confetti(120);
  G.weekLP = 0; saveG();
  if (cur === 'eli' || cur === 'hall') go(cur, { force: true, dir: 'none' });
}
function addSteps(n, fromEl) {
  const t = G.today, was = t.steps; t.steps += n; saveG();
  if (was < 7000 && t.steps >= 7000 && !t.coinWalk) { t.coinWalk = true; saveG(); giveCoins(1, 'เดินครบ 7,000 ก้าว', fromEl || $('#app')); }
  if (cur === 'eli') refreshHome();
}

/* ── demo control panel (time machine) — side panel on desktop + sheet in-app ── */
const DEMO = [
  ['👟 +1,500 ก้าว', () => addSteps(1500, $('#lpCard'))],
  ['🌙 นอน 7.5 ชม.', () => { G.today.sleep = 7.5; if (!G.today.coinSleep) { G.today.coinSleep = true; giveCoins(1, 'นอน 7–9 ชม.', $('#lpCard')); } saveG(); cur === 'eli' && refreshHome(); }],
  ['🌙 นอน 5.2 ชม.', () => { G.today.sleep = 5.2; saveG(); cur === 'eli' && refreshHome(); }],
  ['✅ จบวัน (ตามที่ทำจริง)', () => commitDay(false)],
  ['⚡ ข้าม 1 วันแบบขยัน', () => commitDay(true)],
  ['⚡×7 ขยันทั้งสัปดาห์', () => { for (let i = 0; i < 6; i++) { Object.assign(G.today, { steps: 8800, pet: true, sent: true }); const e = earnedToday(); G.total += e; G.weekLP += e; G.streak++; G.dow = (G.dow + 1) % 7; G.today = newDay(); } saveG(); commitDay(true); }],
  ['😴 หายไป 3 วัน', () => goAway(3)],
  ['🥺 หายไป 8 วัน', () => goAway(8)],
  ['💤 หายไป 3 เดือน', () => goAway(90)],
  ['🔄 รีเซ็ตเดโม', () => { G = G0(); saveG(); go('eli', { force: true, dir: 'none' }); toast('รีเซ็ตเป็นผู้ใช้ 21 วันติด (Lv.6)'); }],
];
function demoHTML() {
  const L = LPX.level(G.total);
  return `<div class="demo-h">⏱ เครื่องย้อนเวลา <small>สำหรับเดโม</small></div>
    <div class="demo-s">LP สะสม <b>${fmt(G.total)}</b> · Lv.${L} · Streak ${G.streak} วัน (×${LPX.mult(G.streak).toFixed(2)}) · 🪙 ${G.coins}</div>
    <div class="demo-g">${DEMO.map(([l], i) => `<button class="press" data-i="${i}">${l}</button>`).join('')}</div>
    <div class="demo-h" style="margin-top:12px">👀 พรีวิวออร่า</div>
    <div class="demo-g t">${TIERS.slice(1).map(t => `<button class="press ${G.preview === t.min ? 'on' : ''}" data-tier="${t.min}">${t.ic} Lv.${t.min}</button>`).join('')}<button class="press ${G.preview ? '' : 'on'}" data-tier="0">ของจริง</button></div>`;
}
function bindDemo(root, after) {
  $$('[data-i]', root).forEach(b => b.onclick = () => { DEMO[b.dataset.i][1](); after && after(); });
  $$('[data-tier]', root).forEach(b => b.onclick = () => { G.preview = +b.dataset.tier || null; saveG(); if (cur === 'eli') go('eli', { force: true, dir: 'none' }); after && after(); });
}
function renderSideDemo() { const s = $('#demo'); if (!s) return; s.innerHTML = demoHTML(); bindDemo(s, renderSideDemo); }
setInterval(renderSideDemo, 1500);

/* ═════════ ELi home: Life Power + petting ═════════ */
let homeEli = null, auraT = null;
function refreshHome() {
  const pg = $('.pg.eli'); if (!pg) return;
  const t = G.today, w = LPX.walk(t.steps), s = LPX.sleep(t.sleep), a = LPX.app(t), b = w + s + a, m = LPX.mult(G.streak), e = Math.floor(b * m);
  const set = (id, v) => { const el = $(id, pg); if (el) el.textContent = v; };
  set('#lpE', fmt(e)); set('#lpB', b); set('#lpM', m.toFixed(2));
  [['#bw', w, 40, `${fmt(t.steps)} / 7,000 ก้าว`], ['#bs', s, 40, `${t.sleep} ชม.`], ['#ba', a, 20, `ลูบน้อง ${t.pet ? '✓' : '✗'} · ส่งพลังใจ ${t.sent ? '✓' : '✗'}`]].forEach(([id, v, max, sub]) => {
    const r = $(id, pg); if (!r) return; $('i', r).style.width = v / max * 100 + '%'; $('b', r).textContent = `${v}/${max}`; $('small', r).textContent = sub;
  });
  const qs = [t.steps >= 7000, t.sleep >= 7 && t.sleep <= 9, t.pet, t.sent];
  $$('.q', pg).forEach((q, i) => q.classList.toggle('done', qs[i]));
  set('#qn', qs.filter(Boolean).length);
  const chest = $('#chest', pg); if (chest) { chest.classList.toggle('ready', qs.every(Boolean) && !t.chest); chest.classList.toggle('opened', t.chest); }
  set('#cw', t.coinWalk ? '✓' : '·'); set('#cs', t.coinSleep ? '✓' : '·'); set('#cn', (t.coinWalk ? 1 : 0) + (t.coinSleep ? 1 : 0));
  $$('[data-coins]').forEach(el => el.textContent = fmt(G.coins));
}

const LIFE = {};
LIFE.eli = pg => {
  const L = G.preview || LPX.level(G.total), T = LPX.tier(L), lo = LPX.req(LPX.level(G.total)), hi = LPX.req(LPX.level(G.total) + 1);
  const vital = G.preview ? 'happy' : G.vital;
  pg.innerHTML = `<div class="scroll">
    <div class="eh">
      <span class="mark" style="width:26px;height:30px;color:var(--navy)"></span><b class="eh-t">บ้านน้อง ELi</b>
      <span style="flex:1"></span>
      <button class="chip2 coinchip2 press" data-go="treasury">${coinIc}<b data-coins>${fmt(G.coins)}</b></button>
      <span class="chip2 fire" title="Streak">🔥<b>${G.streak}</b><small>×${LPX.mult(G.streak).toFixed(2)}</small></span>
      <button class="ib" id="demoBtn" aria-label="เดโม">⏱</button>
    </div>
    <button class="lvbar press" id="lvb"><span class="lv-ic">${T.ic}</span><div class="lv-x"><div><b>Lv.${L}</b> ${T.name}${G.preview ? ' <em>(พรีวิว)</em>' : ''}</div><div class="pb"><i style="width:0" data-w="${G.preview ? 100 : (G.total - lo) / (hi - lo) * 100}"></i></div></div><small class="num">${fmt(G.total)}<br>/${fmt(hi)} LP</small></button>
    <div class="estage v-${vital}" id="estage">
      <img class="ebg" src="assets/${themeBg()}.webp" alt="">
      <div class="aura t-${T.key}"><i></i><i></i><i></i></div>
      ${T.key === 'champion' || T.key === 'eternal' ? '<img class="crown" src="assets/it_crown.webp" onerror="this.remove()" alt="">' : ''}
      <svg class="pring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="pr-bg"/><circle cx="60" cy="60" r="54" class="pr-fg" id="prf"/></svg>
      <div class="hint" id="hint">${vital === 'lonely' ? '🥺 น้องนั่งกอดเข่ารออยู่... ลูบปลอบหน่อย' : vital === 'sleepy' ? '😴 น้องง่วงแล้ว ลูบปลุกหน่อยนะ' : G.today.pet ? '💙 ได้แต้มลูบวันนี้แล้ว · ลูบเล่นต่อได้เลย' : '✋ ลูบตัวน้อง 2–3 วิ รับ +10 Life Power'}</div>
    </div>
    <div class="wrap2">
      ${G.revival ? `<section class="card rev rise"><b>🌈 เควสต์ฟื้นฟูพลังชีวิต</b><span>เดินครบ 7,000 ก้าว 3 วันติด ได้คืน <b>+${fmt(G.revival.back)} LP</b> (50% ที่สลายไป)</span><div class="rdots">${[0, 1, 2].map(i => `<i class="${i < G.revival.days ? 'on' : ''}"></i>`).join('')}</div></section>` : ''}
      <section class="card lp rise" id="lpCard">
        <div class="lp-h"><span>⚡ Life Power วันนี้</span><b class="num" id="lpE">0</b></div>
        <div class="lp-f">ฐาน <b id="lpB">0</b>/100 × ตัวคูณ Streak <b id="lpM">1.00</b> <span class="fire-s">🔥 ${G.streak} วัน</span></div>
        <div class="lpr" id="bw"><span class="li">👟</span><div><div class="lt">เดิน <b></b></div><div class="pb"><i></i></div><small></small></div></div>
        <div class="lpr s" id="bs"><span class="li">🌙</span><div><div class="lt">หลับ <b></b></div><div class="pb"><i></i></div><small></small></div></div>
        <div class="lpr a" id="ba"><span class="li">💙</span><div><div class="lt">ผูกพัน <b></b></div><div class="pb"><i></i></div><small></small></div></div>
      </section>
      <section class="card quests rise" style="--d:.06s">
        <div class="qh"><b>เควสต์ประจำวัน <span id="qn">0</span>/4</b><button class="chest" id="chest" aria-label="กล่องรางวัล"><img src="assets/it_chest.webp" onerror="this.src='assets/it_gift.webp'" alt=""></button></div>
        ${[['👟', 'เดินครบ 7,000 ก้าว', '+1 🪙'], ['🌙', 'นอน 7–9 ชม. ต่อเนื่อง', '+1 🪙'], ['✋', 'ลูบตัวน้อง ELi', '+10 ⚡'], ['💖', 'ส่งพลังใจใน Hero Hall', '+10 ⚡']].map(([i, t, r], k) => `<button class="q" data-q="${k}"><span class="qi">${i}</span><span class="qt">${t}</span><span class="qr">${r}</span><span class="qc">✓</span></button>`).join('')}
        <div class="qcoins">🪙 เหรียญวันนี้ <b id="cn">0</b>/2 · เดิน <b id="cw">·</b> · หลับ <b id="cs">·</b></div>
      </section>
      <section class="card mini rise" style="--d:.1s"><button class="press" data-go="hall"><span>🏆</span>Hero Hall<small>อันดับสัปดาห์</small></button><button class="press" data-go="treasury"><span>💎</span>คลังสมบัติ<small>แลกของ/ธีม</small></button><button class="press" id="wardBtn"><span>🏡</span>ธีมบ้านน้อง<small>${Object.keys(G.owned).filter(k => THEMES[k]).length + 1} ธีม</small></button></section>
    </div></div>`;
  bindGo(pg);
  const stage = $('#estage', pg);
  homeEli = new Eli(stage, { size: 230, x: 195, y: 320 });
  const idlePose = () => vital === 'lonely' ? 'pet6' : vital === 'sleepy' ? 'pet5' : 'pet1';
  homeEli.pose(idlePose()); homeEli.el.classList.add('home-eli');
  refreshHome();
  setTimeout(() => { $$('.lvbar .pb i', pg).forEach(i => i.style.width = Math.min(100, i.dataset.w) + '%'); const lp = $('#lpE', pg); countUp(lp, earnedToday(), 900); }, 120);
  // ambient: aura particles, zZz when sleepy, tears when lonely, idle blinks/hops when happy
  clearInterval(auraT);
  auraT = every(700, () => {
    if (!document.body.contains(stage)) return;
    if (vital === 'sleepy') floatUp(stage, 250, 150, 'z', 1);
    else if (vital === 'lonely') { if (Math.random() < .4) floatUp(stage, 175, 210, '💧', 1); }
    else auraParticle(stage, T.key);
  });
  let idleN = 0;
  every(3200, () => { if (petting || vital !== 'happy' || !homeEli) return; idleN++; if (idleN % 3 === 0) homeEli.jump(30, 420); else homeEli.squash(.06, 500); });

  // ── petting (pan gesture over the mascot) ──
  let petting = false, last = null, acc = G.today.petMs, lastFx = 0, lastSnd = 0, hold = null;
  const prf = $('#prf', pg), C = 2 * Math.PI * 54, NEED = 2500;
  prf.style.strokeDasharray = C; const ring = v => prf.style.strokeDashoffset = C * (1 - Math.min(1, v / NEED));
  ring(G.today.pet ? 0 : acc);
  const hit = document.createElement('div'); hit.className = 'pet-hit'; stage.append(hit);
  const start = e => { petting = true; last = { x: e.clientX, y: e.clientY, t: performance.now() }; hit.setPointerCapture(e.pointerId); stage.classList.add('petting'); SFX.ac(); };
  const move = e => {
    if (!petting) return;
    const now = performance.now(), dx = e.clientX - last.x, dy = e.clientY - last.y, dist = Math.hypot(dx, dy), dt = now - last.t;
    last = { x: e.clientX, y: e.clientY, t: now };
    if (dist < 1.5 || dt > 200) return;
    acc += dt;
    homeEli.pose(dx < 0 ? 'pet2' : 'pet3');
    homeEli.sq.style.transform = `rotate(${Math.max(-10, Math.min(10, dx * .8))}deg)`;
    if (now - lastFx > 110) { lastFx = now; const p = relInStage(e); burst(stage, p.x, p.y, { n: 3, dist: 40, size: 7, colors: ['#FF8FB1', '#FF4D6D', '#FFD54F'], shape: Math.random() < .5 ? 'star' : 'dot' }); floatUp(stage, p.x, p.y, Math.random() < .7 ? '💗' : '✨', 1); buzz(12); }
    if (now - lastSnd > 230) { lastSnd = now; SFX.chime(); }
    if (!G.today.pet) { ring(acc); G.today.petMs = acc; if (acc >= NEED) petDone(); }
    else if (acc > NEED * 1.2) { acc = 0; homeEli.pose('pet4'); SFX.giggle(); homeEli.shake(500, 3); homeEli.say(EXTRA_LINES[Math.random() * EXTRA_LINES.length | 0], 1500); }
  };
  const relInStage = e => { const r = stage.getBoundingClientRect(), k = appK(); return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; };
  const end = () => {
    if (!petting) return; petting = false; stage.classList.remove('petting'); homeEli.sq.style.transform = '';
    clearTimeout(hold); hold = setTimeout(() => homeEli && !petting && homeEli.pose(idlePose()), 500); saveG();
  };
  hit.addEventListener('pointerdown', start); hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerup', end); hit.addEventListener('pointercancel', end);
  hit.addEventListener('click', () => { if (acc > 300) return; homeEli.pose(vital === 'happy' ? 'cheer6' : idlePose()); homeEli.jump(40, 420); SFX.pop(); homeEli.say(vital === 'happy' ? ['จิ้มทำไมอ่า~ ลูบดีกว่า!', 'ไปเดินกันไหม?', 'วันนี้เป็นไงบ้าง?'][Math.random() * 3 | 0] : 'ลูบตัวหน่อยนะ...', 1500); setTimeout(() => homeEli && homeEli.pose(idlePose()), 900); });

  async function petDone() {
    G.today.pet = true; G.today.petMs = NEED; petting = false; stage.classList.remove('petting'); homeEli.sq.style.transform = '';
    const woke = vital !== 'happy';
    G.vital = 'happy'; G.away = 0; saveG();
    buzz([20, 40, 60]); SFX.giggle(); setTimeout(() => SFX.coin(), 250);
    homeEli.pose('pet4'); await homeEli.shake(420, 3);
    homeEli.pose('pet1'); await homeEli.jump(70, 560);
    popNum(stage, 195, 120, '⚡ +10 Life Power!', 'gold');
    homeEli.say(woke ? 'ตื่นแล้ว! คิดถึงที่สุดเลย 💙' : PET_LINES[Math.random() * PET_LINES.length | 0], 2400);
    flyTo(homeEli.el, $('#lpCard'), '💗', 7, () => { refreshHome(); $('#lpCard').classList.remove('hop'); void $('#lpCard').offsetWidth; $('#lpCard').classList.add('hop'); });
    $('#hint', pg).textContent = '💙 ได้แต้มลูบวันนี้แล้ว · ลูบเล่นต่อได้เลย';
    if (woke) { stage.className = 'estage v-happy'; confetti(80); setTimeout(() => go('eli', { force: true, dir: 'none' }), 2600); }
  }
  // quests, chest, wardrobe, demo
  $$('.q', pg).forEach(q => q.onclick = () => {
    const k = +q.dataset.q;
    if (k === 0) addSteps(1500, q); else if (k === 1) DEMO[1][1](); else if (k === 2) { stage.scrollIntoView({ behavior: 'smooth' }); homeEli.say('ลูบตรงนี้เลย~ 👆', 1500); } else go('hall');
  });
  $('#chest', pg).onclick = e => {
    const c = e.currentTarget;
    if (G.today.chest) return toast('เปิดกล่องวันนี้แล้ว พรุ่งนี้มาใหม่นะ');
    if (!c.classList.contains('ready')) { c.classList.add('shake'); setTimeout(() => c.classList.remove('shake'), 500); return toast('ทำเควสต์ให้ครบ 4 ข้อเพื่อเปิดกล่อง'); }
    G.today.chest = true; G.stickers++; saveG(); refreshHome();
    openChest();
  };
  $('#wardBtn', pg).onclick = wardrobe;
  $('#lvb', pg).onclick = tierSheet;
  $('#demoBtn', pg).onclick = () => openSheet(demoHTML(), sh => bindDemo(sh, () => closeSheet()));
  if (G.shield && !$('#sheet').innerHTML) setTimeout(() => shieldSheet(0), 900);
  cleanup.push(() => { homeEli && homeEli.remove(); homeEli = null; });
};
function auraParticle(stage, key) {
  if (key === 'sprout0') return;
  const x = 195 + (Math.random() - .5) * 200, y = 300 - Math.random() * 60;
  const ch = { sprout: ['🍃', '•'], vibrant: ['💧', '✦'], guardian: ['🔹', '✦'], champion: ['🔥', '✨'], eternal: ['⭐', '✨', '🌟'] }[key];
  const p = document.createElement('i'); p.className = `ap ap-${key}`; p.textContent = ch[Math.random() * ch.length | 0]; p.style.left = x + 'px'; p.style.top = y + 'px'; stage.append(p);
  p.animate([{ transform: 'translate(-50%,0) scale(.3)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translate(calc(-50% + ${(Math.random() - .5) * 50}px),-${120 + Math.random() * 80}px) scale(1)`, opacity: 0 }], { duration: 2200, easing: 'ease-out' }).fin.then(() => p.remove());
}
function openChest() {
  const ov = document.createElement('div'); ov.className = 'lvup chest-ov';
  const stk = ['pet1', 'run1', 'pet5', 'pet6'][Math.random() * 4 | 0];   // stickers = the original drawings
  ov.innerHTML = `<i class="rays"></i><div class="lv-t">กล่องรางวัลประจำวัน</div><img class="ch-img" src="assets/it_chest.webp" onerror="this.src='assets/it_gift.webp'" alt="">
    <div class="ch-card"><img src="${spr(stk)}" alt=""><b>สติกเกอร์น้อง ELi ใหม่!</b><small>อัลบั้ม ${G.stickers}/24 · สะสมครบได้ชุดลิมิเต็ด</small></div><button class="btn btn-o press">เก็บเข้าอัลบั้ม</button>`;
  $('#app').append(ov);
  const img = $('.ch-img', ov), card = $('.ch-card', ov);
  img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 500, iterations: 2 }).fin.then(() => {
    img.src = 'assets/it_chest_open.webp'; img.onerror = null; SFX.levelup(); buzz([30, 50, 30]); burst(ov, 195, 360, { n: 30, dist: 170, colors: ['#FFD54F', '#FFF3B0', '#fff', '#FC5A1E'], shape: 'star', size: 11 });
    card.classList.add('on');
  });
  $('.btn', ov).onclick = () => ov.remove();
}
function tierSheet() {
  const L = LPX.level(G.total);
  openSheet(`<h4>ระดับพลังชีวิต (Level)</h4><p style="margin:-6px 0 10px;color:var(--ink2);font-size:13px">Level = ⌊√(LP สะสม / 100)⌋ + 1 · LP ไม่ลดเมื่อใช้ Coins แต่จะสลายถ้าหายไปเกิน 3 วัน</p>
    ${[[1, 0, 'วันแรก'], [2, 100, 'วันที่ 1–2'], [5, 1600, 'สัปดาห์ที่ 2'], [10, 8100, 'เดือนที่ 1–2'], [20, 36100, 'เดือนที่ 4–6'], [30, 84100, 'เดือนที่ 9+']].map(([lv, need, when]) => { const t = LPX.tier(lv); return `<div class="trow ${L >= lv ? 'got' : ''}"><span class="avt t-${t.key}" style="width:40px;height:40px"><img src="${spr('pet1')}" alt=""></span><div><b>Lv.${lv} ${t.ic} ${t.name}</b><small>${t.aura}</small></div><span class="num">${fmt(need)}<small>${when}</small></span></div>`; }).join('')}`);
}
function wardrobe() {
  const own = Object.keys(THEMES).filter(k => G.owned[k]);
  openSheet(`<h4>ธีมบ้านน้อง ELi</h4><p style="color:var(--ink2);font-size:13px;margin:-6px 0 10px">เปลี่ยนฉากบ้านของน้อง${own.length ? '' : ' · แลกธีมเพิ่มได้ที่คลังสมบัติ'}</p>
    <div class="wgrid"><button class="wi ${G.theme ? '' : 'on'}" data-s=""><span class="wth" style="background-image:url(${A('bg_onboard')})"></span>สวนสดใส</button>${own.map(k => `<button class="wi ${G.theme === k ? 'on' : ''}" data-s="${k}"><span class="wth" style="background-image:url(${A(THEMES[k][1])})"></span>${THEMES[k][0]}</button>`).join('')}</div>
    <div style="height:12px"></div><button class="btn btn-d press" data-go="treasury">ไปคลังสมบัติ</button>`, sh => {
    bindGo(sh);
    $$('.wi', sh).forEach(b => b.onclick = () => { G.theme = b.dataset.s || null; saveG(); closeSheet(); SFX.pop(); go('eli', { force: true, dir: 'none' }); toast(`เปลี่ยนเป็นธีม${G.theme ? THEMES[G.theme][0] : 'สวนสดใส'} ✨`); });
  });
}

/* ═════════ Hero Hall ═════════ */
const FRIENDS = [
  { id: 'q1', n: 'ยายบุญมี', img: 'q1', total: 91000, week: 1640, note: 'ตำนานวัย 68 · เดินทุกเช้า' },
  { id: 'p3', n: 'ลุงสมชาย', img: 'p3', total: 38000, week: 1720, note: '🔥 92 วันติด' },
  { id: 'p1', n: 'ณัฐ วิ่งเช้า', img: 'p1', total: 6000, week: 1580, note: 'เพิ่งเริ่ม 30 วัน · ×2.5 แล้ว!' },
  { id: 'p2', n: 'ฟ้า ใส', img: 'p2', total: 9200, week: 1310, note: 'Guardian คนใหม่' },
  { id: 'q3', n: 'แพรว', img: 'q3', total: 1750, week: 610, note: 'นอนครบทุกคืน 🌙' },
  { id: 'p4', n: 'มิ้นท์', img: 'p4', total: 420, week: 280, note: 'เพิ่งเข้ามาใหม่' },
  { id: 'q4', n: 'น้องภูมิ', img: 'q4', total: 160, week: 120, note: 'สายลูบน้อง' },
  { id: 'q2', n: 'ต้น', img: 'q2', total: 100, week: 0, note: '💤 หายไป 3 เดือน · พลังสลายเหลือ 100 LP', away: true },
];
function hallRows(mode) {
  const me = { id: 'me', n: 'คุณ', img: 'avatar', total: G.total, week: G.weekLP + earnedToday(), me: true, note: `🔥 ${G.streak} วันติด` };
  return [...FRIENDS, me].sort((a, b) => mode === 'week' ? b.week - a.week : b.total - a.total);
}
LIFE.hall = pg => {
  let mode = 'week';
  pg.innerHTML = `<div class="scroll">
    <div class="topbar"><h1>Hero Hall</h1><span class="chip2 league">🥇 ลีกทองคำ</span></div>
    <div class="seg" id="seg"><i class="ind"></i><button class="on">สัปดาห์นี้</button><button>ตลอดกาล</button></div>
    <div class="wrap" id="hw"></div></div>`;
  const sc = $('.scroll', pg), hw = $('#hw', pg); stickyShadow(sc);
  const seg = $('#seg', pg), ind = $('.ind', seg);
  const setSeg = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  requestAnimationFrame(() => setSeg($('button.on', seg)));
  const draw = () => {
    const rows = hallRows(mode), legends = rows.filter(r => LPX.level(r.total) >= 30), val = r => mode === 'week' ? r.week : r.total;
    const top = rows.slice(0, 3), max = Math.max(...rows.map(val), 1);
    hw.innerHTML = `
      ${legends.length ? `<section class="card legend rise">${legends.map(r => `<div class="lg">${avTier(r.img, r.total)}<div><b>📌 ${r.n}</b><small>🌟 Eternal Legend · ปักหมุดถาวร · Lv.${LPX.level(r.total)}</small></div></div>`).join('')}</section>` : ''}
      <section class="podium rise" style="--d:.05s">${[1, 0, 2].map(i => top[i] ? `<div class="pd p${i + 1}">${avTier(top[i].img, top[i].total, top[i].me ? 'me' : '')}<b>${top[i].n}</b><span class="num">${fmt(val(top[i]))} LP</span><div class="blk"><em>${i + 1}</em></div></div>` : '').join('')}</section>
      ${mode === 'week' ? '<div class="zone up">▲ โซนเลื่อนชั้น (Top 3) → ลีกเพชร 💎</div>' : ''}
      <section class="card hl rise" style="--d:.1s">${rows.map((r, i) => `
        <div class="hr2 ${r.me ? 'me' : ''} ${r.away ? 'away' : ''} ${mode === 'week' && i === rows.length - 2 ? 'dz' : ''}" data-id="${r.id}">
          <span class="rk num">${i + 1}</span>${avTier(r.img, r.total)}
          <div class="nm"><b>${r.n} <small>Lv.${LPX.level(r.total)} ${tierOf(r.total).ic}</small></b><span>${r.note}</span><i style="width:0" data-w="${val(r) / max * 100}"></i></div>
          <span class="v num">${fmt(val(r))}</span>
          ${r.me ? '' : `<button class="send ${G.today.sentTo[r.id] ? 'on' : ''}" aria-label="ส่งพลังใจ">💖</button>`}
        </div>`).join('')}</section>
      ${mode === 'week' ? '<div class="zone down">▼ 2 อันดับสุดท้ายเสี่ยงตกชั้น</div>' : ''}
      <p class="hnote">💡 คะแนนสัปดาห์คิดจาก Life Power ที่ได้ในสัปดาห์นี้ · คนที่หายไปจะได้ 0 และ LP สะสมสลายลงเรื่อยๆ ทำให้คนใหม่ที่สม่ำเสมอแซงได้</p>`;
    setTimeout(() => $$('.hr2 .nm i', hw).forEach(i => i.style.width = i.dataset.w + '%'), 80);
    $$('.send', hw).forEach(b => b.onclick = e => {
      const row = b.closest('.hr2'), id = row.dataset.id, f = FRIENDS.find(x => x.id === id);
      if (G.today.sentTo[id]) return toast(`ส่งพลังใจให้${f.n}แล้ววันนี้ 💗`);
      G.today.sentTo[id] = true; b.classList.add('on'); SFX.chime(); buzz(25);
      const first = !G.today.sent; G.today.sent = true; saveG();
      flyTo(b, $('.avt', row), '💖', 6, () => { const av = $('.avt', row); av.classList.remove('hop'); void av.offsetWidth; av.classList.add('hop'); floatUp(hw, relLocal(av, hw).x, relLocal(av, hw).y, '💗', 4); });
      if (first) { setTimeout(() => { SFX.coin(); popNum(hw, relLocal(b, hw).x, relLocal(b, hw).y - 10, '⚡ +10 LP', 'gold'); toast(`ส่งพลังใจให้${f.n} · ได้ +10 Life Power (ผูกพัน)`); }, 700); }
      else toast(`ส่งพลังใจให้${f.n}แล้ว 💖`);
    });
  };
  $$('button', seg).forEach((b, i) => b.onclick = () => { $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); setSeg(b); mode = i ? 'all' : 'week'; draw(); });
  draw();
};
const relLocal = (el, host) => { const r = el.getBoundingClientRect(), h = host.getBoundingClientRect(), k = appK(); return { x: (r.left - h.left + r.width / 2) / k, y: (r.top - h.top + r.height / 2) / k }; };

/* ═════════ Treasury ═════════ */
const SHOP = [
  { id: 'th_sunrise', n: 'ธีมริมน้ำยามเช้า', c: 25, lv: 1, kind: 'theme', img: 'ph1' },
  { id: 'th_forest', n: 'ธีมสวนป่าร่มรื่น', c: 30, lv: 1, kind: 'theme', img: 'ph3' },
  { id: 'th_night', n: 'ธีมเมืองยามค่ำคืน', c: 60, lv: 5, kind: 'theme', img: 'ph2' },
  { id: 'th_stadium', n: 'ธีมสนามแชมป์', c: 120, lv: 10, kind: 'theme', img: 'ph4' },
  { id: 'it_potion', n: 'น้ำยาฟื้นฟู Streak', c: 10, lv: 1, kind: 'item', fb: 'i_drop' },
  { id: 'it_gift', n: 'กล่องสติกเกอร์ 3 ใบ', c: 15, lv: 1, kind: 'item' },
  { id: 'i_shoe', n: 'คูปองรองเท้าวิ่ง 10%', c: 50, lv: 8, kind: 'coupon' },
  { id: 'it_shield', n: 'ดีลสินเชื่อดอกเบี้ยพิเศษ', c: 100, lv: 10, kind: 'coupon', fb: 'b_shoe' },
  { id: 'it_crown', n: 'กรอบโปรไฟล์ Champion', c: 80, lv: 20, kind: 'item', fb: 'b_crown' },
];
LIFE.treasury = pg => {
  let tab = 'all';
  const L = LPX.level(G.total);
  pg.innerHTML = `<div class="scroll">
    <div class="topbar"><button class="ib" data-go="eli" aria-label="กลับ">${I.back}</button><h1>คลังสมบัติ</h1><span class="chip2 coinchip2">${coinIc}<b data-coins>${fmt(G.coins)}</b></span></div>
    <div class="wrap">
      <section class="card tre-h rise"><div><b>Eli Coins ได้วันละ 2 เหรียญ</b><span>เดินครบ 7,000 ก้าว +1 · นอน 7–9 ชม. +1 · ทุก 5 เลเวลรับโบนัส +5</span></div><img src="assets/it_chest_open.webp" onerror="this.src='assets/it_gift.webp'" alt=""></section>
      <div class="seg" id="seg" style="margin:0 0 12px"><i class="ind"></i><button class="on" data-t="all">ทั้งหมด</button><button data-t="theme">ธีมบ้าน</button><button data-t="item">ไอเทม</button><button data-t="coupon">คูปอง</button></div>
      <div class="tgrid" id="tg"></div></div></div>`;
  bindGo(pg);
  const seg = $('#seg', pg), ind = $('.ind', seg), tg = $('#tg', pg);
  const setSeg = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  requestAnimationFrame(() => setSeg($('button.on', seg)));
  const draw = () => {
    tg.innerHTML = SHOP.filter(s => tab === 'all' || s.kind === tab).map((s, k) => {
      const locked = L < s.lv, own = G.owned[s.id] && s.kind === 'theme';
      return `<button class="card ti rise ${locked ? 'lock' : ''} ${own ? 'own' : ''}" style="--d:${k * .04}s" data-id="${s.id}">
        <div class="ph2 k-${s.kind}"><img src="${A(s.img || s.id)}" ${s.fb ? `onerror="this.src='${A(s.fb)}'"` : ''} alt="">${locked ? `<span class="lk">🔒 Lv.${s.lv}<small>${LPX.tier(s.lv).name}</small></span>` : ''}</div>
        <b>${s.n}</b><span class="pr2">${own ? (G.theme === s.id ? '✓ ใช้อยู่' : '✓ มีแล้ว') : `${coinIc}${s.c}`}</span></button>`;
    }).join('');
  };
  draw();
  $$('button', seg).forEach(b => b.onclick = () => { $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); setSeg(b); tab = b.dataset.t; draw(); });
  tg.addEventListener('click', e => {
    const el = e.target.closest('.ti'); if (!el) return;
    const s = SHOP.find(x => x.id === el.dataset.id);
    if (L < s.lv) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 450); return toast(`ต้องมี Life Power ถึง Lv.${s.lv} (${fmt(LPX.req(s.lv))} LP) ก่อน`); }
    if (s.kind === 'theme' && G.owned[s.id]) { G.theme = s.id; saveG(); toast(`เปลี่ยนเป็น${s.n}แล้ว ✨`); return go('eli'); }
    const ok = G.coins >= s.c;
    openSheet(`<div class="buy"><div class="ph2 k-${s.kind}" style="height:170px;border-radius:20px"><img src="${A(s.img || s.id)}" ${s.fb ? `onerror="this.src='${A(s.fb)}'"` : ''} alt=""></div><h4>${s.n}</h4>
      <p>${ok ? `ใช้ ${s.c} Eli Coins · เหลือ ${G.coins - s.c}` : `Coins ไม่พอ ขาดอีก ${s.c - G.coins} เหรียญ<br>เดินครบ 7,000 ก้าว + นอนให้พอ ได้วันละ 2 เหรียญนะ`}</p>
      <button class="btn ${ok ? 'btn-o' : 'btn-d'} press" id="buy">${ok ? 'แลกเลย' : 'ไปทำเควสต์'}</button></div>`, sh => {
      $('#buy', sh).onclick = () => {
        if (!ok) { closeSheet(); return setTimeout(() => go('eli'), 250); }
        G.coins -= s.c; G.owned[s.id] = true; if (s.id === 'it_potion') G.potions++; if (s.kind === 'theme') G.theme = s.id; saveG();
        closeSheet(); SFX.levelup(); confetti(70); $$('[data-coins]').forEach(x => x.textContent = fmt(G.coins));
        toast(s.kind === 'theme' ? `ได้${s.n}! ย้ายบ้านน้องให้แล้ว` : `แลก ${s.n} สำเร็จ 🎉`); draw();
        if (s.kind === 'theme') setTimeout(() => go('eli'), 900);
      };
    });
  });
};

/* ═════════ Story share editor (custom photo + movable/zoomable stats) ═════════ */
const SHARE = { tpl: 'classic', col: '#ffffff', photo: 'assets/ph1.webp', ph: { z: 1, x: 0, y: 0 }, ov: { x: 135, y: 300, s: 1 }, mode: 'ov' };
const TPL = { classic: [190, 270], route: [230, 230], eli: [250, 210], line: [280, 64] };
const imgCache = {};
const loadImg = src => imgCache[src] || (imgCache[src] = new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }));
function tinted(img, col, w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h); return c; }
async function drawOverlay(ctx, a, tpl, col) {
  const [W, H] = TPL[tpl], km = a.km.toFixed(2), pace = paceStr(a.sec / a.km), time = clock(a.sec);
  const mark = await loadImg('assets/logo_mark.png');
  ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = col === '#ffffff' ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.25)'; ctx.shadowBlur = 6;
  const route = (x, y, w, h, lw) => {
    const p = new Path2D(ROUTES[a.r]); ctx.save(); const s = Math.min(w / 358, h / 196); ctx.translate(x + (w - 358 * s) / 2, y + (h - 196 * s) / 2); ctx.scale(s, s);
    ctx.lineWidth = lw / s; ctx.lineJoin = ctx.lineCap = 'round'; ctx.stroke(p); ctx.restore();
  };
  const label = (t, x, y) => { ctx.font = '500 11px Comfortaa, "Noto Sans Thai"'; ctx.globalAlpha = .85; ctx.fillText(t, x, y); ctx.globalAlpha = 1; };
  const val = (t, x, y, px = 30) => { ctx.font = `700 ${px}px Comfortaa`; ctx.fillText(t, x, y); };
  const logo = (x, y, h) => { if (mark) ctx.drawImage(tinted(mark, col, mark.width, mark.height), x - h * .43, y, h * .86, h); };
  if (tpl === 'classic') {
    label('ระยะทาง', W / 2, 16); val(km + ' km', W / 2, 48);
    label('เพซ', W / 2, 74); val(pace + ' /km', W / 2, 104, 26);
    label('เวลา', W / 2, 130); val(time, W / 2, 160, 26);
    route(25, 170, W - 50, 62, 3.5); logo(W / 2, 240, 26);
  } else if (tpl === 'route') {
    route(10, 6, W - 20, 150, 5); val(`${km} km`, W / 2, 190, 34);
    ctx.font = '600 14px Comfortaa'; ctx.fillText(`${pace} /km · ${time}`, W / 2, 212); logo(W - 18, 0, 22);
  } else if (tpl === 'eli') {
    const e = await loadImg(spr('cheer6')); ctx.shadowBlur = 0;
    ctx.fillStyle = col === '#ffffff' ? 'rgba(255,255,255,.95)' : col; ctx.beginPath(); ctx.roundRect(88, 24, 158, 112, 22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(98, 110); ctx.lineTo(80, 130); ctx.lineTo(118, 118); ctx.fill();
    ctx.fillStyle = col === '#ffffff' ? '#171A2C' : '#fff'; label('วันนี้วิ่งไป', 167, 46); val(km + ' km', 167, 78, 30);
    ctx.font = '600 14px Comfortaa'; ctx.fillText(`${pace}/km · ${time}`, 167, 102); ctx.font = '600 11px Comfortaa, "Noto Sans Thai"'; ctx.fillText('เก่งมาก! — ELi', 167, 124);
    if (e) ctx.drawImage(e, 0, 70, 140 * e.width / e.height, 140);
  } else {
    logo(18, 18, 28); ctx.textAlign = 'left'; val(`${km} km`, 42, 44, 28);
    ctx.font = '600 16px Comfortaa'; ctx.fillText(`${pace}/km   ${time}`, 150, 42);
  }
  ctx.restore();
}
function photoBox(img, fw, fh, ph) {
  const b = Math.max(fw / img.naturalWidth, fh / img.naturalHeight) * ph.z, w = img.naturalWidth * b, h = img.naturalHeight * b;
  return { x: (fw - w) / 2 + ph.x, y: (fh - h) / 2 + ph.y, w, h };
}
LIFE.share = (pg, opt) => {
  const a = opt.act || curAct || FEED[0], FW = 270, FH = 480;   // story frame (9:16); scaled down on short screens via CSS zoom-free transform
  pg.innerHTML = `
    <div class="topbar sh-top"><button class="ib" id="shBack" aria-label="กลับ">${I.back}</button><h1>แชร์สตอรี่</h1><button class="sv-btn press" id="exp">บันทึกรูป</button></div>
    <div class="frame" id="frame"><img class="fph" id="fph" alt=""><canvas class="fov" id="fov"></canvas><div class="fhint" id="fhint">ลากเพื่อขยับ · หมุนล้อ/บีบ 2 นิ้วเพื่อขยาย</div></div>
    <div class="shc">
      <div class="shrow"><label class="upl press">📷<input type="file" accept="image/*" id="file" hidden><span>รูปของฉัน</span></label>
        ${['ph1', 'ph2', 'ph3', 'ph4', 'bg_map'].map(p => `<button class="thumb ${SHARE.photo === A(p) ? 'on' : ''}" data-p="${A(p)}" style="background-image:url(${A(p)})"></button>`).join('')}</div>
      <div class="shrow">${[['classic', 'สถิติ'], ['route', 'เส้นทาง'], ['eli', 'น้อง ELi'], ['line', 'แถบเดียว']].map(([k, l]) => `<button class="tp ${SHARE.tpl === k ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}
        ${['#ffffff', '#171A2C', '#FC5A1E'].map(c => `<button class="cl2 ${SHARE.col === c ? 'on' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
      <div class="shrow"><div class="mtg"><button class="${SHARE.mode === 'ov' ? 'on' : ''}" data-m="ov">ขยับสถิติ</button><button class="${SHARE.mode === 'ph' ? 'on' : ''}" data-m="ph">ขยับรูป</button></div>
        <input type="range" id="zoom" min="40" max="260" value="100" aria-label="ขนาด"><button class="tp" id="rst">รีเซ็ต</button></div>
    </div>`;
  const frame = $('#frame', pg), fph = $('#fph', pg), cv = $('#fov', pg), zoom = $('#zoom', pg), dpr = Math.max(2, devicePixelRatio || 1);
  $('#shBack', pg).onclick = () => go(opt.back || 'activity', { act: a });
  const layoutPhoto = () => { if (!fph.naturalWidth) return; const b = photoBox(fph, FW, FH, SHARE.ph); Object.assign(fph.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' }); };
  const layoutOv = () => { const [W, H] = TPL[SHARE.tpl]; Object.assign(cv.style, { width: W + 'px', height: H + 'px', left: SHARE.ov.x - W / 2 + 'px', top: SHARE.ov.y - H / 2 + 'px', transform: `scale(${SHARE.ov.s})` }); };
  const renderOv = async () => { const [W, H] = TPL[SHARE.tpl]; cv.width = W * dpr; cv.height = H * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr); await document.fonts.ready; await drawOverlay(c, a, SHARE.tpl, SHARE.col); layoutOv(); };
  const syncZoom = () => zoom.value = Math.round((SHARE.mode === 'ov' ? SHARE.ov.s : SHARE.ph.z) * 100);
  fph.onload = layoutPhoto; fph.src = SHARE.photo;
  renderOv(); syncZoom();
  frame.animate([{ transform: 'scale(.92)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
  setTimeout(() => $('#fhint', pg).classList.add('off'), 2600);
  // pointer gestures: drag + pinch, target = stats overlay or photo
  const pts = new Map(); let g0 = null;
  const target = () => SHARE.mode === 'ov' ? SHARE.ov : SHARE.ph;
  frame.addEventListener('pointerdown', e => {
    if (SHARE.mode === 'ov' && e.target !== cv && pts.size === 0) { const r = cv.getBoundingClientRect(); if (!(e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30)) return; }
    frame.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); g0 = null; frame.classList.add('drag');
  });
  frame.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const p = pts.get(e.pointerId), k = frame.getBoundingClientRect().width / FW, t = target();   // frame may be scaled on short screens
    if (pts.size === 1) { t.x += (e.clientX - p.x) / k; t.y += (e.clientY - p.y) / k; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [m, n] = [...pts.values()], d = Math.hypot(m.x - n.x, m.y - n.y);
      if (g0) { const f = d / g0; if (SHARE.mode === 'ov') t.s = Math.max(.4, Math.min(2.6, t.s * f)); else t.z = Math.max(1, Math.min(4, t.z * f)); syncZoom(); }
      g0 = d;
    }
    SHARE.mode === 'ov' ? layoutOv() : layoutPhoto();
  });
  const up = e => { pts.delete(e.pointerId); g0 = null; if (!pts.size) frame.classList.remove('drag'); };
  frame.addEventListener('pointerup', up); frame.addEventListener('pointercancel', up);
  frame.addEventListener('wheel', e => { e.preventDefault(); const t = target(), f = e.deltaY < 0 ? 1.06 : 1 / 1.06; if (SHARE.mode === 'ov') t.s = Math.max(.4, Math.min(2.6, t.s * f)); else t.z = Math.max(1, Math.min(4, t.z * f)); syncZoom(); SHARE.mode === 'ov' ? layoutOv() : layoutPhoto(); }, { passive: false });
  zoom.oninput = () => { const v = zoom.value / 100; if (SHARE.mode === 'ov') { SHARE.ov.s = v; layoutOv(); } else { SHARE.ph.z = Math.max(1, v); layoutPhoto(); } };
  $$('.thumb', pg).forEach(b => b.onclick = () => { SHARE.photo = b.dataset.p; SHARE.ph = { z: 1, x: 0, y: 0 }; fph.src = SHARE.photo; $$('.thumb', pg).forEach(x => x.classList.toggle('on', x === b)); });
  $('#file', pg).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { SHARE.photo = r.result; SHARE.ph = { z: 1, x: 0, y: 0 }; fph.src = r.result; $$('.thumb', pg).forEach(x => x.classList.remove('on')); toast('ใส่รูปของคุณแล้ว ✓'); }; r.readAsDataURL(f); };
  $$('.tp[data-t]', pg).forEach(b => b.onclick = () => { SHARE.tpl = b.dataset.t; $$('.tp[data-t]', pg).forEach(x => x.classList.toggle('on', x === b)); renderOv(); });
  $$('.cl2', pg).forEach(b => b.onclick = () => { SHARE.col = b.dataset.c; $$('.cl2', pg).forEach(x => x.classList.toggle('on', x === b)); renderOv(); });
  $$('.mtg button', pg).forEach(b => b.onclick = () => { SHARE.mode = b.dataset.m; $$('.mtg button', pg).forEach(x => x.classList.toggle('on', x === b)); frame.classList.toggle('m-ph', SHARE.mode === 'ph'); syncZoom(); });
  $('#rst', pg).onclick = () => { SHARE.ov = { x: 135, y: 300, s: 1 }; SHARE.ph = { z: 1, x: 0, y: 0 }; layoutOv(); layoutPhoto(); syncZoom(); };
  $('#exp', pg).onclick = async () => {
    const OUTW = 1080, k = OUTW / FW, c = document.createElement('canvas'); c.width = OUTW; c.height = FH * k; const x = c.getContext('2d');
    x.fillStyle = '#222'; x.fillRect(0, 0, c.width, c.height);
    if (fph.naturalWidth) { const b = photoBox(fph, FW, FH, SHARE.ph); x.drawImage(fph, b.x * k, b.y * k, b.w * k, b.h * k); }
    const [W, H] = TPL[SHARE.tpl]; x.save(); x.scale(k, k); x.translate(SHARE.ov.x, SHARE.ov.y); x.scale(SHARE.ov.s, SHARE.ov.s); x.translate(-W / 2, -H / 2); await drawOverlay(x, a, SHARE.tpl, SHARE.col); x.restore();
    c.toBlob(async blob => {
      // inside a claude.ai artifact plain download links are blocked: hand the file to the viewer's save dialog instead
      const dl = window.claude?.use ? await window.claude.use('downloads') : null;
      if (dl) {
        try { const r = await dl.save({ filename: 'eli-run-story.png', data: blob }); if (r?.status === 'saved') { toast('บันทึกรูปสตอรี่แล้ว (1080×1920) ✓'); confetti(40); } return; }
        catch (e) { if (e?.code !== 'unavailable') return; }
      }
      const file = new File([blob], 'eli-run-story.png', { type: 'image/png' });
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: a.t }); return; } } catch (e) { if (e.name === 'AbortError') return; }
      const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = 'eli-run-story.png'; l.click(); setTimeout(() => URL.revokeObjectURL(u), 2000);
      toast('บันทึกรูปสตอรี่แล้ว (1080×1920) ✓'); confetti(40);
    }, 'image/png');
  };
};
