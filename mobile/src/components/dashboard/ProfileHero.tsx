import { View, Text, Image, StyleSheet } from "react-native";
import { BadgeCheck, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { PROFILE_RING_GRADIENT } from "@/lib/theme/gradients";
import type { ProfileResponse } from "@/lib/api/hooks";

function ProfileAvatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "E";
  return (
    <View style={{ width: 96, height: 96 }}>
      <LinearGradient colors={PROFILE_RING_GRADIENT} style={styles.ring}>
        <View style={[styles.avatarInner, { backgroundColor: colors.backgroundElevated }]}>
          {image ? (
            <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      <View style={[styles.badge, { backgroundColor: colors.echoGreen }]}>
        <BadgeCheck size={15} color={colors.onSpotify} />
      </View>
    </View>
  );
}

export function ProfileHero({ user, connectedDate }: { user: ProfileResponse["user"]; connectedDate: string }) {
  const rows = [
    { label: "Account age", value: user.accountAge },
    { label: "Plan", value: user.spotifyProduct },
    { label: "Connected", value: connectedDate },
  ];

  return (
    <GlassCard padding="lg" rounded="2xl">
      <View style={styles.center}>
        <ProfileAvatar name={user.name} image={user.avatarUrl} />

        <View style={styles.pill}>
          <ShieldCheck size={12} color={colors.echoGreen} />
          <Text style={styles.pillText}>Spotify connected</Text>
        </View>

        <Text style={styles.username}>{user.name}</Text>
        <Text style={styles.title}>Your Music Identity</Text>
        <Text style={styles.subtitle}>A profile shaped by your listening journey.</Text>

        <View style={styles.table}>
          {rows.map(({ label, value }, i) => (
            <View key={label} style={[styles.tableRow, i < rows.length - 1 && styles.tableRowDivider]}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text numberOfLines={1} style={styles.tableValue}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  ring: { width: 96, height: 96, borderRadius: 48, padding: 3, alignItems: "center", justifyContent: "center" },
  avatarInner: { height: "100%", width: "100%", overflow: "hidden", borderRadius: 999 },
  avatarFallback: { height: "100%", width: "100%", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: fontSize[30], fontFamily: "GeistSansBold", color: alpha.white(0.9) },
  badge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.black,
  },
  center: { alignItems: "center" },
  pill: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.spotify(0.2),
    backgroundColor: alpha.spotify(0.1),
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: colors.echoGreen,
  },
  username: {
    marginTop: 16,
    fontSize: fontSize[12],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[12]),
    color: alpha.white(0.35),
  },
  title: { marginTop: 4, textAlign: "center", fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 8, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.45) },
  table: {
    marginTop: 20,
    width: "100%",
    borderRadius: 18,
    backgroundColor: alpha.black(0.25),
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  tableRowDivider: { borderBottomWidth: 1, borderColor: alpha.white(0.06) },
  tableLabel: { fontSize: fontSize[13], color: alpha.white(0.4) },
  tableValue: { fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", textTransform: "capitalize", color: colors.white },
});
