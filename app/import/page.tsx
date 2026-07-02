"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UploadCloud, FileJson, Lock, ShieldCheck,
  Trash2, EyeOff, CheckCircle2, Music,
  Clock, TrendingUp, AlertCircle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "idle" | "reading" | "uploading" | "form" | "submitting" | "success" | "error";

interface RawEntry {
  ts: string;
  platform?: string | null;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  reason_start?: string | null;
  reason_end?: string | null;
  shuffle?: boolean | null;
  skipped?: boolean | null;
  offline?: boolean | null;
}

interface ImportStats {
  totalReceived: number;
  totalFiltered: number;
  totalInserted: number;
  totalDuplicates: number;
  yearSpan: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BATCH_SIZE = 2_000;

const GENRES = [
  "Pop", "Hip-Hop", "Rock", "R&B", "Afrobeats",
  "Jazz", "Electronic", "Classical", "Soul",
  "Amapiano", "Indie", "Gospel", "Drill", "Reggae",
];

const mockChartData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 40 },
  { value: 30 }, { value: 60 }, { value: 45 }, { value: 80 },
  { value: 65 }, { value: 100 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function getYearSpan(entries: RawEntry[]): number {
  const years = entries
    .map((e) => new Date(e.ts).getFullYear())
    .filter((y) => !isNaN(y));
  return years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

// useSearchParams must live under a Suspense boundary in the app router —
// the outer default export only provides that wrapper.
export default function ImportPage() {
  return (
    <Suspense fallback={null}>
      <ImportPageInner />
    </Suspense>
  );
}

function ImportPageInner() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  // ?mode=resync — the user already onboarded and is uploading a fresh
  // export to backfill missed plays. Same upload pipeline (the unique
  // ts+uri index dedupes server-side); skips the genre/bio form.
  const isResync = useSearchParams().get("mode") === "resync";

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core pipeline ────────────────────────────────────────────────────────

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (f) => f.type === "application/json" || f.name.endsWith(".json")
    );

    if (!files.length) {
      setErrorMsg("No valid JSON files found. Extract the ZIP Spotify sends you and upload the JSON files.");
      setStage("error");
      return;
    }

    setStage("reading");
    setProgress(0);
    setErrorMsg(null);

    try {
      // ── Phase 1: Read files (0 → 40% of progress bar) ─────────────────

      const allEntries: RawEntry[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgressLabel(`Reading ${file.name}…`);

        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onprogress = (e) => {
            if (!e.lengthComputable) return;
            // Each file contributes equally to the 0–40% reading band
            const fileProgress = e.loaded / e.total;
            const overall = ((i + fileProgress) / files.length) * 40;
            setProgress(Math.round(overall));
          };
          reader.onload = (e) => resolve(e.target!.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsText(file);
        });

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error(`${file.name} is not valid JSON.`);
        }

        if (!Array.isArray(parsed)) {
          throw new Error(`${file.name} doesn't look like a Spotify streaming history file.`);
        }

        allEntries.push(...(parsed as RawEntry[]));
      }

      setProgress(40);
      const yearSpan = getYearSpan(allEntries);

      // ── Phase 2: Upload in batches (40 → 100% of progress bar) ────────

      setStage("uploading");
      const batches = chunk(allEntries, BATCH_SIZE);
      const totalBatches = batches.length;

      let totalReceived  = 0;
      let totalFiltered  = 0;
      let totalInserted  = 0;
      let totalDuplicates = 0;

      for (let b = 0; b < batches.length; b++) {
        setProgressLabel(`Uploading batch ${b + 1} of ${totalBatches}…`);

        const res = await fetch("/api/user/import-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: batches[b] }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? `Batch ${b + 1} failed.`);
        }

        const data = await res.json();
        totalReceived   += data.received;
        totalFiltered   += data.filtered;
        totalInserted   += data.inserted;
        totalDuplicates += data.duplicates;

        // 40% → 100% across all batches
        const uploadProgress = 40 + ((b + 1) / totalBatches) * 60;
        setProgress(Math.round(uploadProgress));
      }

      setProgress(100);
      setProgressLabel("Done");

      setStats({ totalReceived, totalFiltered, totalInserted, totalDuplicates, yearSpan });
      setStage(isResync ? "success" : "form");

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }, [isResync]);

  // ── Genre toggle ─────────────────────────────────────────────────────────

  const toggleGenre = (genre: string) =>
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );

  // ── Complete onboarding ──────────────────────────────────────────────────

  async function handleSubmit() {
    if (!selectedGenres.length) {
      setErrorMsg("Pick at least one genre to continue.");
      return;
    }

    setErrorMsg(null);
    setStage("submitting");

    try {
      const res = await fetch("/api/user/complete-import", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteGenres: selectedGenres, bio: bio.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Server error.");
      }

      await updateSession({ onboardingCompleted: true });
      setStage("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("form");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="pt-32 pb-20 min-h-screen relative overflow-x-hidden">
      {/* Ambient */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-spotify/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ── Main ── */}
          <div className="lg:col-span-7 flex flex-col gap-8">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {isResync ? (
                  <>
                    Re-sync your{" "}
                    <span className="font-serif-display italic text-spotify">Spotify</span>{" "}
                    history
                  </>
                ) : (
                  <>
                    Import your{" "}
                    <span className="font-serif-display italic text-spotify">Spotify</span>{" "}
                    history
                  </>
                )}
              </h1>
              <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                {isResync
                  ? "Upload your newest export — we skip everything already in your vault and add only the plays we missed."
                  : "Upload your extended streaming history to unlock your complete listening timeline, forgotten favorites, and deeply personal insights."}
              </p>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <AnimatePresence mode="wait">

                {/* Idle */}
                {stage === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); processFiles(e.dataTransfer.files); }}
                      onDragOver={(e) => e.preventDefault()}
                      className="w-full border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-spotify/50 hover:bg-spotify/5 transition-all duration-300 group/dz relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover/dz:opacity-100 transition-opacity" />
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <UploadCloud size={32} className="text-white/80 group-hover/dz:text-spotify transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Drop your Spotify JSON files here</h3>
                      <p className="text-white/50 text-sm mb-6">or click to browse — multiple files supported</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
                        <FileJson size={14} /> StreamingHistory_*.json
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json,application/json" multiple className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
                  </motion.div>
                )}

                {/* Reading / Uploading */}
                {(stage === "reading" || stage === "uploading") && (
                  <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-12">
                    <div className="relative w-24 h-24 mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-white/10 stroke-current" strokeWidth="4" cx="50" cy="50" r="40" fill="transparent" />
                        <motion.circle
                          className="text-spotify stroke-current"
                          strokeWidth="4" strokeLinecap="round"
                          cx="50" cy="50" r="40" fill="transparent"
                          animate={{ strokeDasharray: `${(progress / 100) * 251.2} 251.2` }}
                          transition={{ duration: 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-semibold">{progress}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {stage === "reading" ? "Reading your files…" : "Uploading to your vault…"}
                    </h3>
                    <p className="text-white/40 text-sm">{progressLabel}</p>
                  </motion.div>
                )}

                {/* Form */}
                {(stage === "form" || stage === "submitting") && stats && (
                  <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-7">

                    {/* Stats from actual parsed data */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { val: stats.totalInserted.toLocaleString(), label: "Plays stored",  color: "text-spotify" },
                        { val: stats.totalFiltered.toLocaleString(), label: "Skips removed", color: "text-white/60" },
                        { val: `${stats.yearSpan} yr${stats.yearSpan !== 1 ? "s" : ""}`, label: "History span", color: "text-violet-400" },
                        { val: stats.totalDuplicates > 0 ? stats.totalDuplicates.toLocaleString() : "None", label: "Duplicates", color: "text-blue-400" },
                      ].map(({ val, label, color }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                          <div className={`text-xl font-bold ${color}`}>{val}</div>
                          <div className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Genres */}
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-3">
                        Pick your favourite genres <span className="text-white/40">(at least one)</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {GENRES.map((g) => (
                          <button
                            key={g}
                            onClick={() => toggleGenre(g)}
                            className={`px-4 py-1.5 rounded-full border text-sm transition-all duration-150 ${
                              selectedGenres.includes(g)
                                ? "bg-spotify border-spotify text-black font-semibold shadow-[0_0_16px_-2px_rgba(29,185,84,0.5)]"
                                : "border-white/15 text-white/60 hover:border-white/30"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-2">
                        Short bio <span className="text-white/40">(optional)</span>
                      </p>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="What does music mean to you?"
                        maxLength={500}
                        rows={3}
                        className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm resize-none focus:outline-none focus:border-white/25 placeholder:text-white/25 transition-colors"
                      />
                      <p className="text-xs text-white/25 mt-1 text-right">{bio.length}/500</p>
                    </div>

                    {errorMsg && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={14} /> {errorMsg}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={stage === "submitting"}
                      className="w-full py-4 rounded-full bg-spotify text-black font-bold text-base tracking-wide hover:brightness-110 transition-all shadow-[0_0_30px_-5px_rgba(29,185,84,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {stage === "submitting" ? "Saving…" : "Continue to Dashboard →"}
                    </button>
                  </motion.div>
                )}

                {/* Error */}
                {stage === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-10 gap-5">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                      <AlertCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Import failed</h3>
                      <p className="text-white/50 text-sm max-w-sm">{errorMsg}</p>
                    </div>
                    <button onClick={() => { setStage("idle"); setProgress(0); setErrorMsg(null); }} className="px-6 py-2.5 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* Success */}
                {stage === "success" && stats && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-spotify/20 flex items-center justify-center mb-6 text-spotify">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{isResync ? "You're up to date!" : "Import Complete!"}</h3>
                    <p className="text-white/60 mb-8">
                      {isResync
                        ? `${stats.totalInserted.toLocaleString()} new play${stats.totalInserted === 1 ? "" : "s"} added — ${stats.totalDuplicates.toLocaleString()} were already in your vault.`
                        : `${stats.totalInserted.toLocaleString()} plays across ${stats.yearSpan} year${stats.yearSpan !== 1 ? "s" : ""} — your story is ready.`}
                    </p>
                    <button onClick={() => router.replace("/dashboard")} className="w-full py-4 rounded-full bg-spotify text-black font-semibold text-lg hover:brightness-110 transition-colors shadow-[0_0_30px_-5px_rgba(29,185,84,0.5)]">
                      {isResync ? "Back to Dashboard" : "View Your Story"}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>

            {/* How-to */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="font-medium text-white/90 mb-4 flex items-center gap-2">
                <FileJson size={16} className="text-white/50" /> How to get your Spotify archive
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "Go to Spotify Account Privacy settings",
                  'Request your "Extended streaming history"',
                  "Download the ZIP, extract, and upload the StreamingHistory_*.json files here",
                ].map((text, i) => (
                  <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-3">{i + 1}</div>
                    <p className="text-sm text-white/70">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-white/40">
              {([[Lock, "Secure upload"], [ShieldCheck, "Encrypted"], [Trash2, "Delete anytime"], [EyeOff, "Private"]] as const).map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-1.5"><Icon size={14} /> {label}</div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Preview Panel (unchanged) ── */}
          <div className="lg:col-span-5 relative">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="sticky top-32">
              <div className="glass-card p-6 relative overflow-hidden min-h-[600px] border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-8">What you&apos;ll unlock</h3>
                  <div className="space-y-6">
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Listening Timeline</span>
                        <TrendingUp size={14} className="text-spotify" />
                      </div>
                      <div className="h-24 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#1DB954" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="relative h-40">
                      <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-0 w-48 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-xl z-20">
                        <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-violet-400" /><span className="text-xs font-medium text-white/70">April 2024</span></div>
                        <p className="text-sm font-semibold">Most nostalgic month</p>
                      </motion.div>
                      <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 right-0 w-52 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-xl z-10">
                        <div className="flex items-center gap-2 mb-2"><Music size={14} className="text-pink-400" /><span className="text-xs font-medium text-white/70">First Stream</span></div>
                        <p className="text-sm font-semibold truncate">The Less I Know The Better</p>
                        <p className="text-xs text-white/40">Tame Impala</p>
                      </motion.div>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                      <span className="text-sm font-medium mb-3 block">Yearly Heatmap</span>
                      <div className="grid grid-cols-12 gap-1">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="aspect-square rounded-sm" style={{ backgroundColor: `rgba(29, 185, 84, ${0.1 + (i % 8) * 0.1})` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent z-20" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}