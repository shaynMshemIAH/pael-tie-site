export const Env = {
  INGEST_TOKEN: (process.env.PAEL_TIE_SITE_INGEST_TOKEN ?? '').trim(),
} as const;
