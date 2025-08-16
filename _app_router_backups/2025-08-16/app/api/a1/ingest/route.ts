// app/api/a1/ingest/route.ts
import { kv } from '@vercel/kv';

export const runtime = 'edge';

function ok(auth: string | null) {
  const token = process.env.A1_TOKEN;              // set in Vercel env
  if (!token) return false;
  if (!auth) return false;
  // accept either: Authorization: Bearer <token> or x-ingest-token: <token>
  const raw = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return raw.trim() === token.trim();
}

export async function POST(req: Request) {
  const auth =
    req.headers.get('authorization') ?? req.headers.get('x-ingest-token');

  if (!ok(auth)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad token' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  // normalize a minimal shape
  const record = {
    field: body.field ?? 'FieldA1',
    device_id: body.device_id ?? 'A1',
    ts: body.ts ?? new Date().toISOString(),
    sensors: body.sensors ?? {
      o2: body.o2,
      temperature: body.temperature,
      pressure: body.pressure,
      altitude: body.altitude,
    },
    raw: body,
  };

  // write both a rolling list and a latest pointer (same pattern as B1)
  await kv.set('telemetry:a1:latest', record);
  await kv.lpush('telemetry:a1', record);
  await kv.ltrim('telemetry:a1', 0, 199); // keep last 200

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
