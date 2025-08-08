import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    status: "Study bwCOE was visualized-able",
    message: "RAMI AGI at LdD Node AutomatedActived",
  });
}
