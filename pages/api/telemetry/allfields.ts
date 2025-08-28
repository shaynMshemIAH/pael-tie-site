// pages/api/telemetry/allfields.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });

const FIELD_KEYS = ["fielda1", "field01", "fieldb1", "fieldmi1"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!client.isOpen) await client.connect();

    // Always return a stable shape so the UI can render consistently
    const results = await Promise.all(FIELD_KEYS.map((k) => client.get(k)));
    const payload: Record<string, any> = {};
    FIELD_KEYS.forEach((k, i) => {
      const raw = results[i];
      if (!raw) {
        payload[k] = null;
        return;
      }
      try {
        payload[k] = JSON.parse(raw);
      } catch {
        // If something corrupt slipped into Redis, surface a minimal safe object
        payload[k] = { error: "bad-json", raw };
      }
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(payload);
  } catch (err) {
    console.error("allfields api error:", err);
    res.status(500).json({ error: "Failed to fetch telemetry data" });
  } finally {
    if (client.isOpen) client.disconnect();
  }
}
