import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const { siteId, name, email, phone, message, contact } = await req.json();

    // Support both old (contact) and new (email + phone) formats
    const leadEmail = email || (contact?.includes("@") ? contact : null);
    const leadPhone = phone || (!contact?.includes("@") ? contact : null);

    if (!siteId || !name || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!leadEmail && !leadPhone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    const { data: submission } = await supabase
      .from("onboarding_submissions")
      .select("business_name, email, owner_email, trade, area, address, hours, generated_copy")
      .eq("id", siteId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const businessName = submission.business_name || "the team";
    const businessEmail = submission.email || submission.owner_email || process.env.NOTIFICATION_EMAIL!;
    const area = submission.area || submission.address || "the local area";
    const hours = submission.hours || "during business hours";
    const tone = (submission.generated_copy as { about?: string })?.about?.slice(0, 300) || "";

    // ── 1. Save lead to database ──────────────────────────────────────────────
    await supabase.from("leads").insert({
      site_id: siteId,
      name,
      contact: leadEmail || leadPhone,
      email: leadEmail,
      phone: leadPhone,
      message,
    });

    // ── 2. Notify the tradesperson ────────────────────────────────────────────
    await resend.emails.send({
      from: "PietPilot <noreply@pietpilot.com>",
      to: businessEmail,
      replyTo: leadEmail || undefined,
      subject: `New lead from your website — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0b1220; color: #fff; border-radius: 12px;">
          <h2 style="color: #f59e0b; margin-bottom: 16px; font-size: 20px;">New message from your website 🔔</h2>
          <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 8px;"><b>Name:</b> ${name}</p>
          ${leadEmail ? `<p style="color: #e2e8f0; font-size: 15px; margin: 0 0 8px;"><b>Email:</b> <a href="mailto:${leadEmail}" style="color:#f59e0b;">${leadEmail}</a></p>` : ""}
          ${leadPhone ? `<p style="color: #e2e8f0; font-size: 15px; margin: 0 0 8px;"><b>Phone:</b> <a href="tel:${leadPhone}" style="color:#f59e0b;">${leadPhone}</a></p>` : ""}
          <p style="color: #e2e8f0; font-size: 15px; margin: 16px 0 8px;"><b>Message:</b></p>
          <p style="color: #cbd5e1; font-size: 15px; white-space: pre-wrap; background: #1e293b; padding: 12px 16px; border-radius: 8px;">${message}</p>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px;">Sent via your PietPilot website · Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    // ── 3. SMS til håndværkeren (hvis Twilio er sat op) ──────────────────────
    const businessPhone = submission.phone;
    if (businessPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: businessPhone,
          body: `🔔 New lead from your website!\n\nName: ${name}\n${leadEmail ? `Email: ${leadEmail}\n` : ""}${leadPhone ? `Phone: ${leadPhone}\n` : ""}\nMessage: ${message.slice(0, 100)}${message.length > 100 ? "..." : ""}`,
        });
      } catch (smsErr) {
        console.error("SMS notification failed:", smsErr);
      }
    }

    // ── 4. Auto-reply to lead (if email provided) ─────────────────────────────
    if (leadEmail) {
      let replyText = "";
      try {
        const aiReply = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Write a brief, warm auto-reply email from "${businessName}" to a customer named "${name}" who sent this message: "${message}".

Business info: ${businessName} serves ${area}. Hours: ${hours}.
Tone reference: ${tone}

Rules:
- 3-5 sentences max
- Warm and professional, not robotic
- Thank them for reaching out
- Confirm you received their message and will be in touch soon
- Mention your hours if relevant
- Sign off as "${businessName}"
- NO subject line, NO "Dear", just the body text
- Write in English`,
          }],
        });
        replyText = (aiReply.content[0] as { text: string }).text.trim();
      } catch {
        replyText = `Thank you for reaching out to ${businessName}, ${name}! We've received your message and will get back to you as soon as possible. Our team is available ${hours}. We look forward to speaking with you.\n\nBest regards,\n${businessName}`;
      }

      await resend.emails.send({
        from: `${businessName} <noreply@pietpilot.com>`,
        to: leadEmail,
        replyTo: businessEmail,
        subject: `Thanks for contacting ${businessName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${replyText.replace(/\n/g, "<br/>")}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">This is an automated confirmation. To reply, simply respond to this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead form error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
