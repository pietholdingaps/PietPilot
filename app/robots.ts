import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/onboarding/", "/login/", "/profile/", "/ads/", "/leads/"],
    },
    sitemap: "https://pietpilot.com/sitemap.xml",
  };
}
