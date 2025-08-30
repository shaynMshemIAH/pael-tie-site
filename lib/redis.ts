// lib/redis.ts
import Redis from "ioredis";

let client: any = null;

/** Build (or return) a singleton Redis client */
export function buildRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }
  client = new Redis(url);
  return client;
}

/** Convenience singleton for files that import { redis } */
export const redis = buildRedis();
