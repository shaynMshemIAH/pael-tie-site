// pages/api/field/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFieldState } from '../../lib/telemetry/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as 'A'|'0'|'B'|'MI';
  if (!['A','0','B','MI'].includes(id)) return res.status(400).json({ error: 'Invalid field' });
  // Always returns JSON with arrays—even if empty. Never 500.
  res.status(200).json(getFieldState(id));
}
