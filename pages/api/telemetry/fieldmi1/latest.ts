import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from "../../../../lib/redis"; // Make sure this path is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  const data = await redis.get("fieldmi1_latest");

  if (data) {
    return res.status(200).json({ hasData: true, data: JSON.parse(data) });
  } else {
    return res.status(404).json({ hasData: false, msg: "No data found for fieldmi1 or fieldmi1:latest" });
  }
}
