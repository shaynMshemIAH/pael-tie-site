import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const keys = await redis.keys('*');
    const data = await Promise.all(
      keys.map(async (key) => {
        const value = await redis.get(key);
        return { key, value };
      })
    );

    return res.status(200).json({ keys: data });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching Redis keys', details: err });
  }
}
