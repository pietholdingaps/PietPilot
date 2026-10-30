import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/leads", "/ads", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  const response = NextResponse.next({ request });

  // Skip auth check if not a protected route
  if (!isProtected) return response;

  // Allow through if ?site= param present (localStorage-based auth fallback)
  const hasSiteParam = request.nextUrl.searchParams.has("site");
  if (hasSiteParam) return response;

  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unavailable — fail open so the site stays up
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/ads/:path*", "/profile/:path*"],
};
