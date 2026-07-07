import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { colors, alpha, fontSize, trackingWidest2, radius } from "@/lib/theme/tokens";
import { colorForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod, TimelinePageTrack } from "@/lib/api/hooks";

const COVER = 32;
const RAIL_W = 26;
const DOT = 10;

type YearRailProps = {
  periods: TimelinePagePeriod[];
  yearHours: Array<{ year: string; v: number }>;
};

function ArtCluster({ tracks }: { tracks: TimelinePageTrack[] }) {
  const arts = tracks.slice(0, 3);
  if (!arts.length) return null;
  return (
    <View style={{ flexDirection: "row" }}>
      {arts.map((t, i) =>
        t.albumImageUrl ? (
          <Image key={`${t.title}-${i}`} source={{ uri: t.albumImageUrl }} style={[styles.cover, i > 0 && styles.coverOverlap]} />
        ) : (
          <View
            key={`${t.title}-${i}`}
            style={[styles.cover, i > 0 && styles.coverOverlap, { backgroundColor: colorForKey(t.title) }]}
          />
        )
      )}
    </View>
  );
}

// The archive: every month as a node on a vertical rail, newest first,
// grouped under big year headers (Spotify library style). Tapping a month
// reopens it inline — story line, top songs, top artist — no navigation.
export function YearRail({ periods, yearHours }: YearRailProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const years = [...new Set(periods.map((p) => p.year))].sort((a, b) => b - a);
  const hoursFor = (year: number) => yearHours.find((y) => y.year === String(year))?.v;

  return (
    <View>
      {years.map((year) => {
        const months = periods.filter((p) => p.year === year).sort((a, b) => b.monthIdx - a.monthIdx);
        const yh = hoursFor(year);
        return (
          <View key={year}>
            <View style={styles.yearRow}>
              <Text style={styles.yearText}>{year}</Text>
              {yh ? <Text style={styles.yearHours}>{yh}h of music</Text> : null}
            </View>

            {months.map((p, mi) => {
              const isOpen = expanded === p.id;
              const dotColor = colorForKey(p.topGenre);
              return (
                <View key={p.id} style={styles.monthRow}>
                  <View style={styles.railCol}>
                    <View style={[styles.railLine, mi === months.length - 1 && { bottom: 14 }]} />
                    <View
                      style={[
                        styles.railDot,
                        { backgroundColor: dotColor },
                        isOpen && { width: DOT + 4, height: DOT + 4, borderRadius: (DOT + 4) / 2 },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={() => setExpanded((cur) => (cur === p.id ? null : p.id))}
                    style={[styles.monthBody, isOpen && styles.monthBodyOpen]}
                  >
                    <View style={styles.monthHead}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.monthName, isOpen && { color: colors.white }]}>{p.monthName}</Text>
                        <Text numberOfLines={1} style={styles.monthMeta}>
                          {p.topGenre} · {p.totalHours}h · {p.uniqueArtists} artists
                        </Text>
                      </View>
                      <ArtCluster tracks={p.tracks} />
                    </View>

                    {isOpen ? (
                      <MotiView
                        from={{ opacity: 0, translateY: -6 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 220 }}
                        style={styles.expand}
                      >
                        {p.story ? <Text style={styles.story}>{p.story.line}</Text> : null}

                        <View style={styles.moodRow}>
                          <View style={[styles.moodDot, { backgroundColor: colorForKey(p.mood) }]} />
                          <Text style={styles.moodText}>
                            Felt {p.mood.toLowerCase()} · {p.moodScore.toFixed(1)} / 10
                          </Text>
                        </View>

                        {p.tracks.length ? (
                          <View style={styles.tracks}>
                            {p.tracks.map((track, i) => (
                              <View key={`${track.title}-${i}`} style={styles.trackRow}>
                                <Text style={styles.trackIndex}>{i + 1}</Text>
                                {track.albumImageUrl ? (
                                  <Image source={{ uri: track.albumImageUrl }} style={styles.trackThumb} />
                                ) : (
                                  <View style={[styles.trackThumb, { backgroundColor: colorForKey(track.title) }]} />
                                )}
                                <View style={{ flex: 1, minWidth: 0 }}>
                                  <Text numberOfLines={1} style={styles.trackTitle}>
                                    {track.title}
                                  </Text>
                                  <Text numberOfLines={1} style={styles.trackArtist}>
                                    {track.artist}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : null}

                        <View style={styles.artistRow}>
                          {p.topArtistImageUrl ? (
                            <Image source={{ uri: p.topArtistImageUrl }} style={styles.artistAvatar} />
                          ) : (
                            <View style={[styles.artistAvatar, { backgroundColor: colorForKey(p.topArtist) }]} />
                          )}
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={styles.artistLabel}>On repeat</Text>
                            <Text numberOfLines={1} style={styles.artistName}>
                              {p.topArtist}
                            </Text>
                          </View>
                        </View>
                      </MotiView>
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  yearRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  yearText: { fontSize: fontSize[24], fontFamily: "GeistSansBold", color: colors.white },
  yearHours: { fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.4) },

  monthRow: { flexDirection: "row" },
  railCol: { width: RAIL_W, alignItems: "center" },
  railLine: {
    position: "absolute",
    top: 0,
    bottom: -14,
    width: 2,
    borderRadius: 1,
    backgroundColor: alpha.white(0.07),
  },
  railDot: {
    marginTop: 14,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },

  monthBody: { flex: 1, marginLeft: 10, marginBottom: 14, borderRadius: radius["2xl"], padding: 12 },
  monthBodyOpen: { backgroundColor: colors.surface },
  monthHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  monthName: { fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: alpha.white(0.9) },
  monthMeta: { marginTop: 2, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },

  cover: {
    width: COVER,
    height: COVER,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  coverOverlap: { marginLeft: -12 },

  expand: { marginTop: 12 },
  story: {
    fontSize: fontSize[12],
    fontFamily: "PlayfairDisplayItalic",
    fontStyle: "italic",
    lineHeight: fontSize[12] * 1.45,
    color: alpha.white(0.6),
  },
  moodRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  moodDot: { width: 6, height: 6, borderRadius: 3 },
  moodText: { fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.55) },

  tracks: { marginTop: 12, gap: 10 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackIndex: { width: 14, fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.25) },
  trackThumb: { width: 36, height: 36, borderRadius: 6 },
  trackTitle: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.4) },

  artistRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 12,
  },
  artistAvatar: { width: 32, height: 32, borderRadius: 16 },
  artistLabel: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  artistName: { marginTop: 1, fontSize: fontSize[12], fontFamily: "GeistSansSemiBold", color: colors.white },
});
