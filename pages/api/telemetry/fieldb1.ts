import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const fieldId = body.field_id || 'fieldb1';

      // Normalize timestamp
      const timestamp = body.timestamp
        ? new Date(body.timestamp).toISOString()
        : new Date().toISOString();

      const payload = {
        ...body,
        field_id: fieldId,
        timestamp,
      };

      // Save cleanly
      await redis.set(`telemetry:${fieldId}`, JSON.stringify(payload));

      return res.status(200).json({ msg: 'Saved to Redis', field_id: fieldId });
    } catch (err) {
      return res.status(500).json({ msg: 'Redis save failed', error: err });
    }
  }

  if (req.method === 'GET') {
    try {
      const fieldId = req.query.field_id || 'fieldb1';
      const key = `telemetry:${fieldId}`;
      const data = await redis.get(key);

      if (!data) {
        return res.status(404).json({ hasData: false, msg: 'No data found' });
      }

      const parsed = JSON.parse(data);

      // Ultrasonic: convert meters → cm at the API level
      if (parsed.sensors?.ultrasonic !== undefined) {
        parsed.sensors.ultrasonic = parsed.sensors.ultrasonic * 100;
      }

      // Keep backward-compatible samples array AND provide direct access for UI
      return res.status(200).json({
        timestamp: parsed.timestamp,
        sensors: parsed.sensors,
        samples: [
          {
            ts: parsed.timestamp,
            sensors: parsed.sensors,
          },
        ],
      });
    } catch (err) {
      return res.status(500).json({ msg: 'Redis read failed', error: err });
    }
  }

  return res.status(405).json({ msg: 'Method Not Allowed' });
}
