"use client";

import { ArrowRight, AudioLines, Lock, Music2, Sparkles } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-currently-playing",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
];

// Floating decoration cards — visual continuity with the homepage
function MusicAgeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -3 }}
      transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[2px] top-[80px] hidden lg:block -translate-x-full w-[190px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4 pointer-events-none select-none"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
          <span className="text-[10px] text-violet-300">♪</span>
        </div>
        <span className="text-[11px] text-white/40">Your music age</span>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">23</p>
      <p className="text-[11px] text-white/40 mt-0.5">years old</p>
      <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-blue-400" />
      </div>
    </motion.div>
  );
}

function ForgottenFavoriteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 3 }}
      transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-[2px] top-[60px] hidden lg:block -translate-y-0 translate-x-full w-[170px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4 pointer-events-none select-none"
    >
      <p className="text-[9px] font-semibold tracking-[0.1em] text-white/30 uppercase mb-2">
        Forgotten Favorite
      </p>
      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 mb-3 flex items-center justify-center">
        <span className="text-white text-lg">♫</span>
      </div>
      <p className="text-[12px] font-semibold text-white/80 leading-tight">Midnight City</p>
      <p className="text-[10px] text-white/40">M83</p>
    </motion.div>
  );
}

function GenreCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[2px] bottom-[100px] hidden lg:block -translate-x-full w-[175px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4 pointer-events-none select-none"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[10px] text-white/40">↗</span>
        <span className="text-[11px] text-white/40">Genre Evolution</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-[11px] text-white/60">Afrobeats</span>
        <span className="text-white/20 text-xs">→</span>
        <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-[11px] text-white/60">Indie Soul</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-12 bg-[#060b10]">

      {/* Ambient blobs — identical to homepage */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-spotify/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      {/* Waveform — identical to homepage */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            d="M0 200C240 200 240 100 480 100C720 100 720 300 960 300C1200 300 1200 200 1440 200"
            stroke="url(#paint0_linear)"
            strokeWidth="2"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
            d="M0 250C240 250 240 50 480 50C720 50 720 350 960 350C1200 350 1200 250 1440 250"
            stroke="url(#paint1_linear)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="200" x2="1440" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1DB954" stopOpacity="0" />
              <stop offset="0.5" stopColor="#1DB954" />
              <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="0" y1="200" x2="1440" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1DB954" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Centered auth card + floating decorations */}
      {/* Outer wrapper — wide enough for floating decorations to breathe */}
      <div className="relative z-10 w-full max-w-[820px] flex items-center justify-center">
        <MusicAgeCard />
        <ForgottenFavoriteCard />
        <GenreCard />

        {/* Card constrained to 440px, centred inside the outer wrapper */}
        <div className="w-full max-w-[440px]">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow halo */}
          <div className="absolute -inset-px -z-10 rounded-[32px] bg-gradient-to-br from-spotify/15 via-transparent to-blue-500/10 blur-[20px]" />

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/50 backdrop-blur-[48px] p-8 sm:p-10">
            {/* Glass edge accents */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spotify/50 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-spotify/40 to-transparent" />

            {/* Brand header */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10">
                <AudioLines className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <p className="font-semibold text-base text-white/90">Echo Stats</p>
                <p className="text-xs text-white/40 mt-0.5">Spotify-powered dashboard</p>
              </div>
            </div>

            <hr className="border-white/[0.08] mb-7" />

            {/* Headline — matches homepage typographic energy */}
            <h1 className="text-[clamp(26px,4vw,34px)] font-bold leading-[1.1] tracking-tight text-white/90 mb-3">
              Your music,{" "}
              <span className="font-serif italic font-normal text-white/60">
                finally visible.
              </span>
            </h1>

            <p className="text-[14px] leading-[1.65] text-white/45 mb-7">
              Connect your Spotify account once. We read your listening history and surface insights — nothing is stored or shared.
            </p>

            {/* CTA */}
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await signIn(
                    "spotify",
                    { callbackUrl: "/auth/callback" },
                    { scope: SCOPES.join(" "), show_dialog: "true" }
                  );
                } catch (e) {
                  setError(`Something went wrong. Please try again.`);
                  setLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 rounded-full px-7 py-[15px] bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-[15px] tracking-[0.02em] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <Sparkles className="w-4 h-4 opacity-70" />
              {loading ? "Signing in…" : "Continue with Spotify"}
              <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
            </button>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100">
                {error}
              </p>
            )}

            {/* Disclaimer — the only fine-print that earns its place */}
            <div className="flex items-start gap-2.5 mt-6">
              <Lock className="w-3 h-3 flex-shrink-0 opacity-25 mt-0.5" />
              <p className="text-[11px] text-white/25 leading-[1.5]">
                Read-only access. We never post, store, or sell your data.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </main>
  );
}