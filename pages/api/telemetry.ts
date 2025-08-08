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

type ProxyOut = RecentResponse | SummaryResponse | { error: string; detail?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProxyOut>
) {
  const base = process.env.CUDAQ_API_BASE;
  const key = process.env.COE_API_KEY;

  if (!base || !key) {
    return res
      .status(500)
      .json({ error: "server-misconfig", detail: "Missing CUDAQ_API_BASE or COE_API_KEY" });
  }

  const path =
    typeof req.query.path === "string" && (req.query.path === "summary" || req.query.path === "recent")
      ? req.query.path
      : "recent";

  const nRaw = typeof req.query.n === "string" ? Number(req.query.n) : NaN;
  const n = Number.isFinite(nRaw) ? Math.min(2000, Math.max(1, Math.trunc(nRaw))) : 50;

  try {
    const url = path === "summary" ? `${base}/summary` : `${base}/recent?n=${encodeURIComponent(String(n))}`;
    const r = await fetch(url, { headers: { "x-api-key": key } });
    const text = await r.text();

    try {
      const parsed: ProxyOut = JSON.parse(text);
      return res.status(r.status).json(parsed);
    } catch {
      return res.status(502).json({ error: "invalid-json", detail: text });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({ error: "proxy-fail", detail: msg });
  }
}
