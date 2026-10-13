/* Eli's World — profile & settings (client 2026-10-13): opened from the profile card on Eli's World.
   Profile photo · username · description · date of birth (→ real age) · gender · log out. Prototype: saved on this device only. */
LIFE.settings = pg => {
  pg.classList.add('w-set2');
  const C = G.citizen, th = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }); };
  pg.innerHTML = `<img class="wbg" src="assets/w_set_bg.webp" alt="">
    <button class="st-back press" data-go="world" aria-label="กลับ">${wi('st_back')}</button><b class="st-ttl">โปรไฟล์</b>
    <div class="s2-scroll">
      <div class="s2-av">
        <label class="ph press"><img id="s2Img" src="${C.photo || 'assets/w_avatar.webp'}" alt=""><i class="cam">${T2.ic.photo}</i><input type="file" accept="image/*" id="s2File" hidden></label>
        <span class="chg">แตะเพื่อเปลี่ยนรูปโปรไฟล์</span>
        <span class="cid">Eli Citizen ID <b>${C.id}</b></span>
      </div>
      <section class="s2-card">
        <label class="s2-f"><span>ชื่อผู้ใช้</span><input id="s2Name" maxlength="24" value="${C.name}"></label>
        <label class="s2-f"><span>คำอธิบาย</span><textarea id="s2Bio" rows="3" maxlength="150" placeholder="เล่าเกี่ยวกับตัวคุณสั้น ๆ เช่น สายเดินยามเช้า ☀️">${C.bio || ''}</textarea><em id="s2BioN">${(C.bio || '').length}/150</em></label>
        <label class="s2-f"><span>วันเดือนปีเกิด</span><input type="date" id="s2Birth" value="${C.birth}" max="${new Date().toISOString().slice(0, 10)}"></label>
        <div class="s2-age"><span>อายุจริง</span><b id="s2Age">${C.age}</b><span>ปี</span><small id="s2BirthTh">${th(C.birth)}</small></div>
        <div class="s2-f"><span>เพศสภาพ</span><div class="s2-seg" id="s2Sex"><button data-g="f" class="${C.gender !== 'm' ? 'on' : ''}">หญิง</button><button data-g="m" class="${C.gender === 'm' ? 'on' : ''}">ชาย</button></div></div>
      </section>
      <button class="s2-save press" id="s2Save">บันทึก</button>
      <button class="s2-out press" id="stOut">ออกจากระบบ</button>
    </div>`;
  bindGo(pg);
  let photo = C.photo || null, gender = C.gender === 'm' ? 'm' : 'f';
  // the photo is shrunk to a 256 px square so it fits in the phone's storage
  $('#s2File', pg).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), s = Math.min(im.width, im.height);
      g.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 256, 256);
      photo = c.toDataURL('image/jpeg', .85); $('#s2Img', pg).src = photo; SFX.pop();
    }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
  $('#s2Bio', pg).oninput = e => { $('#s2BioN', pg).textContent = `${e.target.value.length}/150`; };
  $('#s2Birth', pg).onchange = e => { $('#s2Age', pg).textContent = ageOf(e.target.value); $('#s2BirthTh', pg).textContent = th(e.target.value); };
  $$('#s2Sex button', pg).forEach(b => b.onclick = () => { gender = b.dataset.g; $$('#s2Sex button', pg).forEach(x => x.classList.toggle('on', x === b)); SFX.pop(); });
  $('#s2Save', pg).onclick = () => {
    const nm = $('#s2Name', pg).value.trim(), bd = $('#s2Birth', pg).value;
    if (!nm) { $('#s2Name', pg).focus(); return toast('ตั้งชื่อผู้ใช้ก่อนนะ'); }
    Object.assign(C, { name: nm, bio: $('#s2Bio', pg).value.trim(), birth: bd || C.birth, age: ageOf(bd || C.birth), gender, photo });
    try { saveG(); } catch (e) { C.photo = null; saveG(); toast('รูปใหญ่เกินไป ลองรูปอื่นนะ'); return; }
    SFX.chime(); buzz(15); toast('บันทึกโปรไฟล์แล้ว ✓'); later(500, () => go('world'));
  };
  $('#stOut', pg).onclick = () => openSheet(`<h4>ออกจากระบบ?</h4><p class="wsheet-p">ครั้งหน้าต้องเข้าสู่ระบบใหม่อีกครั้ง ข้อมูลของคุณยังอยู่ครบ</p>
    <button class="btn btn-d press" id="s2OutOk" style="background:#E8453C">ออกจากระบบ</button><button class="btn press" data-close style="margin-top:8px">ยกเลิก</button>`, sh => {
    $('#s2OutOk', sh).onclick = () => { closeSheet(); SFX.pop(); G.member = false; saveG(); go('welcome'); };
  });
};
