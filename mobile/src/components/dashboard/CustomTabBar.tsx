import { View, Pressable, Text } from "react-native";
import type { ComponentProps } from "react";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { LayoutDashboard, Music2, Users, History, Lightbulb, UserRound, type LucideIcon } from "lucide-react-native";
import { colors, alpha } from "@/lib/theme/tokens";

// Derives the tabBar render-prop's parameter type from Tabs itself, since
// expo-router vendors its own react-navigation/bottom-tabs fork with no
// stable public type export for BottomTabBarProps.
type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarRenderer>[0];

type TabConfig = { name: string; label: string; icon: LucideIcon };

// Story Mode is registered as a (tabs) group screen (href: null) so it keeps
// the shared AppBackground, but it's a full-screen immersive takeover reached
// via router.push from Overview/SOTD, not this bar. Timeline lives here
// alongside the other data screens — it isn't full-screen chrome, so hiding
// it behind a CTA card buried it from primary navigation.
const TABS: TabConfig[] = [
  { name: "index", label: "Overview", icon: LayoutDashboard },
  { name: "tracks", label: "Tracks", icon: Music2 },
  { name: "artists", label: "Artists", icon: Users },
  { name: "timeline", label: "Timeline", icon: History },
  { name: "insights", label: "Insights", icon: Lightbulb },
  { name: "profile", label: "Profile", icon: UserRound },
];

export function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  // Story Mode is a full-screen immersive takeover (the slide IS the
  // screen, no phone-mockup chrome) — the floating pill bar would
  // overlap its own bottom nav, so it's hidden on that one route.
  if (state.routes[state.index]?.name === "story") return null;

  return (
    <View style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 8 }}>
      <View className="overflow-hidden rounded-full border border-white/10" style={{ backgroundColor: colors.backgroundElevated }}>
        <BlurView intensity={40} tint="dark" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <View className="flex-row items-center justify-between px-1.5 py-2">
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
                className="flex-1 items-center justify-center py-2"
              >
                <MotiView
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "timing", duration: 150 }}
                  style={{ alignItems: "center", gap: 2 }}
                >
                  <Icon size={18} color={isActive ? colors.echoGreen : alpha.white(0.4)} />
                  <Text
                    className="text-9 font-sans-medium"
                    style={{ color: isActive ? colors.echoGreen : alpha.white(0.4) }}
                  >
                    {tab.label}
                  </Text>
                </MotiView>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
