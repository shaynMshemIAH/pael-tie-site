/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';

const TOKEN =
  process.env.B1_SITE_TOKEN ||
  process.env.PAEL_TIE_SITE_INGEST_TOKEN ||
  'dev-token';

let latest: any = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(latest ?? { ok: false });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = (req.headers.authorization as string) || '';
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!supplied || supplied !== TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const sensors =
    (typeof body.sensors === 'object' && body.sensors !== null)
      ? (body.sensors as Record<string, unknown>)
      : Object.fromEntries(
          Object.entries(body).filter(([k, v]) =>
            !['field','device','device_id','ts','timestamp','timestamp_iso','receivedAt','gateway_received_ts','labels','nonlinear_time'].includes(k) &&
            (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string')
          )
        );

  latest = {
    field: (body as any).field ?? 'FieldB1',
    timestamp_iso:
      (body as any).timestamp_iso ??
      (body as any).timestamp ??
      (body as any).ts ??
      new Date().toISOString(),
    sensors,
    labels: (body as any).labels ?? null,
    nonlinear_time: (body as any).nonlinear_time ?? null,
    gateway_received_ts: (body as any).gateway_received_ts ?? null,
  };

  return res.status(200).json({ ok: true });
}
