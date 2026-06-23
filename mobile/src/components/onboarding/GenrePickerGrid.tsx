import { View } from "react-native";
import { Pill } from "@/components/ui";

export const GENRES = [
  "Pop", "Hip-Hop", "Rock", "R&B", "Afrobeats",
  "Jazz", "Electronic", "Classical", "Soul",
  "Amapiano", "Indie", "Gospel", "Drill", "Reggae",
];

type GenrePickerGridProps = {
  selected: string[];
  onToggle: (genre: string) => void;
};

export function GenrePickerGrid({ selected, onToggle }: GenrePickerGridProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {GENRES.map((genre) => (
        <Pill
          key={genre}
          label={genre}
          variant="spotify"
          selected={selected.includes(genre)}
          onPress={() => onToggle(genre)}
        />
      ))}
    </View>
  );
}
