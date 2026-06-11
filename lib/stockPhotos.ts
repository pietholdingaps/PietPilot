// Trade-relevant photos. These are hand-picked, manually verified Unsplash
// photos — each one was downloaded and visually checked to make sure it
// actually shows the right trade in action (no more random/identical/unrelated
// stock photos like the old LoremFlickr-based version produced), and each URL
// was checked to actually return HTTP 200 (some earlier picks were broken).

type PhotoSet = {
  hero: string;
  gallery: string[];
};

function img(base: string, width: number) {
  return `${base}?auto=format&fit=crop&w=${width}&q=70`;
}

// base = full URL up to (but not including) the query string. Some Unsplash
// photos live on images.unsplash.com, others (premium) on plus.unsplash.com —
// so we store the full base, not just an ID.
const sets: Record<string, { hero: string; gallery: string[] }> = {
  plumbing: {
    hero: "https://plus.unsplash.com/premium_photo-1663045495725-89f23b57cfc5",
    gallery: [
      "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3",
      "https://plus.unsplash.com/premium_photo-1664301972519-506636f0245d",
      "https://plus.unsplash.com/premium_photo-1683141410787-c4dbd2220487",
    ],
  },
  electrical: {
    hero: "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
    gallery: [
      "https://images.unsplash.com/photo-1660330589693-99889d60181e",
      "https://images.unsplash.com/photo-1635335874521-7987db781153",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
    ],
  },
  hvac: {
    hero: "https://images.unsplash.com/photo-1642749776312-aa42ce20c9f5",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1683134512538-7b390d0adc9e",
      "https://images.unsplash.com/photo-1546079406-046e141edf3d",
      "https://images.unsplash.com/photo-1732395805034-e0bf859665e5",
    ],
  },
  roofing: {
    hero: "https://plus.unsplash.com/premium_photo-1682617326551-4749611516f6",
    gallery: [
      "https://images.unsplash.com/photo-1633759593085-1eaeb724fc88",
      "https://images.unsplash.com/photo-1635424709845-3a85ad5e1f5e",
      "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2",
    ],
  },
  painting: {
    hero: "https://images.unsplash.com/photo-1613844044163-1ad2f2d0b152",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1721865603899-a750a71d9a6a",
      "https://plus.unsplash.com/premium_photo-1680297036893-d6faac34ea94",
      "https://images.unsplash.com/photo-1759406066673-f76869a4e6db",
    ],
  },
  carpentry: {
    hero: "https://plus.unsplash.com/premium_photo-1664300494539-313eac2a6095",
    gallery: [
      "https://images.unsplash.com/photo-1659930087003-2d64e33181f7",
      "https://images.unsplash.com/photo-1544164560-adac3045edb2",
      "https://plus.unsplash.com/premium_photo-1663134364102-00758ead290c",
    ],
  },
  masonry: {
    hero: "https://images.unsplash.com/photo-1704005445445-2747074be8ac",
    gallery: [
      "https://images.unsplash.com/photo-1617720356637-6264c1c0b4bb",
      "https://plus.unsplash.com/premium_photo-1682366278869-6c01b1517319",
      "https://plus.unsplash.com/premium_photo-1683120839162-865f278816c0",
    ],
  },
  landscaping: {
    hero: "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9",
    gallery: [
      "https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96",
      "https://plus.unsplash.com/premium_photo-1664299231556-57f570023f87",
      "https://plus.unsplash.com/premium_photo-1680286739871-01142bc609df",
    ],
  },
  cleaning: {
    hero: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350",
    gallery: [
      "https://images.unsplash.com/photo-1740657254989-42fe9c3b8cce",
      "https://images.unsplash.com/photo-1647381518264-97ff1835026f",
      "https://plus.unsplash.com/premium_photo-1684407616442-87bf0d69e8b4",
    ],
  },
  general: {
    hero: "https://plus.unsplash.com/premium_photo-1683140705462-11ed388653cf",
    gallery: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f",
      "https://images.unsplash.com/photo-1567361808960-dec9cb578182",
      "https://plus.unsplash.com/premium_photo-1723478480754-436a04e21412",
    ],
  },
};

const keywordMap: { keywords: string[]; key: keyof typeof sets }[] = [
  { keywords: ["plumb", "drain", "pipe", "water heater"], key: "plumbing" },
  { keywords: ["electric", "wiring", "wire", "panel"], key: "electrical" },
  { keywords: ["hvac", "heating", "cooling", "air condition", "furnace", "ac "], key: "hvac" },
  { keywords: ["roof", "shingle", "gutter"], key: "roofing" },
  { keywords: ["paint", "drywall"], key: "painting" },
  { keywords: ["carpen", "wood", "framing", "cabinet"], key: "carpentry" },
  { keywords: ["mason", "brick", "concrete", "stone", "paving"], key: "masonry" },
  { keywords: ["landscap", "lawn", "garden", "tree"], key: "landscaping" },
  { keywords: ["clean", "janitor"], key: "cleaning" },
];

function setForTrade(trade: string) {
  const t = (trade || "").toLowerCase();
  for (const { keywords, key } of keywordMap) {
    if (keywords.some((k) => t.includes(k))) return sets[key];
  }
  return sets.general;
}

export function getPhotosForTrade(trade: string): PhotoSet {
  const set = setForTrade(trade);
  return {
    hero: img(set.hero, 1600),
    gallery: set.gallery.map((base) => img(base, 800)),
  };
}
