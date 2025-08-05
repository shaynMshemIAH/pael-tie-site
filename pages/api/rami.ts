import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId, imageId } = req.query;

  // You can log or validate them if needed
  console.log('sessionId:', sessionId, 'imageId:', imageId);

  res.status(200).json({
    ldd: 'LdD21(+5D1)',
    zrasw: '0.67 (2-week duration)',
    fieldInfo: 'Reflectance dominant, refractance fading',
    agiMessage: 'Your BWemc² currently reflects tragic choice, decay dome confirmed. Leaf_PLT options remain open.'
  });
}
