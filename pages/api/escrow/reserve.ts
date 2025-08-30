// pages/api/escrow/reserve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { BYE_TIERS } from "../../../lib/byeConfig";
import { quotePrice, Role } from "../../../lib/pricing";
import { buildRedis } from "../../../lib/redis";

const stripe2 = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

export default async function handlerReserve(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { sku, role = "rich", region = "rich", releaseDate } = req.body as {
      sku: keyof typeof BYE_TIERS;
      role: Role;
      region: "rich" | "poor";
      releaseDate: string;
    };

    if (!sku || !(sku in BYE_TIERS)) return res.status(400).json({ error: "Invalid sku" });
    if (!releaseDate) return res.status(400).json({ error: "Missing releaseDate (ISO)" });
    if (role === "enlisted") return res.status(403).json({ error: "Enlisted cannot pay; use sequence escrow" });

    const { unitAmount, currency } = quotePrice(sku, { role, region });
    if (unitAmount <= 0) return res.status(400).json({ error: "Zero-price tier not eligible for money escrow" });

    const tier = BYE_TIERS[sku];

    // Build origin from the current request (handles prod aliases, custom domains, and local)
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = req.headers.host as string;
    const origin = process.env.SITE_URL || `${proto}://${host}`;

    const session = await stripe2.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/bye/escrow-success?sku=${sku}`,
      cancel_url: `${origin}/bye/cancel?sku=${sku}`,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${tier.label} — Escrow Reserve`,
              description: `Releases on ${releaseDate}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { sku, role, region, releaseDate, escrow: "money" },
    });

    // Mirror in ledger as reserved (webhook will flip to "funded")
    const r = buildRedis();
    const ledgerId = `escrow:money:${session.id}`;
    await r.hset(ledgerId, {
      sku,
      amount: String(unitAmount),
      currency,
      role,
      region,
      releaseDate,
      status: "reserved",
    });
    await r.expire(ledgerId, 60 * 60 * 24 * 120); // 120 days

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Reserve failed" });
  }
}
