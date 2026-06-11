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
    const { siteId, name, contact, message } = await req.json();

    if (!siteId || !name || !contact || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: submission } = await supabase
      .from("onboarding_submissions")
      .select("business_name, email, owner_email")
      .eq("id", siteId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Send to the business's own contact email if they gave us one, otherwise
    // fall back to the account owner's email, otherwise to PietPilot so nothing gets lost.
    const to = submission.email || submission.owner_email || process.env.NOTIFICATION_EMAIL!;

    await resend.emails.send({
      from: "PietPilot <noreply@pietpilot.com>",
      to,
      replyTo: contact,
      subject: `New website inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">New message from your website</h2>
          <p style="color: #333; font-size: 16px;"><b>Name:</b> ${name}</p>
          <p style="color: #333; font-size: 16px;"><b>Contact:</b> ${contact}</p>
          <p style="color: #333; font-size: 16px;"><b>Message:</b></p>
          <p style="color: #333; font-size: 16px; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Sent via ${submission.business_name || "your"} PietPilot website — reply directly to this email to respond.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead form error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
