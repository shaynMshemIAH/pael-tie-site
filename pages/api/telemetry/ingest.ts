// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";

const AUTH = process.env.PAEL_TIE_SITE_INGEST_TOKEN || "";

// Simple in-memory cache (works like your A1/B1 dev pattern)
const latest: Record<string, any> = (global as any).__LATEST__ || {};
(global as any).__LATEST__ = latest;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  if (!AUTH || auth !== `Bearer ${AUTH}`) return res.status(401).json({ ok: false, error: "Bad token" });

  try {
    const { type, payload } = req.body || {};
    if (!type || !payload) return res.status(400).json({ ok: false, error: "Missing type/payload" });

    // Save latest by type (A1/B1/fieldmi1 etc.)
    latest[type] = { ts: Date.now(), payload };

    return res.status(200).json({ ok: true, stored: type });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "ingest failed" });
  }
}
