import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.FIELDMI1_KV_KV_REST_API_URL!,
  token: process.env.FIELDMI1_KV_KV_REST_API_TOKEN!,
});

  export default redis;
  export { redis }   

  export async function getFieldMI1() {
  const raw = await redis.get('fieldmi1');

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('Error parsing Redis value for fieldmi1:', err);
    return null;
  }
}
