import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  // Simple password check via Authorization header
  const auth = req.headers.get("x-admin-key");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-06-30.basil" as never });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    // Active subscriptions
    const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    const activeSubs = subs.data;
    const activeCount = activeSubs.length;

    // MRR: sum of all active subscription amounts (normalized to monthly)
    let mrr = 0;
    for (const sub of activeSubs) {
      for (const item of sub.items.data) {
        const price = item.price;
        const amount = (price.unit_amount || 0) / 100;
        if (price.recurring?.interval === "month") mrr += amount * (item.quantity || 1);
        else if (price.recurring?.interval === "year") mrr += (amount / 12) * (item.quantity || 1);
      }
    }
    const arr = mrr * 12;

    // Churned this month
    const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
    const canceled = await stripe.subscriptions.list({ status: "canceled", limit: 100, created: { gte: monthStart } });
    const churnedCount = canceled.data.length;
    const churnRate = activeCount > 0 ? parseFloat(((churnedCount / (activeCount + churnedCount)) * 100).toFixed(1)) : 0;

    // Customer lifetime (months) based on churn
    const lifetimeMonths = churnRate > 0 ? parseFloat((100 / churnRate).toFixed(1)) : null;

    // Average revenue per customer
    const avgRevenue = activeCount > 0 ? parseFloat((mrr / activeCount).toFixed(2)) : 149;
    const ltv = lifetimeMonths ? parseFloat((avgRevenue * lifetimeMonths).toFixed(0)) : null;

    // New this month
    const newSubs = await stripe.subscriptions.list({ status: "active", limit: 100, created: { gte: monthStart } });
    const newCount = newSubs.data.length;

    // Growth rate: new vs last month
    const lastMonthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime() / 1000);
    const lastMonthEnd = monthStart - 1;
    const lastMonthSubs = await stripe.subscriptions.list({ status: "active", limit: 100, created: { gte: lastMonthStart, lte: lastMonthEnd } });
    const lastMonthCount = lastMonthSubs.data.length;
    const growthRate = lastMonthCount > 0 ? parseFloat((((newCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1)) : null;

    // Total sites in DB
    const { count: totalSites } = await supabase.from("onboarding_submissions").select("*", { count: "exact", head: true });

    // Total leads
    const { count: totalLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });

    // Fixed monthly costs (update these manually in env or hardcode)
    const fixedCosts = {
      vercel: 20,
      supabase: 25,
      resend: 20,
      twilio: 15,
      anthropic: 30, // estimated AI cost
      stripe: parseFloat((mrr * 0.029 + activeCount * 0.3).toFixed(2)), // 2.9% + $0.30/sub
    };
    const totalCosts = Object.values(fixedCosts).reduce((a, b) => a + b, 0);
    const profit = parseFloat((mrr - totalCosts).toFixed(2));

    return NextResponse.json({
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      activeCustomers: activeCount,
      newThisMonth: newCount,
      churnedThisMonth: churnedCount,
      churnRate,
      lifetimeMonths,
      ltv,
      growthRate,
      totalSites: totalSites || 0,
      totalLeads: totalLeads || 0,
      profit,
      costs: fixedCosts,
      totalCosts: parseFloat(totalCosts.toFixed(2)),
      avgRevenue,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
