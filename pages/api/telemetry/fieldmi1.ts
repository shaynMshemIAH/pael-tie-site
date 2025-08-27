import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = req.body;
    const fieldId = body.field_id;
    
    try {

      const payload = {
        ...body,
        timestamp: body.timestamp || Date.now(), // Fallback if Pi doesn't send one
      };

      await redis.set(`telemetry:${fieldId}`, JSON.stringify(body));
      return res.status(200).json({ msg: "Saved to Redis", field_id: fieldId });
    } catch (err) {
      return res.status(500).json({ msg: "Redis save failed", error: err });
    }
  }

  if (req.method === 'GET') {
    const { field_id } = req.query;
    const key = `telemetry:${field_id || "fieldmi1"}`;

    try {
        const data = await redis.get(key);
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

  return res.status(405).json({ msg: "Method Not Allowed" });
}
 
