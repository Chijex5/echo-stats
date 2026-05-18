// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS   = ["/auth", "/api/auth"];
const IMPORT_PATH    = "/import";
const DASHBOARD_PATH = "/dashboard";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and public paths — skip entirely
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ── API routes: never redirect — return 401 so fetch() can handle it ──
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next(); // authenticated — let the route handler decide
  }

  // ── Page routes ───────────────────────────────────────────────────────

  // Not signed in → /auth
  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const onboarded = token.onboardingCompleted as boolean;

  // Signed in but not onboarded → only /import allowed
  if (!onboarded && pathname !== IMPORT_PATH) {
    return NextResponse.redirect(new URL(IMPORT_PATH, req.url));
  }

  // Fully onboarded hitting /import → bounce to /dashboard
  if (onboarded && pathname === IMPORT_PATH) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};