k// pages/api/telemetry/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import Redis from "ioredis";
import path from "path";
import { spawn } from "child_process";

const INGEST_TOKEN = process.env.PAEL_TIE_SITE_INGEST_TOKEN?.trim() || "";
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

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
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!INGEST_TOKEN || !isTokenValid(token)) {
    console.warn("AUTH FAIL", { received: token });
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

    // Save original telemetry data to Redis
    const redisKey = `telemetry:${fieldType}`;
    const data = { ts: Date.now(), ...payload };

    if (payload.nh3_entropy && payload.nh3_entropy > 0.3) {
      console.log(`[ALERT] High NH3 entropy detected from ${payload.field_id}`);
    }

    await redis.set(redisKey, JSON.stringify(data));
    console.log(`[REDIS] Stored telemetry under ${redisKey}`);

    // Quantum digestion only if payload contains NH3 entropy or lux data
    if (payload.nh3_entropy !== undefined || payload.lux !== undefined) {
      const quantumPath = path.resolve("./quantum_digestion.py");
      const py = spawn("python3", [quantumPath, JSON.stringify(payload)]);

      let digest = "";
      py.stdout.on("data", (chunk) => (digest += chunk));
      py.stderr.on("data", (err) => console.error("[QUANTUM ERR]", err.toString()));

      py.on("close", async () => {
        try {
          const quantum_result = digest ? JSON.parse(digest) : {};
          await redis.set(
            `quantum:${fieldType}`,
            JSON.stringify({
              ts: Date.now(),
              field_id: fieldType,
              quantum_result,
            })
          );
          console.log(`[REDIS] Stored quantum digest for ${fieldType}`);
        } catch (err) {
          console.error("Quantum Result Parse Error:", err);
        }
      });
    }

    return res.status(200).json({ ok: true, stored: fieldType });
  } catch (err: any) {
    console.error("INGEST ERROR:", err);
    return res.status(400).json({ ok: false, error: err?.message || "Malformed request body" });
  }
}
