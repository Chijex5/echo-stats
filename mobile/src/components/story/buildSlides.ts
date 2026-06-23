import type { StoryModeResponse } from "@/lib/api/hooks";
import type { DecorationKey } from "./decorations";

export type StorySlide = {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  imageUrl?: string;
  decoration: DecorationKey;
  showWave?: boolean;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function buildSlides(data: StoryModeResponse): StorySlide[] {
  return [
    {
      id: 1,
      label: "Top Song",
      title: data.topSong.title,
      subtitle: data.topSong.subtitle,
      accent: "#18d87e",
      imageUrl: data.topSong.albumImageUrl,
      decoration: "vinyl",
      showWave: true,
    },
    {
      id: 2,
      label: "Top Artist",
      title: data.topArtist.title,
      subtitle: data.topArtist.subtitle,
      accent: "#60a5fa",
      imageUrl: data.topArtist.artistImageUrl,
      decoration: "equalizer",
      showWave: true,
    },
    {
      id: 3,
      label: "Music Age",
      title: data.musicAge.year,
      subtitle: data.musicAge.subtitle,
      accent: "#a78bfa",
      decoration: "rings",
    },
    {
      id: 4,
      label: "Favorite Era",
      title: data.favoriteEra.title,
      subtitle: data.favoriteEra.subtitle,
      accent: "#f59e0b",
      decoration: "era",
    },
    {
      id: 5,
      label: "Forgotten Favorite",
      title: data.forgottenFavorite.title,
      subtitle: data.forgottenFavorite.subtitle,
      accent: "#ec4899",
      imageUrl: data.forgottenFavorite.albumImageUrl,
      decoration: "cassette",
    },
    {
      id: 6,
      label: "Emotional Month",
      title: data.emotionalMonth.month ? MONTH_NAMES[data.emotionalMonth.month - 1] ?? "—" : "—",
      subtitle: data.emotionalMonth.subtitle,
      accent: "#fb7185",
      decoration: "heartbeat",
    },
    {
      id: 7,
      label: "Hidden Gem",
      title: data.hiddenGem?.trackName ?? "Still digging",
      subtitle: data.hiddenGem ? `${data.hiddenGem.artistName} · ${data.hiddenGem.plays} plays` : "Keep listening to surface one.",
      accent: "#22d3ee",
      imageUrl: data.hiddenGem?.albumImageUrl,
      decoration: "diamond",
    },
    {
      id: 8,
      label: "Personality",
      title: data.personality.title,
      subtitle: data.personality.subtitle,
      accent: "#34d399",
      decoration: "fingerprint",
    },
  ];
}
