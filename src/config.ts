export const siteConfig = {
  // attraction basics
  name: {
    th: 'ตลาดน้ำดำเนินสะดวก',
    en: 'Damnoen Saduak Floating Market',
    zh: '丹嫩沙多水上市场',
  },
  slug: 'damnoen-saduak-floating-market',
  domain: process.env.CURRENT_SITE_DOMAIN
    ? `https://${process.env.CURRENT_SITE_DOMAIN}`
    : 'https://damnoensaduakthailand.com',

  // editorial
  lastUpdated: '2026-10-10',
  themeColor: '#0d2a2e',
  localeTags: { th: 'th-TH', en: 'en', zh: 'zh-CN' } as Record<string, string>,

  // hero / social image — largest responsive variant of photo #1
  heroImage: '/gallery/damnoen-saduak-floating-market-1-1440.jpg',
  heroImageWidth: 1440,
  heroImageHeight: 1080,

  province: {
    th: 'จังหวัดราชบุรี',
    en: 'Ratchaburi Province',
    zh: '叻丕府',
  },
  country: {
    th: 'ประเทศไทย',
    en: 'Thailand',
    zh: '泰国',
  },

  // Google Maps — ALL on-page links and hasMap point here
  mapsUrl: 'https://maps.app.goo.gl/EAF2RLoeXPAJcJAz7',

  // real coordinates for the live weather / sunset API and GeoCoordinates (Damnoen Saduak)
  coords: {
    lat: 13.51787,
    lng: 99.96024,
    label: {
      th: '๑๓.๕๑๗๘๗°N · ๙๙.๙๖๐๒๔°E',
      en: '13.51787°N · 99.96024°E',
      zh: '北纬 13.51787° · 东经 99.96024°',
    },
  },

  rating: '3.8',
  reviewCount: '35,000',
  category: {
    th: 'ตลาดน้ำ',
    en: 'Floating Market',
    zh: '水上市场',
  },

  // contact (long form for display)
  address: {
    th: 'Damnoen Saduak, อำเภอดำเนินสะดวก จังหวัดราชบุรี ๗๐๑๓๐ ประเทศไทย',
    en: 'Damnoen Saduak, Damnoen Saduak District, Ratchaburi 70130, Thailand',
    zh: '泰国 拉差汶里府 丹暖沙多县 丹嫩沙多 70130',
  },
  // structured PostalAddress parts for schema.org TouristAttraction
  postalAddress: {
    streetAddress: { th: 'Damnoen Saduak', en: 'Damnoen Saduak', zh: '丹嫩沙多' },
    addressLocality: { th: 'อำเภอดำเนินสะดวก', en: 'Damnoen Saduak District', zh: '丹暖沙多县' },
    addressRegion: { th: 'จังหวัดราชบุรี', en: 'Ratchaburi', zh: '叻丕府（拉差汶里府）' },
    postalCode: '70130',
    addressCountry: 'TH',
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

  // authoritative reference sources (E-E-A-T)
  sources: [
    {
      name: {
        th: 'การท่องเที่ยวแห่งประเทศไทย (ททท.) — ตลาดน้ำดำเนินสะดวก',
        en: 'Tourism Authority of Thailand — Damnoen Saduak Floating Market',
        zh: '泰国国家旅游局（TAT）— 丹嫩沙多水上市场',
      },
      url: 'https://www.tourismthailand.org/Attraction/damnoen-saduak-floating-market',
    },
    {
      name: {
        th: 'Google Maps — ตำแหน่งที่ได้รับการยืนยัน',
        en: 'Google Maps — Verified location',
        zh: 'Google Maps — 已核实位置',
      },
      url: 'https://maps.app.goo.gl/DAR94g91aeJne7Y96',
    },
    {
      name: {
        th: 'วิกิพีเดีย — ตลาดน้ำดำเนินสะดวก',
        en: 'Wikipedia — Damnoen Saduak Floating Market',
        zh: '维基百科 — 丹嫩沙多水上市场',
      },
      url: 'https://en.wikipedia.org/wiki/Damnoen_Saduak_Floating_Market',
    },
    {
      name: {
        th: 'กรมอุตุนิยมวิทยา — ข้อมูลภูมิอากาศ',
        en: 'Thai Meteorological Department — Climate information',
        zh: '泰国气象厅 — 气候资料',
      },
      url: 'https://www.tmd.go.th/',
    },
    {
      name: {
        th: 'กรมชลประทาน — ข้อมูลคลองและแหล่งน้ำ',
        en: 'Royal Irrigation Department — Canal and water resources',
        zh: '泰国皇家灌溉厅 — 运河与水资源',
      },
      url: 'https://www.rid.go.th/',
    },
    {
      name: {
        th: 'สำนักงานจังหวัดราชบุรี',
        en: 'Ratchaburi Provincial Office',
        zh: '叻丕府政府办公室',
      },
      url: 'https://www.ratchaburi.go.th/',
    },
  ],
} as const;
