import { View, Pressable, Text, StyleSheet } from "react-native";
import type { ComponentProps } from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LayoutDashboard, Music2, Users, History, Lightbulb, type LucideIcon } from "lucide-react-native";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

// Derives the tabBar render-prop's parameter type from Tabs itself, since
// expo-router vendors its own react-navigation/bottom-tabs fork with no
// stable public type export for BottomTabBarProps.
type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarRenderer>[0];

type TabConfig = { name: string; label: string; icon: LucideIcon };

// Profile is reached via the avatar in each screen's header (see
// ProfileHeaderButton), Spotify-style, so it's not a tab slot here — that
// keeps the bar to five uncluttered destinations. Story/SOTD are href:null
// group screens reached via router.push (full-screen takeovers).
const TABS: TabConfig[] = [
  { name: "index", label: "Overview", icon: LayoutDashboard },
  { name: "tracks", label: "Tracks", icon: Music2 },
  { name: "artists", label: "Artists", icon: Users },
  { name: "timeline", label: "Timeline", icon: History },
  { name: "insights", label: "Insights", icon: Lightbulb },
];

// Spotify-style bar: no floating card, no border — a full-width fade from
// transparent into the page background, with the icons sitting directly on
// it. Content scrolls underneath and dissolves into the bar.
export function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  // Story Mode is a full-screen immersive takeover (the slide IS the
  // screen, no phone-mockup chrome) — the bar would overlap its own
  // bottom nav, so it's hidden on that one route.
  if (state.routes[state.index]?.name === "story") return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <LinearGradient
        colors={[alpha.hex(colors.background, 0), alpha.hex(colors.background, 0.86), colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          const isActive = routeIndex !== -1 && state.index === routeIndex;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                if (routeIndex === -1) return;
                const route = state.routes[routeIndex];
                navigation.navigate(route.name, route.params);
              }}
              style={styles.tab}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                color={isActive ? colors.white : alpha.white(0.45)}
              />
              <Text style={[styles.label, { color: isActive ? colors.white : alpha.white(0.45) }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 28 },
  row: { flexDirection: "row", alignItems: "flex-end", paddingTop: 6 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 4 },
  label: { fontSize: fontSize[10], fontFamily: "GeistSansMedium" },
});
