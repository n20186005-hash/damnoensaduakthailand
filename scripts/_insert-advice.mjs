import fs from 'node:fs';

/* New copy for the visitor-advice engine. Keys are appended to `weather.advice`
   (advice block) or to the `weather` object itself (windScale). */
const ADD = {
  en: {
    advice: {
      dressStorm:
        'Heavy rain or strong wind — wear a waterproof outer layer and skip wide skirts or long umbrellas.',
      dressCold: 'Unusually cold for the tropics — bring a warm jacket and a scarf.',
      planChance:
        'Rain is likely at some point — favour the covered parts of the market and keep the boat trip flexible.',
      planWind:
        'Breezy conditions — boat trips and open-air sections may be suspended, so go early or reshuffle the day.',
      planFog:
        'Dense fog — views along the canal are limited, so treat this as a market-and-food morning.',
      gearRaincoat: 'Rain jacket (a long umbrella is awkward in wind)',
      gearLayer: 'A light layer for the cool early morning',
      gearMask: 'A mask if fog or haze bothers you',
      gearWind: 'A hat that stays put — gusts lift loose clothing',
      alertTitle: 'Weather warning',
      alertAdvice:
        'Adjust your plans, stay clear of low-lying and waterside areas, and keep checking the forecast.',
    },
    windScale: 'Force',
  },
  th: {
    advice: {
      dressStorm: 'ฝนหนักหรือลมแรง ควรใส่เสื้อกันฝน และเลี่ยงกระโปรงบานหรือร่มยาว',
      dressCold: 'อากาศหนาวผิดปกติสำหรับเขตร้อน ควรเตรียมเสื้อกันหนาวและผ้าพันคอ',
      planChance:
        'มีแนวโน้มฝนตกช่วงใดช่วงหนึ่ง ควรเน้นเดินชมส่วนที่มีหลังคา และเผื่อเวลาเปลี่ยนแผนล่องเรือ',
      planWind: 'ลมค่อนข้างแรง เรือและกิจกรรมกลางแจ้งอาจงดให้บริการ ควรไปตั้งแต่เช้าหรือเลื่อนวัน',
      planFog: 'หมอกลงจัด มองวิวคลองได้จำกัด ควรเน้นเดินชมตลาดและชิมอาหารแทน',
      gearRaincoat: 'เสื้อกันฝน (ร่มยาวไม่เหมาะเวลาลมแรง)',
      gearLayer: 'เสื้อบาง ๆ สำหรับเช้าที่อากาศเย็น',
      gearMask: 'หน้ากากอนามัย หากหมอกหรือฝุ่นรบกวน',
      gearWind: 'หมวกที่กระชับ อย่าใส่เสื้อผ้าหลวมเพราะลมพัดง่าย',
      alertTitle: 'ประกาศเตือนภัยอากาศ',
      alertAdvice: 'ควรปรับแผนการเดินทาง หลีกเลี่ยงพื้นที่ลุ่มและริมน้ำ และติดตามพยากรณ์อากาศต่อเนื่อง',
    },
    windScale: 'ระดับลม',
  },
  zh: {
    advice: {
      dressStorm: '风雨较大，建议穿防水外套，避免宽松长裙与长柄伞。',
      dressCold: '气温偏低，注意防寒，建议穿厚外套、备围巾。',
      planChance: '降水概率较高，建议优先安排有顶棚的市场区域，乘船时间留出弹性。',
      planWind: '风力偏大，游船与露天项目可能暂停，建议提前出发或调整日期。',
      planFog: '大雾能见度差，运河观景效果有限，可把行程集中在市场与美食。',
      gearRaincoat: '雨衣（风大时不适合长柄伞）',
      gearLayer: '清晨偏凉，随身备一件薄外套',
      gearMask: '雾霾敏感者建议带口罩',
      gearWind: '帽子容易被吹落，不建议穿宽松衣物',
      alertTitle: '气象预警',
      alertAdvice: '建议调整行程，远离低洼与水域区域，并持续关注最新天气。',
    },
    windScale: '风力',
  },
};

for (const [locale, patch] of Object.entries(ADD)) {
  const file = `src/i18n/${locale}.json`;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  if (lines.some((line) => line.includes('"gearWind"'))) {
    console.log(`${locale}: already patched`);
    continue;
  }
  const adviceAt = lines.findIndex((line) => /^ {4}"advice"\s*:\s*\{\s*$/.test(line));
  const weatherAt = lines.findIndex((line) => /^ {2}"weather"\s*:\s*\{\s*$/.test(line));
  if (adviceAt === -1 || weatherAt === -1) throw new Error(`anchors missing in ${file}`);

  const adviceBlock = Object.entries(patch.advice).map(
    ([key, value]) => `      ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
  );
  lines.splice(adviceAt + 1, 0, ...adviceBlock);
  lines.splice(weatherAt + 1, 0, `    ${JSON.stringify('windScale')}: ${JSON.stringify(patch.windScale)},`);

  fs.writeFileSync(file, lines.join('\n'));
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`${locale}: +${adviceBlock.length + 1} keys`);
}
