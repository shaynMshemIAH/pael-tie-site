import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!client.isOpen) await client.connect();

    // Get latest telemetry for all four fields from Redis cache
    const keys = ["fielda1", "field01", "fieldb1", "fieldmi1"];
    const results = await Promise.all(keys.map((k) => client.get(k)));

    const response = results.reduce((acc, data, i) => {
      if (data) {
        acc[keys[i]] = JSON.parse(data);
      }
      return acc;
    }, {} as Record<string, any>);

    res.status(200).json(response);
  } catch (err: any) {
    console.error("Redis fetch error:", err);
    res.status(500).json({ error: "Failed to fetch telemetry data" });
  } finally {
    if (client.isOpen) client.disconnect();
  }
}
