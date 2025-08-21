// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// --- Strict ENV token ---
const FIELD_GATE_TOKEN = process.env.FIELD_GATE_TOKEN?.trim() || "";

// --- Timing-safe token match ---
function isTokenValid(token: string): boolean {
  const expected = Buffer.from(FIELD_GATE_TOKEN);
  const received = Buffer.from(token);
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method check
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Auth check
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!FIELD_GATE_TOKEN || !isTokenValid(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    // Parse incoming JSON
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const payload = rawBody.payload ?? rawBody;
    const fieldType =
      (rawBody.type ||
        rawBody.stream ||
        payload.field_id ||
        "unknown")?.toLowerCase();

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    // Store in in-memory global (for debugging only)
    (globalThis as any)._LATEST_ ||= {};
    (globalThis as any)._LATEST_[fieldType] = {
      ts: Date.now(),
      ...payload,
    };

    return res.status(200).json({ ok: true, stored: fieldType });
  } catch (err: any) {
    return res.status(400).json({
      ok: false,
      error: err?.message || "Malformed request body",
    });
  }
}
