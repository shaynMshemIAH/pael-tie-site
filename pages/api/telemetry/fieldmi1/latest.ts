// pages/api/telemetry/fieldmi1/latest.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const liveDir = path.join(process.cwd(), 'data', 'live');  // Or wherever FastAPI saved it
  const filePath = path.join(liveDir, 'fieldmi1.json');

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.status(200).json({ hasData: true, data });
  } catch (err) {
    res.status(404).json({ hasData: false, msg: 'Data not found' });
  }
}
