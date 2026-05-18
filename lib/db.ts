import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

// Cache shape — store the promise so concurrent calls share one connection attempt
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Survives Next.js hot-reloads in dev; reset between cold-starts in prod
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  // 1. Already connected and connection is alive — return immediately
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // 2. Stale/disconnected cached reference — clear it so we reconnect
  if (cache.conn && mongoose.connection.readyState !== 1) {
    cache.conn    = null;
    cache.promise = null;
  }

  // 3. No in-flight promise — start one
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,   // fail fast — no silent queuing
      maxPoolSize: 10,         // reuse connections across serverless invocations
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  // 4. Await the shared promise (concurrent callers all wait on the same one)
  cache.conn = await cache.promise;
  return cache.conn;
}