import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const store = (globalThis as any)._LATEST_ || {};
  const keys = Object.keys(store);
  const summaries = keys.map(k => ({
    key: k,
    ts: store[k]?.ts,
    field_id: store[k]?.field_id,
  }));
  res.status(200).json({ ok: true, keys: summaries });
}
