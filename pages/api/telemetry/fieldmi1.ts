// pages/api/telemetry/fieldmi1.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Tap the same global cache used by ingest
const latest: Record<string, any> = (global as any).__LATEST__ || {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const entry = latest["fieldmi1"];
  if (!entry) return res.status(200).json({ ok: true, hasData: false, msg: "No FieldMI data yet" });

  return res.status(200).json({
    ok: true,
    ts: entry.ts,
    data: entry.payload,
  });
}
