import type { TierKey } from "./byeConfig";

export type Role = "rich" | "poor" | "enlisted";

export interface PriceQuote {
  unitAmount: number; // in cents
  currency: string;
  display: string; // e.g., "$5" or "$0.50"
}

// Region-aware "drop zeros" helper (very simple MVP)
function dropZeros(base: number, region: "rich" | "poor"): number {
  return region === "poor" ? Math.max(0.1, base / 10) : base; // e.g., $10 -> $1
}

export function quotePrice(
  sku: TierKey,
  opts: { role: Role; region: "rich" | "poor"; currency?: string } = { role: "rich", region: "rich" }
): PriceQuote {
  const currency = opts.currency ?? "USD";
  const sameLdd = { bye1800: 1, bye5785: 5 } as Record<string, number>;
  const crossLdd = { bye43200: 50, bye86400: 100 } as Record<string, number>;

  if (opts.role === "enlisted") {
    return { unitAmount: 0, currency, display: "$0 (enlisted)" };
  }

  let base = 0;
  if (sku in sameLdd) base = sameLdd[sku];
  if (sku in crossLdd) base = crossLdd[sku];
  if (sku === "cdpd") base = 0; // handled by contract flow

  const regional = dropZeros(base, opts.region);
  const unitAmount = Math.round(regional * 100);
  const display = unitAmount === 0 ? "$0" : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(regional);
  return { unitAmount, currency, display };
}
