export const siteConfig = {
  // attraction basics
  name: {
    th: 'ตลาดน้ำดำเนินสะดวก',
    en: 'Damnoen Saduak Floating Market',
    zh: '丹嫩沙多水上市场',
  },
  slug: 'damnoen-saduak-floating-market',
  domain: 'https://damnoensaduakthailand.com',

  // Google Maps — ALL four on-page links point here
  mapsUrl: 'https://maps.app.goo.gl/DAR94g91aeJne7Y96',

  // real coordinates for the live weather / sunset API (Damnoen Saduak)
  coords: {
    lat: 13.519,
    lng: 99.953,
    label: {
      th: '๑๓.๕๑°N · ๙๙.๙๕°E',
      en: '13.51°N · 99.95°E',
      zh: '北纬 13.51° · 东经 99.95°',
    },
  },

  rating: '3.8',
  reviewCount: '34,449',
  category: {
    th: 'ตลาดน้ำ',
    en: 'Floating Market',
    zh: '水上市场',
  },

  // contact
  address: {
    th: 'Damnoen Saduak, อำเภอดำเนินสะดวก จังหวัดราชบุรี ๗๐๑๓๐ ประเทศไทย',
    en: 'Damnoen Saduak, Damnoen Saduak District, Ratchaburi 70130, Thailand',
    zh: '泰国 拉差汶里府 丹暖沙多县 丹嫩沙多 70130',
  },
  phone: '+66852227470',
  phoneDisplay: '+66 85 222 7470',
  plusCode: 'GXC5+3C · Damnoen Saduak',

  hours: {
    th: 'ทุกวัน ๐๗:๐๐ – ๑๗:๐๐ น.',
    en: 'Daily 07:00 – 17:00',
    zh: '每日 07:00 – 17:00',
  },

  // JSON-LD / OG
  sameAs: [
    'https://maps.app.goo.gl/DAR94g91aeJne7Y96',
  ],
} as const;
