import { View, StyleSheet } from "react-native";
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
    <View style={styles.grid}>
      {GENRES.map((genre) => (
        <Pill key={genre} label={genre} variant="spotify" selected={selected.includes(genre)} onPress={() => onToggle(genre)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
