import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/cn";
import { alpha } from "@/lib/theme/tokens";

type ListRowProps = {
  imageUrl?: string | null;
  fallbackGradient?: [string, string];
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  rounded?: "lg" | "full";
};

export function ListRow({
  imageUrl,
  fallbackGradient = [alpha.spotify(0.25), alpha.teal(0.1)],
  title,
  subtitle,
  trailing,
  rounded = "lg",
}: ListRowProps) {
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-lg";
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className={cn("h-12 w-12", roundedClass)} />
      ) : (
        <LinearGradient colors={fallbackGradient} className={cn("h-12 w-12", roundedClass)} />
      )}
      <View className="flex-1">
        <Text numberOfLines={1} className="text-14 font-sans-medium text-white/90">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="mt-0.5 text-12 text-white/45">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
