// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const INGEST_TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN?.trim() || "";

function isTokenValid(token: string): boolean {
  const expected = Buffer.from(INGEST_TOKEN);
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!INGEST_TOKEN || !isTokenValid(token)) {
    console.log("AUTH FAIL", { received: token, expected: INGEST_TOKEN });
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const payload = rawBody.payload ?? rawBody;
    const fieldType =
      (rawBody.type || rawBody.stream || payload.field_id || "unknown")?.toLowerCase();

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    // Store in in-memory global (for quick debug only)
    (globalThis as any)._LATEST_ ||= {};
    (globalThis as any)._LATEST_[fieldType] = {
      ts: Date.now(),
      ...payload,
    };

    console.log("TOKEN ON SERVER:", INGEST_TOKEN);
    console.log("PAYLOAD:", payload);

    return res.status(200).json({ ok: true, stored: fieldType });
  } catch (err: any) {
    return res.status(400).json({
      ok: false,
      error: err?.message || "Malformed request body",
    });
  }
}
