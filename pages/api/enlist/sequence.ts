import type { NextApiRequest, NextApiResponse } from "next";
import { BYE_TIERS } from "../../../lib/byeConfig";
import { buildRedis } from "../../../lib/redis";

export default async function enlistHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { sku, userId, releaseDate } = req.body as { sku: keyof typeof BYE_TIERS; userId: string; releaseDate: string };
    if (!sku || !(sku in BYE_TIERS)) return res.status(400).json({ error: "Invalid sku" });
    if (!userId || !releaseDate) return res.status(400).json({ error: "Missing userId or releaseDate" });

    const tier = BYE_TIERS[sku];
    const r = buildRedis();
    const id = `escrow:sequence:${userId}:${Date.now()}`;
    await r.hset(id, {
      sku,
      sequences: String(tier.sequences),
      releaseDate,
      status: "reserved",
    });
    await r.expire(id, 60 * 60 * 24 * 120);
    return res.status(200).json({ ok: true, id });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Enlist failed" });
  }
}
