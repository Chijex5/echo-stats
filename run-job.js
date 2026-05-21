"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ".env.local" });
// Dynamic imports AFTER env is loaded
var User = (await Promise.resolve().then(function () { return require("./lib/models/User.js"); })).default;
var connectDB = (await Promise.resolve().then(function () { return require("./lib/db.js"); })).connectDB;
var execSync = (await Promise.resolve().then(function () { return require("child_process"); })).execSync;
await connectDB();
var users = await User.find({}, { _id: 1 }).lean();
for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
    var user = users_1[_i];
    console.log("\n=== Enriching user ".concat(user._id, " ==="));
    execSync("npx tsx lib/enrichStreamEntries.ts", {
        env: __assign(__assign({}, process.env), { ENRICH_USER_ID: user._id.toString() }),
        stdio: "inherit",
    });
}
