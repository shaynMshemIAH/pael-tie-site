import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = req.body;
    const fieldId = body.field_id;
    
    try {
      await redis.set(fieldId, JSON.stringify(body));
      return res.status(200).json({ msg: "Saved to Redis", field_id: fieldId });
    } catch (err) {
      return res.status(500).json({ msg: "Redis save failed", error: err });
    }
  }

  if (req.method === 'GET') {
    const { field_id } = req.query;

    try {
      const data = await redis.get(field_id as string);
      if (data) {
        const parsed = JSON.parse(data);

        return res.status(200).json({
          samples: [
            {
              ts: parsed.timestamp ?? new Date().toISOString(),
              sensors: parsed.sensors ?? {},
            },
          ],
        });
      } else {
        return res.status(404).json({ hasData: false, msg: "No data found" });
      }
    } catch (err) {
      return res.status(500).json({ msg: "Redis read failed", error: err });
    }
  }
} 
