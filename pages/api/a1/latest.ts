import type { NextApiRequest, NextApiResponse } from 'next';
import { _getA1Buffer } from './ingest';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const all = _getA1Buffer();
  const n = Math.max(0, Math.min(+(req.query.n ?? 200), 500));
  res.status(200).json({ count: Math.min(n, all.length), samples: all.slice(-n) });
}
