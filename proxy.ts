import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS  = ["/auth", "/api/auth"];
const IMPORT_PATH   = "/import";
const DASHBOARD_PATH = "/dashboard";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public paths and static assets through
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not signed in → send to /auth
  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const onboarded = token.onboardingCompleted as boolean;

  // Signed in but not onboarded → only /import is allowed
  if (!onboarded && pathname !== IMPORT_PATH) {
    return NextResponse.redirect(new URL(IMPORT_PATH, req.url));
  }

  // Fully onboarded user hitting /import → bounce to /dashboard
  if (onboarded && pathname === IMPORT_PATH) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};