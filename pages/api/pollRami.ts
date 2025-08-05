import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = JSON.parse(req.body);
  const filePath = path.join(process.cwd(), 'public', 'polls.json');

  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {}

  existing.push(data);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  res.status(200).json({ status: 'ok' });
}
