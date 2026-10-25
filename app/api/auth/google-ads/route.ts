import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "648637108045-c99q4hrncr3qan594h00hndh9pl3365c.apps.googleusercontent.com";
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://pietpilot.com"}/api/auth/google-ads/callback`;

  const client = new OAuth2Client(
    clientId,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/adwords"],
  });

  return NextResponse.redirect(url);
}
