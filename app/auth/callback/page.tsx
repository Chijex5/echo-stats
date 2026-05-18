"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }

    if (session?.user.onboardingCompleted) {
      router.replace("/dashboard");
    } else {
      router.replace("/import");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-neutral-400 animate-pulse">Redirecting…</p>
    </div>
  );
}