import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST method: Save to Redis
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const fieldId = payload.field_id ?? req.query.field;

      if (!fieldId) {
        return res.status(400).json({ msg: "Missing field_id in payload or query" });
      }

      await redis.set(fieldId, JSON.stringify(payload));
      return res.status(200).json({ msg: "Saved to Redis", field_id: fieldId });
    } catch (err) {
      return res.status(500).json({ msg: "Redis save failed", error: err });
    }
  }

  // GET method: Retrieve from Redis
  if (req.method === 'GET') {
    try {
      const fieldId = req.query.field_id as string;

      if (!fieldId) {
        return res.status(400).json({ msg: "Missing field_id in query" });
      }

      const data = await redis.get(fieldId);
      if (!data) {
        return res.status(404).json({ hasData: false, msg: "No data found" });
      }

      const parsed = JSON.parse(data);
      return res.status(200).json({
        samples: [
          {
            ts: parsed.timestamp ?? new Date().toISOString(),
            sensors: parsed.sensors ?? {},
          },
        ],
      });
    } catch (err) {
      return res.status(500).json({ msg: "Redis read failed", error: err });
    }
  }

  // Method not allowed
  return res.status(405).json({ msg: "Method not allowed" });
}
