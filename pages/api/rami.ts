import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res) {
    console.warn("API build phase — no response object available.");
    return;
  }

  // Your real-time response logic
  res.status(200).json({
    status: "ok",
    message: "RAMI Node Active",
  });
}
