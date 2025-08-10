import type { NextApiRequest, NextApiResponse } from "next";

type TelemetryItem = {
  device_id?: string;
  ts?: string;
  o2?: number;
  temperature?: number;
  pressure?: number;
  altitude?: number;
};

type RecentResponse = { count: number; items: TelemetryItem[] };
type SummaryResponse = {
  count: number;
  latest_ts?: string;
  latest_device?: string | null;
  latest_o2?: number;
  latest_temp?: number;
  latest_pressure?: number;
  latest_altitude?: number;
};

type ProxyOut = RecentResponse | SummaryResponse | { error: string; detail?: string };

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProxyOut>) {
  const base = process.env.COE_API_BASE;
  const key = process.env.COE_API_KEY;

  if (!base || !key) {
    return res.status(500).json({
      error: "server-misconfig",
      detail: "Missing COE_API_BASE or COE_API_KEY",
    });
  }

  // path = "summary" | "recent"
  const pathParam = typeof req.query.path === "string" ? req.query.path : undefined;
  const path: "summary" | "recent" = pathParam === "summary" ? "summary" : "recent";

  // n for /recent
  const nRaw = typeof req.query.n === "string" ? Number(req.query.n) : NaN;
  const n = Number.isFinite(nRaw) ? Math.max(1, Math.min(2000, Math.trunc(nRaw))) : 50;

  // build upstream URL
  const url =
    path === "summary" ? `${base}/summary` : `${base}/recent?n=${encodeURIComponent(String(n))}`;

  // No caching in Next/edge/CDN
  res.setHeader("Cache-Control", "no-store");

  // timeout guard
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": key,
        "cache-control": "no-store",
      },
      signal: controller.signal,
    });
    clearTimeout(t);

    const text = await r.text();

    // Try to pass JSON through; if upstream sends HTML (tunnel error), return a helpful message.
    try {
      const parsed = JSON.parse(text) as ProxyOut;
      return res.status(r.ok ? 200 : r.status).json(parsed);
    } catch {
      const debug = req.query.debug === "1";
      return res
        .status(502)
        .json(debug ? ({ error: "proxy-fail", detail: text } as ProxyOut) : { error: "proxy-fail", detail: "unexpected JSON shape" });
    }
  } catch (e) {
    clearTimeout(t);
    return res.status(504).json({ error: "proxy-timeout", detail: String(e) });
  }
}
