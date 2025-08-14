// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { registrationSchema } from '@/lib/telemetry/schema';
import { upsertRegistration } from '@/lib/telemetry/store';

const TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN!;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (req.headers.authorization !== `Bearer ${TOKEN}`) return res.status(401).json({ error: 'Unauthorized' });

    const parsed = registrationSchema.parse(req.body);
    upsertRegistration(parsed);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.errors ?? String(e) });
  }
}
