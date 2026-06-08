import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  try {
    const { name, email, message } = await req.json();

    if (!email || !email.includes("@") || !message) {
      return NextResponse.json({ error: "Please fill in your email and message." }, { status: 400 });
    }

    await resend.emails.send({
      from: "PietPilot <noreply@pietpilot.com>",
      to: process.env.NOTIFICATION_EMAIL!,
      replyTo: email,
      subject: `📩 Contact form: ${name || email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">New contact form message</h2>
          <p style="color: #333; font-size: 16px;"><b>Name:</b> ${name || "—"}</p>
          <p style="color: #333; font-size: 16px;"><b>Email:</b> ${email}</p>
          <p style="color: #333; font-size: 16px;"><b>Message:</b></p>
          <p style="color: #333; font-size: 15px; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">PietPilot — ${new Date().toLocaleString("da-DK")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
