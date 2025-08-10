/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

type Sensors = Record<string, number | boolean | string>;
type Latest = Partial<{
  sensors: Sensors;
  most_recent: { sensors?: Sensors };
  timestamp_iso: string;
  receivedAt: string;
  gateway_received_ts: number;
}> & Record<string, any> | null;

function usePolling(path: string, ms = 1000) {
  const [data, setData] = useState<Latest>(null);
  useEffect(() => {
    let live = true;
    const tick = async () => {
      try {
        const r = await fetch(path, { cache: "no-store" });
        const j = await r.json();
        if (live) setData(j as Latest);
      } catch {}
    };
    tick();
    const t = setInterval(tick, ms);
    return () => { live = false; clearInterval(t); };
  }, [path, ms]);
  return data;
}

function extractSensors(latest: Latest): Sensors | null {
  if (!latest) return null;
  if (latest.sensors) return latest.sensors;
  if (latest.most_recent?.sensors) return latest.most_recent.sensors ?? null;

  // fallback: treat flat payload as sensors (skip metadata)
  const ignore = new Set([
    "field","device","device_id","ts","timestamp","timestamp_iso","receivedAt",
    "gateway_received_ts","labels","nonlinear_time","ok","count","most_recent","_raw"
  ]);
  const out: Sensors = {};
  for (const [k,v] of Object.entries(latest)) {
    if (!ignore.has(k) && (typeof v === "number" || typeof v === "boolean" || typeof v === "string")) out[k] = v as any;
  }
  return Object.keys(out).length ? out : null;
}

export default function FieldB1Live() {
  const latest = usePolling("/api/telemetry/fieldb1", 1000);
  const sensors = extractSensors(latest);
  const ts = latest?.timestamp_iso ?? latest?.receivedAt ??
    (latest?.gateway_received_ts ? new Date((latest.gateway_received_ts as number)*1000).toISOString() : undefined);
  const age = ts ? Math.max(0, Math.round((Date.now()-new Date(ts).getTime())/1000)) : null;
  const live = !!sensors;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">FieldB1 — Live Telemetry</h1>
        <div className="rounded-2xl shadow p-5 bg-white border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-semibold">Latest sensors</span>
            <span className={`px-2 py-1 rounded text-sm ${live ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {live ? "LIVE" : "IDLE"}
            </span>
          </div>

          {!sensors ? (
            <div className="text-gray-400 text-sm">No data yet…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">sensor</th>
                    <th className="py-2">value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sensors).map(([k, v]) => (
                    <tr key={k} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 text-gray-700">{k}</td>
                      <td className="py-2 font-medium">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            {age !== null ? <>updated {age}s ago</> : <>waiting for first sample…</>}
          </div>
        </div>
      </div>
    </main>
  );
}
