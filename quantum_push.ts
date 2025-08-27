// pages/api/telemetry/quantum_push.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { field, quantum_result } = req.body;
    if (!field || !quantum_result) throw new Error("Invalid payload");

    // TODO: Store to database
    // e.g., await db.collection("quantum_results").insertOne({ field, quantum_result, ts: Date.now() });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
