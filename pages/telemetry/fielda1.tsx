// pages/telemetry/fielda1.tsx and fieldb1.tsx
import type { GetServerSideProps } from 'next';

type Json = Record<string, unknown>;
type Props = { data: Json };

export default function Page({ data }: Props) {
  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://${ctx.req.headers.host}`;
  const res = await fetch(`${base}/api/telemetry/fielda1`, { cache: 'no-store' }); // change to fieldb1 on that page
  const data = (await res.json()) as Json;
  return { props: { data } };
};
