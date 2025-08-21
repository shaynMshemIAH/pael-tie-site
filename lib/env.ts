import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.FIELDMI1_KV_URL!,
  token: process.env.FIELDMI1_KV_REST_TOKEN!,
});

export const Env = {
  INGEST_TOKEN: (process.env.PAEL_TIE_SITE_INGEST_TOKEN ?? '').trim(),
};
