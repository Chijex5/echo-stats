import mongoose, { Schema, model, models } from "mongoose";

const UserImportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    favoriteGenres: [String],
    favoriteArtists: [String],
    country: String,
    timezone: String,

    spotifyImported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.UserImport || model("UserImport", UserImportSchema);