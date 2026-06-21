import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateSlug } from "@/lib/generateSlug";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const body = await req.json();
    const {
      businessName, trade, area, phone, email, address, license, hours,
      services, experience, about, whyChooseUs, template,
      accountName, accountEmail, projectPhotos, trustpilotUrl, googleReviewsUrl, domain,
    } = body;

    const { data: inserted, error: dbError } = await supabase.from("onboarding_submissions").insert({
      business_name: businessName || null,
      trade: trade || null,
      area: area || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      license_number: license || null,
      owner_email: accountEmail || null,
      hours: hours || null,
      services: services || null,
      experience: experience || null,
      about: about || null,
      why_choose_us: whyChooseUs || null,
      logo_url: null,
      project_photos: projectPhotos && projectPhotos.length > 0 ? projectPhotos : null,
      trustpilot_url: trustpilotUrl || null,
      google_reviews_url: googleReviewsUrl || null,
      custom_domain: domain || null,
      slug: businessName ? generateSlug(businessName) : null,
      template: template || null,
      account_name: accountName || null,
      created_at: new Date().toISOString(),
    }).select("id").single();

    if (dbError) {
      console.error("Supabase onboarding error:", dbError);
    }

    // Auto-add domain to Vercel if provided
    if (domain && inserted?.id) {
      const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanDomain }),
      }).catch(() => {});
    }

    await resend.emails.send({
      from: "PietPilot <noreply@pietpilot.com>",
      to: process.env.NOTIFICATION_EMAIL!,
      subject: `🚀 Ny onboarding: ${businessName || "Ukendt virksomhed"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">Ny onboarding gennemført</h2>
          <p style="color: #333; font-size: 16px;"><b>Navn:</b> ${accountName || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Email:</b> ${accountEmail || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Virksomhed:</b> ${businessName || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Branche:</b> ${trade || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Område:</b> ${area || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Telefon:</b> ${phone || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Kontakt-email:</b> ${email || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Adresse:</b> ${address || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Licens/forsikringsnr.:</b> ${license || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Åbningstider:</b> ${hours || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Ydelser:</b> ${services || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Erfaring:</b> ${experience || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Om virksomheden:</b> ${about || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Hvorfor vælge dem:</b> ${whyChooseUs || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Valgt design:</b> ${template || "—"}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">PietPilot — ${new Date().toLocaleString("da-DK")}</p>
        </div>
      `,
    });

    // ── Velkomstmail til kunden ───────────────────────────────────────────────
    if (accountEmail && inserted?.id) {
      const siteSlug = businessName ? generateSlug(businessName) : null;
      const siteUrl = siteSlug ? `https://pietpilot.com/${siteSlug}` : `https://pietpilot.com/site/${inserted.id}`;
      const dashboardUrl = `https://pietpilot.com/dashboard?site=${inserted.id}`;
      await resend.emails.send({
        from: "PietPilot <noreply@pietpilot.com>",
        to: accountEmail,
        subject: `Your website is ready — ${businessName || "PietPilot"}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 32px; background: #0b1220; color: #eef1f6; border-radius: 16px;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #fff;">PietPilot</span>
            </div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 12px; color: #fff;">Your website is live, ${accountName?.split(" ")[0] || "there"}!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
              Your AI-powered website for <strong style="color:#fff;">${businessName}</strong> has been created and is ready to share with customers.
            </p>

            <a href="${siteUrl}" style="display: block; background: #f59e0b; color: #0b1220; font-weight: 800; font-size: 16px; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; margin-bottom: 16px;">
              View your website →
            </a>
            <a href="${dashboardUrl}" style="display: block; background: transparent; color: #f59e0b; font-weight: 700; font-size: 15px; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; border: 1px solid #f59e0b33; margin-bottom: 32px;">
              Open your dashboard
            </a>

            <div style="background: #1e293b; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">What's next</p>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px;">✓ Share your website link with customers</p>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px;">✓ Add photos and reviews in your dashboard</p>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0;">✓ Get notified instantly when leads come in</p>
            </div>

            <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
              Questions? Reply to this email — we're here to help.<br/>
              <span style="color: #334155;">PietPilot · AI Marketing for Tradespeople</span>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, id: inserted?.id || null });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
