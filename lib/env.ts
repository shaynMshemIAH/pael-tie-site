function pick(...keys: string[]) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim() !== '') return v;
  }
  return '';
}

export const Env = {
  // site ingest tokens (for Next.js API auth)
  A1_TOKEN: pick('A1_SITE_TOKEN', 'NEW_A1_SITE_TOKEN'),
  B1_TOKEN: pick('B1_SITE_TOKEN', 'NEW_B1_SITE_TOKEN'),
  INGEST_TOKEN: pick('PAEL_TIE_SITE_INGEST_TOKEN', 'NEW_PAEL_TIE_SITE_TOKEN'),

  // device shared keys (Pi <-> Mac), not used by site routes
  A1_SHARED_KEY: pick('A1_SHARED_KEY', 'NEW_COE_API_KEY'),
  B1_SHARED_KEY: pick('B1_SHARED_KEY', 'NEW_FIELD_GATE_TOKEN', 'NEW_FIELDS_GATE_TOKEN'),

  // base url (client only if NEXT_PUBLIC_)
  COE_API_BASE: pick('NEXT_PUBLIC_COE_API_BASE', 'COE_API_BASE'),
};
