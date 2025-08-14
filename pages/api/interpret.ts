// pages/api/interpret.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { interpretationSchema } from '@/lib/telemetry/schema';
import { addInterpretation } from '@/lib/telemetry/store';

const TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN!;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (req.headers.authorization !== `Bearer ${TOKEN}`) return res.status(401).json({ error: 'Unauthorized' });

    const parsed = interpretationSchema.parse(req.body);
    addInterpretation(parsed);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.errors ?? String(e) });
  }
}
