// Fetches Pexels photos for all test sites and patches their serviceDetails in the DB
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dltyeyeomyuuznwoedbx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Paste your Pexels API key here if you have it, otherwise we skip Pexels
const PEXELS_KEY = process.env.PEXELS_API_KEY || "";

const TEST_SLUGS = [
  "blue-wave-pools",
  "sunrise-solar",
  "shield-pest-control",
  "rocky-mountain-garage-doors",
  "comfort-zone-insulation",
  "precision-walls",
  "la-tile-masters",
  "boston-handyman-pro",
  "capital-fence-co",
  "bay-area-remodeling-group",
];

function getPexelsQuery(serviceName) {
  const s = serviceName.toLowerCase();
  if (/roof|roofing|gutter|fascia|soffit|shingle/.test(s)) return "roofer on rooftop shingles installation";
  if (/deck|terrace|patio|veranda|pergola/.test(s)) return "wooden deck garden patio outdoor";
  if (/floor|flooring|vinyl|laminate|hardwood|parquet|carpet|tiling/.test(s)) return "hardwood floor installation wood planks";
  if (/kitchen|worktop|cabinet|cupboard/.test(s)) return "modern kitchen renovation white cabinets";
  if (/bathroom|shower|bath|wet room/.test(s)) return "modern bathroom renovation shower";
  if (/fenc|gate|railing|balustrade/.test(s)) return "garden fence wood panel new fence";
  if (/window|glazing|conservatory/.test(s)) return "window installation double glazing home";
  if (/paint|decorat|plaster|render/.test(s)) return "interior painting decorator wall paint";
  if (/landscap|garden|turf|lawn|grass|plant|hedge/.test(s)) return "landscaping garden design lawn";
  if (/electr|wiring|fuse|ev charger|smart/.test(s)) return "electrician wiring electrical panel home";
  if (/plumb|boiler|radiator|pipe/.test(s)) return "plumber boiler installation heating home";
  if (/hvac|air con|heat pump|ventilat/.test(s)) return "hvac air conditioning unit installation";
  if (/pool|swim|spa|hot tub/.test(s)) return "swimming pool backyard blue water";
  if (/leak detect/.test(s)) return "pool leak detection equipment pressure test";
  if (/spray foam|blown.?in|insulation|attic insul|basement insul|air seal/.test(s)) return "spray foam insulation contractor home";
  if (/pest|termite|rodent|bed bug|mosquito/.test(s)) return "pest control exterminator spraying home";
  if (/garage door|spring replac|opener|panel replac|cable/.test(s)) return "garage door installation modern home";
  if (/drywall|skim coat|popcorn/.test(s)) return "drywall installation smooth wall professional";
  if (/solar|battery storage|ground.mounted/.test(s)) return "solar panel installation rooftop residential";
  if (/tile install|tile master|backsplash|floor tile|shower tile|outdoor tile|regroup/.test(s)) return "tile installation bathroom kitchen professional";
  if (/door|garage/.test(s)) return "garage door modern home exterior";
  return serviceName;
}

function fetchPexels(query) {
  return new Promise((resolve) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
    const req = https.get(url, { headers: { Authorization: PEXELS_KEY } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const photo = json.photos?.[0]?.src?.large;
          resolve(photo || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
  });
}

async function main() {
  if (!PEXELS_KEY) {
    console.log("⚠️  PEXELS_API_KEY not set — run: $env:PEXELS_API_KEY='your-key'; node fix-photos.cjs");
    console.log("   Skipping Pexels fetch. stockPhotos.ts keyword fix is still deployed.");
    return;
  }

  const { data: sites, error } = await supabase
    .from("onboarding_submissions")
    .select("id, slug, business_name, generated_copy")
    .in("slug", TEST_SLUGS);

  if (error) { console.error("DB error:", error.message); return; }
  console.log(`Found ${sites.length} sites to patch\n`);

  for (const site of sites) {
    const copy = site.generated_copy;
    if (!copy?.serviceDetails?.length) {
      console.log(`  ${site.business_name}: no serviceDetails, skipping`);
      continue;
    }

    process.stdout.write(`  ${site.business_name}... `);
    let updated = 0;

    for (const detail of copy.serviceDetails) {
      const query = getPexelsQuery(detail.title);
      const photo = await fetchPexels(query);
      if (photo) {
        detail.photo = photo;
        updated++;
      }
    }

    await supabase
      .from("onboarding_submissions")
      .update({ generated_copy: copy })
      .eq("id", site.id);

    console.log(`✓ ${updated}/${copy.serviceDetails.length} photos updated`);
  }

  console.log("\nDone! Refresh any site to see new photos.");
}

main().catch(console.error);
