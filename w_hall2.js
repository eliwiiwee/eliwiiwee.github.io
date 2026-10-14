/* Eli's World — Hero Hall v2 (client 2026-10-13: same logic, a better design → gen/r2/hall_raw.png, sticker-game style).
   Logic = "Life power ในฟีเจอร์ hero hall.docx" (engine LPX in life.js):
   · สัปดาห์นี้ = Life Power earned this week (yours = G.weekLP + today's ⌊base × streak multiplier⌋); someone away scores 0
   · ตลอดกาล = lifetime LP (decays when away > 3 days, floor 100); Lv = ⌊√(LP/100)⌋ + 1 → tier ring + title on every avatar
   · Eternal Legend (Lv 30+) is pinned at the top of the list for good
   · send a heart = S_App +10 once a day (× your streak multiplier), your row updates at once */
const HF = [   // friends (mock): the doc's two stories are ต้น (away 3 months, decayed to 100 LP) and มินท์ (new, 30 days steady, ×2.5)
  { id: 'f1', n: 'ต้นกล้า', av: 'h_av2', total: 91000, week: 450 },     // Eternal Legend (Lv 31): pinned for good, an easy week this time
  { id: 'f2', n: 'ฟ้า ใส', av: 'h_av1', total: 38000, week: 1720 },
  { id: 'f3', n: 'มินท์', av: 'h_av3', total: 6000, week: 1580 },
  { id: 'f4', n: 'แพรว', av: 'h_av4', total: 9200, week: 1310 },
  { id: 'f6', n: 'บอส', av: 'h_av6', total: 1750, week: 610 },
  { id: 'f7', n: 'นุ่น', av: 'h_av7', total: 420, week: 280 },
  { id: 'f5', n: 'ต้น', av: 'h_av5', total: 100, week: 0, away: true },
];
const hallMe = () => ({ id: 'me', n: 'คุณ', img: G.citizen.photo || 'assets/w_avatar.webp', total: G.total, week: G.weekLP + earnedToday(), me: true });
const hallRank = mode => [...HF.map(f => ({ ...f, img: `assets/${f.av}.webp` })), hallMe()].sort((a, b) => mode === 'week' ? b.week - a.week : b.total - a.total);
LIFE.hall = pg => {
  pg.classList.add('w-hall2');
  let mode = 'week';
  const heart = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.4 2.9 4.5 6.6 4.2c2.1-.2 3.9 1 5.4 2.9 1.5-1.9 3.3-3.1 5.4-2.9 3.7.3 5.7 4.2 4.2 7.5C19.5 16.4 12 21 12 21z"/></svg>';
  const conf = Array.from({ length: 18 }, (_, k) => `<i class="cf" style="left:${(k * 47) % 100}%;top:${(k * 29) % 34}%;--r:${(k * 37) % 180}deg;--c:${['#F6C343', '#F28C28', '#7B95F4', '#FF8FB1', '#5BD1C9'][k % 5]};animation-delay:${(k % 6) * .5}s"></i>`).join('');
  const s = Math.max(.6, Math.min(1, (appH - 96 - 300) / 372)), listTop = Math.round(372 * s);
  pg.innerHTML = `<div class="h2-bg">${conf}</div>
    <div class="h2-top" style="transform:scale(${s.toFixed(3)})">
    <div class="h2-head"><span class="lg"><i class="wlogo"></i></span><b>Hero Hall</b><img src="assets/hd_hall.png" alt=""></div>
    ${spk('left:300px;top:52px;width:22px;height:22px', 30, 2)}
    <div class="h2-seg" id="hhSeg"><i class="ind"></i><button class="on" data-m="week">สัปดาห์นี้</button><button data-m="all">ตลอดกาล</button></div>
    <section class="h2-pod" id="hhTop"></section></div>
    <section class="h2-list" style="top:${listTop}px"><div class="h2-lh"><i class="bars"><i></i><i></i><i></i></i><b>อันดับ Life Power</b></div><div class="h2-rows" id="hhRows"></div></section>`;
  const val = r => mode === 'week' ? r.week : r.total;
  const lv = r => LPX.level(r.total), tk = r => LPX.tier(lv(r)).key;
  const who = r => { const t = LPX.tier(lv(r)); return `${r.me ? 'คุณ' : r.n} · Lv.${lv(r)} ${t.ic} ${t.name}${r.away ? ' · 💤 หายไป 3 เดือน พลังสลายเหลือ 100 LP' : ''}`; };
  const draw = () => {
    const all = hallRank(mode), top = all.slice(0, 3), rest = all.slice(3), mx = Math.max(1, val(all[0]));
    const legends = all.filter(r => lv(r) >= 30).sort((a, b) => b.total - a.total);
    $('#hhTop', pg).innerHTML = `<i class="rays"></i>${[[2, 1], [1, 0], [3, 2]].map(([n, i]) => `
      <div class="h2-p p${n} ${top[i].me ? 'me' : ''}" data-i="${i}">
        ${n === 1 ? '<img class="cr" src="assets/h_crown1.png" alt="">' : ''}
        <div class="av t-${tk(top[i])}"><img src="${top[i].img}" alt=""></div>
        <i class="md">${n}</i>
        <div class="ped"><i class="top"></i><div class="nm"><b>${top[i].n}</b><span>${fmt(val(top[i]))} LP</span></div></div>
      </div>`).join('')}`;
    $('#hhRows', pg).innerHTML = legends.map(r => `<div class="h2-leg" data-id="${r.id}"><span class="av t-eternal"><img src="${r.img}" alt=""></span>
        <span class="mid"><b>📌 ${r.n}</b><small>🌟 Eternal Legend · Lv.${lv(r)} · ปักหมุดถาวร</small></span><span class="lp">${fmt(r.total)}<small>LP</small></span></div>`).join('') +
      rest.map((r, k) => `<div class="h2-row ${r.me ? 'me' : ''} ${r.away ? 'away' : ''}" style="animation-delay:${k * .06}s" data-id="${r.id}">
      <span class="rk">${4 + k}</span><span class="av t-${tk(r)}"><img src="${r.img}" alt=""></span>
      <span class="mid"><b><span class="nmx">${r.n}</span><small class="lvc t-${tk(r)}">Lv.${lv(r)}</small></b><span class="bar"><i data-w="${val(r) / mx * 100}"></i></span></span><span class="lp">${fmt(val(r))}</span>
      ${r.me ? `<span class="you" title="Streak">🔥${G.streak} <small>×${LPX.mult(G.streak).toFixed(2)}</small></span>` : `<button class="ht ${G.today.sentTo[r.id] ? 'on' : ''}" aria-label="ส่งพลังใจ">${heart}<span>${G.today.sentTo[r.id] ? 'ส่งแล้ว' : 'ส่งพลังใจ'}</span></button>`}</div>`).join('') +
      `<button class="h2-inv press" id="hhInv"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-7 2-7 5v2h11.3A6.5 6.5 0 0 1 13 13.4 12 12 0 0 0 9 13zm9 0v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>ชวนเพื่อนมาแข่งใน Hero Hall</button>
      <p class="h2-note">${mode === 'week' ? 'คะแนนสัปดาห์ = Life Power ที่ได้สัปดาห์นี้ (เริ่มใหม่ทุกวันจันทร์) · คนที่หายไปได้ 0 · ยิ่งเข้าติดต่อกัน ตัวคูณ Streak ยิ่งสูง (สูงสุด ×2.5)' : 'ตลอดกาล = Life Power สะสมทั้งหมด · หายไปเกิน 3 วันพลังจะค่อย ๆ สลาย คนใหม่ที่สม่ำเสมอจึงแซงได้ · Lv.30 ขึ้นไปได้ปักหมุดถาวร'}</p>`;
    later(80, () => $$('.h2-row .bar i', pg).forEach(i => i.style.width = i.dataset.w + '%'));
    $$('.h2-p', pg).forEach(a => a.onclick = () => { SFX.pop(); a.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' }); toast(`${who(top[a.dataset.i])} · ${fmt(val(top[a.dataset.i]))} LP`); });
    $$('.h2-row .av, .h2-leg', pg).forEach(a => a.onclick = () => { const r = all.find(x => x.id === a.closest('[data-id]').dataset.id); SFX.pop(); toast(who(r)); });
    $('#hhInv', pg).onclick = () => toast('ส่งลิงก์ชวนเพื่อนแล้ว 💌');
  };
  draw();
  $$('#hhSeg button', pg).forEach(b => b.onclick = () => { mode = b.dataset.m; SFX.pop(); $$('#hhSeg button', pg).forEach(x => x.classList.toggle('on', x === b)); $('#hhSeg', pg).classList.toggle('all', mode === 'all'); draw(); });
  $('#hhRows', pg).addEventListener('click', e => {
    const b = e.target.closest('.ht'); if (!b) return;
    const id = b.closest('.h2-row').dataset.id;
    if (G.today.sentTo[id]) return toast('ส่งพลังใจให้เพื่อนคนนี้แล้ววันนี้ 💙');
    const order = () => hallRank(mode).map(r => r.id).join(), was = order(), e0 = earnedToday();
    G.today.sentTo[id] = true; const first = !G.today.sent; G.today.sent = true; saveG();
    b.classList.add('on'); $('span', b).textContent = 'ส่งแล้ว'; SFX.chime(); buzz(20);
    const r = relLocal(b, pg); floatUp(pg, r.x, r.y - 10, '💗', 5);
    if (!first) return toast('ส่งพลังใจแล้ว 💗');
    const add = earnedToday() - e0;   // S_App +10, multiplied by the streak
    toast(`ส่งพลังใจแล้ว! +10 Life Power × Streak ${LPX.mult(G.streak).toFixed(2)} = +${add} LP ✨`);
    later(700, () => {
      if (mode === 'week' && order() !== was) return draw();   // your rank moved
      const me = $('.h2-row.me .lp, .h2-p.me .nm span', pg);
      if (me && mode === 'week') { me.textContent = fmt(hallMe().week) + (me.closest('.h2-p') ? ' LP' : ''); me.animate([{ transform: 'scale(1.35)', color: '#F6C343' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
    });
  });
};
