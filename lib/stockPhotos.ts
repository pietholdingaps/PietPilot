// Trade-relevant stock photo library (Unsplash — free to use, no attribution required for hotlinking via source URLs)
// Each trade keyword maps to a small set of relevant photo URLs used across the generated site (hero, gallery, etc.)

type PhotoSet = {
  hero: string;
  gallery: string[];
};

const photoLibrary: Record<string, PhotoSet> = {
  plumbing: {
    hero: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
      "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    ],
  },
  electrical: {
    hero: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
      "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=800&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    ],
  },
  hvac: {
    hero: "https://images.unsplash.com/photo-1631545806609-4f01e6dba1d8?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1631545806609-4f01e6dba1d8?w=800&q=80",
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    ],
  },
  roofing: {
    hero: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800&q=80",
      "https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=800&q=80",
      "https://images.unsplash.com/photo-1632759145355-2a3f9f3c0e90?w=800&q=80",
    ],
  },
  painting: {
    hero: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
      "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80",
    ],
  },
  carpentry: {
    hero: "https://images.unsplash.com/photo-1601564921647-b446839a013f?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1601564921647-b446839a013f?w=800&q=80",
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    ],
  },
  masonry: {
    hero: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
      "https://images.unsplash.com/photo-1590725140246-20acdee442be?w=800&q=80",
      "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&q=80",
    ],
  },
  general: {
    hero: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
      "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80",
    ],
  },
};

const keywordMap: { keywords: string[]; key: keyof typeof photoLibrary }[] = [
  { keywords: ["plumb", "drain", "pipe", "water heater"], key: "plumbing" },
  { keywords: ["electric", "wiring", "wire", "panel"], key: "electrical" },
  { keywords: ["hvac", "heating", "cooling", "air condition", "furnace", "ac "], key: "hvac" },
  { keywords: ["roof", "shingle", "gutter"], key: "roofing" },
  { keywords: ["paint", "drywall"], key: "painting" },
  { keywords: ["carpen", "wood", "framing", "cabinet"], key: "carpentry" },
  { keywords: ["mason", "brick", "concrete", "stone", "paving"], key: "masonry" },
];

export function getPhotosForTrade(trade: string): PhotoSet {
  const t = (trade || "").toLowerCase();
  for (const { keywords, key } of keywordMap) {
    if (keywords.some((k) => t.includes(k))) return photoLibrary[key];
  }
  return photoLibrary.general;
}
