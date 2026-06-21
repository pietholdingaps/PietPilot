import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sites } = await supabase
    .from("onboarding_submissions")
    .select("id, slug, updated_at, generated_copy")
    .not("generated_copy", "is", null);

  const BASE = "https://pietpilot.com";
  const entries: MetadataRoute.Sitemap = [];

  for (const site of sites || []) {
    const siteUrl = site.slug ? `${BASE}/${site.slug}` : `${BASE}/site/${site.id}`;
    const lastMod = site.updated_at ? new Date(site.updated_at) : new Date();
    const copy = site.generated_copy as { serviceDetails?: { slug: string }[] } | null;

    entries.push({ url: siteUrl, lastModified: lastMod, changeFrequency: "weekly", priority: 0.9 });

    for (const service of copy?.serviceDetails || []) {
      entries.push({
        url: `${siteUrl}/services/${service.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
