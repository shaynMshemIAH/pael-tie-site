// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getFieldMI1() {
  const raw = await redis.get('fieldmi1');

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('Error parsing Redis value for fieldmi1:', err);
    return null;
  }
}

export async function getFieldB1() {
  const raw = await redis.get('fieldb1');

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('Error parsing Redis value for fieldb1:', err);
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { field } = body;

  if (!field) {
    return new Response(JSON.stringify({ error: 'Missing field key' }), { status: 400 });
  }

  await redis.set(field, body);

  return new Response(JSON.stringify({
    message: `${field} data endpoint`,
    timestamp: new Date().toISOString(),
  }), { status: 200 });
}
