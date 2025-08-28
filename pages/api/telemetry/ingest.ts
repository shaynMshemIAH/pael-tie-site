// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import Redis from "ioredis";

const INGEST_TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN?.trim() || "";
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

/**
 * Validate Authorization Token
 */
function isTokenValid(token: string): boolean {
  const expected = Buffer.from(INGEST_TOKEN);
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

/**
 * Telemetry Ingest API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow POST only
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Validate Bearer token
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!INGEST_TOKEN || !isTokenValid(token)) {
    console.warn("AUTH FAIL", { received: token });
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    // Parse body
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const payload = rawBody.payload ?? rawBody;
    const fieldType =
      (rawBody.type || rawBody.stream || payload.field_id || "unknown")?.toLowerCase();

    // Validate payload
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    // Save telemetry to Redis
    const redisKey = `telemetry:${fieldType}`;
    const data = { ts: Date.now(), ...payload };
    await redis.set(redisKey, JSON.stringify(data));

    console.log(`[REDIS] Stored telemetry under ${redisKey}`);

    // Respond success
    return res.status(200).json({ ok: true, stored: fieldType });
  } catch (err: any) {
    console.error("INGEST ERROR:", err);
    return res.status(400).json({ ok: false, error: err?.message || "Malformed request body" });
  }
}
