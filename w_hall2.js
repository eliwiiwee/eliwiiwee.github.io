/* Eli's World — Hero Hall v2 (client 2026-10-13: same logic, a better design → gen/r2/hall_raw.png, sticker-game style).
   Logic as before: Life Power ranking this week / all time, top-3 podium, send a heart (+10 LP once a day), invite friends. */
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
  const draw = () => {
    const d = HH[mode], mx = d.top[0][1];
    $('#hhTop', pg).innerHTML = `<i class="rays"></i>${[[2, 1], [1, 0], [3, 2]].map(([n, i]) => `
      <div class="h2-p p${n}" data-i="${i}">
        ${n === 1 ? '<img class="cr" src="assets/h_crown1.png" alt="">' : ''}
        <div class="av"><img src="assets/${d.top[i][2]}.webp" alt=""></div>
        <i class="md">${n}</i>
        <div class="ped"><i class="top"></i><div class="nm"><b>${d.top[i][0]}</b><span>${fmt(d.top[i][1])} LP</span></div></div>
      </div>`).join('')}`;
    $('#hhRows', pg).innerHTML = d.rows.map(([id, nm, lp, av], k) => `<div class="h2-row ${id === 'me' ? 'me' : ''}" style="animation-delay:${k * .06}s" data-id="${id}">
      <span class="rk">${d.from + k}</span><span class="av"><img src="assets/${av}.webp" alt=""></span>
      <span class="mid"><b>${nm}</b><span class="bar"><i data-w="${lp / mx * 100}"></i></span></span><span class="lp">${fmt(lp)}</span>
      ${id === 'me' ? '<span class="you">คุณ</span>' : `<button class="ht ${G.today.sentTo[id] ? 'on' : ''}" aria-label="ส่งพลังใจ">${heart}<span>${G.today.sentTo[id] ? 'ส่งแล้ว' : 'ส่งพลังใจ'}</span></button>`}</div>`).join('') +
      `<button class="h2-inv press" id="hhInv"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-7 2-7 5v2h11.3A6.5 6.5 0 0 1 13 13.4 12 12 0 0 0 9 13zm9 0v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>ชวนเพื่อนมาแข่งใน Hero Hall</button>`;
    later(80, () => $$('.h2-row .bar i', pg).forEach(i => i.style.width = i.dataset.w + '%'));
    $$('.h2-p', pg).forEach(a => a.onclick = () => { SFX.pop(); a.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' }); toast(`${d.top[a.dataset.i][0]} · ${fmt(d.top[a.dataset.i][1])} LP`); });
    $('#hhInv', pg).onclick = () => toast('ส่งลิงก์ชวนเพื่อนแล้ว 💌');
  };
  draw();
  $$('#hhSeg button', pg).forEach(b => b.onclick = () => { mode = b.dataset.m; SFX.pop(); $$('#hhSeg button', pg).forEach(x => x.classList.toggle('on', x === b)); $('#hhSeg', pg).classList.toggle('all', mode === 'all'); draw(); });
  $('#hhRows', pg).addEventListener('click', e => {
    const b = e.target.closest('.ht'); if (!b) return;
    const id = b.closest('.h2-row').dataset.id;
    if (G.today.sentTo[id]) return toast('ส่งพลังใจให้เพื่อนคนนี้แล้ววันนี้ 💙');
    G.today.sentTo[id] = true; const first = !G.today.sent; G.today.sent = true; saveG();
    b.classList.add('on'); $('span', b).textContent = 'ส่งแล้ว'; SFX.chime(); buzz(20);
    const r = relLocal(b, pg); floatUp(pg, r.x, r.y - 10, '💗', 5);
    toast(first ? 'ส่งพลังใจแล้ว! +10 Life Power ✨' : 'ส่งพลังใจแล้ว 💗');
  });
};
