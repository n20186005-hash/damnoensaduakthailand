import fs from 'node:fs';

const KEYS = {
  en: {
    bestTitle: 'Best window on the water today',
    bestAlt: 'Alternative slot',
    bestNote: 'Ranked from hourly rain chance and heat between 07:00 and 17:00.',
    bestClear: 'Driest and coolest hours of the trading day — the canal is at its liveliest.',
    bestHeat: 'Early hours are the coolest; shade gets scarce once the afternoon heat builds.',
    bestRain: 'Rain is likelier elsewhere in the day — use this window for the boat ride.',
    bestNone: 'Every window carries a real chance of rain; keep a covered riverside plan ready.',
  },
  th: {
    bestTitle: 'ช่วงเวลาที่ดีที่สุดในการล่องคลองวันนี้',
    bestAlt: 'ช่วงเวลาสำรอง',
    bestNote: 'ประเมินจากโอกาสฝนรายชั่วโมงและความร้อนระหว่าง ๐๗:๐๐–๑๗:๐๐ น.',
    bestClear: 'เป็นช่วงที่ฝนน้อยและอากาศเย็นที่สุดของวัน คลองคึกคักที่สุด',
    bestHeat: 'ช่วงเช้าอากาศเย็นที่สุด พอบ่ายแก่แดดจัดและร่มเงามีจำกัด',
    bestRain: 'ช่วงอื่นของวันมีโอกาสฝนสูงกว่า แนะนำให้ล่องเรือในช่วงนี้',
    bestNone: 'วันนี้เกือบทุกช่วงมีโอกาสฝน ควรเตรียมแผนสำรองริมคลองที่มีหลังคา',
  },
  zh: {
    bestTitle: '今日最佳游览时段',
    bestAlt: '备选时段',
    bestNote: '按 07:00–17:00 逐小时降雨概率与体感温度综合排序。',
    bestClear: '全天降雨概率最低、体感最舒适，也是水道最热闹的时段。',
    bestHeat: '清晨最凉爽，午后升温快、遮阴处有限。',
    bestRain: '当天其他时段降雨概率更高，建议把乘船安排在此窗口。',
    bestNone: '今日各时段降雨概率都偏高，建议准备有遮蔽的备选行程。',
  },
};

for (const [locale, entries] of Object.entries(KEYS)) {
  const file = `src/i18n/${locale}.json`;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const index = lines.findIndex((line) => /^ {2}"weather"\s*:\s*\{\s*$/.test(line));
  if (index === -1) throw new Error(`weather block not found in ${file}`);
  if (lines.some((line) => line.includes('"bestTitle"'))) {
    console.log(`${locale}: already patched`);
    continue;
  }
  const block = Object.entries(entries).map(
    ([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
  );
  lines.splice(index + 1, 0, ...block);
  fs.writeFileSync(file, lines.join('\n'));
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`${locale}: inserted ${block.length} keys`);
}
