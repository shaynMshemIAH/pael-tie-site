// pages/api/a1/latest.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

export const config = { runtime: 'nodejs' }

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const items = await kv.lrange('telemetry:a1', 0, 0)
    const latest = items.length ? JSON.parse(String(items[0])) : null
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ ok: true, item: latest })
  } catch (e:any) {
    // optional: fallback via our own ingest GET
    try {
      const base = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://pael-tie-site.vercel.app'
      const r = await fetch(`${base}/api/a1/ingest?n=1`)
      const j = await r.json()
      const latest = j.items?.[0] ?? null
      return res.status(200).json({ ok: true, item: latest, source: 'fallback' })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
