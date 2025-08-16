// pages/api/telemetry/fielda1.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

export const config = { runtime: 'nodejs' }

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('KV env missing')
    }
    const items = await kv.lrange('telemetry:a1', 0, 0)
    const latest = items.length ? JSON.parse(String(items[0])) : null
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(latest ?? { ok: false })
  } catch (e:any) {
    console.error('[fielda1] read error', { name: e?.name, msg: e?.message })
    // optional: fallback to ingest GET so the page still works even if KV is down
    try {
      const resp = await fetch(`${process.env.VERCEL_URL?.startsWith('http')?process.env.VERCEL_URL:'https://pael-tie-site.vercel.app'}/api/a1/ingest?n=1`)
      const data = await resp.json()
      const latest = (data.items && data.items[0]) || null
      return res.status(200).json(latest ?? { ok: false })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
