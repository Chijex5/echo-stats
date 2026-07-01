import { View, Text, StyleSheet } from "react-native";
import { Calendar, Moon, CloudRain, Repeat, type LucideIcon } from "lucide-react-native";
import { GlassCard, SectionHeading } from "@/components/ui";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import type { SotdStoryBeat, SotdStoryIconName } from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdStoryIconName, LucideIcon> = { Calendar, Moon, CloudRain, Repeat };

type TheStoryProps = {
  beats: SotdStoryBeat[];
};

export function TheStory({ beats }: TheStoryProps) {
  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading label="The story" title="You lived with this song for a" accentWord="season." />
      </View>
      <GlassCard padding="lg" rounded="2xl">
        <View style={{ gap: 20 }}>
          {beats.map((b, i) => {
            const Icon = ICON_MAP[b.icon];
            return (
              <View key={i} style={styles.row}>
                <View style={styles.iconWrap}>
                  <Icon size={15} color={alpha.white(0.6)} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stat}>{b.stat}</Text>
                  <Text style={styles.label}>{b.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  iconWrap: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.08),
    backgroundColor: alpha.white(0.04),
  },
  stat: { fontSize: fontSize[26], fontFamily: "PlayfairDisplayItalic", lineHeight: fontSize[26], color: colors.white },
  label: { marginTop: 6, fontSize: fontSize[13], lineHeight: fontSize[13] * 1.5, color: alpha.white(0.5) },
});
