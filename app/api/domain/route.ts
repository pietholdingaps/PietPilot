import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { siteId, domain } = await req.json();
    if (!siteId || !domain) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

    // Save to Supabase
    await supabase.from("onboarding_submissions").update({ custom_domain: clean }).eq("id", siteId);

    // Add domain to Vercel project
    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: clean }),
      }
    );

    const vercelData = await vercelRes.json();
    const alreadyExists = vercelData.error?.code === "domain_already_in_use" || vercelData.error?.code === "domain_already_exists";

    if (!vercelRes.ok && !alreadyExists) {
      console.error("Vercel domain error:", vercelData);
      return NextResponse.json({ error: "Could not add domain to Vercel" }, { status: 500 });
    }

    // Return DNS instructions based on domain type
    const isApex = !clean.startsWith("www.");
    return NextResponse.json({
      ok: true,
      domain: clean,
      isApex,
      cname: "cname.vercel-dns.com",
      aRecord: "76.76.21.21",
    });
  } catch (err) {
    console.error("Domain route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { siteId } = await req.json();
    if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

    await supabase.from("onboarding_submissions").update({ custom_domain: null }).eq("id", siteId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Domain delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
