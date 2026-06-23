import { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { File } from "expo-file-system";
import type * as DocumentPicker from "expo-document-picker";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { MotiView } from "moti";
import { AppBackground, AmbientBlob, GlassCard, SectionHeading, StatTile, PrimaryButton } from "@/components/ui";
import { DropZone } from "@/components/onboarding/DropZone";
import { ProgressRing } from "@/components/onboarding/ProgressRing";
import { GenrePickerGrid } from "@/components/onboarding/GenrePickerGrid";
import { BioInput } from "@/components/onboarding/BioInput";
import { staggerChild } from "@/lib/motion/presets";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

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

const BATCH_SIZE = 2_000;

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function getYearSpan(entries: RawEntry[]): number {
  const years = entries.map((e) => new Date(e.ts).getFullYear()).filter((y) => !isNaN(y));
  return years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
}

export default function ImportScreen() {
  const { completeOnboarding } = useAuth();

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  async function processFiles(assets: DocumentPicker.DocumentPickerAsset[]) {
    const jsonAssets = assets.filter((a) => a.mimeType === "application/json" || a.name.endsWith(".json"));

    if (!jsonAssets.length) {
      setErrorMsg("No valid JSON files found. Extract the ZIP Spotify sends you and upload the JSON files.");
      setStage("error");
      return;
    }

    setStage("reading");
    setProgress(0);
    setErrorMsg(null);

    try {
      const allEntries: RawEntry[] = [];

      for (let i = 0; i < jsonAssets.length; i++) {
        const asset = jsonAssets[i];
        setProgressLabel(`Reading ${asset.name}…`);

        const text = await new File(asset.uri).text();

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error(`${asset.name} is not valid JSON.`);
        }
        if (!Array.isArray(parsed)) {
          throw new Error(`${asset.name} doesn't look like a Spotify streaming history file.`);
        }
        allEntries.push(...(parsed as RawEntry[]));

        // No per-byte progress is available from a single text() read, so
        // each completed file advances the 0–40% reading band evenly.
        setProgress(Math.round(((i + 1) / jsonAssets.length) * 40));
      }

      const yearSpan = getYearSpan(allEntries);

      setStage("uploading");
      const batches = chunk(allEntries, BATCH_SIZE);
      const totalBatches = batches.length;

      let totalReceived = 0;
      let totalFiltered = 0;
      let totalInserted = 0;
      let totalDuplicates = 0;

      for (let b = 0; b < batches.length; b++) {
        setProgressLabel(`Uploading batch ${b + 1} of ${totalBatches}…`);

        const res = await apiFetch("/api/user/import-history", {
          method: "POST",
          body: JSON.stringify({ entries: batches[b] }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Batch ${b + 1} failed.`);
        }

        const data = await res.json();
        totalReceived += data.received;
        totalFiltered += data.filtered;
        totalInserted += data.inserted;
        totalDuplicates += data.duplicates;

        setProgress(Math.round(40 + ((b + 1) / totalBatches) * 60));
      }

      setProgress(100);
      setProgressLabel("Done");
      setStats({ totalReceived, totalFiltered, totalInserted, totalDuplicates, yearSpan });
      setStage("form");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  }

  async function handleSubmit() {
    if (!selectedGenres.length) {
      setErrorMsg("Pick at least one genre to continue.");
      return;
    }

    setErrorMsg(null);
    setStage("submitting");

    try {
      const res = await apiFetch("/api/user/complete-import", {
        method: "PATCH",
        body: JSON.stringify({ favoriteGenres: selectedGenres, bio: bio.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Server error.");
      }

      // Don't flip onboardingCompleted yet — the root navigator redirects out
      // of this stack the instant it sees that flag, which would skip past
      // the success screen entirely. It's deferred to the CTA below.
      setStage("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("form");
    }
  }

  async function handleViewStory() {
    await completeOnboarding();
  }

  return (
    <AppBackground>
      <AmbientBlob color="#1DB954" size={420} blur={90} style={{ top: 60, left: -160 }} delayMs={0} />
      <AmbientBlob color="#7c3aed" size={380} blur={100} style={{ top: 280, right: -150 }} delayMs={1400} />
      <AmbientBlob color="#2563eb" size={320} blur={90} style={{ bottom: 80, left: -120 }} delayMs={2600} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 72, paddingBottom: 48 }}>
        <MotiView {...staggerChild(0)} className="mb-6">
          <SectionHeading
            label="One last step"
            title="Import your"
            accentWord="Spotify"
            subtitle="Upload your extended streaming history to unlock your complete listening timeline, forgotten favorites, and deeply personal insights."
          />
        </MotiView>

        <MotiView {...staggerChild(1)}>
          <GlassCard padding="lg" rounded="2xl">
            {stage === "idle" && <DropZone onPick={processFiles} />}

            {(stage === "reading" || stage === "uploading") && (
              <View className="items-center py-10">
                <View className="mb-7">
                  <ProgressRing progress={progress} />
                </View>
                <Text className="mb-1.5 text-xl font-sans-semibold text-white">
                  {stage === "reading" ? "Reading your files…" : "Uploading to your vault…"}
                </Text>
                <Text className="text-[13px] text-white/40">{progressLabel}</Text>
              </View>
            )}

            {(stage === "form" || stage === "submitting") && stats && (
              <View className="gap-7">
                <View className="flex-row flex-wrap gap-3">
                  <StatTile label="Plays stored" value={stats.totalInserted.toLocaleString()} accentColor="#1DB954" />
                  <StatTile label="Skips removed" value={stats.totalFiltered.toLocaleString()} />
                  <StatTile
                    label="History span"
                    value={`${stats.yearSpan} yr${stats.yearSpan !== 1 ? "s" : ""}`}
                    accentColor="#a78bfa"
                  />
                  <StatTile
                    label="Duplicates"
                    value={stats.totalDuplicates > 0 ? stats.totalDuplicates.toLocaleString() : "None"}
                    accentColor="#60a5fa"
                  />
                </View>

                <View>
                  <Text className="mb-3 text-sm font-sans-medium text-white/80">
                    Pick your favourite genres <Text className="text-white/40">(at least one)</Text>
                  </Text>
                  <GenrePickerGrid selected={selectedGenres} onToggle={toggleGenre} />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-sans-medium text-white/80">
                    Short bio <Text className="text-white/40">(optional)</Text>
                  </Text>
                  <BioInput value={bio} onChangeText={setBio} />
                </View>

                {errorMsg ? (
                  <View className="flex-row items-center gap-2">
                    <AlertCircle size={14} color="#f87171" />
                    <Text className="text-sm text-red-400">{errorMsg}</Text>
                  </View>
                ) : null}

                <PrimaryButton
                  label={stage === "submitting" ? "Saving…" : "Continue to Dashboard"}
                  variant="spotify-solid"
                  loading={stage === "submitting"}
                  fullWidth
                  onPress={handleSubmit}
                />
              </View>
            )}

            {stage === "error" && (
              <View className="items-center gap-5 py-8">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle size={32} color="#f87171" />
                </View>
                <View className="items-center">
                  <Text className="mb-1 text-xl font-sans-semibold text-white">Import failed</Text>
                  <Text className="max-w-sm text-center text-sm text-white/50">{errorMsg}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setStage("idle");
                    setProgress(0);
                    setErrorMsg(null);
                  }}
                  className="rounded-full border border-white/20 px-6 py-2.5"
                >
                  <Text className="text-sm text-white/90">Try again</Text>
                </Pressable>
              </View>
            )}

            {stage === "success" && stats && (
              <View className="items-center py-6">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-spotify/20">
                  <CheckCircle2 size={40} color="#1DB954" />
                </View>
                <Text className="mb-2 text-2xl font-sans-bold text-white">Import Complete!</Text>
                <Text className="mb-8 text-center text-[15px] text-white/60">
                  {stats.totalInserted.toLocaleString()} plays across {stats.yearSpan} year
                  {stats.yearSpan !== 1 ? "s" : ""} — your story is ready.
                </Text>
                <PrimaryButton label="View Your Story" variant="spotify-solid" fullWidth onPress={handleViewStory} />
              </View>
            )}
          </GlassCard>
        </MotiView>
      </ScrollView>
    </AppBackground>
  );
}
