// Trade-relevant photos. Hand-picked Unsplash photos verified to show
// the correct trade/service. Photo sets cover the most common service
// categories — keyword matching is intentionally broad so any service
// a tradesperson might type lands on the right image.

type PhotoSet = {
  hero: string;
  gallery: string[];
};

function img(base: string, width: number) {
  return `${base}?auto=format&fit=crop&w=${width}&q=70`;
}

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
  flooring: {
    hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    gallery: [
      "https://images.unsplash.com/photo-1615873968403-89e068629265",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    ],
  },
  decking: {
    hero: "https://images.unsplash.com/photo-1600210492493-0946911123ea",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
      "https://images.unsplash.com/photo-1598902108854-10e335adac99",
    ],
  },
  kitchen: {
    hero: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    gallery: [
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7",
      "https://images.unsplash.com/photo-1556909045-bf6def6afd43",
      "https://images.unsplash.com/photo-1556909078-59fe292e5bb3",
    ],
  },
  bathroom: {
    hero: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14",
    gallery: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
      "https://images.unsplash.com/photo-1620626011761-996317702149",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953",
    ],
  },
  windows: {
    hero: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
    gallery: [
      "https://images.unsplash.com/photo-1560185127-6a7e1e2b0d61",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff",
    ],
  },
};

// ---------------------------------------------------------------------------
// For the hero/gallery on the main site page (matched to trade, not service)
// ---------------------------------------------------------------------------

const tradeKeywordMap: { keywords: string[]; key: keyof typeof sets }[] = [
  { keywords: ["plumb", "drain", "pipe", "water heater", "vvs"], key: "plumbing" },
  { keywords: ["electric", "wiring", "wire", "panel", "electrician"], key: "electrical" },
  { keywords: ["hvac", "heating", "cooling", "air condition", "furnace"], key: "hvac" },
  { keywords: ["roof", "shingle", "gutter", "roofer", "tagdækker"], key: "roofing" },
  { keywords: ["paint", "drywall", "decorator", "maler"], key: "painting" },
  { keywords: ["carpen", "joiner", "timber", "framing", "tømrer"], key: "carpentry" },
  { keywords: ["mason", "brick", "concrete", "stone", "paving", "murermester"], key: "masonry" },
  { keywords: ["landscap", "lawn", "garden", "tree", "turf"], key: "landscaping" },
  { keywords: ["clean", "janitor", "pressure wash"], key: "cleaning" },
  { keywords: ["floor", "tiling", "tile"], key: "flooring" },
  { keywords: ["kitchen", "cabinet", "køkken"], key: "kitchen" },
  { keywords: ["bathroom", "bath", "bad"], key: "bathroom" },
];

function setForTrade(trade: string) {
  const t = (trade || "").toLowerCase();
  for (const { keywords, key } of tradeKeywordMap) {
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

// ---------------------------------------------------------------------------
// Per-service photo matching
// Each entry has: a list of keywords (matched against the service name),
// and the photo set key to use. Listed most-specific first.
// The more keywords you add here, the better it works for real customer input.
// ---------------------------------------------------------------------------

const servicePhotoMap: { keywords: string[]; key: keyof typeof sets }[] = [
  // Kitchen
  {
    keywords: [
      "kitchen", "køkken", "cabinet", "cupboard", "worktop", "benchtop",
      "kitchenette", "galley", "countertop",
    ],
    key: "kitchen",
  },
  // Bathroom
  {
    keywords: [
      "bathroom", "bad", "bath", "shower", "badeværelse", "toilet", "vanity",
      "wet room", "en suite", "ensuite", "powder room", "washroom",
    ],
    key: "bathroom",
  },
  // Flooring — covers every floor material/type
  {
    keywords: [
      "floor", "flooring", "gulv", "hardwood", "laminate", "tile", "tiling",
      "vinyl", "lvt", "lvp", "carpet", "carpeting", "screed", "subfloor",
      "parquet", "engineered wood", "engineered floor", "ceramic", "porcelain",
      "stone floor", "slate", "linoleum", "lino", "underlay",
    ],
    key: "flooring",
  },
  // Decking / outdoor living
  {
    keywords: [
      "deck", "decking", "patio", "terrasse", "pergola", "outdoor living",
      "veranda", "balcony", "altan", "gazebo", "summerhouse", "outdoor room",
      "outdoor entertainment", "bbq area", "pool deck",
    ],
    key: "decking",
  },
  // Fencing — use decking photos (outdoor context)
  {
    keywords: [
      "fence", "fencing", "hegn", "gate", "railing", "balustrade",
      "picket", "timber fence", "colorbond", "pool fence", "privacy screen",
    ],
    key: "decking",
  },
  // Windows & doors
  {
    keywords: [
      "window", "vindue", "door", "dør", "glas", "glazing", "skylight",
      "double glaz", "triple glaz", "bifold", "sliding door", "french door",
      "upvc", "aluminium window", "sash window", "velux", "roof window",
      "security door", "fly screen", "screen door",
    ],
    key: "windows",
  },
  // Roofing — covers everything roof-related
  {
    keywords: [
      "roof", "roofing", "shingle", "gutter", "tag", "tagdæk",
      "flat roof", "pitched roof", "metal roof", "fascia", "soffit",
      "chimney", "flashing", "ridge", "eaves", "downpipe", "downspout",
      "re-roof", "reroof", "new roof", "roof repair", "roof replacement",
      "colorbond roof", "tile roof", "slate roof", "tin roof",
    ],
    key: "roofing",
  },
  // Painting & decorating
  {
    keywords: [
      "paint", "painting", "maler", "drywall", "plaster", "plastering",
      "decorator", "decorating", "wallpaper", "render", "rendering",
      "cornice", "skimming", "interior paint", "exterior paint",
      "feature wall", "colour consult",
    ],
    key: "painting",
  },
  // Masonry / hard surfaces
  {
    keywords: [
      "concrete", "beton", "driveway", "indkørsel", "paving", "pave",
      "stone", "sten", "brick", "brickwork", "mason", "retaining wall",
      "garden wall", "path", "pathway", "footpath", "walkway",
      "kerbing", "exposed aggregate", "stamped concrete", "cobblestone",
      "bluestone", "sandstone", "limestone",
    ],
    key: "masonry",
  },
  // Plumbing — everything water/gas
  {
    keywords: [
      "plumb", "vvs", "pipe", "piping", "drain", "drainage", "sewer",
      "water heater", "hot water", "boiler", "radiator", "underfloor heat",
      "leak", "tap", "faucet", "toilet install", "basin", "sink install",
      "gas fit", "gas line", "irrigation pipe", "stormwater",
    ],
    key: "plumbing",
  },
  // Electrical
  {
    keywords: [
      "electric", "electrical", "wiring", "rewiring", "panel", "switchboard",
      "el-arbejde", "strøm", "lighting", "light install", "power point",
      "outlet", "socket", "circuit", "fuse", "solar panel", "ev charger",
      "data cable", "home automation", "smart home", "ceiling fan",
      "exhaust fan", "downlight", "led install",
    ],
    key: "electrical",
  },
  // HVAC / climate control
  {
    keywords: [
      "hvac", "heating", "varme", "cooling", "air condition", "aircon",
      "furnace", "ventilation", "heat pump", "ducted", "split system",
      "reverse cycle", "evaporative", "ducting", "vent", "thermostat",
      "boiler service", "radiator install",
    ],
    key: "hvac",
  },
  // Cleaning / pressure washing
  {
    keywords: [
      "clean", "cleaning", "rengøring", "janitor", "pressure wash",
      "high pressure", "soft wash", "window clean", "gutter clean",
      "end of lease", "bond clean", "carpet clean", "tile clean",
      "roof clean", "driveway clean",
    ],
    key: "cleaning",
  },
  // Landscaping / garden
  {
    keywords: [
      "landscap", "landscape", "garden", "have", "lawn", "mow", "mowing",
      "turf", "grass", "artificial grass", "tree", "træ", "hedge",
      "trimming", "pruning", "mulch", "soil", "planting", "irrigation",
      "sprinkler", "retaining", "garden design", "outdoor design",
      "lawn care", "weed",
    ],
    key: "landscaping",
  },
  // Carpentry / structural / general building
  {
    keywords: [
      "carpen", "carpentry", "joiner", "joinery", "timber", "framing",
      "tømrer", "stair", "staircase", "skirting", "architrave", "trim",
      "loft conversion", "attic", "extension", "addition", "new build",
      "structural", "renovation", "remodel", "fit-out", "fitout",
      "formwork", "pergola build", "shed", "garage", "granny flat",
    ],
    key: "carpentry",
  },
];

export function getPhotoForService(serviceName: string, trade: string, index: number): string {
  const s = (serviceName || "").toLowerCase();

  for (const { keywords, key } of servicePhotoMap) {
    if (keywords.some((k) => s.includes(k))) {
      const set = sets[key];
      const all = [set.hero, ...set.gallery];
      return img(all[index % all.length], 800);
    }
  }

  // No keyword match — use the business's trade photos so it's at least
  // relevant to the trade, not a completely random image.
  const tradeSet = setForTrade(trade);
  const all = [tradeSet.hero, ...tradeSet.gallery];
  return img(all[index % all.length], 800);
}
