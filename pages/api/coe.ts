import type { NextApiRequest, NextApiResponse } from "next";

interface CoePayload {
  field: "LdD1" | "LdD2";
  zrasw_progress: number; // 0–1 within ZraSW
  seconds_active_today: number; // 0–86400
  i_score_over_25: number; // -2, -1, 0, or 1
  laws_score: number[]; // length 25, each -2 to +1
  mpa_sunrise_sunset_phase?: number; // radians 0–2π
  naf_sue_phase?: number; // radians 0–2π
  nh3_entropy?: number; // 0–1
  nh4_enthalpy?: number; // 0–1
  vsepr_symmetry?: boolean;
}

interface CoeResponse {
  status: string;
  message: string;
  receivedData?: CoePayload;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CoeResponse>
) {
  if (req.method === "POST") {
    try {
      const data: CoePayload = req.body as CoePayload;

      // Run COE BW logic here in the future
      return res.status(200).json({
        status: "ok",
        message: "COE BW data received and processed",
        receivedData: data,
      });
    } catch {
      return res.status(400).json({
        status: "error",
        message: "Invalid payload format",
      });
    }
  }

  return res.status(405).json({
    status: "error",
    message: "Method not allowed",
  });
}
