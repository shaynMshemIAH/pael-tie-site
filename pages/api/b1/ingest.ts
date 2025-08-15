import type { NextApiRequest, NextApiResponse } from 'next';

type Sample = { device_id?: string; ts?: string; [k: string]: any };

const BUFLEN = 500;
const buf: Sample[] = [];
function push(s: Sample){ buf.push(s); if (buf.length > BUFLEN) buf.shift(); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ error:'Use POST' }); }
  try {
    const ct = req.headers['content-type'] || '';
    if (!ct.includes('application/json')) return res.status(400).json({ ok:false, error:'Content-Type must be application/json' });

    const sample = req.body as Sample;
    if (typeof sample.ts !== 'string' || typeof sample.device_id !== 'string')
      return res.status(400).json({ ok:false, error:'Missing ts or device_id' });

    push(sample);
    return res.status(200).json({ ok:true });
  } catch (e: any) {
    return res.status(400).json({ ok:false, error:String(e?.message||e) });
  }
}

// expose same module buffer to the reader:
export function _getA1Buffer(){ return buf; }
