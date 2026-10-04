/* Eli's World — shared state + helpers for the theme-A screens (loaded after life.js, before w_pages.js / app.js). */
// world-specific defaults on top of the Life Power state (G, life.js)
if (!G.world) {
  Object.assign(G, { coins: 6540, world: 1 });
  G.citizen = { name: 'สายสุขภาพ', id: 'ELI-0425', age: 32 };
  G.cart = [];
  G.redeemed = [];
  saveG();
}
G.cart = G.cart || []; G.redeemed = G.redeemed || [];
const wi = (n, c = '') => `<img class="mk ${c}" src="assets/${n}.png" alt="">`;
const wcoins = () => fmt(G.coins);
// Eli Bio-age: younger when today's Life Power habits are on track (walk + sleep + care), older when they slip
const bioAge = () => {
  const t = G.today, score = LPX.walk(t.steps) / 40 * .45 + LPX.sleep(t.sleep) / 40 * .4 + LPX.app(t) / 20 * .15;
  return Math.round(G.citizen.age + 4 - score * 8);   // 0 → age+4 … 1 → age-4
};
// sleep stages for the last night (hours), split like a healthy night: deep 26%, light 58%, REM 16%
const sleepStages = h => { const q = x => Math.round(x * 4) / 4; const d = q(h * .26), r = q(h * .16); return { d, l: q(h - d - r), r }; };
const sleepQuality = h => Math.max(40, Math.min(98, Math.round(60 + (Math.min(h, 8) - 5) * 11)));
const qualityWord = q => q >= 90 ? 'สดชื่นเต็มเปี่ยม' : q >= 75 ? 'พักผ่อนดี' : q >= 60 ? 'พอใช้' : 'ยังไม่พอ';
const hrs = h => (h % 1 ? h.toFixed(2).replace(/0$/, '') : h) + 'h';
