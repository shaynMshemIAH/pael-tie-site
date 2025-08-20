// pages/api/telemetry/fieldb1.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    hasData: true,
    data: {
      timestamp: new Date().toISOString(),
      sensors: {
        ultrasonic_cm: 147,
        ammonia_mv: 388,
        motion_triggered: true,
      },
    },
  });
}
