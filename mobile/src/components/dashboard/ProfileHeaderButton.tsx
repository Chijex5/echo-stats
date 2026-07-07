import { Pressable, Image, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "@/lib/api/hooks";
import { colors, fontSize } from "@/lib/theme/tokens";

const SIZE = 36;

// Spotify-style account access: a small avatar in the screen header instead
// of a bottom-tab slot, keeping the tab bar uncluttered. The profile query
// is shared/cached by react-query, so mounting this on multiple screens
// doesn't refetch.
export function ProfileHeaderButton() {
  const router = useRouter();
  const profile = useProfile();
  const user = profile.data?.user;
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "E";

  return (
    <Pressable onPress={() => router.push("/(tabs)/profile")} hitSlop={8}>
      {user?.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.fallback]}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceRaised },
  initial: { fontSize: fontSize[14], fontFamily: "GeistSansBold", color: colors.white },
});
