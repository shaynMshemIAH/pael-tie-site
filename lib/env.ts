// lib/env.ts
function pick(...keys: string[]) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim() !== '') return v.trim();
  }
  return '';
}

export const Env = {
  A1_TOKEN: pick('A1_SITE_TOKEN', 'NEW_A1_SITE_TOKEN'),
  B1_TOKEN: pick('B1_SITE_TOKEN', 'NEW_B1_SITE_TOKEN'),
  INGEST_TOKEN: pick('PAEL_TIE_SITE_INGEST_TOKEN', 'NEW_PAEL_TIE_SITE_TOKEN'),
} as const;
