// pages/telemetry/fieldmi1.tsx

import { useEffect, useState } from 'react';

export default function FieldMI1Telemetry() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/telemetry/fieldmi1');
        const json = await res.json();
        if (!res.ok) throw new Error(json.msg);
        setData(json.samples[0]);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading telemetry...</p>;
  if (error || !data) return <p>Error fetching telemetry.</p>;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>FieldMI1 Telemetry</h1>
      <p><strong>Timestamp:</strong> {data.ts}</p>

      <ul>
        {Object.entries(data.sensors).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {JSON.stringify(value)}
          </li>
        ))}
      </ul>
    </main>
  );
}
