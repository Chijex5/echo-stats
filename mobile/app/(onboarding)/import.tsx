import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import type * as DocumentPicker from "expo-document-picker";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { MotiView } from "moti";
import { AppBackground, GlassCard, SectionHeading, StatTile, PrimaryButton } from "@/components/ui";
import { DropZone } from "@/components/onboarding/DropZone";
import { ProgressRing } from "@/components/onboarding/ProgressRing";
import { GenrePickerGrid } from "@/components/onboarding/GenrePickerGrid";
import { BioInput } from "@/components/onboarding/BioInput";
import { staggerChild } from "@/lib/motion/presets";
import { apiFetch } from "@/lib/api/client";
import {
  filterJsonAssets,
  readHistoryAssets,
  uploadHistoryEntries,
  type UploadTotals,
} from "@/lib/history/uploadHistory";
import { scheduleResyncReminder } from "@/lib/notifications/resyncReminder";
import { useAuth } from "@/lib/auth/AuthContext";
import { colors, alpha, spacing, fontSize } from "@/lib/theme/tokens";

type Stage = "idle" | "reading" | "uploading" | "form" | "submitting" | "success" | "error";

export default function ImportScreen() {
  const { completeOnboarding } = useAuth();

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [stats, setStats] = useState<UploadTotals | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  async function processFiles(assets: DocumentPicker.DocumentPickerAsset[]) {
    const jsonAssets = filterJsonAssets(assets);

    if (!jsonAssets) {
      setErrorMsg("No valid JSON files found. Extract the ZIP Spotify sends you and upload the JSON files.");
      setStage("error");
      return;
    }

    setStage("reading");
    setProgress(0);
    setErrorMsg(null);

    try {
      const onProgress = (pct: number, label: string) => {
        setProgress(pct);
        setProgressLabel(label);
      };
      const allEntries = await readHistoryAssets(jsonAssets, onProgress);

      setStage("uploading");
      const totals = await uploadHistoryEntries(allEntries, onProgress);

      setStats(totals);
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
    // First natural moment to ask for notification permission: arm the
    // monthly "upload a fresh export" reminder before entering the app.
    await scheduleResyncReminder().catch(() => false);
    await completeOnboarding();
  }

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.screenX,
          paddingTop: spacing.screenTop,
          paddingBottom: spacing["4xl"],
        }}
      >
        <MotiView {...staggerChild(0)} style={{ marginBottom: 24 }}>
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
              <View style={styles.progressWrap}>
                <View style={{ marginBottom: 28 }}>
                  <ProgressRing progress={progress} />
                </View>
                <Text style={styles.progressTitle}>{stage === "reading" ? "Reading your files…" : "Uploading to your vault…"}</Text>
                <Text style={styles.progressLabel}>{progressLabel}</Text>
              </View>
            )}

            {(stage === "form" || stage === "submitting") && stats && (
              <View style={{ gap: 28 }}>
                <View style={styles.statsGrid}>
                  <StatTile label="Plays stored" value={stats.totalInserted.toLocaleString()} accentColor={colors.spotify} />
                  <StatTile label="Skips removed" value={stats.totalFiltered.toLocaleString()} />
                  <StatTile
                    label="History span"
                    value={`${stats.yearSpan} yr${stats.yearSpan !== 1 ? "s" : ""}`}
                    accentColor={colors.accentPurple}
                  />
                  <StatTile
                    label="Duplicates"
                    value={stats.totalDuplicates > 0 ? stats.totalDuplicates.toLocaleString() : "None"}
                    accentColor={colors.accentBlue}
                  />
                </View>

                <View>
                  <Text style={styles.fieldLabel}>
                    Pick your favourite genres <Text style={styles.fieldLabelMuted}>(at least one)</Text>
                  </Text>
                  <GenrePickerGrid selected={selectedGenres} onToggle={toggleGenre} />
                </View>

                <View>
                  <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                    Short bio <Text style={styles.fieldLabelMuted}>(optional)</Text>
                  </Text>
                  <BioInput value={bio} onChangeText={setBio} />
                </View>

                {errorMsg ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={14} color={colors.accentRed} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
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
              <View style={styles.errorState}>
                <View style={styles.errorIconWrap}>
                  <AlertCircle size={32} color={colors.accentRed} />
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.errorStateTitle}>Import failed</Text>
                  <Text style={styles.errorStateMessage}>{errorMsg}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setStage("idle");
                    setProgress(0);
                    setErrorMsg(null);
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            )}

            {stage === "success" && stats && (
              <View style={styles.successState}>
                <View style={styles.successIconWrap}>
                  <CheckCircle2 size={40} color={colors.spotify} />
                </View>
                <Text style={styles.successTitle}>Import Complete!</Text>
                <Text style={styles.successMessage}>
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

const styles = StyleSheet.create({
  progressWrap: { alignItems: "center", paddingVertical: 40 },
  progressTitle: { marginBottom: 6, fontSize: fontSize[20], fontFamily: "GeistSansSemiBold", color: colors.white },
  progressLabel: { fontSize: fontSize[13], color: alpha.white(0.4) },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  fieldLabel: { marginBottom: 12, fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: alpha.white(0.8) },
  fieldLabelMuted: { color: alpha.white(0.4) },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  errorText: { fontSize: fontSize[14], color: colors.accentRed },
  errorState: { alignItems: "center", gap: 20, paddingVertical: 32 },
  errorIconWrap: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: alpha.hex(colors.accentRed, 0.1),
  },
  errorStateTitle: { marginBottom: 4, fontSize: fontSize[20], fontFamily: "GeistSansSemiBold", color: colors.white },
  errorStateMessage: { maxWidth: 384, textAlign: "center", fontSize: fontSize[14], color: alpha.white(0.5) },
  retryButton: { borderRadius: 999, borderWidth: 1, borderColor: alpha.white(0.2), paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { fontSize: fontSize[14], color: alpha.white(0.9) },
  successState: { alignItems: "center", paddingVertical: 24 },
  successIconWrap: {
    marginBottom: 24,
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: alpha.spotify(0.2),
  },
  successTitle: { marginBottom: 8, fontSize: fontSize[24], fontFamily: "GeistSansBold", color: colors.white },
  successMessage: { marginBottom: 32, textAlign: "center", fontSize: fontSize[15], color: alpha.white(0.6) },
});
