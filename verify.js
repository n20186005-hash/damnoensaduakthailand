const fs = require('fs');
const langs = ['th', 'en', 'zh'];
for (const l of langs) {
  const h = fs.readFileSync(`dist/${l}/index.html`, 'utf8');
  const u = (h.match(/maps\.app\.goo\.gl\/DAR94g91aeJne7Y96/g) || []).length;
  const g = (h.match(/Google Maps/g) || []).length;
  const hr = (h.match(/href="https:\/\/maps\.app\.goo\.gl/g) || []).length;
  const coords = h.includes('LAT = 13.519') && h.includes('LON = 99.953');
  console.log(`[${l}] URL occ=${u}  GoogleMapsText=${g}  hrefLinks=${hr}  weatherCoordsOK=${coords}`);
}
