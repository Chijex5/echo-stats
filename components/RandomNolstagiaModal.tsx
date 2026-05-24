"use client";
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, X, Clock, Users, Music2, ChevronRight } from "lucide-react";

type Period = {
  id: string;
  label: string;
  year: number;
  monthIdx: number;
  monthName: string;
  topGenre: string;
  mood: string;
  moodScore: number;
  totalHours: number;
  uniqueArtists: number;
  topArtist: string;
  topArtistColor: string;
  topArtistImageUrl?: string | null;
  accent: string;
  tracks: { title: string; albumImageUrl?: string | null; artist: string; color: string }[];
  story?: { tag: string; line: string };
};

// ─── Back-in-time loader ──────────────────────────────────────────────────────

function TimeTravelLoader() {
  const currentYear = new Date().getFullYear();
  const rewindYears = Array.from({ length: 8 }, (_, i) => currentYear - i * 4);

  return (
    <div className="flex flex-col items-center justify-center py-14 gap-9 select-none">

      {/* Clock / reel assembly */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer dashed orbit */}
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-white/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        {/* Tick marks ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-white/[0.07]"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
        {/* Core pulse */}
        <motion.div
          className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.09] flex items-center justify-center relative"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ background: "radial-gradient(circle, rgba(29,185,84,0.5), transparent 70%)" }}
          />
          <Clock size={18} className="text-white/40 relative z-10" />
        </motion.div>

        {/* Orbiting dot — goes backwards (counter-clockwise) */}
        {[0, 1].map((n) => (
          <motion.div
            key={n}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: n === 0 ? "rgba(29,185,84,0.9)" : "rgba(255,255,255,0.2)",
              top: n === 0 ? 6 : 10,
              left: "50%",
              transformOrigin: `0 ${n === 0 ? 52 : 44}px`,
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: n === 0 ? 2 : 3.4,
              repeat: Infinity,
              ease: "linear",
              delay: n * 0.6,
            }}
          />
        ))}
      </div>

      {/* Year rewind cascade */}
      <div className="relative h-9 w-44 overflow-hidden flex items-center justify-center">
        {rewindYears.map((year, i) => (
          <motion.span
            key={year}
            className="absolute text-[1.6rem] font-bold tabular-nums tracking-tighter text-white/20"
            initial={{ y: -48, opacity: 0 }}
            animate={{
              y: ["-48px", "0px", "0px", "48px"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 0.85,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: rewindYears.length * 0.2 + 0.6,
              ease: "easeInOut",
            }}
          >
            {year}
          </motion.span>
        ))}
        {/* Final "???" flash at the end of each cycle */}
        <motion.span
          className="absolute text-[1.6rem] font-bold tabular-nums tracking-tighter text-spotify/70"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: [0, 1, 0], scale: [0.75, 1.05, 1] }}
          transition={{
            duration: 0.7,
            delay: rewindYears.length * 0.2 + 0.15,
            repeat: Infinity,
            repeatDelay: rewindYears.length * 0.2 + 0.6,
          }}
        >
          ???
        </motion.span>
      </div>

      {/* Status text */}
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
        going back in time
      </p>

      {/* Film-strip tape */}
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-[7px] rounded-[2px] bg-white/[0.08]"
            animate={{ opacity: [0.08, 0.45, 0.08], scaleY: [1, 1.3, 1] }}
            transition={{
              duration: 0.45,
              repeat: Infinity,
              delay: i * 0.055,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Memory card ──────────────────────────────────────────────────────────────

function MemoryCard({
  period,
  onRetry,
  onClose,
}: {
  period: Period;
  onRetry: () => void;
  onClose: () => void;
}) {
  const initials = period.topArtist
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/30 mb-1.5">
            you were here
          </p>
          <h2 className="text-[2rem] font-bold tracking-tight leading-[1.05]">
            {period.monthName}
          </h2>
          <p className="text-2xl font-serif-display italic font-normal text-white/35 leading-none -mt-0.5">
            {period.year}
          </p>
          <p className="text-xs text-white/40 mt-2">
            Mood:{" "}
            <span className="text-white/75 font-medium not-italic">
              {period.mood.toLowerCase()}
            </span>
          </p>
        </div>

        {/* Mood score chip */}
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] mt-0.5">
          <span className="text-lg font-bold text-spotify leading-none">
            {period.moodScore.toFixed(1)}
          </span>
          <span className="text-[8px] uppercase tracking-widest text-white/25 mt-0.5">
            mood
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { Icon: Clock,  label: "Hours",   value: `${period.totalHours}h` },
          { Icon: Users,  label: "Artists", value: String(period.uniqueArtists) },
          { Icon: Music2, label: "Top",     value: period.topGenre },
        ].map(({ Icon, label, value }) => (
          <div
            key={label}
            className="bg-white/[0.025] border border-white/[0.055] rounded-2xl px-3 py-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Icon size={9} className="text-white/25" />
              <span className="text-[8px] uppercase tracking-widest text-white/25">{label}</span>
            </div>
            <span className="text-sm font-semibold truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Top artist ── */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.025] border border-white/[0.055]">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full ring-1 ring-white/10 shrink-0 overflow-hidden ${
            period.topArtistImageUrl
              ? ""
              : `bg-gradient-to-br ${period.topArtistColor} flex items-center justify-center text-xs font-bold`
          }`}
        >
          {period.topArtistImageUrl ? (
            <img
              src={period.topArtistImageUrl}
              alt={period.topArtist}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] uppercase tracking-widest text-white/25">Top artist</p>
          <p className="text-sm font-semibold truncate">{period.topArtist}</p>
        </div>
        <ChevronRight size={13} className="text-white/15 shrink-0" />
      </div>

      {/* ── Tracks ── */}
      {period.tracks.length > 0 && (
        <div>
          <p className="text-[8px] uppercase tracking-widest text-white/25 mb-3">Top songs</p>
          <div className="space-y-3">
            {period.tracks.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] text-white/15 w-4 font-mono shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl shrink-0 overflow-hidden ring-1 ring-white/[0.07] ${
                    t.albumImageUrl ? "" : `bg-gradient-to-br ${t.color}`
                  }`}
                >
                  {t.albumImageUrl && (
                    <img
                      src={t.albumImageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{t.title}</p>
                  <p className="text-[11px] text-white/35 truncate">{t.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Story ── */}
      {period.story && (
        <div className="flex items-start gap-3 pt-4 border-t border-white/[0.055]">
          <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[8px] uppercase tracking-widest text-white/35">
            {period.story.tag}
          </span>
          <span className="text-xs text-white/50 italic font-serif-display leading-relaxed">
            {period.story.line}
          </span>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-spotify hover:bg-[#1ed760] active:scale-[0.97] text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[0_0_28px_-6px_rgba(29,185,84,0.6)]"
        >
          <Shuffle size={12} />
          Another memory
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] border border-white/[0.08] text-white/50 text-sm font-medium px-5 py-2.5 rounded-full transition-all"
        >
          <X size={12} />
          Close
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RandomNostalgiaModal({ periods }: { periods: Period[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period | null>(null);

  const pickRandom = useCallback(async () => {
    if (!periods.length) return;
    setLoading(true);
    setPeriod(null);

    const minDelay = new Promise<void>((r) => setTimeout(r, 2400));
    try {
      const res = await fetch("/api/dashboard/timeline-page");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const pool: Period[] = data?.periods?.length ? data.periods : periods;
      await minDelay;
      setPeriod(pool[Math.floor(Math.random() * pool.length)]);
    } catch {
      await minDelay;
      setPeriod(periods[Math.floor(Math.random() * periods.length)] ?? null);
    } finally {
      setLoading(false);
    }
  }, [periods]);

  const openModal = useCallback(() => {
    setOpen(true);
    pickRandom();
  }, [pickRandom]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      {/* ── Trigger ── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-32 left-1/3 w-[500px] h-[400px] bg-spotify/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Floating sleeves */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex">
            {(["from-pink-500 to-orange-400", "from-emerald-400 to-cyan-500", "from-purple-500 to-indigo-500"] as const).map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], rotate: i % 2 === 0 ? -6 : 6 }}
                  transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${c} shadow-2xl shadow-black/40 ring-1 ring-white/10`}
                  style={{ marginLeft: i === 0 ? 0 : -16 }}
                >
                  <div className="w-full h-full rounded-2xl bg-black/15" />
                </motion.div>
              )
            )}
          </div>

          <div className="relative max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-widest text-white/50 mb-6">
              <Shuffle size={11} className="text-spotify" />
              Surprise me
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
              Take me somewhere{" "}
              <span className="font-serif-display italic text-spotify/90">random</span>.
            </h3>
            <p className="text-white/50 leading-relaxed mb-8 max-w-md text-sm">
              Close your eyes. We&apos;ll drop you into a forgotten month — the songs, the mood,
              the memories that came with it.
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-spotify hover:bg-[#1ed760] active:scale-95 text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5"
            >
              <Shuffle size={14} />
              Jump to a random memory
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 56, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[410px] rounded-[28px] overflow-hidden"
              style={{
                background: "rgba(9, 11, 15, 0.97)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow:
                  "0 0 0 0.5px rgba(255,255,255,0.04), 0 48px 120px rgba(0,0,0,0.85)",
                maxHeight: "92dvh",
                overflowY: "auto",
              }}
            >
              {/* Period-tinted ambient — swaps per memory */}
              <AnimatePresence>
                {period && (
                  <motion.div
                    key={period.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute -top-36 -right-20 w-[320px] h-[320px] rounded-full blur-[80px] pointer-events-none bg-gradient-to-br ${period.accent}`}
                  />
                )}
              </AnimatePresence>
              {/* Static violet counter-glow */}
              <div className="absolute -bottom-20 -left-16 w-[240px] h-[240px] bg-violet-600/10 rounded-full blur-[70px] pointer-events-none" />

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] flex items-center justify-center text-white/35 hover:text-white/70 transition-all"
              >
                <X size={11} />
              </button>

              <div className="relative p-6 md:p-7">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TimeTravelLoader />
                    </motion.div>
                  ) : period ? (
                    <motion.div
                      key={period.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <MemoryCard
                        period={period}
                        onRetry={pickRandom}
                        onClose={() => setOpen(false)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}