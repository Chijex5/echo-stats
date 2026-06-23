import { ScrollView, View } from "react-native";

type HeatmapCell = {
  date: string;
  plays: number;
};

type CalendarHeatmapProps = {
  cells: HeatmapCell[];
  cellSize?: number;
  gap?: number;
};

function intensityColor(pct: number) {
  if (pct <= 0) return "rgba(255,255,255,0.05)";
  const alpha = 0.15 + pct * 0.65;
  return `rgba(24,216,126,${alpha})`;
}

// 53x7 GitHub-style contribution grid. Cells are expected oldest-first,
// chunked into weeks of 7; horizontally scrollable since 53 weeks never
// fits a phone width.
export function CalendarHeatmap({ cells, cellSize = 12, gap = 3 }: CalendarHeatmapProps) {
  const maxPlays = Math.max(1, ...cells.map((c) => c.plays));
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row" style={{ gap }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ gap }}>
            {week.map((cell, di) => (
              <View
                key={cell.date + di}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  backgroundColor: intensityColor(cell.plays / maxPlays),
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
