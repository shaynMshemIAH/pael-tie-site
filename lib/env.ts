// lib/env.ts
export const Env = {
  // Only what the site actually needs to check incoming posts from the gateway:
  INGEST_TOKEN: (process.env.PAEL_TIE_SITE_INGEST_TOKEN ?? '').trim(),
} as const;
