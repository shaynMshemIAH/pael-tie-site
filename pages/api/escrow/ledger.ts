import type { NextApiRequest, NextApiResponse } from "next";
import { buildRedis } from "../../../lib/redis";

export default async function ledgerHandler(req: NextApiRequest, res: NextApiResponse) {
  const r = buildRedis();
  const keys = [
    ...(await r.keys("escrow:money:*")),
    ...(await r.keys("escrow:sequence:*")),
  ];
  const items: any[] = [];
  for (const k of keys) {
    const h = await r.hgetall(k);
    const type = k.startsWith("escrow:money:") ? "money" : "sequence";
    items.push({ type, ...h });
  }
  res.json({ items });
}
