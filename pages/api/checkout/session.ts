// pages/api/checkout/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { BYE_TIERS } from "../../../lib/byeConfig";
import { quotePrice, Role } from "../../../lib/pricing";
import { buildRedis } from "../../../lib/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // quick env sanity
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe not configured" });

  try {
    const { sku, role = "rich", region = "rich" } = req.body as {
      sku: keyof typeof BYE_TIERS;
      role: Role;
      region: "rich" | "poor";
    };

    if (!sku || !(sku in BYE_TIERS)) return res.status(400).json({ error: "Invalid sku" });
    if (role === "enlisted") return res.status(403).json({ error: "Enlisted cannot pay; use sequence enlistment flow" });

    const { unitAmount, currency, display } = quotePrice(sku, { role, region });
    if (unitAmount <= 0) return res.status(400).json({ error: "Tier is zero-priced; use enlistment or contract flow" });

    const tier = BYE_TIERS[sku];

    // Build origin from request (works on Vercel + local, avoids hardcoding)
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = req.headers.host as string;
    const origin = process.env.SITE_URL || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // include session_id and disable vercel toolbar in the return URL
      success_url: `${origin}/bye/success?sku=${sku}&session_id={CHECKOUT_SESSION_ID}&vercelToolbar=false`,
      cancel_url: `${origin}/bye/cancel?sku=${sku}&vercelToolbar=false`,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: tier.label,
              description: `${tier.description} • ${tier.sequences} sequences`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      // helpful for reconciliation
      client_reference_id: `${sku}:${role}:${region}`,
      metadata: {
        sku,
        role,
        region,
        sequences: String(tier.sequences),
        traversal: tier.traversal,
      },
    });

    // Mirror a pending intent in Redis for your ledger
    try {
      const r = buildRedis();
      await r.set(
        `bye:pending:${session.id}`,
        JSON.stringify({
          sku,
          role,
          region,
          amount: unitAmount,
          currency,
          status: "pending",
          sessionId: session.id,
        }),
        "EX",
        60 * 60 * 24
      );
    } catch (e) {
      // non-fatal: don’t break checkout if Redis hiccups
      console.warn("ledger mirror failed:", (e as Error).message);
    }

    return res.status(200).json({ checkoutUrl: session.url, displayAmount: display });
  } catch (err) {
    console.error("checkout error", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
}
