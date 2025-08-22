// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!);

export const Env = {
  INGEST_TOKEN: (process.env.PAEL_TIE_SITE_INGEST_TOKEN ?? '').trim(),
};
