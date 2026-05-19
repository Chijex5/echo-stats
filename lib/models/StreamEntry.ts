import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStreamEntry extends Document {
  userId: mongoose.Types.ObjectId;
  ts: Date;
  platform: string;
  msPlayed: number;
  trackName: string;
  artistName: string;
  albumName: string;
  spotifyTrackUri: string;
  reasonStart: string;
  reasonEnd: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  releaseYear?: number;
  releaseDatePrecision?: "year" | "month" | "day" | null;
  releaseYearConfidence?: number | null;
}

const StreamEntrySchema = new Schema<IStreamEntry>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ts:              { type: Date, required: true },
    platform:        { type: String },
    msPlayed:        { type: Number, required: true },
    trackName:       { type: String, required: true },
    artistName:      { type: String, required: true },
    albumName:       { type: String },
    spotifyTrackUri: { type: String, required: true },
    reasonStart:     { type: String },
    reasonEnd:       { type: String },
    shuffle:         { type: Boolean },
    skipped:         { type: Boolean },
    offline:         { type: Boolean },
    releaseYear:     { type: Number },
    releaseDatePrecision: { type: String, enum: ["year", "month", "day", null], default: null },
    releaseYearConfidence: { type: Number, min: 0, max: 1, default: null },
  },
  {
    // No timestamps — ts IS the timestamp
    collection: "stream_entries",
  }
);

// Deduplicate: same user + same track + same exact timestamp = same play event
StreamEntrySchema.index({ userId: 1, ts: 1, spotifyTrackUri: 1 }, { unique: true });

// Common query patterns
StreamEntrySchema.index({ userId: 1, ts: -1 });
StreamEntrySchema.index({ userId: 1, spotifyTrackUri: 1 });
StreamEntrySchema.index({ userId: 1, artistName: 1 });

const StreamEntry: Model<IStreamEntry> =
  mongoose.models.StreamEntry ??
  mongoose.model<IStreamEntry>("StreamEntry", StreamEntrySchema);

export default StreamEntry;
