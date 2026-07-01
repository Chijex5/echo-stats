import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

type ExploreCTACardProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
};

export function ExploreCTACard({ title, subtitle, icon: Icon, onPress }: ExploreCTACardProps) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard padding="md" rounded="2xl">
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Icon size={18} color={colors.echoGreen} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{title}</Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>
          <ChevronRight size={18} color={alpha.white(0.35)} />
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: alpha.spotify(0.1),
  },
  text: { flex: 1 },
  title: { fontSize: fontSize[14], fontFamily: "GeistSansSemiBold", color: colors.white },
  subtitle: { fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
});
