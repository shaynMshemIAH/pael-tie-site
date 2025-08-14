import { useEffect, useMemo, useState } from "react";

interface Sample {
  device_id?: string;
  ts?: string;                  // ISO timestamp
  o2?: number | null;
  pressure?: number | null;
  temperature?: number | null;
  altitude?: number | null;
  [k: string]: unknown;         // allow extra keys without using `any`
}

interface LatestResp {
  count: number;
  samples: Sample[];
}

async function fetchLatest(n = 200): Promise<LatestResp> {
  const r = await fetch(`/api/a1/latest?n=${n}`, { cache: "no-store" });
  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = (await r.json()) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return (await r.json()) as LatestResp;
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function FieldA() {
  const [data, setData] = useState<Sample[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        const j = await fetchLatest(200);
        if (mounted) {
          setData(j.samples ?? []);
          setError(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (mounted) setError(msg);
      }
    };

    tick();
    const id: ReturnType<typeof setInterval> = setInterval(tick, 1500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // dynamic columns based on union of keys in the data
  const columns = useMemo<string[]>(() => {
    const keys = new Set<string>(["ts", "device_id"]);
    for (const s of data) for (const k of Object.keys(s)) keys.add(k);
    return Array.from(keys);
  }, [data]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>
        Field A — Raw Feed (photoautotrophic)
      </h1>
      <p style={{ color: "#666" }}>
        Raw samples as printed by the Pi. No interpretation.
      </p>

      {error && (
        <div style={{ color: "crimson", marginTop: 12 }}>Error: {error}</div>
      )}
      {data.length === 0 && !error && (
        <div style={{ color: "#888", marginTop: 12 }}>No samples yet.</div>
      )}

      {data.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "1px solid #e5e5e5",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data
                .slice()
                .reverse()
                .map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          fontFamily: "menlo, monospace",
                        }}
                      >
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
