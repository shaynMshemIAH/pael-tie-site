import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false } };

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const base = process.env.COE_API_BASE;
  if (!base) return res.status(500).json({ ok: false, error: "COE_API_BASE not set" });

  const sub = Array.isArray(req.query.path) ? req.query.path.join("/") : "";
  const url = `${base}/${sub}`.replace(/\/+$/,"");

  try {
    const raw = await readRawBody(req);
    const headers: Record<string, string> = {};
    if (req.headers["content-type"]) headers["content-type"] = String(req.headers["content-type"]);

    const key = process.env.COE_API_KEY;
    if (key) headers["authorization"] = `Bearer ${key}`;

    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: ["GET","HEAD"].includes(req.method || "GET") ? undefined : raw,
    });

    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!["content-encoding","transfer-encoding","connection"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.send(buf);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "rami proxy failed" });
  }
}
