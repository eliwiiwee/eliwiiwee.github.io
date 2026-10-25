/* Eli's World — theme A screens (design/n*_A.png). ELi = the original art only, moved by code. */

/* ═════════ Dream Land (nd_A) ═════════ */
LIFE.dream = pg => {
  pg.classList.add('w-dream');
  const W = Math.max(390, Math.round((appH - 259) / 1.5)), s = W / 1024;
  const h = G.today.sleep, st = G.today.sleepStages || sleepStages(h), tot = st.d + st.l + st.r, q = sleepQuality(h);
  const ready = h >= 7 && !G.today.dreamChest;
  pg.innerHTML = `
    <img class="dr-bgc" src="assets/dr_bg.webp" alt="">
    <div class="dr-st" style="--W:${W}px;width:${W}px">
      <img class="bg" src="assets/dr_bg.webp" alt="">
      ${[[540, 60], [610, 120], [720, 90], [770, 175], [470, 150], [690, 40]].map(([x, y], k) => `<i class="dr-tw" style="left:${x * s}px;top:${y * s}px;animation-delay:${k * .45}s"></i>`).join('')}
      <img class="dr-front" src="assets/dr_front.webp" alt="">
      <div class="dr-z"><span>z</span><span>z</span><span>Z</span></div>
      <div class="dr-lbl" id="drLbl">${G.today.dreamChest ? 'เปิดแล้ววันนี้ ✓<br>พรุ่งนี้มาใหม่นะ' : 'นอนครบ 7 ชม.<br>แตะเปิดรับเหรียญ'}</div>
      <button class="dr-chest ${G.today.dreamChest ? 'done' : ''}" id="drChest" aria-label="Dream Chest"></button>
    </div>
    <div class="dr-head"><i class="wlogo"></i><i class="moon"></i><b>Dream Land</b></div>
    <div class="dr-coin coinchip2">${wi('w_coin')}<b data-coins>${wcoins()}</b></div>
    <section class="dr-panel">
      <b class="dr-ttl">Sleep Stages</b>
      <span class="dr-q">คุณภาพการนอน <b>${q}%</b></span>
      <div class="dr-bar"><i style="width:${st.d / tot * 100}%"></i><i style="width:${st.l / tot * 100}%"></i><i style="width:${st.r / tot * 100}%"></i></div>
      <div class="dr-leg"><span><i style="background:#5157D6"></i>Deep <b>${hrs(st.d)}</b></span><span><i style="background:#8FA4F6"></i>Light <b>${hrs(st.l)}</b></span><span><i style="background:#F7D47A"></i>REM <b>${hrs(st.r)}</b></span></div>
    </section>`;
  const stage = $('.dr-st', pg);
  // ELi tucked in bed: original art, sitting under the blanket layer (dr-front), breathing slowly
  const eli = new Eli(stage, { size: 272 * s, x: 500 * s, y: 720 * s });
  eli.pose('ready1');
  stage.insertAdjacentHTML('beforeend', `<i class="dr-hit" style="position:absolute;left:${400 * s}px;top:${470 * s}px;width:${200 * s}px;height:${160 * s}px;z-index:9"></i>`);
  let mur = 0;
  $('.dr-hit', pg).onclick = () => {
    SFX.giggle(); buzz(10); eli.squash(.06, 700);
    eli.say(['ฝันดีนะ…', 'zZz… อีกห้านาที', 'ง่วงจังเลย~', 'นอนครบ 7 ชม. ได้เหรียญด้วยนะ'][mur++ % 4], 1600);
    floatUp(stage, 500 * s, 470 * s, '💤', 2);
  };
  every(5200, () => { if (!pg.classList.contains('bed')) eli.squash(.035, 1400); });
  const chest = $('#drChest', pg);
  chest.onclick = async () => {
    if (G.today.dreamChest) return toast('เปิดหีบของคืนนี้ไปแล้ว พรุ่งนี้มาใหม่นะ 🌙');
    if (G.today.sleep < 7) { chest.classList.remove('shake'); void chest.offsetWidth; chest.classList.add('shake'); SFX.sad(); return toast(`เมื่อคืนนอน ${G.today.sleep} ชม. — ต้องนอนให้ครบ 7 ชม. ก่อนนะ`); }
    let n = 3 + Math.round(Math.random() * 4);
    if (CLOUD.on) {   // the app: the server rolls the coins (and checks last night's sleep)
      if (chest.classList.contains('wait')) return; chest.classList.add('wait');
      try { n = await CLOUD.claim('chest'); } catch (e) { chest.classList.remove('wait'); return toast(e.message); }
      chest.classList.remove('wait');
    }
    G.today.dreamChest = true; saveG();
    chest.classList.add('done'); $('#drLbl', pg).innerHTML = `ได้ +${n} coins 🎉<br>ฝันดีทุกคืนนะ`;
    SFX.coin(); buzz([20, 40, 20]); burst(stage, 912 * s, 540 * s, { n: 22, dist: 70, size: 6, colors: ['#F7D47A', '#FFE9A8', '#fff'] });
    giveCoins(n, 'dream', chest);
    later(400, () => { $$('[data-coins]').forEach(e => e.textContent = wcoins()); });
    eli.say('เย้! ได้เหรียญแล้ว ✨', 1600);
  };
};
