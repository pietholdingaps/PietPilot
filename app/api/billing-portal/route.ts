import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { siteId } = await req.json();
    if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

    const { data: site } = await supabase
      .from("onboarding_submissions")
      .select("owner_email, email")
      .eq("id", siteId)
      .single();

    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const customerEmail = site.owner_email || site.email;
    if (!customerEmail) return NextResponse.json({ error: "No email on file" }, { status: 400 });

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (!customers.data.length) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "https://pietpilot.com";
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/dashboard?site=${siteId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}
