import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const body = await req.json();
    const {
      businessName, trade, area, phone, hours,
      services, experience, about, template,
      accountName, accountEmail,
    } = body;

    const { data: inserted, error: dbError } = await supabase.from("onboarding_submissions").insert({
      business_name: businessName || null,
      trade: trade || null,
      area: area || null,
      phone: phone || null,
      hours: hours || null,
      services: services || null,
      experience: experience || null,
      about: about || null,
      template: template || null,
      account_name: accountName || null,
      account_email: accountEmail || null,
      created_at: new Date().toISOString(),
    }).select("id").single();

    if (dbError) {
      console.error("Supabase onboarding error:", dbError);
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
          <p style="color: #333; font-size: 16px;"><b>Åbningstider:</b> ${hours || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Ydelser:</b> ${services || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Erfaring:</b> ${experience || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Om virksomheden:</b> ${about || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Valgt design:</b> ${template || "—"}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">PietPilot — ${new Date().toLocaleString("da-DK")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, id: inserted?.id || null });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
