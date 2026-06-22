import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyMobileRefreshToken,
  signMobileAccessToken,
  signMobileRefreshToken,
  ACCESS_TOKEN_TTL_SECONDS,
} from "@/lib/mobile-auth";

const BodySchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── POST /api/mobile-auth/refresh ─────────────────────────────────────────────
// Exchanges a still-valid mobile refresh token for a new access/refresh pair.
// Rotates the refresh token on every call (defense-in-depth against replay).

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing refreshToken" }, { status: 400 });
  }

  try {
    const claims = await verifyMobileRefreshToken(parsed.data.refreshToken);
    const [accessToken, refreshToken] = await Promise.all([
      signMobileAccessToken(claims.sub, claims.tv),
      signMobileRefreshToken(claims.sub, claims.tv),
    ]);
    return NextResponse.json({ accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS });
  } catch {
    return NextResponse.json({ error: "Invalid or revoked refresh token" }, { status: 401 });
  }
}
