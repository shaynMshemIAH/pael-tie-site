// pages/api/telemetry/fieldmi1.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    hasData: true,
    data: {
      timestamp: new Date().toISOString(),
      sensors: {
        analog_v: 420,
        lux: 95,
        laser_triggered: true,
        mag_x: 0.1,
        mag_y: 0.2,
        mag_z: 0.3,
      },
    },
  });
}
