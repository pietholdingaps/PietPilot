import { NextRequest, NextResponse } from "next/server";

const PIETPILOT_HOSTS = ["pietpilot.com", "www.pietpilot.com", "localhost"];

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const host = hostname.split(":")[0];

  // Skip PietPilot's own domains
  if (PIETPILOT_HOSTS.some((h) => host === h || host.endsWith(".vercel.app"))) {
    return NextResponse.next();
  }

  // Look up site by custom domain
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/onboarding_submissions?custom_domain=eq.${host}&select=id&limit=1`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );

    const data = await res.json();
    if (data && data[0]?.id) {
      const url = req.nextUrl.clone();
      url.pathname = `/site/${data[0].id}${req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    // If lookup fails, just serve normally
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
