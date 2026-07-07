import { View, Text, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

type ServiceRowProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  active?: boolean;
};

export function ServiceRow({ icon: Icon, title, value, active = false }: ServiceRowProps) {
  return (
    <GlassCard padding="sm" rounded="xl">
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Icon size={16} color={alpha.white(0.7)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        </View>
        <View style={[styles.dot, { backgroundColor: active ? colors.echoGreen : alpha.white(0.2) }]} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.08),
    backgroundColor: alpha.white(0.05),
  },
  title: { fontSize: fontSize[13], color: alpha.white(0.4) },
  value: { marginTop: 2, fontSize: fontSize[14], fontFamily: "GeistSansSemiBold", color: colors.white },
  dot: { height: 10, width: 10, borderRadius: 999 },
});
