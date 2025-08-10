/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/telemetry/fieldb1.tsx
import { useEffect, useState } from 'react';

export default function FieldB1Live() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry/fieldb1', { method: 'GET' });
        const json = await res.json();
        setData(json);
      } catch {}
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">FieldB1 Live Telemetry</h1>
      <pre className="mt-4 p-4 rounded bg-gray-100 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

