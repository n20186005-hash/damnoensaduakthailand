const fs = require('fs');
const langs = ['th', 'en', 'zh'];
// markers from OTHER languages that should NOT appear on a given page
const leaks = {
  th: ['Damnoen Saduak Floating Market', '丹嫩沙多', 'Floating Market', '中文', 'Explore', '非営', '游览'],
  en: ['ตลาดน้ำ', 'ดำเนินสะดวก', '丹嫩沙多', '水上市场', 'แบบไม่แสวง'],
  zh: ['ตลาดน้ำ', 'ดำเนินสะดวก', 'Floating Market', 'Damnoen Saduak Floating Market', 'แบบไม่แสวง'],
};
for (const l of langs) {
  const h = fs.readFileSync(`dist/${l}/index.html`, 'utf8');
  const bad = [];
  for (const m of leaks[l]) if (h.includes(m)) bad.push(m);
  const dom = /damnoensaduakthailand\.com/.test(h);
  const old = /damnoensaduakfloatingmarket\.com/.test(h);
  const maps = (h.match(/maps\.app\.goo\.gl\/DAR94g91aeJne7Y96/g) || []).length;
  console.log(`[${l}] domainOK=${dom} oldDomain=${old} maps=${maps} langLeaks=${bad.length ? JSON.stringify(bad) : 'none'}`);
}
