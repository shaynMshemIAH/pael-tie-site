import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });

  const bearer = (req.headers.authorization || "").startsWith("Bearer ")
    ? (req.headers.authorization as string).slice(7)
    : "";
  const token = (req.headers["x-ingest-token"] as string) || bearer;

  if (token !== process.env.FIELD01_INGEST_TOKEN) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  // Do your normal persist/stream/broadcast here. For now, echo.
  const body = req.body;
  return res.status(200).json({ ok: true, received: body?.timestamp ?? null });
}
