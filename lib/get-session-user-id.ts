import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyMobileAccessToken } from "./mobile-auth";

/**
 * Resolves the authenticated Mongo user id from either:
 *  - an Authorization: Bearer <mobileAccessToken> header (mobile), or
 *  - the existing NextAuth httpOnly cookie session (web)
 * A present-but-invalid Bearer header does NOT fall back to the cookie
 * session — the two credential spaces are mutually exclusive per request.
 */
export async function getSessionUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const claims = await verifyMobileAccessToken(authHeader.slice("Bearer ".length));
      return claims.sub;
    } catch {
      return null;
    }
  }

  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
