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
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Gem i Supabase
    const { error: dbError } = await supabase
      .from("waitlist")
      .insert({ email, created_at: new Date().toISOString() });

    if (dbError) {
      // Duplicate email — behandl som success så brugeren ikke ved om de allerede er tilmeldt
      if (dbError.code === "23505") {
        return NextResponse.json({ ok: true });
      }
      console.error("Supabase error:", dbError);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    // Send notifikation til Emil
    await resend.emails.send({
      from: "PietPilot <noreply@pietpilot.com>",
      to: process.env.NOTIFICATION_EMAIL!,
      subject: `🔥 Ny tilmelding: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #ff6b2b; margin-bottom: 8px;">Ny tilmelding til PietPilot</h2>
          <p style="color: #333; font-size: 18px; font-weight: bold;">${email}</p>
          <p style="color: #666; font-size: 14px;">Er landet på waitlisten. Følg op inden for 24 timer.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">PietPilot — ${new Date().toLocaleString("da-DK")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
