import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionUserId } from "@/lib/get-session-user-id";

// ─── POST /api/mobile-auth/logout ──────────────────────────────────────────────
// Bumps mobileTokenVersion, which invalidates every outstanding mobile
// refresh token for this user. Existing access tokens still expire
// naturally within their short TTL.

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await User.findByIdAndUpdate(userId, { $inc: { mobileTokenVersion: 1 } });

  return NextResponse.json({ ok: true });
}
