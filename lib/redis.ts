// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!);

async function getField(fieldKey: string) {
  const raw = await redis.get(fieldKey.toLowerCase());
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error(`Error parsing Redis value for ${fieldKey}:`, err);
    return null;
  }
}

export const getFieldMI1 = () => getField('fieldmi1');
export const getFieldB1 = () => getField('fieldb1');
export const getFieldA1 = () => getField('fielda1');
export const getField01 = () => getField('field01');

export async function POST(req: Request) {
  const body = await req.json();
  const { field } = body;

  if (!field) {
    return new Response(JSON.stringify({ error: 'Missing field key' }), { status: 400 });
  }

  await redis.set(field.toLowerCase(), JSON.stringify(body));

  return new Response(JSON.stringify({
    message: `${field} data endpoint`,
    timestamp: new Date().toISOString(),
  }), { status: 200 });
}
