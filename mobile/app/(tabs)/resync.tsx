import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type * as DocumentPicker from "expo-document-picker";
import { CheckCircle2, AlertCircle, X, CalendarClock, Database, BellRing } from "lucide-react-native";
import { DropZone } from "@/components/onboarding/DropZone";
import { ProgressRing } from "@/components/onboarding/ProgressRing";
import { PrimaryButton, Shimmer } from "@/components/ui";
import {
  filterJsonAssets,
  readHistoryAssets,
  uploadHistoryEntries,
  type UploadTotals,
} from "@/lib/history/uploadHistory";
import { scheduleResyncReminder } from "@/lib/notifications/resyncReminder";
import { queryClient } from "@/lib/api/queryClient";
import { useImportStatus } from "@/lib/api/hooks";
import { colors, alpha, spacing, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";

type Stage = "idle" | "working" | "success" | "error";

const STEPS = [
  "Request your extended streaming history from Spotify's privacy settings",
  "Download the ZIP Spotify emails you (takes a few days) and extract it",
  "Upload the JSON files here — we skip what we already have",
];

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function ResyncScreen() {
  const router = useRouter();
  const status = useImportStatus();

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [totals, setTotals] = useState<UploadTotals | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reminderArmed, setReminderArmed] = useState(false);

  async function processFiles(assets: DocumentPicker.DocumentPickerAsset[]) {
    const jsonAssets = filterJsonAssets(assets);
    if (!jsonAssets) {
      setErrorMsg("No valid JSON files found. Extract the ZIP Spotify sends you and upload the JSON files.");
      setStage("error");
      return;
    }

    setStage("working");
    setProgress(0);
    setErrorMsg(null);

    try {
      const onProgress = (pct: number, label: string) => {
        setProgress(pct);
        setProgressLabel(label);
      };
      const entries = await readHistoryAssets(jsonAssets, onProgress);
      const result = await uploadHistoryEntries(entries, onProgress);
      setTotals(result);

      // Every screen's numbers may have moved — refetch the world, and push
      // the next monthly reminder a full interval out (asks permission the
      // first time).
      void queryClient.invalidateQueries();
      const armed = await scheduleResyncReminder();
      setReminderArmed(armed);

      setStage("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }

  const data = status.data;

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Re-sync history</Text>
            <Text style={styles.subtitle}>Top up your stats with a fresh Spotify export</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.close}>
            <X size={18} color={alpha.white(0.6)} />
          </Pressable>
        </View>

        {status.isLoading ? (
          <Shimmer width="100%" height={76} rounded="xl" />
        ) : data ? (
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <CalendarClock size={15} color={data.dueForResync ? colors.accentAmber : colors.echoGreen} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.statusLabel}>Last import</Text>
                <Text style={styles.statusValue}>{formatDate(data.lastImportAt)}</Text>
              </View>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Database size={15} color={alpha.white(0.5)} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.statusLabel}>Plays stored</Text>
                <Text style={styles.statusValue}>{data.totalEntries.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {data?.dueForResync && stage === "idle" ? (
          <Text style={styles.dueNote}>
            It&apos;s been {data.daysSinceLastImport === null ? "a while" : `${data.daysSinceLastImport} days`} — a
            fresh export will fill in anything the live sync missed.
          </Text>
        ) : null}

        {stage === "idle" ? (
          <View>
            <View style={styles.steps}>
              {STEPS.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            <DropZone onPick={processFiles} />
            <Text style={styles.safeNote}>
              Duplicates are detected automatically — uploading the same files twice never double-counts a play.
            </Text>
          </View>
        ) : null}

        {stage === "working" ? (
          <View style={styles.centerState}>
            <ProgressRing progress={progress} />
            <Text style={styles.workingTitle}>{progress < 40 ? "Reading your files…" : "Syncing your vault…"}</Text>
            <Text style={styles.workingLabel}>{progressLabel}</Text>
          </View>
        ) : null}

        {stage === "success" && totals ? (
          <View style={styles.centerState}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={36} color={colors.echoGreen} />
            </View>
            <Text style={styles.successTitle}>You&apos;re up to date</Text>
            <Text style={styles.successMessage}>
              {totals.totalInserted.toLocaleString()} new play{totals.totalInserted === 1 ? "" : "s"} added ·{" "}
              {totals.totalDuplicates.toLocaleString()} already in your vault
            </Text>
            {reminderArmed ? (
              <View style={styles.reminderRow}>
                <BellRing size={13} color={alpha.white(0.45)} />
                <Text style={styles.reminderText}>We&apos;ll remind you again in a month</Text>
              </View>
            ) : null}
            <View style={{ alignSelf: "stretch", marginTop: 24 }}>
              <PrimaryButton label="Done" variant="spotify-solid" fullWidth onPress={() => router.back()} />
            </View>
          </View>
        ) : null}

        {stage === "error" ? (
          <View style={styles.centerState}>
            <View style={styles.errorIcon}>
              <AlertCircle size={30} color={colors.accentRed} />
            </View>
            <Text style={styles.successTitle}>Sync failed</Text>
            <Text style={styles.successMessage}>{errorMsg}</Text>
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
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },
  close: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius["2xl"],
    backgroundColor: colors.surface,
    padding: 16,
  },
  statusItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  statusDivider: { width: 1, height: 30, backgroundColor: alpha.white(0.07), marginHorizontal: 12 },
  statusLabel: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  statusValue: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  dueNote: {
    marginTop: 12,
    fontSize: fontSize[12],
    fontFamily: "GeistSans",
    lineHeight: fontSize[12] * 1.45,
    color: colors.accentAmber,
  },

  steps: { marginTop: 24, marginBottom: 20, gap: 12 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNum: { fontSize: fontSize[11], fontFamily: "GeistSansBold", color: alpha.white(0.7) },
  stepText: {
    flex: 1,
    fontSize: fontSize[13],
    fontFamily: "GeistSans",
    lineHeight: fontSize[13] * 1.4,
    color: alpha.white(0.6),
  },
  safeNote: {
    marginTop: 14,
    textAlign: "center",
    fontSize: fontSize[11],
    fontFamily: "GeistSans",
    lineHeight: fontSize[11] * 1.4,
    color: alpha.white(0.3),
  },

  centerState: { alignItems: "center", paddingVertical: 48 },
  workingTitle: { marginTop: 24, fontSize: fontSize[18], fontFamily: "GeistSansSemiBold", color: colors.white },
  workingLabel: { marginTop: 4, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.4) },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: alpha.spotify(0.12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  successTitle: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  successMessage: {
    marginTop: 6,
    textAlign: "center",
    maxWidth: 300,
    fontSize: fontSize[13],
    fontFamily: "GeistSans",
    lineHeight: fontSize[13] * 1.4,
    color: alpha.white(0.55),
  },
  reminderRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 6 },
  reminderText: { fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: alpha.hex(colors.accentRed, 0.1),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  retryButton: {
    marginTop: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: alpha.white(0.2),
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: alpha.white(0.9) },
});
