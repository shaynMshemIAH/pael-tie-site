/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

function useLatest(path: string, intervalMs = 1000) {
  const [data, setData] = React.useState<any | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let stop = false;
    let t: any;

    async function tick() {
      try {
        const r = await fetch(path, { cache: 'no-store' });
        const ct = r.headers.get('content-type') || '';
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`);
        }
        if (!ct.includes('application/json')) {
          const text = await r.text();
          throw new Error(`non-JSON response: ${text.slice(0, 120)}`);
        }
        const j = await r.json();
        if (!stop) {
          setData(j);
          setErr(null);
        }
      } catch (e: any) {
        if (!stop) setErr(e?.message || 'fetch failed');
      } finally {
        if (!stop) t = setTimeout(tick, intervalMs);
      }
    }

    tick();
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [path, intervalMs]);

  return { data, err };
}

export default function FieldA1Page() {
  // IMPORTANT: hit the API route, not the page route
  const { data, err } = useLatest('/api/telemetry/fielda1', 1000);

  return (
    <main style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>FieldA1 — Live Telemetry</h1>
      {err && <div style={{ color: 'crimson' }}>fetch error: {err}</div>}
      {!data ? (
        <div style={{ color: '#666' }}>No data yet…</div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <strong>field:</strong> <code>{data.field ?? 'FieldA1'}</code>{' '}
            <span style={{ opacity: 0.6 }}>|</span>{' '}
            <strong>ts:</strong> <code>{data.timestamp_iso}</code>
          </div>
          <h3>Sensors</h3>
          <pre style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(data.sensors ?? {}, null, 2)}
          </pre>
          <h3>Full payload</h3>
          <pre style={{ background: '#111', color: '#9ef', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}

// DO NOT export getStaticProps / getServerSideProps from this page.
