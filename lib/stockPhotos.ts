// Trade-relevant photos, fetched dynamically by keyword search so the images
// actually match the trade (instead of guessing fixed Unsplash photo IDs,
// which frequently turned out to show unrelated subjects).

type PhotoSet = {
  hero: string;
  gallery: string[];
};

const keywordMap: { keywords: string[]; tags: string[] }[] = [
  { keywords: ["plumb", "drain", "pipe", "water heater"], tags: ["plumber", "plumbing", "pipes", "tools"] },
  { keywords: ["electric", "wiring", "wire", "panel"], tags: ["electrician", "wiring", "electrical", "tools"] },
  { keywords: ["hvac", "heating", "cooling", "air condition", "furnace", "ac "], tags: ["hvac", "airconditioner", "heating", "technician"] },
  { keywords: ["roof", "shingle", "gutter"], tags: ["roofer", "roofing", "rooftop", "construction"] },
  { keywords: ["paint", "drywall"], tags: ["painter", "painting", "renovation", "walls"] },
  { keywords: ["carpen", "wood", "framing", "cabinet"], tags: ["carpenter", "woodworking", "joinery", "tools"] },
  { keywords: ["mason", "brick", "concrete", "stone", "paving"], tags: ["mason", "bricklayer", "concrete", "construction"] },
  { keywords: ["landscap", "lawn", "garden", "tree"], tags: ["landscaping", "gardening", "lawncare", "outdoor"] },
  { keywords: ["clean", "janitor"], tags: ["cleaning", "cleaner", "housekeeping"] },
  { keywords: ["garage", "door"], tags: ["garagedoor", "repairman", "tools"] },
];

function tagsForTrade(trade: string): string[] {
  const t = (trade || "").toLowerCase();
  for (const { keywords, tags } of keywordMap) {
    if (keywords.some((k) => t.includes(k))) return tags;
  }
  return ["tradesman", "construction", "handyman", "tools"];
}

// LoremFlickr returns a real photo matched against the given tags. The seed
// keeps each slot's image stable across reloads for the same business.
function flickrUrl(width: number, height: number, tags: string[], seed: string) {
  return `https://loremflickr.com/${width}/${height}/${tags.join(",")}?lock=${seed}`;
}

export function getPhotosForTrade(trade: string, seedBase = "default"): PhotoSet {
  const tags = tagsForTrade(trade);
  return {
    hero: flickrUrl(1600, 900, tags, `${seedBase}-hero`),
    gallery: [
      flickrUrl(800, 600, tags, `${seedBase}-1`),
      flickrUrl(800, 600, tags, `${seedBase}-2`),
      flickrUrl(800, 600, tags, `${seedBase}-3`),
    ],
  };
}
