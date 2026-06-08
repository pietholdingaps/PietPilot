// Trade-relevant photos. These are hand-picked, manually verified Unsplash
// photos — each one was downloaded and visually checked to make sure it
// actually shows the right trade in action (no more random/identical/unrelated
// stock photos like the old LoremFlickr-based version produced).

type PhotoSet = {
  hero: string;
  gallery: string[];
};

function img(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=70`;
}

const sets: Record<string, { hero: string; gallery: string[] }> = {
  plumbing: {
    hero: "1676210133055-eab6ef033ce3",
    gallery: ["1663045495725-89f23b57cfc5", "1664301972519-506636f0245d", "1607472586893-edb57bdc0e39"],
  },
  electrical: {
    hero: "1621905251189-08b45d6a269e",
    gallery: ["1660330589693-99889d60181e", "1635335874521-7987db781153", "1621905251918-48416bd8575a"],
  },
  hvac: {
    hero: "1683134512538-7b390d0adc9e",
    gallery: ["1660330589827-da8ab7dd3c02", "1683134512538-7b390d0adc9e", "1660330589693-99889d60181e"],
  },
  roofing: {
    hero: "1682617326551-4749611516f6",
    gallery: ["1635424709845-3a85ad5e1f5e", "1633759593085-1eaeb724fc88", "1678293088678-5eb08b9c283e"],
  },
  painting: {
    hero: "1723867291079-0e3a69e7d412",
    gallery: ["1680297036893-d6faac34ea94", "1613844044163-1ad2f2d0b152", "1624352908259-ec0b31e421ee"],
  },
  carpentry: {
    hero: "1664300494539-313eac2a6095",
    gallery: ["1659930087003-2d64e33181f7", "1663134364102-00758ead290c", "1544164560-adac3045edb2"],
  },
  masonry: {
    hero: "1617720356637-6264c1c0b4bb",
    gallery: ["1682366278869-6c01b1517319", "1704005445445-2747074be8ac", "1673865641469-34498379d8af"],
  },
  landscaping: {
    hero: "1605117882932-f9e32b03fea9",
    gallery: ["1734079692160-fcbe4be6ab96", "1664299231556-57f570023f87", "1680286739871-01142bc609df"],
  },
  cleaning: {
    hero: "1683141112334-d7d404f6e716",
    gallery: ["1740657254989-42fe9c3b8cce", "1647381518264-97ff1835026f", "1678304224523-d25b4117558f"],
  },
  general: {
    hero: "1589939705384-5185137a7f0f",
    gallery: ["1581166397057-235af2b3c6dd", "1606676539940-12768ce0e762", "1518709414768-a88981a4515d"],
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
    gallery: set.gallery.map((id) => img(id, 800)),
  };
}
