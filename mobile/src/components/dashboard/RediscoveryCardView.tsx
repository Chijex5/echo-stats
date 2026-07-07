import { Text, View, StyleSheet } from "react-native";
import { GlassCard } from "@/components/ui";
import { colorForKey } from "@/lib/theme/gradients";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";
import type { RediscoveryCard } from "@/lib/api/hooks";

export function RediscoveryCardView({ card }: { card: RediscoveryCard }) {
  return (
    <GlassCard padding="md" rounded="2xl" style={{ width: 160 }}>
      <View style={[styles.dot, { backgroundColor: colorForKey(card.key) }]} />
      <Text style={styles.count}>{card.count}</Text>
      <Text style={styles.title}>{card.title}</Text>
      <Text numberOfLines={2} style={styles.desc}>
        {card.desc}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  dot: { marginBottom: 8, height: 8, width: 8, borderRadius: 4 },
  count: { fontSize: fontSize[24], fontFamily: "GeistSansBold", color: colors.white },
  title: { marginTop: 4, fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: alpha.white(0.85) },
  desc: { marginTop: 4, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },
});
