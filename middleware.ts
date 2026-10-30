import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/leads", "/ads", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unavailable — fail open for now
  }

  // Only redirect if protected route AND no ?site= fallback AND not authenticated
  // Remove the siteParam check when ready to enforce mandatory login at go-live
  const hasSiteParam = request.nextUrl.searchParams.has("site");
  if (isProtected && !user && !hasSiteParam) {
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
