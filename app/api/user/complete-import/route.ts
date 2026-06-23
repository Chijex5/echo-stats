import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────────────────────

const ImportSchema = z.object({
  favoriteGenres: z
    .array(z.string().min(1).max(40))
    .min(1, "Pick at least one genre")
    .max(10),
  bio: z.string().max(500).optional(),
});

// ─── PATCH /api/user/complete-import ─────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const userId = await getSessionUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...parsed.data,
        onboardingCompleted: true,
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}