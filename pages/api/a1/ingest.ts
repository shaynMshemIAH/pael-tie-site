import type { NextApiRequest, NextApiResponse } from 'next';

type Sample = {
  device_id?: string;
  ts?: string; // ISO
  [k: string]: any; // pass-through for o2, pressure, etc.
};

// simple in-memory ring buffer
const BUFLEN = 500;
const buf: Sample[] = [];

function push(sample: Sample) {
  buf.push(sample);
  if (buf.length > BUFLEN) buf.shift();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // accept only JSON
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({ ok: false, error: 'Content-Type must be application/json' });
    }

    const sample = req.body as Sample;

    // minimal checks so UI can rely on these two
    if (typeof sample.ts !== 'string' || typeof sample.device_id !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing ts or device_id' });
    }

    push(sample);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    // always JSON; never leak HTML
    return res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
}

// Export getter for the reader route
export function _getA1Buffer() { return buf; }
