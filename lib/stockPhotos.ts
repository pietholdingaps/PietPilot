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
    hero: "https://images.unsplash.com/photo-1676210134188-4c05dd172f89",
    gallery: [
      "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3",
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39",
      "https://images.unsplash.com/photo-1545193329-4a052e14eb8f",
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
      "https://images.unsplash.com/photo-1660330589827-da8ab7dd3c02",
      "https://images.unsplash.com/photo-1546079406-046e141edf3d",
      "https://images.unsplash.com/photo-1732395805034-e0bf859665e5",
    ],
  },
  roofing: {
    hero: "https://images.unsplash.com/photo-1635424824849-1b09bdcc55b1",
    gallery: [
      "https://images.unsplash.com/photo-1633759593085-1eaeb724fc88",
      "https://images.unsplash.com/photo-1635424709845-3a85ad5e1f5e",
      "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2",
    ],
  },
  painting: {
    hero: "https://images.unsplash.com/photo-1613844044163-1ad2f2d0b152",
    gallery: [
      "https://images.unsplash.com/photo-1688372199140-cade7ae820fe",
      "https://images.unsplash.com/photo-1742900280861-32bed068938b",
      "https://images.unsplash.com/photo-1759406066673-f76869a4e6db",
    ],
  },
  carpentry: {
    hero: "https://images.unsplash.com/photo-1608613304899-ea8098577e38",
    gallery: [
      "https://images.unsplash.com/photo-1659930087003-2d64e33181f7",
      "https://images.unsplash.com/photo-1544164560-adac3045edb2",
      "https://images.unsplash.com/photo-1590880795696-20c7dfadacde",
    ],
  },
  masonry: {
    hero: "https://images.unsplash.com/photo-1704005445445-2747074be8ac",
    gallery: [
      "https://images.unsplash.com/photo-1617720356637-6264c1c0b4bb",
      "https://images.unsplash.com/photo-1673865641469-34498379d8af",
      "https://images.unsplash.com/photo-1701850009190-2859ba2aeea6",
    ],
  },
  landscaping: {
    hero: "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9",
    gallery: [
      "https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96",
      "https://images.unsplash.com/photo-1734303023491-db8037a21f09",
      "https://images.unsplash.com/photo-1597201278257-3687be27d954",
    ],
  },
  cleaning: {
    hero: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350",
    gallery: [
      "https://images.unsplash.com/photo-1740657254989-42fe9c3b8cce",
      "https://images.unsplash.com/photo-1647381518264-97ff1835026f",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473",
    ],
  },
  general: {
    hero: "https://images.unsplash.com/photo-1646324554833-f0b6a479fa5d",
    gallery: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f",
      "https://images.unsplash.com/photo-1567361808960-dec9cb578182",
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427",
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

// Maps a specific service name (e.g. "New roof", "Decks & patios", "Doors & windows")
// to a photo that actually matches that service — not just the business's general trade.
// Checked in order, so more specific categories (e.g. decks) come before broader
// ones (e.g. landscaping) that share keywords like "tree"/"træ".
const serviceCategories: { keywords: string[]; images: string[] }[] = [
  { keywords: ["roof", "shingle", "gutter", "tag"], images: [sets.roofing.hero, ...sets.roofing.gallery] },
  { keywords: ["deck", "patio", "terrasse", "pergola", "fence", "hegn"], images: [sets.carpentry.gallery[0], sets.carpentry.gallery[2], sets.landscaping.gallery[0]] },
  { keywords: ["door", "window", "dør", "vindue", "glas"], images: [sets.carpentry.hero, sets.general.gallery[0], sets.carpentry.gallery[1]] },
  { keywords: ["addition", "extension", "renovat", "remodel", "tilbygning", "ombygning", "udvidelse"], images: [sets.masonry.hero, ...sets.masonry.gallery] },
  { keywords: ["kitchen", "køkken", "cabinet"], images: [sets.carpentry.hero, sets.carpentry.gallery[1], sets.carpentry.gallery[2]] },
  { keywords: ["bathroom", "bad"], images: [sets.plumbing.hero, ...sets.plumbing.gallery] },
  { keywords: ["floor", "gulv"], images: [sets.carpentry.gallery[2], sets.carpentry.hero] },
  { keywords: ["paint", "maler", "drywall"], images: [sets.painting.hero, ...sets.painting.gallery] },
  { keywords: ["concrete", "beton", "driveway", "indkørsel", "paving", "stone", "sten"], images: [sets.masonry.hero, ...sets.masonry.gallery] },
  { keywords: ["plumb", "vvs", "pipe", "drain", "water heater"], images: [sets.plumbing.hero, ...sets.plumbing.gallery] },
  { keywords: ["electric", "wiring", "panel", "el-arbejde", "strøm"], images: [sets.electrical.hero, ...sets.electrical.gallery] },
  { keywords: ["hvac", "heating", "varme", "cooling", "air condition", "furnace", "ventilation"], images: [sets.hvac.hero, ...sets.hvac.gallery] },
  { keywords: ["clean", "rengøring", "janitor"], images: [sets.cleaning.hero, ...sets.cleaning.gallery] },
  { keywords: ["landscap", "garden", "have", "lawn", "tree", "træ"], images: [sets.landscaping.hero, ...sets.landscaping.gallery] },
];

export function getPhotoForService(serviceName: string, trade: string, index: number): string {
  const s = (serviceName || "").toLowerCase();
  for (const cat of serviceCategories) {
    if (cat.keywords.some((k) => s.includes(k))) {
      return img(cat.images[index % cat.images.length], 800);
    }
  }
  // No specific match — fall back to the business's general trade photos.
  const tradeSet = setForTrade(trade);
  const allImages = [tradeSet.hero, ...tradeSet.gallery];
  return img(allImages[index % allImages.length], 800);
}
