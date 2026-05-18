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
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function songLabel(song: SongMoment) {
  if (!song) return "No track yet";
  return `${song.trackName} - ${song.artistName}`;
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 shadow-inner shadow-white/[0.02]">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-black shadow-lg`}>
          <Icon size={18} />
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-white/45">{label}</p>
    </div>
  );
}

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
      className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl transition-colors hover:bg-white/[0.055]"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07] text-emerald-300">
        <Icon size={19} />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">{label}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/45">{detail}</p>
    </motion.div>
  );
}

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
    <div className="relative grid grid-cols-[44px_1fr] gap-4 rounded-3xl border border-white/[0.08] bg-black/20 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{title}</p>
        <p className="mt-2 truncate text-base font-semibold text-white">{value}</p>
        <p className="mt-1 text-sm text-white/45">{meta}</p>
      </div>
    </div>
  );
}

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
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07] text-white/80">
          <Icon size={18} />
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" : "bg-white/25"}`} />
      </div>
      <p className="text-sm font-medium text-white/45">{title}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "E";
  return (
    <div className="relative h-32 w-32 shrink-0 rounded-full bg-gradient-to-br from-emerald-300 via-indigo-400 to-violet-500 p-[3px] shadow-[0_0_70px_rgba(16,185,129,0.35)] md:h-40 md:w-40">
      <div className="h-full w-full overflow-hidden rounded-full bg-[#101410]">
        {image ? (
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/[0.02] text-5xl font-bold text-white">
            {initial}
          </div>
        )}
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-black bg-emerald-400 text-black shadow-[0_0_24px_rgba(52,211,153,0.55)]">
        <BadgeCheck size={19} />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="h-72 animate-pulse rounded-[34px] bg-white/[0.04]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data, error, isLoading } = useSWR("/api/dashboard/profile", fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-white selection:bg-spotify/30 selection:text-white lg:flex">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <TopNav />

        <main className="w-full flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden">
            <div className="pointer-events-none absolute -right-24 top-0 h-[560px] w-[560px] rounded-full bg-emerald-500/12 blur-[150px] mix-blend-screen" />
            <div className="pointer-events-none absolute left-1/4 top-72 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[130px] mix-blend-screen" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen" />

            {isLoading && <ProfileSkeleton />}

            {error && (
              <GlassPanel className="p-8">
                <p className="text-sm text-red-200">Profile could not be loaded. Please refresh the page.</p>
              </GlassPanel>
            )}

            {data && (
              <div className="relative z-10 flex flex-col gap-10">
                <GlassPanel className="p-6 md:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(139,92,246,0.18),transparent_30%)]" />
                  <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
                    <div className="flex flex-col gap-7 md:flex-row md:items-end">
                      <Avatar name={data.user.name} image={data.user.avatarUrl} />
                      <div className="min-w-0 pb-2">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                          <ShieldCheck size={14} />
                          Spotify connected
                        </div>
                        <p className="mb-2 text-sm font-medium uppercase tracking-[0.22em] text-white/40">
                          {data.user.name}
                        </p>
                        <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white md:text-7xl">
                          Your Music Identity
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/55">
                          A profile shaped by your listening journey.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-3xl border border-white/[0.08] bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/45">Account age</span>
                        <span className="font-semibold text-white">{data.user.accountAge}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/45">Plan signal</span>
                        <span className="font-semibold capitalize text-emerald-200">{data.user.spotifyProduct}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/45">Connected</span>
                        <span className="font-semibold text-white">{data.summary.connectedDate}</span>
                      </div>
                    </div>
                  </div>
                </GlassPanel>

                <section>
                  <SectionTitle eyebrow="Overview" title="User Summary" />
                  <GlassPanel className="p-4 md:p-5">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                      value={data.milestones.latestGenreShift.to ? `${data.milestones.latestGenreShift.from ?? "New signal"} -> ${data.milestones.latestGenreShift.to}` : "No shift detected"}
                      meta="Based on the last 60 days of artist gravity"
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle eyebrow="Connections" title="Connected Services" />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <ServiceCard icon={BadgeCheck} title="Spotify" value={data.services.spotifyConnected ? "Connected" : "Disconnected"} active={data.services.spotifyConnected} />
                    <ServiceCard icon={Clock3} title="Last sync" value={formatDate(data.services.lastSync)} active={Boolean(data.services.lastSync)} />
                    <ServiceCard icon={ShieldCheck} title="Sync health" value={data.services.syncHealth} active={data.services.syncHealth === "Healthy"} />
                    <ServiceCard icon={Archive} title="Archive imported" value={data.services.archiveImported ? "Imported" : "Pending"} active={data.services.archiveImported} />
                    <ServiceCard icon={Database} title="Storage used" value={data.services.storageUsed} active />
                  </div>
                </section>

                <section>
                  <SectionTitle eyebrow="Visual Memory" title="Highlights" />
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr_0.9fr]">
                    <GlassPanel className="p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Top album art collage</p>
                          <h3 className="mt-2 text-xl font-semibold text-white">Albums that colored the archive</h3>
                        </div>
                        <Disc3 className="text-emerald-300" size={22} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(data.highlights.topAlbums.length ? data.highlights.topAlbums : Array.from({ length: 6 }, (_, index) => ({ _id: `Album ${index + 1}`, artistName: "EchoStats", plays: 0 }))).map((album, index) => (
                          <div key={`${album._id}-${index}`} className={`aspect-square rounded-2xl bg-gradient-to-br ${albumGradients[index % albumGradients.length]} p-3 shadow-2xl shadow-black/30`}>
                            <div className="flex h-full flex-col justify-between rounded-xl border border-white/15 bg-black/15 p-3">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{album.plays} plays</span>
                              <span className="line-clamp-2 text-sm font-semibold text-white">{album._id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassPanel>

                    <GlassPanel className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Most played artist portrait</p>
                      <div className="mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-indigo-400 to-violet-500 text-4xl font-bold text-black shadow-[0_0_70px_rgba(99,102,241,0.35)]">
                        {data.highlights.mostPlayedArtist?._id.slice(0, 2).toUpperCase() ?? "ES"}
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold text-white">{data.highlights.mostPlayedArtist?._id ?? "Still emerging"}</h3>
                      <p className="mt-2 text-sm text-white/45">{data.highlights.mostPlayedArtist?.plays ?? 0} lifetime plays</p>
                    </GlassPanel>

                    <div className="grid gap-4">
                      <GlassPanel className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Favorite song this year</p>
                        <h3 className="mt-4 text-xl font-semibold leading-7 text-white">{songLabel(data.highlights.favoriteSongThisYear)}</h3>
                        <p className="mt-2 text-sm text-white/45">{data.highlights.favoriteSongThisYear?.plays ?? 0} plays this year</p>
                      </GlassPanel>
                      <GlassPanel className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Forgotten favorites</p>
                        <h3 className="mt-4 text-4xl font-semibold text-white">{compactNumber(data.highlights.forgottenFavoriteCount)}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/45">Tracks with enough history to deserve a rediscovery pass.</p>
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
