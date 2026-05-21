import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic imports AFTER env is loaded
const { default: User } = await import("./lib/models/User.js");
const { connectDB } = await import("./lib/db.js");
const { spawnSync } = await import("child_process");

await connectDB();
const users = await User.find({}, { _id: 1 }).lean();

for (const user of users) {
  console.log(`\n=== Enriching user ${user._id} ===`);
  spawnSync("npx", ["tsx", "lib/enrichStreamEntries.ts"], {
    shell: true,
    env: { ...process.env, ENRICH_USER_ID: user._id.toString() },
    stdio: "inherit",
  });
}