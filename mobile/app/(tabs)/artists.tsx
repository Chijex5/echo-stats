import { View, Text } from "react-native";
import { SectionHeading } from "@/components/ui";

export default function ArtistsScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 72 }}>
      <SectionHeading label="Coming soon" title="Artists" />
      <Text className="mt-4 text-[13px] text-white/40">This screen is being built next.</Text>
    </View>
  );
}
