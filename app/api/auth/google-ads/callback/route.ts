import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return new NextResponse("Missing code parameter", { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "648637108045-c99q4hrncr3qan594h00hndh9pl3365c.apps.googleusercontent.com";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `https://pietpilot.com/api/auth/google-ads/callback`;

  if (!clientSecret) {
    return new NextResponse("GOOGLE_CLIENT_SECRET is not set in Vercel env vars", { status: 500 });
  }

  const client = new OAuth2Client(clientId, clientSecret, redirectUri);

  let tokens;
  try {
    const result = await client.getToken(code);
    tokens = result.tokens;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Token exchange failed: ${msg}`, { status: 500 });
  }

  const refreshToken = tokens.refresh_token;
  const refreshToken = tokens.refresh_token;

  // Show the refresh token so Emil can copy it to Vercel env vars
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Ads — Authorization Complete</title>
      <style>
        body { font-family: -apple-system, sans-serif; background: #080808; color: #fff; max-width: 600px; margin: 80px auto; padding: 0 24px; }
        h1 { font-size: 20px; margin-bottom: 8px; }
        p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; }
        .token { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 20px; font-family: monospace; font-size: 13px; word-break: break-all; color: #f59e0b; margin: 20px 0; }
        .step { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 20px; margin: 12px 0; }
        .step strong { display: block; font-size: 13px; margin-bottom: 4px; }
        .step span { color: rgba(255,255,255,0.4); font-size: 13px; }
        .ok { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>✅ Google Ads authorized successfully</h1>
      <p>Copy this refresh token and add it to Vercel as an environment variable:</p>

      ${refreshToken
        ? `<div class="token">${refreshToken}</div>
           <p>Add this to Vercel → Settings → Environment Variables:</p>
           <div class="step">
             <strong>Variable name</strong>
             <span>GOOGLE_ADS_REFRESH_TOKEN</span>
           </div>
           <div class="step">
             <strong>Value</strong>
             <span>${refreshToken}</span>
           </div>
           <p style="color:#10b981;margin-top:20px">After saving in Vercel, redeploy the project and ads will work.</p>`
        : `<p style="color:#f87171">⚠️ No refresh token received. This usually means the Google account was already authorized. Go to <a href="https://myaccount.google.com/permissions" style="color:#f59e0b">Google Account Permissions</a>, revoke PietPilot access, then <a href="/api/auth/google-ads" style="color:#f59e0b">try again</a>.</p>`
      }
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
