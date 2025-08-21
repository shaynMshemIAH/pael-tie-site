// lib/safeAuth.ts
import crypto from 'crypto';
import type { NextApiRequest } from 'next';

export function safeAuth(req: NextApiRequest, expected: string): boolean {
  const header = (req.headers.authorization || "").trim();
  if (!header.toLowerCase().startsWith("bearer ")) return false;

  const token = header.slice(7).trim();
  const A = Buffer.from(expected);
  const B = Buffer.from(token);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}
