import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArtistGenre extends Document {
  /** Normalized: lowercase + trimmed — the join key from StreamEntry.artistName */
  artistName: string;
  spotifyArtistId: string;
  /** Raw genre strings from the Spotify artist object */
  spotifyGenres: string[];
  /** Mapped to our DNA node IDs ("soul", "rnb", "hiphop", …) */
  normalizedGenres: string[];
  fetchedAt: Date;
}

const ArtistGenreSchema = new Schema<IArtistGenre>(
  {
    artistName:       { type: String, required: true, unique: true, index: true },
    spotifyArtistId:  { type: String, default: "" },
    spotifyGenres:    { type: [String], default: [] },
    normalizedGenres: { type: [String], default: [] },
    fetchedAt:        { type: Date, default: Date.now },
  },
  { collection: "artist_genres" }
);

// TTL: re-fetch stale entries after 30 days so evolving artists stay current
ArtistGenreSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ArtistGenre: Model<IArtistGenre> =
  mongoose.models.ArtistGenre ??
  mongoose.model<IArtistGenre>("ArtistGenre", ArtistGenreSchema);

export default ArtistGenre;