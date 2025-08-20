// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// --- Timing-safe comparison ---
function safeEq(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

// --- Env Secret ---
const AUTH = process.env.SITE_TOKEN_SECRET?.trim() ?? "";

// --- Handler ---
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Method check ---
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // --- Authorization header ---
  const auth = (req.headers.authorization || "").trim();
  if (!AUTH || !auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ ok: false, error: "Bad token" });
  }

  // --- Auth token check ---
  const presented = auth.slice(7).trim();
  if (!safeEq(presented, AUTH)) {
    return res.status(401).json({ ok: false, error: "Bad token" });
  }

  // --- Body parsing ---
  const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const payload = raw.payload ?? raw;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ ok: false, error: "Missing/invalid payload" });
  }

  // --- Extract type for telemetry indexing ---
  // Can use .type, .stream, or fallback to .field_id
  const type = (raw.type ?? raw.stream ?? payload.field_id ?? "unknown").toLowerCase();

  // --- Normalize key and store globally ---
  (globalThis as any)._LATEST_ ||= {};
  (globalThis as any)._LATEST_[type] = {
    ts: Date.now(),
    ...payload
  };

  return res.status(200).json({ ok: true, stored: type });
}
