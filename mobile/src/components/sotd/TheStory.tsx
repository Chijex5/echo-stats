import { View, Text, StyleSheet } from "react-native";
import { Calendar, Moon, CloudRain, Repeat, type LucideIcon } from "lucide-react-native";
import { alpha, colors, fontSize, radius } from "@/lib/theme/tokens";
import type { SotdStoryBeat, SotdStoryIconName } from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdStoryIconName, LucideIcon> = { Calendar, Moon, CloudRain, Repeat };

type TheStoryProps = {
  beats: SotdStoryBeat[];
  accent: string;
};

// The song's history with you as a plain fact list — serif stat, small
// caption — inside one borderless surface card.
export function TheStory({ beats, accent }: TheStoryProps) {
  return (
    <View style={styles.card}>
      {beats.map((b, i) => {
        const Icon = ICON_MAP[b.icon];
        return (
          <View key={i} style={[styles.row, i > 0 && styles.rowDivider]}>
            <Icon size={16} color={accent} strokeWidth={1.8} style={{ marginTop: 6 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stat}>{b.stat}</Text>
              <Text style={styles.label}>{b.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 14 },
  rowDivider: { borderTopWidth: 1, borderColor: alpha.white(0.06) },
  stat: { fontSize: fontSize[24], fontFamily: "PlayfairDisplayItalic", lineHeight: fontSize[24] * 1.05, color: colors.white },
  label: { marginTop: 4, fontSize: fontSize[12], lineHeight: fontSize[12] * 1.5, fontFamily: "GeistSans", color: alpha.white(0.5) },
});
