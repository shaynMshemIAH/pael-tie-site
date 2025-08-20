// pages/api/interpret.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { interpretationSchema } from '../../lib/telemetry/schema';
import fs from 'fs';
import path from 'path';

export function addInterpretation(parsed: any) {
  const filePath = path.resolve('./pages/api/interpreted_output.json');

  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      existing = JSON.parse(content);
    } catch (err) {
      console.error("Failed to read existing JSON:", err);
    }
  }

  existing.push(parsed);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  (global as any).__LATEST__ = {
    ...((global as any).__LATEST__ || {}),
    fieldmi1: {
      ts: Date.now(),
      payload: parsed,
    },
  };
}

const TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN!;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parsed = interpretationSchema.parse(req.body);
    addInterpretation(parsed);

    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("Interpretation error:", e);
    res.status(400).json({ ok: false, error: e.errors ?? String(e) });
  }
}
