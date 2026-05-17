"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Music2 } from "lucide-react";

export default function AuthCompletePage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    const redirect = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 5000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(redirect);
    };
  }, [router]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(29,185,84,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#05080b_0%,#07110b_50%,#05080b_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spotify/70 to-transparent" />
          <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-spotify/15 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-spotify shadow-[0_0_40px_-12px_rgba(29,185,84,0.8)]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
              <Sparkles className="h-3.5 w-3.5 text-spotify" />
              Authentication complete
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Wait a minute
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              We&apos;re finishing up your Spotify session and sending you to your dashboard.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-white/75">
              <Music2 className="h-4 w-4 text-spotify" />
              Redirecting to dashboard in {secondsLeft} seconds
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}