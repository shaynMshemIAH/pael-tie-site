/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
// use a RELATIVE import to avoid alias issues in prod
import { Env } from '../../../lib/env';

export const config = { runtime: 'nodejs' };

let latest: any = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const TOKEN = Env.A1_TOKEN || Env.INGEST_TOKEN || '';

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(latest ?? { ok: false });
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const supplied = ((req.headers.authorization as string) || '').replace(/^Bearer\s+/i, '');
    if (!TOKEN || supplied !== TOKEN) {
      console.log('[fielda1] 403', { haveToken: !!TOKEN, suppliedLen: supplied.length });
      return res.status(403).json({ error: 'Forbidden' });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const sensors =
      typeof (body as any).sensors === 'object' && body.sensors !== null ? (body as any).sensors : {};

    latest = {
      field: (body as any).field ?? 'FieldA1',
      timestamp_iso:
        (body as any).timestamp_iso ??
        (body as any).timestamp ??
        (body as any).ts ??
        new Date().toISOString(),
      sensors,
      labels: (body as any).labels ?? null,
      nonlinear_time: (body as any).nonlinear_time ?? null,
      gateway_received_ts: (body as any).gateway_received_ts ?? null,
      device: (body as any).device ?? (body as any).device_id ?? null,
    };

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[fielda1] 500:', err?.message || err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
