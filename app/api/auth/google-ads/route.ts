import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET() {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-ads/callback`
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/adwords"],
  });

  return NextResponse.redirect(url);
}
