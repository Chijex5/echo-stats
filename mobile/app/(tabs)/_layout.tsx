import { useEffect } from "react";
import { Tabs } from "expo-router";
import { AppBackground } from "@/components/ui/AppBackground";
import { CustomTabBar } from "@/components/dashboard/CustomTabBar";
import { useImportStatus } from "@/lib/api/hooks";
import { syncResyncReminder } from "@/lib/notifications/resyncReminder";

export default function TabsLayout() {
  // Keep the monthly re-sync reminder armed: scheduled notifications don't
  // survive reinstalls, so on entry re-derive the next fire time from the
  // server's lastImportAt (no-ops unless notification permission is granted).
  const importStatus = useImportStatus();
  useEffect(() => {
    if (importStatus.data !== undefined) {
      void syncResyncReminder(importStatus.data.lastImportAt);
    }
  }, [importStatus.data]);

  return (
    <AppBackground>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tracks" />
        <Tabs.Screen name="artists" />
        <Tabs.Screen name="timeline" />
        <Tabs.Screen name="insights" />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="resync" options={{ href: null }} />
        <Tabs.Screen name="story" options={{ href: null }} />
        <Tabs.Screen name="song-of-the-day" options={{ href: null }} />
      </Tabs>
    </AppBackground>
  );
}
