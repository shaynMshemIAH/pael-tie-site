// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

function pick(...keys: string[]) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim() !== "") return v.trim();
  }
  return "";
}
function safeEq(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

const AUTH = pick("PAEL_TIE_SITE_INGEST_TOKEN", "SITE_INGEST_TOKEN");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // --- auth ---
  const auth = (req.headers.authorization || "").trim(); // "Bearer <token>"
  if (!AUTH || !auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ ok: false, error: "Bad token" });
  }
  const presented = auth.slice(7).trim();
  if (!safeEq(presented, AUTH)) {
    return res.status(401).json({ ok: false, error: "Bad token" });
  }

  // --- body normalisation ---
  const raw = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const type =
    raw.type ??
    raw.stream ??
    raw.field_id ??
    "unknown";

  const payload = raw.payload ?? raw;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ ok: false, error: "Missing/invalid payload" });
  }

  // simple in-memory cache (dev pattern)
  const g = global as any;
  g.__LATEST__ = g.__LATEST__ || {};
  g.__LATEST__[type] = { ts: Date.now(), payload };

  return res.status(200).json({ ok: true, stored: type });
}
