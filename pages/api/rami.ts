import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res || typeof res.status !== "function") {
    console.warn("API build phase — response object not available.");
    return;
  }

  // ✅ Safe to respond
  res.status(200).json({
    status: "ok",
    message: "RAMI Node Active",
  });
}
