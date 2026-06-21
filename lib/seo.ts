import { Metadata } from "next";

// Trade type → schema.org type mapping
const SCHEMA_TYPE_MAP: Record<string, string> = {
  plumbing: "Plumber",
  plumber: "Plumber",
  electrician: "Electrician",
  electrical: "Electrician",
  roofing: "RoofingContractor",
  roofer: "RoofingContractor",
  hvac: "HVACContractor",
  "air conditioning": "HVACContractor",
  heating: "HVACContractor",
  painting: "PaintingContractor",
  painter: "PaintingContractor",
  landscaping: "Landscaper",
  landscaper: "Landscaper",
  locksmith: "Locksmith",
  moving: "MovingCompany",
  "general contractor": "GeneralContractor",
  carpenter: "GeneralContractor",
  carpentry: "GeneralContractor",
  masonry: "GeneralContractor",
  concrete: "GeneralContractor",
  flooring: "GeneralContractor",
  fencing: "GeneralContractor",
  insulation: "GeneralContractor",
  "pest control": "GeneralContractor",
  "garage door": "GeneralContractor",
  solar: "Electrician",
  tile: "GeneralContractor",
  handyman: "GeneralContractor",
  pool: "GeneralContractor",
  windows: "GeneralContractor",
  drywall: "GeneralContractor",
};

function getSchemaType(trade: string): string {
  const t = trade.toLowerCase();
  for (const [key, val] of Object.entries(SCHEMA_TYPE_MAP)) {
    if (t.includes(key)) return val;
  }
  return "LocalBusiness";
}

function parseOpeningHours(hours: string) {
  // Parse "Mon-Fri 7am-6pm, Sat 8am-2pm" → OpeningHoursSpecification array
  const specs: { dayOfWeek: string | string[]; opens: string; closes: string }[] = [];
  const dayMap: Record<string, string> = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
    fri: "Friday", sat: "Saturday", sun: "Sunday",
  };

  const segments = hours.split(",").map(s => s.trim());
  for (const seg of segments) {
    const m = seg.match(/([a-z\-]+)\s+(\d+(?::\d+)?(?:am|pm)?)\s*[–\-]\s*(\d+(?::\d+)?(?:am|pm)?)/i);
    if (!m) continue;
    const dayPart = m[1].toLowerCase();
    const openStr = m[2].toLowerCase();
    const closeStr = m[3].toLowerCase();

    function to24(t: string) {
      const isPm = t.includes("pm");
      const isAm = t.includes("am");
      const [h, min] = t.replace(/[apm]/gi, "").split(":").map(Number);
      const hour = isPm && h !== 12 ? h + 12 : (!isPm && isAm && h === 12) ? 0 : h;
      return `${String(hour).padStart(2, "0")}:${String(min || 0).padStart(2, "0")}`;
    }

    const opens = to24(openStr);
    const closes = to24(closeStr);

    if (dayPart.includes("-")) {
      const [startKey, endKey] = dayPart.split("-");
      const days = Object.keys(dayMap);
      const startIdx = days.findIndex(d => d.startsWith(startKey));
      const endIdx = days.findIndex(d => d.startsWith(endKey));
      if (startIdx !== -1 && endIdx !== -1) {
        const dayRange = days.slice(startIdx, endIdx + 1).map(d => dayMap[d]);
        specs.push({ dayOfWeek: dayRange, opens, closes });
      }
    } else {
      const dayKey = Object.keys(dayMap).find(d => d.startsWith(dayPart.slice(0, 3)));
      if (dayKey) specs.push({ dayOfWeek: dayMap[dayKey], opens, closes });
    }
  }
  return specs;
}

export interface SiteMetaData {
  businessName: string;
  trade: string;
  area: string;
  address?: string;
  phone: string;
  email?: string;
  hours?: string;
  licenseNumber?: string;
  slug?: string;
  siteId: string;
  headline?: string;
  subheadline?: string;
  stats?: { value: string; label: string }[];
}

const BASE_URL = "https://pietpilot.com";

// ── Title tag ──────────────────────────────────────────────────────────────
export function buildTitle(businessName: string, trade: string, area: string): string {
  const city = area.split(",")[0].trim();
  const tradeTitle = trade
    ? trade.charAt(0).toUpperCase() + trade.slice(1)
    : "Trade Services";
  const title = `${tradeTitle} in ${city} | ${businessName}`;
  return title.length > 65 ? `${businessName} — ${city}` : title;
}

export function buildServiceTitle(serviceName: string, businessName: string, area: string): string {
  const city = area.split(",")[0].trim();
  const title = `${serviceName} in ${city} | ${businessName}`;
  return title.length > 70 ? `${serviceName} | ${businessName}` : title;
}

// ── Meta description ───────────────────────────────────────────────────────
export function buildDescription(businessName: string, trade: string, area: string, phone: string, years?: string): string {
  const city = area.split(",")[0].trim();
  const yearsText = years ? `${years} years experience. ` : "";
  const desc = `${businessName} provides professional ${trade || "trade"} services in ${city}. ${yearsText}Licensed & insured. Call ${phone} for a free quote.`;
  return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
}

export function buildServiceDescription(serviceName: string, businessName: string, area: string, phone: string): string {
  const city = area.split(",")[0].trim();
  const desc = `Expert ${serviceName.toLowerCase()} in ${city} from ${businessName}. Licensed & insured. Free estimates. Call ${phone} to schedule.`;
  return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
}

// ── Metadata object ────────────────────────────────────────────────────────
export function buildSiteMetadata(data: SiteMetaData): Metadata {
  const canonicalUrl = data.slug
    ? `${BASE_URL}/${data.slug}`
    : `${BASE_URL}/site/${data.siteId}`;

  const years = data.stats?.find(s => s.label.toLowerCase().includes("year"))?.value;

  return {
    title: buildTitle(data.businessName, data.trade, data.area),
    description: buildDescription(data.businessName, data.trade, data.area, data.phone, years),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: buildTitle(data.businessName, data.trade, data.area),
      description: buildDescription(data.businessName, data.trade, data.area, data.phone, years),
      url: canonicalUrl,
      siteName: "PietPilot",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export function buildServicePageMetadata(
  serviceName: string,
  data: SiteMetaData,
  serviceSlug: string
): Metadata {
  const siteUrl = data.slug ? `${BASE_URL}/${data.slug}` : `${BASE_URL}/site/${data.siteId}`;
  const canonicalUrl = `${siteUrl}/services/${serviceSlug}`;

  return {
    title: buildServiceTitle(serviceName, data.businessName, data.area),
    description: buildServiceDescription(serviceName, data.businessName, data.area, data.phone),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: buildServiceTitle(serviceName, data.businessName, data.area),
      description: buildServiceDescription(serviceName, data.businessName, data.area, data.phone),
      url: canonicalUrl,
      siteName: "PietPilot",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

// ── LocalBusiness JSON-LD ──────────────────────────────────────────────────
export function buildLocalBusinessSchema(data: SiteMetaData) {
  const city = data.area.split(",")[0].trim();
  const state = data.area.includes(",") ? data.area.split(",").slice(1).join(",").trim() : "";
  const siteUrl = data.slug ? `${BASE_URL}/${data.slug}` : `${BASE_URL}/site/${data.siteId}`;
  const schemaType = getSchemaType(data.trade);
  const openingHours = data.hours ? parseOpeningHours(data.hours) : [];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: data.businessName,
    telephone: data.phone,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state || undefined,
      addressCountry: "US",
      ...(data.address && { streetAddress: data.address }),
    },
    areaServed: data.area.split(",").map(a => ({ "@type": "City", name: a.trim() })),
    priceRange: "$$",
  };

  if (data.email) schema.email = data.email;
  if (data.licenseNumber) schema.identifier = `License #${data.licenseNumber}`;
  if (openingHours.length > 0) schema.openingHoursSpecification = openingHours;

  return schema;
}

// ── Service JSON-LD ────────────────────────────────────────────────────────
export function buildServiceSchema(
  serviceName: string,
  description: string,
  businessName: string,
  phone: string,
  area: string,
  serviceUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description.slice(0, 300),
    url: serviceUrl,
    provider: {
      "@type": "LocalBusiness",
      name: businessName,
      telephone: phone,
    },
    areaServed: area.split(",").map(a => ({ "@type": "City", name: a.trim() })),
  };
}

// ── FAQ JSON-LD ────────────────────────────────────────────────────────────
export function buildFaqSchema(faqs: { q?: string; a?: string; question?: string; answer?: string }[]) {
  const validFaqs = faqs.filter(f => (f.q || f.question) && (f.a || f.answer));
  if (validFaqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map(f => ({
      "@type": "Question",
      name: f.question || f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer || f.a,
      },
    })),
  };
}
