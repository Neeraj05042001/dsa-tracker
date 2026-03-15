import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Creates a middleware-specific supabase client that can
  // read + refresh the session cookie on every request
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Refresh session — MUST be called before any redirect logic.
  // This silently refreshes the access token if it has expired,
  // keeping the user logged in without them noticing.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Rule 1: Protect /dashboard and all routes under it ──────────
  // If not logged in → redirect to /login
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = new URL("/login", request.url);
    // Remember where they were trying to go
    // so we can redirect them back after login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Rule 2: Redirect logged-in users away from /login ───────────
  // If already logged in and they visit /login → send to dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── All other routes: pass through normally ──────────────────────
  return response;
}

// ── Route matcher ────────────────────────────────────────────────
// Tells Next.js which routes this middleware runs on.
// Excludes static files, images, and Next.js internals for performance.
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};