import type { NextApiRequest, NextApiResponse } from "next";

type SensorReading = {
  label: string;
  value: string;
};

type FormattedTelemetry = {
  fieldName: string;
  lastUpdated: string;
  readings: SensorReading[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sensors = {
    lux: 338.5396270941052,
    temp_amb_c: 23.700954770594066,
    temp_obj_c: 23.583372777492382,
    delta_t_c: -0.11758199310168393,
    mag_x: -90,
    mag_y: -59,
    mag_z: -53,
    bearing_deg: 213.24706774933586,
  };

  const formatted: FormattedTelemetry = {
    fieldName: "FieldA1",
    lastUpdated: new Date().toISOString(),
    readings: Object.entries(sensors).map(([label, value]) => ({
      label,
      value: value.toFixed(2),
    })),
  };

  res.status(200).json(formatted);
}
