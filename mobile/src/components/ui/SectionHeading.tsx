import { View, Text } from "react-native";
import { EyebrowLabel } from "./EyebrowLabel";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  label?: string;
  title: string;
  accentWord?: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionHeading({ label, title, accentWord, subtitle, align = "left" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <View className={centered ? "items-center" : "items-start"}>
      {label ? <EyebrowLabel className="mb-2">{label}</EyebrowLabel> : null}
      <Text className={cn("text-2xl font-sans-bold text-white", centered && "text-center")}>
        {title}
        {accentWord ? <Text className="font-serif italic text-echo-green"> {accentWord}</Text> : null}
      </Text>
      {subtitle ? (
        <Text className={cn("mt-1.5 text-13 text-white/45", centered && "text-center")}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
