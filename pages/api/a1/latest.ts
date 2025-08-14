import type { NextApiRequest, NextApiResponse } from 'next';
import { _getA1Buffer } from './ingest';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const all = _getA1Buffer();
  // optional limit query ?n=100
  const n = Math.max(0, Math.min(+(req.query.n ?? 200), 500));
  const slice = all.slice(-n);
  // stable JSON shape; no throws
  res.status(200).json({ count: slice.length, samples: slice });
}

