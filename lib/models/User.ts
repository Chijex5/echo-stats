import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  spotifyId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  country?: string;
  spotifyProduct?: string;       // "free" | "premium"
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;        // Unix ms
  onboardingCompleted: boolean;
  // App-specific fields populated at /import
  favoriteGenres?: string[];
  bio?: string;
  // Last time this user uploaded a streaming-history export (initial import
  // or re-sync) — drives the "re-sync due" nudge on web and mobile.
  lastImportAt?: Date;
  // Mobile session revocation counter — bumped on logout to invalidate
  // every outstanding mobile refresh token for this user.
  mobileTokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    spotifyId:           { type: String, required: true, unique: true, index: true },
    email:               { type: String, required: true, unique: true, index: true },
    displayName:         { type: String, required: true },
    avatarUrl:           { type: String },
    country:             { type: String },
    spotifyProduct:      { type: String },
    accessToken:         { type: String, required: true },
    refreshToken:        { type: String, required: true },
    tokenExpiresAt:      { type: Number, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    // App-specific
    favoriteGenres:      [{ type: String }],
    bio:                 { type: String, maxlength: 500 },
    lastImportAt:        { type: Date },
    mobileTokenVersion:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent model recompilation in Next.js dev hot-reload
const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;