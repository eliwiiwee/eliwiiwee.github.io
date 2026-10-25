/* Eli's World — cloud layer (Supabase: sign-in, profile, Life Power, coins, Hero Hall, Treasury).
   Off unless the build sets window.ELI_CLOUD = { url, key } and loads the Supabase client (mobile/scripts/sync-web.mjs does both).
   Off → the web demo keeps its local demo data, nothing changes.
   On → the server owns coins, Life Power and streak (eli_app/backend/supabase): the app reports what happened
   (opening the app, steps, sleep, petting, garden coins, runs, hearts, redemptions) and paints the state that comes back. */
const CLOUD = (() => {
  const C = window.ELI_CLOUD;
  if (!C || !C.url || !C.key || !window.supabase) return { on: false };
  // implicit flow: the links in the e-mails open the account page (C.accountUrl) in a browser, not this app
  const sb = supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'implicit', storageKey: 'eli_auth' } });

  // server / auth messages → Thai
  const MSG = [
    [/invalid login credentials/i, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
    [/already registered|already been registered/i, 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบนะ'],
    [/email not confirmed/i, 'ยืนยันอีเมลก่อนนะ (ดูลิงก์ในอีเมลของคุณ)'],
    [/password should be|weak password/i, 'รหัสผ่านอย่างน้อย 6 ตัวนะ'],
    [/rate limit|too many/i, 'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่'],
    [/not_enough_coins/, 'เหรียญไม่พอ'],
    [/out_of_stock/, 'ของรางวัลชิ้นนี้หมดแล้ว'],
    [/no_product/, 'ของรางวัลชิ้นนี้ไม่มีแล้ว'],
    [/garden_done/, 'เก็บเหรียญในสวนครบแล้ววันนี้'],
    [/chest_done/, 'เปิดหีบของคืนนี้ไปแล้ว'],
    [/chest_sleep/, 'ต้องนอนให้ครบ 7 ชม. ก่อนนะ'],
    [/no_shield/, 'หมดเวลาใช้น้ำยาแล้ว'],
    [/no_such_code/, 'ไม่พบรหัสเชิญนี้ ลองตรวจตัวอักษรอีกครั้ง'],
    [/last_owner/, 'บัญชีนี้เป็นเจ้าของหลังบ้านคนสุดท้าย — โอนสิทธิ์เจ้าของให้คนอื่นก่อนลบ'],
    [/suspended|user is banned/i, 'บัญชีนี้ถูกระงับการใช้งาน ติดต่อ LINE @eliofficial'],
    [/bad_address/, 'กรอกชื่อ เบอร์โทร และที่อยู่ให้ครบนะ'],
    [/failed to fetch|network|load failed/i, 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองใหม่อีกครั้ง'],
  ];
  const thai = e => { const m = String((e && (e.message || e.error_description)) || e || ''); const f = MSG.find(([re]) => re.test(m)); return f ? f[1] : 'มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง'; };
  const fail = e => { const err = new Error(thai(e)); err.raw = e; throw err; };
  const rpc = async (fn, args) => {
    const { data, error } = await sb.rpc(fn, args);
    if (error && /suspended/.test(error.message || '')) suspended();
    if (error) fail(error);
    return data;
  };
  // the eli team suspended this account: sign out and say so (once)
  let outNow = false;
  const suspended = () => {
    if (outNow) return; outNow = true;
    sb.auth.signOut({ scope: 'local' }).catch(() => {}); G.member = false; saveG();
    setTimeout(() => { if (cur !== 'welcome') go('welcome'); openSheet('<h4>บัญชีถูกระงับ</h4><p class="wsheet-p">บัญชีนี้ถูกระงับการใช้งานโดยทีม eli<br>สอบถามได้ที่ LINE @eliofficial</p><button class="btn btn-d press" data-close>ตกลง</button>'); }, 300);
  };

  /* the server's state → G (the same shape the screens already use) */
  const apply = s => {
    if (!s || !s.profile) return s;
    const p = s.profile, t = s.today || {}, sentTo = {};
    (s.sent_to || []).forEach(id => sentTo[id] = true);
    Object.assign(G.citizen, { id: s.citizen_id, name: p.name, birth: p.birth || '', gender: p.gender || '', bio: p.bio || '', photo: p.avatar || null, setup: p.setup });
    G.citizen.age = p.birth ? ageOf(p.birth) : 32;
    const sleep = t.sleep == null ? 0 : +t.sleep;
    G.today = Object.assign(G.today || {}, {
      steps: t.steps || 0, sleep, sleepStages: t.sleep_stages || null, pet: !!t.pet, sent: !!t.sent, sentTo, petMs: t.pet ? 2000 : 0,
      c3: t.garden || 0, dreamChest: t.chest != null, coinWalk: (t.steps || 0) >= 7000, coinSleep: sleep >= 7 && sleep <= 9, bonus: t.bonus || 0 });
    G.day = s.today_date;
    G.inviteCode = p.invite_code; G.event = s.event || null;
    Object.assign(G, { coins: p.coins, total: p.total_lp, streak: p.streak, away: p.away_days, awayLost: p.away_lost, hallHidden: p.hall_hidden,
      vital: p.away_days >= 7 ? 'lonely' : p.away_days >= 3 ? 'sleepy' : 'happy',
      shield: p.shield_streak && p.away_days && p.away_days <= 3 ? { d: p.shield_streak, n: p.away_days } : null });
    G.weekLP = Math.max(0, s.week_lp - earnedToday());   // Hero Hall adds today's live LP back on top
    saveG();
    $$('[data-coins]').forEach(e => e.textContent = fmt(G.coins));
    return s;
  };

  // a smaller JPEG of the same 256 px avatar (a detailed photo can come out too big at the first quality)
  const shrink = src => new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 256; c.getContext('2d').drawImage(im, 0, 0, 256, 256); let q = .7, out; do { out = c.toDataURL('image/jpeg', q); q -= .15; } while (out.length > 78000 && q > .2); res(out); }; im.onerror = () => res(null); im.src = src; });

  // a redemption as the screens use it (coupon codes from partners ride along on their items)
  const order = o => ({ code: o.code, items: o.items.map(i => i.id), names: o.items.map(i => i.name), coupons: o.items.filter(i => i.coupon).map(i => ({ name: i.name, code: i.coupon })),
    sum: o.total, status: o.status, digital: !!o.digital, tracking: o.tracking || null, shipped: !!o.ship_name, at: o.created_at || new Date().toISOString() });

  /* ── account ── */
  let user = null;
  const signedIn = async () => { user = (await sb.auth.getSession()).data.session?.user || null; return user; };
  const afterAuth = async () => { await signedIn(); G.member = true; await load(); };

  /* ── today: debounced (a burst of Health updates is one call) and one call at a time, in order.
     What a call carried is put back if it fails, so a dropped connection never loses steps, sleep or petting. ── */
  let pending = {}, timer = null, chain = Promise.resolve();
  const merge = (into, a) => { for (const k in a) if (a[k] !== undefined && a[k] !== null && !(k === 'pet' && !a[k])) into[k] = k === 'steps' ? Math.max(into.steps || 0, a.steps) : a[k]; return into; };
  const flush = () => {
    clearTimeout(timer); timer = null;
    const run = chain.then(async () => {
      const a = pending; pending = {};
      try { return apply(await rpc('sync_day', { p_steps: a.steps ?? null, p_sleep: a.sleep ?? null, p_stages: a.stages ?? null, p_pet: !!a.pet })); }
      catch (e) { pending = merge(a, pending); throw e; }   // try again with the next update / the next open
    });
    chain = run.catch(() => {});
    return run;
  };
  const load = () => flush();   // (also sends anything still waiting)

  const api = {
    on: true, sb,
    providers: C.providers || ['email'],
    async boot() {   // on every app start: a stored session → fresh state; none (or remember-me off) → the welcome page
      if (G.member && G.remember === false) { let alive = false; try { alive = !!sessionStorage.getItem('eli_sess'); } catch (e) {} if (!alive) await sb.auth.signOut().catch(() => {}); }
      if (!(await signedIn())) { if (G.member) { G.member = false; saveG(); if (cur !== 'welcome') go('welcome'); } return; }
      G.member = true;
      try { await load(); if (['world', 'dream', 'hall', 'treasury'].includes(cur)) go(cur, { force: true, dir: 'none' }); }
      catch (e) { toast(e.message); }
      const inv = new URLSearchParams(location.search).get('invite');
      if (inv) api.addFriend(inv).then(f => toast(`เพิ่ม ${f.name} เป็นเพื่อนแล้ว 💙`)).catch(e => toast(e.message));
      if (G.shield) setTimeout(() => cur === 'world' && shieldSheet(G.awayLost || 0), 1500);
      else setTimeout(() => api.greet(), 1800);
    },
    async signUp(email, password) {
      const { data, error } = await sb.auth.signUp({ email, password, options: C.accountUrl ? { emailRedirectTo: C.accountUrl } : {} }); if (error) fail(error);
      if (!data.session) return { confirm: true };   // the project asks people to confirm their e-mail first
      await afterAuth(); return {};
    },
    async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) fail(error); await afterAuth(); },
    async signInApple(token, nonce) { const { error } = await sb.auth.signInWithIdToken({ provider: 'apple', token, nonce }); if (error) fail(error); await afterAuth(); },
    async reset(email) { const { error } = await sb.auth.resetPasswordForEmail(email, C.accountUrl ? { redirectTo: C.accountUrl } : {}); if (error) fail(error); },
    async signOut() { await sb.auth.signOut().catch(() => {}); user = null; G.member = false; saveG(); },
    async deleteMe() { await rpc('delete_me'); await api.signOut(); },
    async saveProfile(f) {   // name / birth / gender / bio / avatar / setup / hall_hidden — never coins or LP
      if (f.avatar && f.avatar.length > 78000) f = { ...f, avatar: await shrink(f.avatar) };   // the server keeps avatars under 80 KB
      const { error } = await sb.from('profiles').update(f).eq('id', user.id); if (error) fail(error);
      if ('hall_hidden' in f) { G.hallHidden = f.hall_hidden; saveG(); }
    },
    // my own redemptions, newest first (status + parcel number from the eli team)
    async orders() {
      const { data, error } = await sb.from('redemptions').select('code,items,total,status,digital,tracking,ship_name,created_at').order('created_at', { ascending: false }).limit(30);
      if (error) fail(error);
      return data.map(order);
    },
    // news from the eli team + a running coin event: each shown once (seen ids kept on this phone)
    async greet() {
      if (cur !== 'world' || $('#sheet:not([hidden])')) return;
      const seen = (() => { try { return JSON.parse(localStorage.getItem('eli_seen') || '[]'); } catch (e) { return []; } })();
      const mark = id => { seen.push(id); try { localStorage.setItem('eli_seen', JSON.stringify(seen.slice(-50))); } catch (e) {} };
      const ev = G.event, evKey = ev && `ev:${ev.name}:${ev.ends_at}`;
      if (ev && !seen.includes(evKey)) { mark(evKey); notify(`🎉 ${esc(ev.name)}`, `เหรียญ ×${+ev.mult} ถึง ${new Date(ev.ends_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`, 'pet5'); }
      let news = []; try { news = (await rpc('my_news')).filter(n => !seen.includes(n.id)); } catch (e) { return; }
      const next = () => { const n = news.shift(); if (!n || cur !== 'world') return; mark(n.id);
        openSheet(`<h4>${esc(n.title)}</h4><p class="wsheet-p" style="white-space:pre-line">${esc(n.body)}</p><button class="btn btn-o press" id="nwOk">รับทราบ</button>`, sh => $('#nwOk', sh).onclick = () => { closeSheet(); setTimeout(next, 400); }); };
      setTimeout(next, ev && !seen.includes(evKey) ? 2500 : 0);
    },
    // PDPA: a copy of everything the server keeps about me
    async exportMe() { return rpc('export_me'); },
    load,
    // steps / sleep (from Health) and petting; quest coins are paid by the server
    day(a) { merge(pending, a); clearTimeout(timer); timer = setTimeout(() => flush().catch(() => {}), a.pet ? 0 : 1500); },
    async claim(kind) { const s = apply(await rpc('claim', { p_kind: kind })); return s.got; },
    async run(r) { const s = apply(await rpc('log_run', { p: r })); return { lp: s.lp, coin: s.coin, id: s.run_id }; },
    async heart(id) { apply(await rpc('send_heart', { p_to: id })); },
    async shield(use) { apply(await rpc(use ? 'use_shield' : 'drop_shield')); },
    async addFriend(code) { return rpc('add_friend', { p_code: String(code).replace(/[^0-9a-z]/gi, '').toUpperCase() }); },
    async hall() {
      const rows = await rpc('hall');
      return rows.map(r => ({ id: r.me ? 'me' : r.id, uid: r.id, n: r.me ? 'คุณ' : r.name, img: r.avatar || 'assets/w_avatar.webp', total: r.total, week: r.week, me: r.me, away: r.away && !r.me, sent: r.sent, friend: r.friend }));
    },
    async products() {
      const { data, error } = await sb.from('products').select('*').order('sort'); if (error) fail(error);
      const it = p => ({ id: p.id, n: p.name, c: p.coins, img: p.img, nw: p.is_new, out: p.stock === 0 });
      return { orig: data.filter(p => p.tab === 'orig').map(it), fr: data.filter(p => p.tab === 'fr').map(it) };
    },
    async redeem(ids) { const s = apply(await rpc('redeem', { p_items: ids })); return order({ code: s.code, items: s.items, total: s.total, status: s.digital ? 'done' : 'new', digital: s.digital }); },
    async ship(code, name, phone, address, note) { await rpc('set_shipping', { p_code: code, p_name: name, p_phone: phone, p_address: address, p_note: note || '' }); },
  };
  return api;
})();
