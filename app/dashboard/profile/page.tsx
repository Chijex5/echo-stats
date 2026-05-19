"use client";

import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Activity,
  Archive,
  BadgeCheck,
  CalendarClock,
  Clock3,
  Compass,
  Database,
  Disc3,
  Fingerprint,
  Flame,
  Headphones,
  Heart,
  History,
  Library,
  LucideIcon,
  Music2,
  Orbit,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRound,
  Waves,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

type SongMoment = {
  trackName: string;
  artistName: string;
  ts?: string;
  firstPlayed?: string;
  plays?: number;
} | null;

type ProfileResponse = {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    spotifyProduct: string;
    connectedAt: string | null;
    accountAge: string;
  };
  summary: {
    totalSongsAnalyzed: number;
    yearsImported: number;
    totalArtistsDiscovered: number;
    favoriteGenre: string;
    listeningStreak: number;
    connectedDate: string;
    totalHoursListened: number;
    totalPlays: number;
  };
  identity: {
    listeningPersonality: string;
    musicAge: string;
    favoriteDecade: string;
    hiddenGenre: string;
    topListeningHour: string;
    topListeningSeason: string;
  };
  milestones: {
    firstImportedSong: SongMoment;
    firstSyncedSong: SongMoment;
    oldestFavoriteTrack: SongMoment;
    longestObsession: SongMoment;
    latestGenreShift: { from: string | null; to: string | null };
  };
  services: {
    spotifyConnected: boolean;
    lastSync: string | null;
    syncHealth: string;
    archiveImported: boolean;
    storageUsed: string;
  };
  highlights: {
    topAlbums: Array<{ _id: string; artistName: string; plays: number }>;
    mostPlayedArtist: { _id: string; plays: number } | null;
    favoriteSongThisYear: SongMoment;
    forgottenFavoriteCount: number;
  };
};

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<ProfileResponse>;
  });

const albumGradients = [
  "from-emerald-300 via-teal-500 to-slate-950",
  "from-violet-300 via-fuchsia-600 to-black",
  "from-indigo-300 via-blue-600 to-slate-950",
  "from-amber-200 via-rose-500 to-zinc-950",
  "from-cyan-200 via-emerald-500 to-black",
  "from-purple-200 via-indigo-600 to-zinc-950",
];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function songLabel(song: SongMoment) {
  if (!song) return "No track yet";
  return `${song.trackName} — ${song.artistName}`;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl ${className}`}
    >
      {/* top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/70">
      {children}
    </p>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
// Tighter, more editorial: icon top-left, value large, label below.
// Color accent lives only in the icon container — keeps cards calm.

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-black/25 p-5 transition-colors hover:bg-black/35"
    >
      {/* subtle inner glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-white/10 transition-opacity group-hover:opacity-100" />

      <div
        className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} shadow-md`}
      >
        <Icon size={16} className="text-black" />
      </div>

      <p className="text-xl font-semibold tabular-nums tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-white/40">{label}</p>
    </motion.div>
  );
}

// ─── IdentityCard ─────────────────────────────────────────────────────────────
// Cleaner hierarchy: eyebrow label → value headline → detail.
// Left accent bar ties cards together visually.

function IdentityCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-xl transition-colors hover:bg-white/[0.055]"
    >
      {/* left accent bar */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent rounded-l-3xl" />

      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
        <Icon size={18} />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-tight text-white">
        {value}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/40">{detail}</p>
    </motion.div>
  );
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────
// Horizontal layout: icon left, content right. Connector dot removed for
// cleanliness. Value truncated to one line, meta dimmer.

function TimelineItem({
  icon: Icon,
  title,
  value,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="grid grid-cols-[48px_1fr] gap-4 rounded-3xl border border-white/[0.07] bg-black/20 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
        <Icon size={18} />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
          {title}
        </p>
        <p className="mt-2 truncate text-base font-semibold text-white">
          {value}
        </p>
        <p className="mt-1 text-sm text-white/40">{meta}</p>
      </div>
    </div>
  );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────
// Status dot now has a pulsing ring when active for a live feel.

function ServiceCard({
  icon: Icon,
  title,
  value,
  active,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-white/70">
          <Icon size={17} />
        </div>
        <div className="relative flex items-center justify-center">
          {active && (
            <span className="absolute h-4 w-4 animate-ping rounded-full bg-emerald-300/30" />
          )}
          <span
            className={`relative h-2.5 w-2.5 rounded-full ${
              active
                ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]"
                : "bg-white/20"
            }`}
          />
        </div>
      </div>
      <p className="text-xs font-medium text-white/40">{title}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "E";
  return (
    <div className="relative h-28 w-28 shrink-0 rounded-full bg-gradient-to-br from-emerald-300 via-indigo-400 to-violet-500 p-[3px] shadow-[0_0_60px_rgba(16,185,129,0.3)] md:h-36 md:w-36">
      <div className="h-full w-full overflow-hidden rounded-full bg-[#0d130d]">
        {image ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white/90">
            {initial}
          </div>
        )}
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)]">
        <BadgeCheck size={17} />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="h-72 animate-pulse rounded-[34px] bg-white/[0.04]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data, error, isLoading } = useSWR("/api/dashboard/profile", fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-white selection:bg-spotify/30 selection:text-white lg:flex">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <TopNav />

        <main className="w-full flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="relative mx-auto max-w-[1400px]">

            {/* ambient blobs */}
            <div className="pointer-events-none absolute -right-32 -top-20 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px] mix-blend-screen" />
            <div className="pointer-events-none absolute left-1/3 top-96 h-[440px] w-[440px] rounded-full bg-indigo-500/8 blur-[140px] mix-blend-screen" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-[560px] w-[560px] rounded-full bg-violet-600/8 blur-[160px] mix-blend-screen" />

            {isLoading && <ProfileSkeleton />}

            {error && (
              <GlassPanel className="p-8">
                <p className="text-sm text-red-200/80">
                  Profile could not be loaded. Please refresh the page.
                </p>
              </GlassPanel>
            )}

            {data && (
              <div className="relative z-10 flex flex-col gap-12">

                {/* ── HERO ─────────────────────────────────────────────── */}
                <GlassPanel className="p-7 md:p-10">
                  {/* directional radial tints */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(ellipse_at_85%_10%,rgba(139,92,246,0.14),transparent_35%)]" />

                  <div className="relative grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
                    {/* left: avatar + name */}
                    <div className="flex flex-col gap-8 md:flex-row md:items-end">
                      <Avatar name={data.user.name} image={data.user.avatarUrl} />

                      <div className="min-w-0 pb-1">
                        {/* connected badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                          <ShieldCheck size={13} />
                          Spotify connected
                        </div>

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                          {data.user.name}
                        </p>

                        <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                          Your Music Identity
                        </h1>

                        <p className="mt-4 max-w-xl text-base leading-7 text-white/50">
                          A profile shaped by your listening journey.
                        </p>
                      </div>
                    </div>

                    {/* right: quick facts panel */}
                    <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-black/25">
                      {[
                        { label: "Account age", value: data.user.accountAge },
                        {
                          label: "Plan",
                          value: data.user.spotifyProduct,
                          accent: true,
                        },
                        { label: "Connected", value: data.summary.connectedDate },
                      ].map(({ label, value, accent }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between px-5 py-3.5"
                        >
                          <span className="text-sm text-white/40">{label}</span>
                          <span
                            className={`text-sm font-semibold capitalize ${
                              accent ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassPanel>

                {/* ── SUMMARY ──────────────────────────────────────────── */}
                <section>
                  <SectionTitle eyebrow="Overview" title="User Summary" />
                  <GlassPanel className="p-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard icon={Library} label="Songs analyzed" value={compactNumber(data.summary.totalSongsAnalyzed)} tone="from-emerald-200 to-emerald-500" />
                      <MetricCard icon={History} label="Years imported" value={`${data.summary.yearsImported}`} tone="from-indigo-200 to-indigo-500" />
                      <MetricCard icon={UserRound} label="Artists discovered" value={compactNumber(data.summary.totalArtistsDiscovered)} tone="from-violet-200 to-violet-500" />
                      <MetricCard icon={Disc3} label="Favorite genre" value={data.summary.favoriteGenre} tone="from-cyan-200 to-emerald-400" />
                      <MetricCard icon={Flame} label="Listening streak" value={`${data.summary.listeningStreak} days`} tone="from-amber-200 to-orange-500" />
                      <MetricCard icon={CalendarClock} label="Connected date" value={data.summary.connectedDate} tone="from-fuchsia-200 to-violet-500" />
                      <MetricCard icon={Headphones} label="Hours listened" value={compactNumber(data.summary.totalHoursListened)} tone="from-sky-200 to-blue-500" />
                      <MetricCard icon={Waves} label="Total plays" value={compactNumber(data.summary.totalPlays)} tone="from-lime-200 to-teal-500" />
                    </div>
                  </GlassPanel>
                </section>

                {/* ── IDENTITY ─────────────────────────────────────────── */}
                <section>
                  <SectionTitle eyebrow="Signal" title="Music Identity" />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <IdentityCard icon={Fingerprint} label="Listening personality" value={data.identity.listeningPersonality} detail="A behavioral signature shaped by when and how widely you listen." />
                    <IdentityCard icon={Archive} label="Music age" value={data.identity.musicAge} detail="Your archive remembers the earliest chapter currently imported." />
                    <IdentityCard icon={Orbit} label="Favorite decade" value={data.identity.favoriteDecade} detail="Release-year metadata is still growing, so the archive leads this signal." />
                    <IdentityCard icon={Compass} label="Hidden genre" value={data.identity.hiddenGenre} detail="A quieter corner of your library that keeps resurfacing." />
                    <IdentityCard icon={Clock3} label="Top listening hour" value={data.identity.topListeningHour} detail="The hour your music habit most often comes alive." />
                    <IdentityCard icon={Sparkles} label="Top listening season" value={data.identity.topListeningSeason} detail="The season with the strongest listening gravity." />
                  </div>
                </section>

                {/* ── MILESTONES ───────────────────────────────────────── */}
                <section>
                  <SectionTitle eyebrow="Memory Trail" title="Personal Milestones" />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TimelineItem icon={Music2} title="First imported song" value={songLabel(data.milestones.firstImportedSong)} meta={formatDate(data.milestones.firstImportedSong?.ts)} />
                    <TimelineItem icon={Radio} title="First synced song" value={songLabel(data.milestones.firstSyncedSong)} meta={formatDate(data.milestones.firstSyncedSong?.ts)} />
                    <TimelineItem icon={Heart} title="Oldest favorite track" value={songLabel(data.milestones.oldestFavoriteTrack)} meta={formatDate(data.milestones.oldestFavoriteTrack?.firstPlayed)} />
                    <TimelineItem icon={Flame} title="Longest obsession" value={songLabel(data.milestones.longestObsession)} meta={`${data.milestones.longestObsession?.plays ?? 0} plays recorded`} />
                    <TimelineItem
                      icon={Activity}
                      title="Latest genre shift"
                      value={
                        data.milestones.latestGenreShift.to
                          ? `${data.milestones.latestGenreShift.from ?? "New signal"} → ${data.milestones.latestGenreShift.to}`
                          : "No shift detected"
                      }
                      meta="Based on the last 60 days of artist gravity"
                    />
                  </div>
                </section>

                {/* ── SERVICES ─────────────────────────────────────────── */}
                <section>
                  <SectionTitle eyebrow="Connections" title="Connected Services" />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <ServiceCard icon={BadgeCheck} title="Spotify" value={data.services.spotifyConnected ? "Connected" : "Disconnected"} active={data.services.spotifyConnected} />
                    <ServiceCard icon={Clock3} title="Last sync" value={formatDate(data.services.lastSync)} active={Boolean(data.services.lastSync)} />
                    <ServiceCard icon={ShieldCheck} title="Sync health" value={data.services.syncHealth} active={data.services.syncHealth === "Healthy"} />
                    <ServiceCard icon={Archive} title="Archive" value={data.services.archiveImported ? "Imported" : "Pending"} active={data.services.archiveImported} />
                    <ServiceCard icon={Database} title="Storage used" value={data.services.storageUsed} active />
                  </div>
                </section>

                {/* ── HIGHLIGHTS ───────────────────────────────────────── */}
                <section>
                  <SectionTitle eyebrow="Visual Memory" title="Highlights" />

                  <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr_0.9fr]">

                    {/* albums collage */}
                    <GlassPanel className="p-6">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <EyebrowLabel>Top album art collage</EyebrowLabel>
                          <h3 className="text-xl font-semibold text-white">
                            Albums that colored the archive
                          </h3>
                        </div>
                        <Disc3 className="mt-1 shrink-0 text-emerald-300/70" size={20} />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {(
                          data.highlights.topAlbums.length
                            ? data.highlights.topAlbums
                            : Array.from({ length: 6 }, (_, i) => ({
                                _id: `Album ${i + 1}`,
                                artistName: "EchoStats",
                                plays: 0,
                              }))
                        ).map((album, i) => (
                          <div
                            key={`${album._id}-${i}`}
                            className={`aspect-square rounded-2xl bg-gradient-to-br ${albumGradients[i % albumGradients.length]} p-[2px] shadow-xl shadow-black/40`}
                          >
                            <div className="flex h-full flex-col justify-between rounded-[14px] border border-white/10 bg-black/20 p-3">
                              <span className="text-[9px] font-semibold uppercase tracking-widest text-white/50">
                                {album.plays} plays
                              </span>
                              <span className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                                {album._id}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassPanel>

                    {/* most played artist */}
                    <GlassPanel className="p-6">
                      <EyebrowLabel>Most played artist</EyebrowLabel>

                      <div className="mt-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-indigo-400 to-violet-500 text-3xl font-bold text-black shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                        {data.highlights.mostPlayedArtist?._id
                          .slice(0, 2)
                          .toUpperCase() ?? "ES"}
                      </div>

                      <h3 className="mt-6 text-2xl font-semibold leading-tight text-white">
                        {data.highlights.mostPlayedArtist?._id ?? "Still emerging"}
                      </h3>
                      <p className="mt-2 text-sm text-white/40">
                        {data.highlights.mostPlayedArtist?.plays ?? 0} lifetime plays
                      </p>
                    </GlassPanel>

                    {/* favorite song + forgotten */}
                    <div className="flex flex-col gap-4">
                      <GlassPanel className="flex-1 p-6">
                        <EyebrowLabel>Favorite song this year</EyebrowLabel>
                        <h3 className="mt-4 text-xl font-semibold leading-7 text-white">
                          {songLabel(data.highlights.favoriteSongThisYear)}
                        </h3>
                        <p className="mt-2 text-sm text-white/40">
                          {data.highlights.favoriteSongThisYear?.plays ?? 0} plays this year
                        </p>
                      </GlassPanel>

                      <GlassPanel className="flex-1 p-6">
                        <EyebrowLabel>Forgotten favorites</EyebrowLabel>
                        <h3 className="mt-4 text-4xl font-semibold tabular-nums tracking-tight text-white">
                          {compactNumber(data.highlights.forgottenFavoriteCount)}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/40">
                          Tracks with enough history to deserve a rediscovery pass.
                        </p>
                      </GlassPanel>
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}