"use client";

import { ArrowRight, Lock, Music2, Sparkles } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

const PILLS = [
  { label: "Top tracks",       color: "before:bg-[#53e076] before:shadow-[0_0_6px_#53e076]" },
  { label: "Listening timeline", color: "before:bg-[#47d6ff] before:shadow-[0_0_6px_#47d6ff]" },
  { label: "Story mode",       color: "before:bg-[#ddb7ff] before:shadow-[0_0_6px_#ddb7ff]" },
  { label: "Artist trends",    color: "before:bg-[#53e076] before:shadow-[0_0_6px_#53e076]" },
  { label: "Rediscovery",      color: "before:bg-[#47d6ff] before:shadow-[0_0_6px_#47d6ff]" },
];

const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
];

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-12 md:px-12 md:py-16 [background:radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(29,185,84,0.13)_0%,transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_85%,rgba(71,214,255,0.09)_0%,transparent_50%),radial-gradient(ellipse_50%_40%_at_75%_10%,rgba(221,183,255,0.07)_0%,transparent_45%),#091009] font-[Geist,sans-serif] text-[#dde5d9]">

      {/* ── Atmospheric orbs ── */}
      <div className="pointer-events-none absolute -top-20 -left-16 w-[380px] h-[380px] rounded-full bg-[rgba(29,185,84,0.11)] blur-[80px] animate-[drift_14s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute -bottom-10 -right-5 w-[300px] h-[300px] rounded-full bg-[rgba(71,214,255,0.07)] blur-[80px] animate-[drift_14s_5s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[rgba(221,183,255,0.06)] blur-[80px] animate-[drift_14s_9s_ease-in-out_infinite_alternate]" />

      {/* ── Two-column grid ── */}
      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 items-center">

        {/* ── CARD: top on mobile, right on desktop ── */}
        <aside className="order-first md:order-last relative animate-[fadeUp_0.65s_0.12s_ease_both]">

          {/* Glow halo */}
          <div className="absolute -inset-px -z-10 rounded-[32px] bg-[linear-gradient(135deg,rgba(83,224,118,0.12),transparent_50%,rgba(71,214,255,0.08))] blur-[20px]" />

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.14] bg-[rgba(14,21,14,0.78)] backdrop-blur-[48px] p-6 sm:p-9">

            {/* Glass edge — top */}
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(83,224,118,0.5),rgba(71,214,255,0.3),transparent)]" />
            {/* Glass edge — left */}
            <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,rgba(83,224,118,0.4),transparent_60%)]" />

            {/* Brand header */}
            <div className="flex items-center gap-3.5 mb-7">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#1db954,#0fa344)] shadow-[0_0_28px_rgba(29,185,84,0.5),inset_0_0_8px_rgba(29,185,84,0.25)]">
                <Music2 className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="font-[Sora,sans-serif] font-semibold text-base text-[#e8f0e4]">Echo Stats</p>
                <p className="text-xs text-[#bccbb9] mt-0.5">Spotify-powered dashboard</p>
              </div>
            </div>

            <hr className="border-white/[0.08] mb-5" />

            {/* Section meta */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#bccbb9]">Secure sign-in</span>
              <span className="px-2.5 py-1 rounded-full bg-[rgba(83,224,118,0.1)] border border-[rgba(83,224,118,0.2)] text-[10px] font-bold tracking-[0.06em] text-[#53e076] uppercase">
                OAuth 2.0
              </span>
            </div>

            <h2 className="font-[Sora,sans-serif] text-[clamp(20px,3vw,26px)] font-bold tracking-[-0.025em] text-[#e8f0e4] mb-2">
              Continue with Spotify
            </h2>
            <p className="text-sm leading-[1.65] text-[#bccbb9] mb-6">
              We read your listening history and generate your personalized stats — nothing is stored or shared.
            </p>

            {/* CTA */}
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
              }}
              className="w-full flex items-center justify-center gap-2.5 rounded-full px-7 py-[15px] bg-[#1db954] [background-image:linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_60%)] text-black font-bold text-[15px] tracking-[0.02em] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(29,185,84,0.45),0_8px_20px_rgba(0,0,0,0.4)] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#53e076]/40"
            >
              <SpotifyWordmark />
              {loading ? "Signing in..." : "Sign in with Spotify"}
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            {/* Scopes */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {SCOPES.map(s => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg border border-white/[0.08] bg-white/[0.025] text-[10px] font-semibold tracking-[0.05em] text-[#bccbb9] uppercase"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 mt-5">
              <Lock className="w-3 h-3 flex-shrink-0 opacity-30 mt-0.5" />
              <p className="text-[11px] text-[rgba(188,203,185,0.45)] leading-[1.5]">
                By continuing, you grant Echo Stats read-only access to your Spotify data. We never post on your behalf.
              </p>
            </div>
          </div>
        </aside>

        {/* ── HERO ── */}
        <section className="animate-[fadeUp_0.65s_ease_both]">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border border-[rgba(83,224,118,0.25)] bg-[rgba(83,224,118,0.06)] text-[12px] font-semibold tracking-[0.07em] uppercase text-[#53e076]">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Spotify
          </div>

          {/* Headline */}
          <h1 className="font-[Sora,sans-serif] text-[clamp(32px,5.5vw,58px)] font-bold leading-[1.08] tracking-[-0.04em] text-[#e8f0e4] mb-4">
            Your music,{" "}
            <span className="bg-[linear-gradient(135deg,#53e076_0%,#a8f5bc_55%,#47d6ff_100%)] bg-clip-text text-transparent">
              finally visible.
            </span>
          </h1>

          <p className="text-[clamp(15px,2vw,17px)] leading-[1.7] text-[#bccbb9] max-w-[440px] mb-8">
            Connect once and unlock a living dashboard of your listening history — top tracks, artist trends, rediscovery queues, and timeline views, all built around you.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {PILLS.map(({ label, color }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-2 rounded-full px-[15px] py-[7px] border border-white/[0.14] bg-white/[0.04] text-[13px] font-medium text-[#bccbb9] before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:flex-shrink-0 ${color}`}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Stats — hidden on xs, shown sm+ */}
          <div className="hidden sm:flex flex-wrap gap-x-10 gap-y-4 mt-9 pt-8 border-t border-white/[0.08]">
            {[
              { num: "50k+", label: "Tracks analysed" },
              { num: "12",   label: "Insight views" },
              { num: "Free", label: "Always" },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-[Sora,sans-serif] text-[clamp(20px,2.5vw,26px)] font-bold text-[#e8f0e4] tracking-[-0.02em]">
                  {num}
                </span>
                <span className="text-[11px] font-semibold text-[#bccbb9] tracking-[0.05em] uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Keyframes — injected once, no extra dep */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(28px, 18px) scale(1.08); }
        }
      `}</style>
    </main>
  );
}

/** Inline Spotify wordmark SVG — no extra package needed */
function SpotifyWordmark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}