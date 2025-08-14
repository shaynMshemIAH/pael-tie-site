import { useEffect, useMemo, useState } from 'react';

type Sample = Record<string, any>;

export default function FieldA() {
  const [data, setData] = useState<Sample[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    const tick = async () => {
      try {
        const r = await fetch('/api/a1/latest?n=200', { cache: 'no-store' });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || r.statusText);
        setData(j.samples || []);
        setError(null);
      } catch (e: any) {
        setError(String(e.message || e));
      }
    };
    tick();
    timer = setInterval(tick, 1500);
    return () => clearInterval(timer);
  }, []);

  // Build dynamic columns from the union of keys
  const columns = useMemo(() => {
    const keys = new Set<string>(['ts', 'device_id']);
    data.forEach(s => Object.keys(s).forEach(k => keys.add(k)));
    return Array.from(keys);
  }, [data]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Field A — Raw Feed (photoautotrophic)</h1>
      <p style={{ color: '#666' }}>Raw samples as printed by the Pi. No interpretation.</p>

      {error && <div style={{ color: 'crimson', marginTop: 12 }}>Error: {error}</div>}
      {data.length === 0 && !error && <div style={{ color: '#888', marginTop: 12 }}>No samples yet.</div>}

      {data.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e5e5' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice().reverse().map((row, i) => (
                <tr key={i}>
                  {columns.map(c => (
                    <td key={c} style={{ padding: '8px 10px', borderBottom: '1px solid #f1f1f1', fontFamily: 'menlo, monospace' }}>
                      {formatCell(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCell(v: any) {
  if (v == null) return <span style={{ color: '#aaa' }}>null</span>;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
