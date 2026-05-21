"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    spotifyId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String },
    country: { type: String },
    spotifyProduct: { type: String },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiresAt: { type: Number, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    // App-specific
    favoriteGenres: [{ type: String }],
    bio: { type: String, maxlength: 500 },
}, { timestamps: true });
// Prevent model recompilation in Next.js dev hot-reload
var User = (_a = mongoose_1.default.models.User) !== null && _a !== void 0 ? _a : mongoose_1.default.model("User", UserSchema);
exports.default = User;
