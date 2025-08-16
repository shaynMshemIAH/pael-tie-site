// app/api/telemetry/fielda1/route.ts
import { kv } from '@vercel/kv';
export const runtime = 'edge';

export async function GET() {
  const latest = await kv.get('telemetry:a1:latest');
  if (!latest) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true, ...latest }), {
    headers: { 'content-type': 'application/json' },
  });
}
