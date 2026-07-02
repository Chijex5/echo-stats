import { Tabs } from "expo-router";
import { AppBackground } from "@/components/ui/AppBackground";
import { CustomTabBar } from "@/components/dashboard/CustomTabBar";

export default function TabsLayout() {
  return (
    <AppBackground>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tracks" />
        <Tabs.Screen name="artists" />
        <Tabs.Screen name="timeline" />
        <Tabs.Screen name="insights" />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="story" options={{ href: null }} />
        <Tabs.Screen name="song-of-the-day" options={{ href: null }} />
      </Tabs>
    </AppBackground>
  );
}
