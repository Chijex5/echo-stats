import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "./db";
import User from "./models/User";

const secret = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET!);

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export interface MobileAccessClaims {
  sub: string;
  typ: "access";
  tv: number;
}

export interface MobileRefreshClaims {
  sub: string;
  typ: "refresh";
  tv: number;
}

export async function signMobileAccessToken(mongoId: string, tokenVersion: number) {
  return new SignJWT({ typ: "access", tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(mongoId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret);
}

export async function signMobileRefreshToken(mongoId: string, tokenVersion: number) {
  return new SignJWT({ typ: "refresh", tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(mongoId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(secret);
}

/**
 * Fast, stateless verification used on every authenticated mobile request.
 * Deliberately does not check tokenVersion against the DB — revocation is
 * enforced at refresh time instead, bounding a revoked access token's
 * remaining life to its short TTL.
 */
export async function verifyMobileAccessToken(token: string): Promise<MobileAccessClaims> {
  const { payload } = await jwtVerify(token, secret);
  if (payload.typ !== "access" || typeof payload.sub !== "string") {
    throw new Error("Invalid access token");
  }
  return { sub: payload.sub, typ: "access", tv: payload.tv as number };
}

/**
 * Refresh-time verification — hits the DB to compare tokenVersion, since
 * this is the actual revocation chokepoint (logout bumps mobileTokenVersion).
 */
export async function verifyMobileRefreshToken(token: string): Promise<MobileRefreshClaims> {
  const { payload } = await jwtVerify(token, secret);
  if (payload.typ !== "refresh" || typeof payload.sub !== "string") {
    throw new Error("Invalid refresh token");
  }
  const claims: MobileRefreshClaims = { sub: payload.sub, typ: "refresh", tv: payload.tv as number };

  await connectDB();
  const user = await User.findById(claims.sub).select("mobileTokenVersion");
  if (!user || user.mobileTokenVersion !== claims.tv) {
    throw new Error("Token revoked");
  }
  return claims;
}
