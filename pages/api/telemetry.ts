import type { NextApiRequest, NextApiResponse } from "next";

type TelemetryItem = {
  device_id: string;
  ts: string;
  o2?: number;
  temperature?: number;
  pressure?: number;
  altitude?: number;
};

type RecentResponse = { count: number; items: TelemetryItem[] };
type SummaryResponse =
  | { count: 0 }
  | {
      count: number;
      latest_ts: string;
      latest_o2?: number;
      latest_temp?: number;
      latest_pressure?: number;
      latest_altitude?: number;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecentResponse | SummaryResponse | { error: string; detail?: string }>
) {
  const base = process.env.CUDAQ_API_BASE;
  const key = process.env.COE_API_KEY;

  if (!base || !key) {
    return res.status(500).json({ error: "server-misconfig", detail: "Missing CUDAQ_API_BASE or COE_API_KEY" });
  }

  // path = "recent" | "summary" (default recent)
  const path = (typeof req.query.path === "string" && (req.query.path === "summary" || req.query.path === "recent"))
    ? req.query.path
    : "recent";

  // n for recent (default 50, clamp 1..2000)
  const nRaw = typeof req.query.n === "string" ? Number(req.query.n) : NaN;
  const n = Number.isFinite(nRaw) ? Math.min(2000, Math.max(1, Math.trunc(nRaw))) : 50;

  try {
    const url = path === "summary" ? `${base}/summary` : `${base}/recent?n=${encodeURIComponent(String(n))}`;
    const r = await fetch(url, { headers: { "x-api-key": key } });

    const text = await r.text();
    // Pass through CUDA-Q JSON verbatim to avoid shape drift
    res.status(r.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: "proxy-fail", detail: msg });
  }
}
