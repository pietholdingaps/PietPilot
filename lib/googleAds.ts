import { OAuth2Client } from "google-auth-library";

const MCC_ID = (process.env.GOOGLE_ADS_MCC_ID || "4781206805").replace(/-/g, "");
const BASE = "https://googleads.googleapis.com/v19";

async function getAccessToken(): Promise<string> {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Could not get Google Ads access token");
  return token;
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "login-customer-id": MCC_ID,
    "Content-Type": "application/json",
  };
}

// Generic mutate helper
async function mutate(customerId: string, resource: string, operations: unknown[], token: string) {
  const res = await fetch(`${BASE}/customers/${customerId}/${resource}:mutate`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ operations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json.error || json));
  return json;
}

// Generic search (GAQL)
async function search(customerId: string, query: string, token: string) {
  const res = await fetch(`${BASE}/customers/${customerId}/googleAds:search`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json.error || json));
  return (json.results || []) as Record<string, unknown>[];
}

// Extract numeric ID from resource name "customers/x/campaigns/123" → "123"
function resourceId(name: string): string {
  return name.split("/").pop() || "";
}

export type CampaignInput = {
  customerId: string;
  campaignName: string;
  dailyBudgetUsd: number;
  ads: { headlines: string[]; descriptions: string[] }[];
  keywords: string[];
  negativeKeywords?: string[];
  finalUrl: string;
  focusService: string;
};

export type GoogleCampaignIds = {
  googleCampaignId: string;
  googleAdGroupId: string;
  googleBudgetId: string;
};

export async function createGoogleAdsCampaign(input: CampaignInput): Promise<GoogleCampaignIds> {
  const token = await getAccessToken();
  const cid = input.customerId.replace(/-/g, "");

  // 1. Create budget
  const budgetMicros = Math.round(input.dailyBudgetUsd * 1_000_000);
  const budgetResult = await mutate(cid, "campaignBudgets", [{
    create: {
      name: `PietPilot Budget — ${input.campaignName} — ${Date.now()}`,
      amountMicros: String(budgetMicros),
      deliveryMethod: "STANDARD",
    },
  }], token);
  const budgetResourceName = budgetResult.results[0].resourceName as string;

  // 2. Create campaign
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const campaignResult = await mutate(cid, "campaigns", [{
    create: {
      name: input.campaignName,
      advertisingChannelType: "SEARCH",
      status: "ENABLED",
      manualCpc: { enhancedCpcEnabled: false },
      campaignBudget: budgetResourceName,
      networkSettings: {
        targetGoogleSearch: true,
        targetSearchNetwork: true,
        targetContentNetwork: false,
        targetPartnerSearchNetwork: false,
      },
      startDate: today,
      endDate: "20301231",
    },
  }], token);
  const campaignResourceName = campaignResult.results[0].resourceName as string;
  const googleCampaignId = resourceId(campaignResourceName);

  // 3. Add negative keywords at campaign level
  if (input.negativeKeywords && input.negativeKeywords.length > 0) {
    const negOps = input.negativeKeywords.map((kw) => ({
      create: {
        campaign: campaignResourceName,
        negative: true,
        keyword: { text: kw, matchType: "BROAD" },
      },
    }));
    await mutate(cid, "campaignCriteria", negOps, token).catch(() => {});
  }

  // 4. Create ad group
  const adGroupResult = await mutate(cid, "adGroups", [{
    create: {
      name: `${input.campaignName} — Ad Group`,
      campaign: campaignResourceName,
      type: "SEARCH_STANDARD",
      status: "ENABLED",
      cpcBidMicros: "1000000", // $1 default bid
    },
  }], token);
  const adGroupResourceName = adGroupResult.results[0].resourceName as string;
  const googleAdGroupId = resourceId(adGroupResourceName);

  // 5. Add keywords
  if (input.keywords.length > 0) {
    const kwOps = input.keywords.slice(0, 20).map((kw) => ({
      create: {
        adGroup: adGroupResourceName,
        status: "ENABLED",
        keyword: { text: kw.toLowerCase(), matchType: "PHRASE" },
      },
    }));
    await mutate(cid, "adGroupCriteria", kwOps, token).catch(() => {});
  }

  // 6. Create responsive search ads (one per AI variant)
  const [trade, area] = [input.focusService, ""].map((s) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15)
  );
  for (const ad of input.ads.slice(0, 3)) {
    const headlines = ad.headlines.slice(0, 3).map((text) => ({
      text: text.slice(0, 30),
    }));
    const descriptions = ad.descriptions.slice(0, 2).map((text) => ({
      text: text.slice(0, 90),
    }));
    await mutate(cid, "adGroupAds", [{
      create: {
        adGroup: adGroupResourceName,
        status: "ENABLED",
        ad: {
          responsiveSearchAd: {
            headlines,
            descriptions,
            ...(trade && { path1: trade }),
            ...(area && { path2: area }),
          },
          finalUrls: [input.finalUrl],
        },
      },
    }], token).catch(() => {});
  }

  return {
    googleCampaignId,
    googleAdGroupId,
    googleBudgetId: resourceId(budgetResourceName),
  };
}

export type CampaignStats = {
  clicks: number;
  impressions: number;
  costUsd: number;
  conversions: number;
};

export async function getCampaignStats(customerId: string, googleCampaignId: string): Promise<CampaignStats> {
  const token = await getAccessToken();
  const cid = customerId.replace(/-/g, "");
  const rows = await search(cid, `
    SELECT
      campaign.id,
      metrics.clicks,
      metrics.impressions,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE campaign.id = ${googleCampaignId}
      AND segments.date DURING LAST_30_DAYS
  `, token);
  if (!rows.length) return { clicks: 0, impressions: 0, costUsd: 0, conversions: 0 };
  const m = rows[0].metrics as Record<string, number | undefined>;
  return {
    clicks: Number(m?.clicks || 0),
    impressions: Number(m?.impressions || 0),
    costUsd: Number(m?.costMicros || 0) / 1_000_000,
    conversions: Number(m?.conversions || 0),
  };
}

export async function pauseResumeCampaign(customerId: string, googleCampaignId: string, pause: boolean): Promise<void> {
  const token = await getAccessToken();
  const cid = customerId.replace(/-/g, "");
  await mutate(cid, "campaigns", [{
    update: {
      resourceName: `customers/${cid}/campaigns/${googleCampaignId}`,
      status: pause ? "PAUSED" : "ENABLED",
    },
    updateMask: "status",
  }], token);
}

export async function updateCampaignBudget(customerId: string, googleBudgetId: string, dailyBudgetUsd: number): Promise<void> {
  const token = await getAccessToken();
  const cid = customerId.replace(/-/g, "");
  await mutate(cid, "campaignBudgets", [{
    update: {
      resourceName: `customers/${cid}/campaignBudgets/${googleBudgetId}`,
      amountMicros: String(Math.round(dailyBudgetUsd * 1_000_000)),
    },
    updateMask: "amount_micros",
  }], token);
}

export async function deleteCampaign(customerId: string, googleCampaignId: string): Promise<void> {
  const token = await getAccessToken();
  const cid = customerId.replace(/-/g, "");
  await mutate(cid, "campaigns", [{
    remove: `customers/${cid}/campaigns/${googleCampaignId}`,
  }], token);
}

// Check if developer token + credentials are configured
export function googleAdsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_REFRESH_TOKEN
  );
}
