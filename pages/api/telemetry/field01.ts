// pages/api/telemetry/field01.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("http://192.168.1.214:8124/live/Field01.json");
    const raw = await response.json();

    const sample = raw.data || raw; // Support both formats

    const formatted = {
      hasData: true,
      data: {
        timestamp: sample.timestamp ?? new Date().toISOString(),
        sensors: {
          lux: sample.sensors?.lux ?? "N/A",
          temp_amb_c: sample.sensors?.temp_amb_c ?? "N/A",
          temp_obj_c: sample.sensors?.temp_obj_c ?? "N/A",
          delta_t_c: sample.sensors?.delta_t_c ?? "N/A",
          mag_x: sample.sensors?.mag_x ?? "N/A",
          mag_y: sample.sensors?.mag_y ?? "N/A",
          mag_z: sample.sensors?.mag_z ?? "N/A",
          bearing_deg: sample.sensors?.bearing_deg ?? "N/A",
        },
      },
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch Field01 telemetry:", error);
    res.status(500).json({ error: "Unable to fetch telemetry data" });
  }
}
