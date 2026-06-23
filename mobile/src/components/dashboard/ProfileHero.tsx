import { View, Text, Image } from "react-native";
import { BadgeCheck, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "@/components/ui";
import { colors } from "@/lib/theme/tokens";
import type { ProfileResponse } from "@/lib/api/hooks";

function ProfileAvatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "E";
  return (
    <View style={{ width: 96, height: 96 }}>
      <LinearGradient
        colors={["#6ee7b7", "#818cf8", "#a78bfa"]}
        style={{ width: 96, height: 96, borderRadius: 48, padding: 3, alignItems: "center", justifyContent: "center" }}
      >
        <View className="h-full w-full overflow-hidden rounded-full bg-[#0d130d]">
          {image ? (
            <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-3xl font-sans-bold text-white/90">{initial}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      <View
        className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-black"
        style={{ backgroundColor: colors.echoGreen }}
      >
        <BadgeCheck size={15} color="#05210f" />
      </View>
    </View>
  );
}

export function ProfileHero({ user, connectedDate }: { user: ProfileResponse["user"]; connectedDate: string }) {
  return (
    <GlassCard padding="lg" rounded="2xl">
      <View className="items-center">
        <ProfileAvatar name={user.name} image={user.avatarUrl} />

        <View
          className="mt-5 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
          style={{ borderColor: "rgba(24,216,126,0.2)", backgroundColor: "rgba(24,216,126,0.1)" }}
        >
          <ShieldCheck size={12} color={colors.echoGreen} />
          <Text className="text-[10px] font-sans-bold uppercase tracking-widest2" style={{ color: colors.echoGreen }}>
            Spotify connected
          </Text>
        </View>

        <Text className="mt-4 text-[12px] font-sans-semibold uppercase tracking-widest2 text-white/35">
          {user.name}
        </Text>
        <Text className="mt-1 text-center text-[22px] font-sans-bold text-white">Your Music Identity</Text>
        <Text className="mt-2 text-center text-[13px] text-white/45">
          A profile shaped by your listening journey.
        </Text>

        <View className="mt-5 w-full divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-black/25">
          {[
            { label: "Account age", value: user.accountAge },
            { label: "Plan", value: user.spotifyProduct },
            { label: "Connected", value: connectedDate },
          ].map(({ label, value }) => (
            <View key={label} className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-[13px] text-white/40">{label}</Text>
              <Text numberOfLines={1} className="text-[13px] font-sans-semibold capitalize text-white">
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}
