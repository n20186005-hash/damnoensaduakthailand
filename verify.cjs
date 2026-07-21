const fs = require('fs');
const h = fs.readFileSync('dist/zh/index.html', 'utf8');
// find every Thai run and show context
const re = /[ก-๛][ก-๛\s\.\,]{2,}/g;
let m, n = 0;
const seen = new Set();
while ((m = re.exec(h)) && n < 25) {
  const s = m[0].trim();
  if (seen.has(s)) continue;
  seen.add(s);
  const i = m.index;
  console.log('THAIRUN: [' + s.slice(0, 50) + '] ...ctx: ' + h.substring(Math.max(0, i - 40), i).replace(/\s+/g, ' ').slice(-40));
  n++;
}
console.log('total distinct thai runs shown:', n);
