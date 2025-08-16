import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

const KEY = 'telemetry:a1'
const BUFLEN = 500

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const n = Math.max(1, Math.min(Number(req.query.n ?? 1), BUFLEN))
      const items = await kv.lrange(KEY, 0, n - 1)
      const parsed = items.map((s) => JSON.parse(String(s)))
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ ok: true, items: parsed })
    } catch (e: any) {
      console.error('[a1/ingest GET] error', e)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ error: 'Use POST or GET' })
  }

  try {
    const body = (req.body ?? {}) as any
    const sensors =
      body.sensors && Object.keys(body.sensors).length
        ? body.sensors
        : {
            o2: body.o2 ?? null,
            pressure: body.pressure ?? null,
            temperature: body.temperature ?? null,
            altitude: body.altitude ?? null,
          }
    const field  = body.field  || 'FieldA1'
    const device = body.device || body.device_id || 'A1'
    const unified = { ...body, field, device, sensors }

    await kv.lpush(KEY, JSON.stringify(unified))
    await kv.ltrim(KEY, 0, BUFLEN - 1)

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    console.error('[a1/ingest POST] error', e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
