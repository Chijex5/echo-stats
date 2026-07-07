import { View, Text, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

export type MilestoneItem = {
  key: string;
  icon: LucideIcon;
  title: string;
  value: string;
  meta: string;
};

// Accepts a fixed-order array built explicitly from ProfileResponse's
// 5 named milestone keys (firstImportedSong, firstSyncedSong, ...) — the
// caller maps that object by name, not by iterating it, so a future field
// reorder in the API response can't silently reshuffle this timeline.
export function MilestoneTimeline({ items }: { items: MilestoneItem[] }) {
  return (
    <View>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.rail}>
              <View style={styles.iconWrap}>
                <Icon size={16} color={colors.echoGreen} />
              </View>
              {!isLast ? <View style={styles.connector} /> : null}
            </View>
            <View style={[styles.content, { paddingBottom: isLast ? 0 : 20 }]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.value}>
                {item.value}
              </Text>
              <Text style={styles.meta}>{item.meta}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 16 },
  rail: { alignItems: "center" },
  iconWrap: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.spotify(0.25),
    backgroundColor: alpha.spotify(0.08),
  },
  connector: { marginVertical: 4, width: 1, flex: 1, backgroundColor: alpha.white(0.08) },
  content: { flex: 1 },
  title: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  value: { marginTop: 6, fontSize: fontSize[14], fontFamily: "GeistSansSemiBold", color: colors.white },
  meta: { marginTop: 4, fontSize: fontSize[12], color: alpha.white(0.4) },
});
