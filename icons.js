/* ELi icon set — chosen style "B · duotone line": royal-blue 1.9px rounded strokes over a sunny-yellow fill accent.
   ic(name) returns inline SVG; colours follow --ic-ln / --ic-acc so a parent can recolour (e.g. white on blue). */
const ICON = {
  shoe: ['<path d="M3 13.6h18.3v1.1c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
    '<path d="M3 14.7V8.5c0-.6.6-1 1.1-.8l2.4 1c.6.3 1.3.2 1.8-.2l1.2-1 4.2 3.7c.5.4 1.1.6 1.7.6h2.7c1.6 0 2.9 1.3 3 2.9M3 14.7c0 .9.7 1.6 1.6 1.6h15.1c.9 0 1.6-.7 1.6-1.6v-.9M9.7 10.1l1.4-1.2M11.8 12l1.4-1.2"/>',
    '<path d="M.8 9.6h1.6M.4 12.1h1.9"/>'],
  moon: ['<path d="M19.4 14.8A8 8 0 1 1 10 4.3a6.3 6.3 0 0 0 9.4 10.5z"/>',
    '<path d="M19.4 14.8A8 8 0 1 1 10 4.3a6.3 6.3 0 0 0 9.4 10.5z"/>',
    '<path d="M14.6 3.6h3l-3 3.2h3M19.6 8.6h2l-2 2.1h2"/>'],
  heart: ['<path d="M12 20s-7.4-4.3-7.4-9.9A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.4 2.5C19.4 15.7 12 20 12 20z"/>',
    '<path d="M12 20s-7.4-4.3-7.4-9.9A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.4 2.5C19.4 15.7 12 20 12 20z"/>',
    '<path d="M3.2 4.4l1.3 1.3M20.8 4.4l-1.3 1.3M12 2v1.8"/>'],
  hand: ['<path d="M20.1 2.9c-.6-.8-2-.6-2 .6 0 1 2 2.2 2 2.2s2-1.2 2-2.2c0-1.2-1.4-1.4-2-.6z"/>',
    '<path d="M8.2 13.4V7a1.3 1.3 0 0 1 2.6 0v4.6M10.8 11.2V5.2a1.3 1.3 0 0 1 2.6 0v6M13.4 11.2V6.4a1.3 1.3 0 0 1 2.6 0V12M16 12V9a1.3 1.3 0 0 1 2.6 0v5c0 3.5-2.6 6.2-6.1 6.2h-.6c-2 0-3.6-.9-4.7-2.5l-2.6-3.8a1.3 1.3 0 0 1 2.1-1.6l1.5 1.8"/>'],
  coin: ['<circle cx="12" cy="12" r="8.4"/>',
    '<circle cx="12" cy="12" r="8.4"/><path d="M12 8.4l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z"/>'],
  steps: ['<ellipse cx="8" cy="14.6" rx="2.5" ry="3.8"/><ellipse cx="16" cy="8.6" rx="2.5" ry="3.8"/>',
    '<ellipse cx="8" cy="14.6" rx="2.5" ry="3.8"/><ellipse cx="16" cy="8.6" rx="2.5" ry="3.8"/><path d="M7.2 20.6h1.7M15.2 14.6h1.7"/>'],
  run: ['<circle cx="15.5" cy="10" r="6"/>',
    '<circle cx="14.6" cy="4.4" r="1.8"/><path d="M6.8 21l3.6-5.4 3 2.6v2.8M8.4 11.6l3.1-2.6 3.5 1.6 2 3 3 1M11.5 9l-2 7"/>'],
  story: ['<path d="M8.4 6.6h7.2v8.8H8.4z"/>',
    '<rect x="5.6" y="2.6" width="12.8" height="18.8" rx="3"/><path d="M8.4 15.4l2.6-2.8 1.8 1.8 1.3-1.3 1.5 1.6M10 18.4h4"/><circle cx="13.9" cy="9" r="1.2"/>'],
  trophy: ['<path d="M7 3.8h10V9a5 5 0 0 1-10 0z"/>',
    '<path d="M7 3.8h10V9a5 5 0 0 1-10 0zM7 5.6H4.6A2.6 2.6 0 0 0 7.4 9.8M17 5.6h2.4a2.6 2.6 0 0 1-2.8 4.2M12 14v3M9.6 17h4.8v3.4H9.6z"/>'],
  flame: ['<path d="M12 21.2c-3.9 0-6.6-2.7-6.6-6.3 0-3.2 2.2-5.4 3.6-7.6.4 1.6 1.4 2.8 2.6 3.4.3-3.1 1.6-5.9 4-7.9-.2 2.3.6 4 1.8 5.7 1.2 1.7 2.2 3.4 2.2 6.1 0 3.8-3.2 6.6-7.6 6.6z"/>',
    '<path d="M12 21.2c-3.9 0-6.6-2.7-6.6-6.3 0-3.2 2.2-5.4 3.6-7.6.4 1.6 1.4 2.8 2.6 3.4.3-3.1 1.6-5.9 4-7.9-.2 2.3.6 4 1.8 5.7 1.2 1.7 2.2 3.4 2.2 6.1 0 3.8-3.2 6.6-7.6 6.6zM12 21.2c-1.7 0-2.9-1.2-2.9-2.8 0-1.8 1.6-2.9 2.6-4.4.9 1 3.2 2.4 3.2 4.4 0 1.6-1.2 2.8-2.9 2.8z"/>'],
  drop: ['<path d="M12 3s6.4 6.5 6.4 11.1a6.4 6.4 0 0 1-12.8 0C5.6 9.5 12 3 12 3z"/>',
    '<path d="M12 3s6.4 6.5 6.4 11.1a6.4 6.4 0 0 1-12.8 0C5.6 9.5 12 3 12 3z"/><path d="M9.2 14.6a2.8 2.8 0 0 0 2.8 2.8"/>'],
  bolt: ['<path d="M13.4 2.6 5.2 13.4h6.2l-1 8 8.4-11h-6.2z"/>', '<path d="M13.4 2.6 5.2 13.4h6.2l-1 8 8.4-11h-6.2z"/>'],
  gift: ['<path d="M4.4 11.2h15.2v8.2a1.6 1.6 0 0 1-1.6 1.6H6a1.6 1.6 0 0 1-1.6-1.6z"/>',
    '<rect x="3.4" y="7.4" width="17.2" height="3.8" rx="1.2"/><path d="M4.4 11.2v8.2c0 .9.7 1.6 1.6 1.6h12c.9 0 1.6-.7 1.6-1.6v-8.2M12 7.4V21M12 7.4S10.4 3 7.9 4.1 9 7.4 12 7.4zm0 0s1.6-4.4 4.1-3.3S15 7.4 12 7.4z"/>'],
  send: ['<path d="M12 18.8s-5.6-3.3-5.6-7.5A3.2 3.2 0 0 1 12 9.4a3.2 3.2 0 0 1 5.6 1.9c0 4.2-5.6 7.5-5.6 7.5z"/>',
    '<path d="M12 18.8s-5.6-3.3-5.6-7.5A3.2 3.2 0 0 1 12 9.4a3.2 3.2 0 0 1 5.6 1.9c0 4.2-5.6 7.5-5.6 7.5z"/>', '<path d="M16.6 3.4l3.6 1.2-1.2 3.6M20.2 4.6 15 9.2"/>'],
  check: ['<circle cx="12" cy="12" r="9"/>', '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16.2 9.6"/>'],
  chev: ['', '<path d="m9.5 6 6 6-6 6"/>'],
  home: ['<path d="M9.4 21v-6.2h5.2V21"/>', '<path d="M3.6 10.4 12 3.6l8.4 6.8V19a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2zM9.4 21v-6.2h5.2V21"/>'],
  feed: ['<path d="M7.6 8.4h8.8v3.4H7.6z"/>', '<rect x="4.4" y="3.6" width="15.2" height="16.8" rx="3"/><path d="M7.6 8.4h8.8v3.4H7.6zM7.6 15h8.8M7.6 17.6h5.6"/>'],
  user: ['<circle cx="12" cy="8.2" r="3.9"/>', '<circle cx="12" cy="8.2" r="3.9"/><path d="M4.6 20.6c1.1-3.7 4.1-5.6 7.4-5.6s6.3 1.9 7.4 5.6"/>'],
  sparkle: ['<path d="M12 3.4 13.9 10l6.7 2-6.7 2L12 20.6 10.1 14l-6.7-2 6.7-2z"/>', '<path d="M12 3.4 13.9 10l6.7 2-6.7 2L12 20.6 10.1 14l-6.7-2 6.7-2z"/>'],
  house: ['<path d="M5.6 11v8.4h12.8V11L12 5.6z"/>', '<path d="M3.6 12.4 12 5l8.4 7.4M5.6 10.8v8.6h12.8v-8.6M10.2 19.4v-4.6h3.6v4.6"/>'],
  arrow: ['', '<path d="M4 12h16M14 6l6 6-6 6"/>'],
};
/* full-colour icons used where the approved design shows coloured objects (coin, flame, crown) */
const ICC = {
  coin: '<defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#F5A90F"/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#cg1)"/><circle cx="12" cy="12" r="7.4" fill="#FFC928" stroke="#F0A30A" stroke-width="1"/><path d="M12 7.6l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#fff"/><ellipse cx="8.6" cy="6.6" rx="2.4" ry="1.2" fill="#fff" opacity=".55" transform="rotate(-30 8.6 6.6)"/>',
  flame: '<defs><linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A3D"/><stop offset="1" stop-color="#F0441E"/></linearGradient></defs><path d="M12 22c-4.3 0-7.2-3-7.2-6.9 0-3.5 2.4-5.9 3.9-8.3.4 1.8 1.5 3.1 2.8 3.7.3-3.4 1.8-6.4 4.4-8.6-.2 2.5.7 4.4 2 6.2 1.3 1.9 2.4 3.7 2.4 6.7C20.3 18.9 16.8 22 12 22z" fill="url(#fg1)"/><path d="M12 22c-2 0-3.3-1.4-3.3-3.2 0-2 1.8-3.3 2.9-5 1 1.2 3.7 2.7 3.7 5 0 1.8-1.4 3.2-3.3 3.2z" fill="#FFD23F"/>',
  crown: '<path d="M4 17.6 2.8 7.8l5 3.8L12 5l4.2 6.6 5-3.8L20 17.6z" fill="#FFC928" stroke="#2149C9" stroke-width="1.8" stroke-linejoin="round"/><path d="M4.4 20.2h15.2" stroke="#2149C9" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="14" r="1.6" fill="#2149C9"/>',
  homeSolid: '<path d="M3.4 10.6 12 3.6l8.6 7v8.6a1.8 1.8 0 0 1-1.8 1.8h-4.4v-5.6H9.6V21H5.2a1.8 1.8 0 0 1-1.8-1.8z" fill="currentColor"/>',
};
const icc = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICC[name]}</svg>`;
function ic(name, cls = '') {
  const [acc, ln, tick = ''] = ICON[name] || ICON.heart;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><g class="ic-a">${acc}</g><g class="ic-l">${ln}</g><g class="ic-t">${tick}</g></svg>`;
}
