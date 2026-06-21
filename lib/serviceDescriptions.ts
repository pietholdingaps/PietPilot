/**
 * Smart service description generator.
 * Produces genuinely unique, SEO-relevant 2-sentence descriptions
 * for each service type — no AI API call needed.
 * Used as fallback when AI hasn't generated copy yet.
 */

function toTitle(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

type ServiceTemplate = {
  keywords: string[];
  copy: (title: string, biz: string, area: string) => string;
};

const templates: ServiceTemplate[] = [
  // Drain Cleaning
  {
    keywords: ["drain", "unclog", "blockage", "block", "sewer", "drainage"],
    copy: (title, biz, area) =>
      `Blocked drains don't wait — and neither do we. ${biz} provides fast, professional ${title.toLowerCase()} across ${area}, clearing everything from slow-running sinks to full sewer blockages with the right equipment the first time. Whether it's a kitchen drain, bathroom drain, or an outdoor line, we diagnose the root cause so the problem stays fixed.`,
  },
  // Water Heater
  {
    keywords: ["water heater", "hot water", "boiler", "varmtvand", "warmwasser"],
    copy: (title, biz, area) =>
      `A cold shower when you least expect it is never welcome. ${biz} handles all aspects of ${title.toLowerCase()} for homeowners and businesses across ${area} — from fixing faulty thermostats and replacing heating elements to full unit replacements and tankless upgrades. We carry parts for the most common brands so most jobs are done in a single visit.`,
  },
  // Pipe installation / repair
  {
    keywords: ["pipe", "piping", "pipework", "rør", "repiping", "repipe"],
    copy: (title, biz, area) =>
      `Whether you're dealing with a burst pipe, corroded lines, or a brand-new build, ${biz} delivers expert ${title.toLowerCase()} across ${area}. We work with copper, PEX, and CPVC, and always pressure-test our work before we leave so you have complete peace of mind. No shortcuts, no callbacks — just solid workmanship that lasts.`,
  },
  // Bathroom remodel / renovation
  {
    keywords: ["bathroom", "bath", "shower", "badeværelse", "wet room", "ensuite", "washroom"],
    copy: (title, biz, area) =>
      `A great bathroom remodel starts with the right plumber. ${biz} manages the full ${title.toLowerCase()} process for customers across ${area} — rough-in plumbing, fixture installation, waterproofing, and final connections — so your new space is built to last and looks exactly how you imagined. We coordinate closely with your tiler and builder to keep the project on schedule.`,
  },
  // Leak detection / repair
  {
    keywords: ["leak", "lækage", "detect", "water damage", "damp"],
    copy: (title, biz, area) =>
      `Hidden leaks can cause thousands in damage before you ever see a wet patch. ${biz} uses non-invasive ${title.toLowerCase()} methods across ${area} to pinpoint leaks behind walls, under floors, and underground — without unnecessary digging or cutting. Once found, we fix the source and check the surrounding pipework so you only ever deal with the issue once.`,
  },
  // Gas fitting
  {
    keywords: ["gas", "gas fit", "gas line", "gas pip"],
    copy: (title, biz, area) =>
      `Gas work demands precision and a licensed professional — and that's exactly what ${biz} brings to every ${title.toLowerCase()} job across ${area}. From new gas line installations and appliance connections to leak testing and compliance certificates, we do it safely, correctly, and to code. We won't cut corners where your family's safety is concerned.`,
  },
  // Electrical
  {
    keywords: ["electric", "wiring", "switchboard", "panel", "circuit", "lighting", "outlet", "socket", "fuse"],
    copy: (title, biz, area) =>
      `From safety inspections to full rewires, ${biz} delivers reliable ${title.toLowerCase()} for homes and businesses across ${area}. All work is completed to code, fully tested, and certified so you're always covered — whether it's a single power point or a complete switchboard upgrade. We explain exactly what we're doing and why, so there are no surprises.`,
  },
  // Roofing
  {
    keywords: ["roof", "roofing", "shingle", "gutter", "fascia", "soffit", "flashing", "tag"],
    copy: (title, biz, area) =>
      `Your roof is your home's first line of defence — and ${biz} keeps it that way with professional ${title.toLowerCase()} across ${area}. We handle everything from minor repairs and broken tiles to full re-roofs and gutter replacements, using quality materials built to withstand the local climate. Every job includes a thorough inspection so nothing gets missed.`,
  },
  // Painting / decorating
  {
    keywords: ["paint", "painting", "decorat", "plaster", "render", "wallpaper"],
    copy: (title, biz, area) =>
      `A fresh coat of paint transforms a space — and ${biz} makes it look effortless. We offer professional ${title.toLowerCase()} services across ${area} for both interior and exterior projects, using premium paints and proper preparation techniques for a finish that doesn't peel, crack, or fade. We protect your furniture, clean up after ourselves, and leave every room looking immaculate.`,
  },
  // Flooring
  {
    keywords: ["floor", "flooring", "hardwood", "laminate", "vinyl", "tile", "carpet", "parquet", "gulv"],
    copy: (title, biz, area) =>
      `New flooring completely changes how a room feels, and ${biz} installs it right. We specialise in ${title.toLowerCase()} for properties across ${area}, working with hardwood, engineered timber, laminate, LVT, and tiles — whichever suits your home and budget best. We prepare the subfloor correctly before laying anything, so your floor stays flat, tight, and beautiful for years.`,
  },
  // Decking / outdoor
  {
    keywords: ["deck", "decking", "patio", "pergola", "terrace", "terrasse", "outdoor"],
    copy: (title, biz, area) =>
      `A well-built deck adds usable space, curb appeal, and real value to your home. ${biz} designs and builds ${title.toLowerCase()} across ${area} using treated timber, hardwood, or composite materials — whichever suits your style and maintenance preference. Every structure is built to last, properly footed, and finished to a standard that will impress every visitor.`,
  },
  // Fencing
  {
    keywords: ["fence", "fencing", "gate", "railing", "balustrade"],
    copy: (title, biz, area) =>
      `Good fencing gives you privacy, security, and a cleaner-looking property. ${biz} handles ${title.toLowerCase()} across ${area} in timber, Colorbond, glass, and steel — custom-designed to suit your block and council requirements. All posts are set correctly and all joints are finished properly so your fence stays straight and solid for years without maintenance headaches.`,
  },
  // Windows / doors
  {
    keywords: ["window", "door", "glazing", "conservatory", "skylight"],
    copy: (title, biz, area) =>
      `Poor windows and doors cost you in energy bills and comfort every single day. ${biz} offers expert ${title.toLowerCase()} across ${area}, supplying and fitting double-glazed units, bifold doors, sliding windows, and more — all installed with proper seals, correct flashings, and a finish that looks factory-built. Energy efficiency and security, done properly.`,
  },
  // HVAC / air conditioning
  {
    keywords: ["hvac", "air con", "aircon", "air conditioning", "heat pump", "ventilat", "hvls"],
    copy: (title, biz, area) =>
      `Staying comfortable year-round shouldn't be complicated. ${biz} installs, services, and repairs ${title.toLowerCase()} systems across ${area} — from split systems and ducted air conditioning to heat pumps and ventilation. We size the system correctly for your space, install it cleanly, and set it up so it runs efficiently from day one.`,
  },
  // Landscaping
  {
    keywords: ["landscap", "garden", "lawn", "turf", "irrigation", "sprinkler", "hedge", "tree trim"],
    copy: (title, biz, area) =>
      `A beautiful garden doesn't happen by accident. ${biz} provides professional ${title.toLowerCase()} services across ${area} — from initial design and soil preparation through to planting, turf laying, and ongoing maintenance. We work with your block, your climate, and your budget to create outdoor spaces that look great year-round without demanding all your weekends.`,
  },
  // Extensions / builds
  {
    keywords: ["extension", "addition", "loft", "attic", "conversion", "new build", "renovation", "remodel"],
    copy: (title, biz, area) =>
      `Adding space to your home is one of the smartest investments you can make — if it's done right. ${biz} manages ${title.toLowerCase()} projects across ${area} from planning and council approvals through to the final fit-out, keeping you informed and on budget every step of the way. We've built a reputation for quality finishes and stress-free projects that come in on time.`,
  },
  // Carpentry / joinery
  {
    keywords: ["carpen", "joinery", "cabinet", "built-in", "wardrobe", "shelf", "stair", "skirting", "tømrer"],
    copy: (title, biz, area) =>
      `Custom carpentry makes your home uniquely yours. ${biz} provides skilled ${title.toLowerCase()} across ${area} — from built-in wardrobes and feature shelving to staircases and structural framing. Every piece is crafted to fit your exact space, using quality timber and hardware selected for its durability, so what we build looks great and stays solid for decades.`,
  },
  // Driveway / masonry
  {
    keywords: ["driveway", "paving", "concrete", "masonry", "brick", "stone", "pathway", "kerb", "retaining wall", "chimney"],
    copy: (title, biz, area) =>
      `Your driveway and outdoor surfaces are the first thing visitors see — and ${biz} makes sure they make the right impression. We handle ${title.toLowerCase()} across ${area} using quality materials properly graded for drainage and built to handle the demands of the local climate without cracking or settling. Every project is completed by experienced masons who take pride in work that lasts.`,
  },
  // Pool / spa
  {
    keywords: ["pool", "spa", "hot tub", "swimming", "pool deck", "pool fence", "pool clean", "pool equipment", "pool resurfac", "water feature"],
    copy: (title, biz, area) =>
      `A professionally built pool or spa transforms how you use your outdoor space — and ${biz} builds them to perform beautifully for decades. We handle ${title.toLowerCase()} across ${area} with in-house crews who manage every step from design and permitting through construction, finishing, and final inspection. Our work is fully licensed and backed by a craftsmanship warranty.`,
  },
  // Solar / energy
  {
    keywords: ["solar", "battery storage", "solar panel", "inverter", "solar clean", "energy audit", "roof-mounted", "ground-mounted", "ev charger"],
    copy: (title, biz, area) =>
      `Going solar is one of the highest-return investments a homeowner can make — and ${biz} handles every aspect of ${title.toLowerCase()} across ${area} from design and permitting through installation and utility interconnection. Our licensed team manages the full process so you never have to chase paperwork or coordinate between multiple contractors. Every system is monitored for performance from day one.`,
  },
  // Pest control
  {
    keywords: ["pest", "termite", "rodent", "bed bug", "mosquito", "ant", "roach", "exterminator", "wildlife removal", "prevention plan"],
    copy: (title, biz, area) =>
      `${biz} provides professional ${title.toLowerCase()} services for homes and businesses across ${area} — using family and pet safe products that target infestations at the source, not just the surface. Our licensed technicians identify the root cause of every pest problem and apply treatments specific to the species and conditions found at your property. With regular service plans available, we keep your home protected year-round.`,
  },
  // Garage door
  {
    keywords: ["garage door", "spring replacement", "opener", "garage door repair", "garage door install", "panel replacement", "cable", "roller", "smart garage"],
    copy: (title, biz, area) =>
      `A broken garage door disrupts your day immediately — and ${biz} provides fast, professional ${title.toLowerCase()} across ${area} with factory-trained technicians who arrive in fully stocked trucks. Most repairs are completed in a single visit because we carry the parts most commonly needed on every call. Our work is backed by a service warranty and performed by licensed, background-checked technicians.`,
  },
  // Insulation / spray foam / air sealing
  {
    keywords: ["insulation", "spray foam", "blown-in", "crawl space", "attic insulation", "air sealing", "energy audit", "basement insulation", "weatherstripping"],
    copy: (title, biz, area) =>
      `Proper insulation is the single most impactful upgrade you can make to a home's year-round comfort and energy bills — and ${biz} handles ${title.toLowerCase()} across ${area} with BPI-certified crews who diagnose your home's specific losses before recommending a solution. We use the right materials for each application rather than a one-size-fits-all approach, and every project is completed by our own team with no subcontracting.`,
  },
  // Fencing
  {
    keywords: ["fence", "fencing", "chain link", "vinyl fence", "wood fence", "gate", "wrought iron", "pool fence", "farm fence", "ranch fence"],
    copy: (title, biz, area) =>
      `A well-built fence adds security, privacy, and curb appeal to your property — and ${biz} installs ${title.toLowerCase()} across ${area} with properly set posts, correct material specifications, and all required permits handled on your behalf. Our crews build every fence to stand up to local weather conditions for decades, and we back our installations with a workmanship warranty.`,
  },
  // Drywall / plastering / skim coat / texture
  {
    keywords: ["drywall", "plaster", "skim coat", "texture", "popcorn ceiling", "fire-rated", "soundproof", "tenant improvement", "drywall repair", "drywall patch"],
    copy: (title, biz, area) =>
      `${biz} delivers professional ${title.toLowerCase()} across ${area} with experienced crews who work clean, work efficiently, and produce a paint-ready finish every time. We handle everything from single-room repairs to full new-construction hangs and commercial tenant improvements, using the right compound, technique, and finish level for each application. Your walls will be straight, smooth, and done right.`,
  },
  // Tile
  {
    keywords: ["tile", "backsplash", "mosaic", "grout", "shower tile", "floor tile", "pool tile", "outdoor tile", "tile repair", "tile install"],
    copy: (title, biz, area) =>
      `Tile installation done right starts with proper substrate preparation — and ${biz} doesn't skip that step. We provide professional ${title.toLowerCase()} across ${area} using the correct waterproofing membranes, mortars, and grout systems for each application, so your tile looks great and stays in place for years. Our crews work precisely, match patterns intentionally, and leave your space clean when the job is done.`,
  },
  // Handyman
  {
    keywords: ["handyman", "furniture assembly", "tv mounting", "door repair", "lock repair", "gutter cleaning", "deck repair", "drywall patch", "ceiling fan", "light fixture", "caulking"],
    copy: (title, biz, area) =>
      `${biz} handles ${title.toLowerCase()} for homeowners across ${area} with experienced, background-checked technicians who arrive on time and fully equipped. We tackle small and medium repairs efficiently — often bundling multiple tasks into a single visit so you get more done in less time. Every job is done right the first time, backed by our workmanship guarantee.`,
  },
  // General contractor / home additions / remodeling
  {
    keywords: ["home addition", "kitchen remodel", "bathroom remodel", "basement finish", "renovation", "remodel", "tenant improvement", "general contractor"],
    copy: (title, biz, area) =>
      `${biz} manages ${title.toLowerCase()} for homeowners across ${area} with dedicated project managers who oversee every trade from start to finish, keeping your project on schedule and on budget. With years of local experience and a fully licensed, bonded crew, we handle permits, coordination, and daily communication so you never have to chase contractors. The result is a finished space that looks exactly as you envisioned.`,
  },
];

/**
 * Returns a unique, SEO-friendly description paragraph for a given service.
 * Falls back to a clear generic template if no category matches.
 */
export function generateServiceDescription(
  serviceName: string,
  businessName: string,
  area: string,
  trade?: string
): string {
  const s = serviceName.toLowerCase();
  for (const t of templates) {
    if (t.keywords.some((k) => s.includes(k))) {
      return t.copy(toTitle(serviceName), businessName || "We", area || "your local area");
    }
  }
  // Generic fallback — still specific to the service name, just not category-aware
  const tradeContext = trade ? ` ${trade.toLowerCase()}` : "";
  return `${businessName || "We"} provides expert ${toTitle(serviceName)} services for homes and businesses across ${area || "your local area"}. Our${tradeContext} team brings the right skills, tools, and experience to every job — with honest pricing, clear communication, and a guarantee that the work is done right. Get in touch today for a free, no-obligation quote.`;
}
