/* Eli's World — Step Trek, minimal style L "bold brand" (client pick 2026-10-15, design gen/trek_min/tk_mL_raw.png).
   Client: runners tap record, switch the screen off and open their music app; when they glance they only want km, pace and time.
   So no scenery and no mascot while recording — a yellow band with the huge distance, pace (min/km) + time below, one yellow pause button.
   start: yellow band "Step Trek" + GPS card (permission → yellow searching → green ready) + one start button (no countdown)
   running: ● กำลังบันทึก · GPS, distance, pace, time, "ครบ N กม." note; every km: chime + spoken summary (works with the screen off)
   paused: the distance dims, continue (yellow) / finish (indigo, flag)
   Sizes are design points at 844 pt tall, scaled by --k on shorter screens so the recorder always fits without scrolling. */
LIFE.trek = pg => {
  pg.classList.add('w-trek', 't4');
  Object.assign(RUN, { state: 'idle', sec: 0, m: 0, next: 1000, hr: 0, hrN: 0, zones: [0, 0, 0, 0, 0], laps: [], sport: RUN.sport || 'วิ่ง' });
  pg.style.setProperty('--k', Math.max(.55, Math.min(1, (appH - 128) / 714)).toFixed(3));   // 128 = the parts that don't scale (status row, bottom safe gap)
  pg.innerHTML = `<div class="t4-start">
      <div class="t4-band"><b class="t4-title">Step Trek</b></div>
      <div class="t4-gps" id="t4Gps" data-st="perm">
        <b class="h">เชื่อมต่อ <span class="en">GPS</span></b>
        <span class="st"><i class="dot"></i><span id="t4St">ขอสิทธิ์เข้าถึงตำแหน่ง</span></span>
        <span class="note" id="t4Note">ใช้ตำแหน่งเพื่อบันทึกระยะทางของคุณ</span>
        <button class="t4-allow press" id="t4Allow">${T2.ic.pin}อนุญาตให้เข้าถึงตำแหน่ง</button>
      </div>
      <div class="t4-goW"><button class="t4-go press" id="t4Go" disabled><i class="b">${T2.ic.play}</i><span>เริ่ม</span></button></div>
    </div>`;
  const gps = $('#t4Gps', pg), go4 = $('#t4Go', pg);
  const set = (st, txt, note) => {
    gps.dataset.st = st; $('#t4St', pg).innerHTML = txt.replace('GPS', '<span class="en">GPS</span>'); $('#t4Note', pg).textContent = note; go4.disabled = st !== 'ok';
    if (st === 'ok') { SFX.chime(); buzz(15); }
  };
  const search = () => {
    set('search', 'กำลังค้นหาสัญญาณ GPS…', 'ยืนในที่โล่งจะเจอสัญญาณเร็วขึ้น');
    let done = false;
    const ok = acc => { if (done) return; done = true; G.gpsOk = true; saveG(); later(900, () => cur === 'trek' && RUN.state === 'idle' && set('ok', 'GPS พร้อมแล้ว', `ความแม่นยำ ±${acc} ม.`)); };
    if (window.NATIVE) {   // the app: real permission + a real fix (no fake "ready")
      NATIVE.gpsFix().then(acc => ok(Math.max(3, Math.round(acc)))).catch(e => { if (cur === 'trek' && RUN.state === 'idle') set('perm', 'ยังไม่ได้รับสิทธิ์ตำแหน่ง', e && e.denied ? 'เปิดสิทธิ์ตำแหน่งในการตั้งค่าเครื่อง แล้วลองอีกครั้ง' : 'หาสัญญาณไม่เจอ ลองออกไปที่โล่งแล้วกดอีกครั้ง'); });
      return;
    }
    try { navigator.geolocation.getCurrentPosition(p => ok(Math.max(3, Math.round(p.coords.accuracy))), () => ok(5), { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }); } catch (e) { ok(5); }
    later(4500, () => ok(5));   // prototype: never stuck on a laptop without GPS
  };
  if (G.gpsOk) later(300, search);
  $('#t4Allow', pg).onclick = () => { SFX.pop(); search(); };
  go4.onclick = () => { if (gps.dataset.st === 'ok') startRun(); };

  /* ── recorder ── */
  let rec, kmLen = 0;
  const fitKm = () => {   // the distance fills the width but never overflows it ("12.34" is wider than "2.07")
    const b = $('#t4D', rec); b.style.fontSize = '';
    const max = Math.min(appW, 390) - 40, w = b.scrollWidth;
    if (w > max) b.style.fontSize = parseFloat(getComputedStyle(b).fontSize) * max / w + 'px';
  };
  const startRun = () => {
    SFX.levelup(); buzz([20, 30, 20]);
    T2.say('เริ่มบันทึก สู้ ๆ นะ');   // inside the tap: unlocks iPhone speech for the km announcements
    $('#tabbar').classList.add('hide');
    rec = document.createElement('div'); rec.className = 't4-rec';
    rec.innerHTML = `<div class="t4-band">
        <div class="t4-stat"><span class="s"><i class="dot"></i><b id="t4RecT">กำลังบันทึก</b></span><span class="gps"><i class="bars"><i></i><i></i><i></i></i>GPS</span></div>
        <b class="t4-km" id="t4D">0.00</b><span class="t4-kmL">กิโลเมตร</span>
      </div>
      <div class="t4-low">
        <div class="t4-n"><b id="t4P">–:––</b><span>เพซเฉลี่ย (นาที/กม.)</span></div>
        <i class="t4-hr"></i>
        <div class="t4-n"><b id="t4T">0:00</b><span>เวลา</span></div>
        <span class="t4-note" id="t4Lap">มีเสียงแจ้งทุก 1 กม.</span>
        <div class="t4-btns">
          <button class="t4-b pause press" id="t4Pause"><i class="b">${T2.ic.pause}</i><span>หยุดชั่วคราว</span></button>
          <button class="t4-b res press" id="t4Res"><i class="b">${T2.ic.play}</i><span>ดำเนินการต่อ</span></button>
          <button class="t4-b fin press" id="t4Fin"><i class="b">${T2.ic.flag}</i><span>เสร็จสิ้น</span></button>
        </div>
      </div>`;
    pg.append(rec); later(20, () => rec.classList.add('on'));
    kmLen = 4; fitKm(); document.fonts?.ready.then(() => rec.isConnected && fitKm());
    RUN.state = 'running'; RUN.t0 = Date.now(); RUN.native = !!window.NATIVE;
    if (window.NATIVE) NATIVE.runStart();
    $('#t4Pause', rec).onclick = () => { window.NATIVE && NATIVE.runPause(); RUN.state = 'paused'; rec.classList.add('paused'); $('#t4RecT', rec).textContent = 'หยุดชั่วคราว'; SFX.tone(440, .18, 'triangle', .05); buzz(15); };
    $('#t4Res', rec).onclick = () => { window.NATIVE && NATIVE.runResume(); RUN.state = 'running'; rec.classList.remove('paused'); $('#t4RecT', rec).textContent = 'กำลังบันทึก'; SFX.tone(660, .18, 'triangle', .05); buzz(15); };
    $('#t4Fin', rec).onclick = async () => {
      RUN.state = 'done'; SFX.levelup(); $('#tabbar').classList.remove('hide');
      if (window.NATIVE) { try { await NATIVE.runStop(); } catch (e) {} }   // stops GPS and fills RUN.hr / RUN.zones from Health
      go('trekdone', { dir: 'up' });
    };
  };
  const lap = () => {
    const km = Math.floor(RUN.m / 1000), hr = RUN.hrN ? Math.round(RUN.hr / RUN.hrN) : 0;   // a GPS jump over several km announces only the latest
    RUN.laps.push({ km, sec: RUN.sec });
    const n = $('#t4Lap', rec); n.textContent = `ครบ ${km} กม.!`;
    n.classList.remove('on'); void n.offsetWidth; n.classList.add('on');
    later(3200, () => n.isConnected && (n.textContent = `ครบ ${km} กม.`));
    const d = $('#t4D', rec); d.classList.remove('lap'); void d.offsetWidth; d.classList.add('lap');
    [0, .14, .28].forEach((t, i) => SFX.tone([784, 988, 1318][i], .22, 'sine', .05, t)); buzz([30, 40, 30]);
    later(500, () => T2.say(`ระยะทาง ${km} กิโลเมตร. เวลา ${T2.thTime(RUN.sec)}. เพซเฉลี่ย ${T2.thTime(T2.pace(RUN.m, RUN.sec))} ต่อกิโลเมตร.${hr ? ` อัตราการเต้นของหัวใจเฉลี่ย ${hr} ครั้งต่อนาที` : ''}`));   // no watch → no heart-rate line
    RUN.next = (km + 1) * 1000;
  };
  const tick = () => {
    if (RUN.state !== 'running' || !rec) return;
    if (window.NATIVE) { RUN.sec = Math.round(NATIVE.runSec()); RUN.m = NATIVE.runMeters(); }   // the app: real time + GPS distance
    else {
      RUN.sec += 6; RUN.m += 6 * (1000 / 355) * (.94 + Math.random() * .12);   // web demo: a sped-up run (≈1 km every 30 s, pace ≈ 5:55)
      const hr = T2.hrSim(RUN.sec); RUN.hr += hr; RUN.hrN++; RUN.zones[T2.zoneOf(hr)] += 6;   // time in each heart-rate zone
    }
    const kmT = (RUN.m / 1000).toFixed(2);
    $('#t4D', rec).textContent = kmT; if (kmT.length !== kmLen) { kmLen = kmT.length; fitKm(); }
    $('#t4P', rec).textContent = T2.paceTxt(RUN.m, RUN.sec);
    $('#t4T', rec).textContent = clock(RUN.sec);
    if (RUN.m >= RUN.next) lap();
  };
  every(500, tick);
  RUN.tick = tick;   // the app also calls it on every GPS fix, so km announcements keep coming with the screen off
};
