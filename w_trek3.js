/* Eli's World — Step Trek, game style B "Arcade speed HUD" (client pick 2026-10-14, design gen/trek/tk_B_raw.png).
   start: title sticker + GPS card (permission → yellow searching → green ready) + one big start button (no countdown)
   running: race-track view with speed lines, a lap gauge around the distance (fills toward the next km), time + average speed chips,
            "ครบ 1 กม.!" toast + chime + spoken summary every km, ELi running on the glowing spot, one yellow pause button
   paused: the scene dims, continue (yellow) / finish (indigo, chequered flag)
   ELi = the original art only, moved by code. Mockup px → 390 pt: (x − 15) × .876; top group from the top, bottom group from the bottom. */
LIFE.trek = pg => {
  pg.classList.add('w-trek', 't3');
  Object.assign(RUN, { state: 'idle', sec: 0, m: 0, next: 1000, hr: 0, hrN: 0, laps: [], sport: RUN.sport || 'วิ่ง' });
  const H = appH;
  // the start block (title + GPS card + start button) shrinks on short screens so it always clears the tab bar
  const S = Math.max(.55, Math.min(1, (H - 112) / 745));   // 745 = start block incl. the "เริ่ม" label; 112 = tab bar + the raised play button
  pg.innerHTML = `<img class="wbg" src="assets/tk_bgS.webp" alt="">
    <div class="t3-start" style="transform:scale(${S.toFixed(3)})">
      <img class="t3-title" src="assets/tk_title.png" alt="Step Trek">
      <div class="t3-gps" id="t3Gps" data-st="perm">
        <img class="pin" src="assets/tk_pin.png" alt="">
        <b class="h">เชื่อมต่อ GPS</b>
        <div class="row"><span class="st"><i class="dot"></i><span id="t3St">ขอสิทธิ์เข้าถึงตำแหน่ง</span></span><span class="lamp"><i></i></span></div>
        <i class="hr"></i>
        <span class="note" id="t3Note">ใช้ตำแหน่งเพื่อบันทึกเส้นทางและระยะทางของคุณ</span>
        <button class="t3-allow press" id="t3Allow">อนุญาตให้เข้าถึงตำแหน่ง</button>
      </div>
      <button class="t3-go press" id="t3Go" disabled><img src="assets/hd_trek2.png" alt=""><span>เริ่ม</span></button>
    </div>`;
  const gps = $('#t3Gps', pg), go3 = $('#t3Go', pg);
  const set = (st, txt, note) => {
    gps.dataset.st = st; $('#t3St', pg).textContent = txt; $('#t3Note', pg).textContent = note; go3.disabled = st !== 'ok';
    if (st === 'ok') { SFX.chime(); buzz(15); }
  };
  const search = () => {
    set('search', 'กำลังค้นหาสัญญาณ GPS…', 'ยืนในที่โล่งจะเจอสัญญาณเร็วขึ้น');
    let done = false;
    const ok = acc => { if (done) return; done = true; G.gpsOk = true; saveG(); later(900, () => cur === 'trek' && RUN.state === 'idle' && set('ok', 'GPS พร้อมแล้ว', `ความแม่นยำ ±${acc} ม.`)); };
    try { navigator.geolocation.getCurrentPosition(p => ok(Math.max(3, Math.round(p.coords.accuracy))), () => ok(5), { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }); } catch (e) { ok(5); }
    later(4500, () => ok(5));   // prototype: never stuck on a laptop without GPS
  };
  if (G.gpsOk) later(300, search);
  $('#t3Allow', pg).onclick = () => { SFX.pop(); search(); };
  go3.onclick = () => { if (gps.dataset.st === 'ok') startRun(); };

  /* ── running ── */
  let rec, dust;
  const startRun = () => {
    SFX.levelup(); buzz([20, 30, 20]);
    T2.say('เริ่มบันทึก สู้ ๆ นะ');   // inside the tap: unlocks iPhone speech for the km announcements
    $('#tabbar').classList.add('hide');
    const s = Math.max(.6, Math.min(1, (H - 380) / 454)), ringY = H - 240, topB = 454 * s, esz = Math.round(Math.max(76, Math.min(120, ringY - topB - 8)));
    rec = document.createElement('div'); rec.className = 't3-rec';
    rec.innerHTML = `<img class="wbg" src="assets/tk_bgR.webp" alt=""><i class="t3-speed">${[[8, 34, 0], [17, 30, .25], [27, 24, .5], [73, -24, .12], [83, -30, .37], [92, -34, .6]].map(([x, a, d]) => `<i style="left:${x}%;--a:${a}deg;--d:${d}s"></i>`).join('')}</i><i class="t3-dim"></i>
      <div class="t3-top" style="transform:scale(${s.toFixed(3)})">
        <div class="t3-pill rec"><i class="dot"></i><span id="t3RecT">กำลังบันทึก · ${RUN.sport}</span></div>
        <div class="t3-pill gps"><i class="bars"><i></i><i></i><i></i></i>GPS</div>
        <div class="t3-gauge" id="t3Gauge" style="--p:0"><i class="ring"></i><i class="ticks"></i><div class="in"><b id="t3D">0.00</b><span>กิโลเมตร</span></div></div>
        <div class="t3-chip l"><img src="assets/tk_watch.png" alt=""><span>เวลา</span><b id="t3T">0:00</b></div>
        <div class="t3-chip r"><img src="assets/tk_speedo.png" alt=""><span>ความเร็วเฉลี่ย</span><b><em id="t3V">0.0</em> <small>กม./ชม.</small></b></div>
        <div class="t3-toast" id="t3Toast"><img src="assets/tk_star.png" alt=""><b id="t3ToastT">ครบ 1 กม.!</b></div>
      </div>
      <i class="t3-ring" style="top:${ringY}px"></i>
      <div class="t3-btns">
        <button class="t3-b pause press" id="t3Pause"><img src="assets/tk_pause.png" alt=""><span>หยุดชั่วคราว</span></button>
        <button class="t3-b res press" id="t3Res"><img src="assets/tk_cont.png" alt=""><span>ดำเนินการต่อ</span></button>
        <button class="t3-b fin press" id="t3Fin"><img src="assets/tk_finish.png" alt=""><span>เสร็จสิ้น</span></button>
      </div>`;
    pg.append(rec); later(20, () => rec.classList.add('on'));
    const re = new Eli(rec, { size: esz, x: 195, y: ringY + 6 }); re.setFace(1); re.loop(RUNF, 13);
    clearInterval(dust); dust = setInterval(() => RUN.state === 'running' && puff(rec, re.x - 26, re.y - 2, 1), 320);
    cleanup.push(() => clearInterval(dust));
    RUN.state = 'running'; RUN.eli = re;
    $('#t3Pause', rec).onclick = () => { RUN.state = 'paused'; rec.classList.add('paused'); $('#t3RecT', rec).textContent = 'หยุดชั่วคราว'; re.stop().pose('ready4'); SFX.tone(440, .18, 'triangle', .05); buzz(15); };
    $('#t3Res', rec).onclick = () => { RUN.state = 'running'; rec.classList.remove('paused'); $('#t3RecT', rec).textContent = `กำลังบันทึก · ${RUN.sport}`; re.loop(RUNF, 13); SFX.tone(660, .18, 'triangle', .05); buzz(15); };
    $('#t3Fin', rec).onclick = () => { RUN.state = 'done'; clearInterval(dust); SFX.levelup(); $('#tabbar').classList.remove('hide'); go('trekdone', { dir: 'up' }); };
  };
  const lap = () => {
    const km = RUN.next / 1000, spd = T2.speed(RUN.m, RUN.sec), hr = RUN.hrN ? Math.round(RUN.hr / RUN.hrN) : 0;
    RUN.laps.push({ km, sec: RUN.sec });
    const t = $('#t3Toast', rec); $('#t3ToastT', rec).textContent = `ครบ ${km} กม.!`;
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    $('#t3Gauge', rec).classList.remove('lap'); void rec.offsetWidth; $('#t3Gauge', rec).classList.add('lap');
    [0, .14, .28].forEach((d, i) => SFX.tone([784, 988, 1318][i], .22, 'sine', .05, d)); buzz([30, 40, 30]);
    burst(rec, 195, H - 330, { n: 16, dist: 80, size: 6, colors: ['#F6C343', '#F28C28', '#2A3B9C', '#fff'], shape: 'star' });
    RUN.eli && (RUN.eli.pose('cheer1'), RUN.eli.jump(40, 460).then(() => RUN.state === 'running' && RUN.eli.loop(RUNF, 13)));
    later(500, () => T2.say(`ระยะทาง ${km} กิโลเมตร. เวลา ${T2.thTime(RUN.sec)}. ความเร็วเฉลี่ย ${spd.toFixed(1)} กิโลเมตรต่อชั่วโมง. อัตราการเต้นของหัวใจเฉลี่ย ${hr} ครั้งต่อนาที`));
    RUN.next += 1000;
  };
  every(500, () => {
    if (RUN.state !== 'running' || !rec) return;
    RUN.sec += 6; RUN.m += 6 * (1000 / 355) * (.94 + Math.random() * .12);   // prototype: a sped-up run (≈1 km every 30 s)
    const hr = 138 + Math.round(Math.sin(RUN.sec / 40) * 9 + Math.random() * 4); RUN.hr += hr; RUN.hrN++;
    $('#t3D', rec).textContent = (RUN.m / 1000).toFixed(2);
    $('#t3T', rec).textContent = clock(RUN.sec);
    $('#t3V', rec).textContent = T2.speed(RUN.m, RUN.sec).toFixed(1);
    $('#t3Gauge', rec).style.setProperty('--p', ((RUN.m % 1000) / 1000).toFixed(3));   // the arc fills toward the next km
    if (RUN.m >= RUN.next) lap();
  });
};
