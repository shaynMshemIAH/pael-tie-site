/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

type Sensors = Record<string, number | boolean | string>;
type Latest =
  | (Partial<{
      field: string;
      timestamp_iso: string;
      timestamp: string;
      ts: string | number;
      sensors: Sensors;
      most_recent: { sensors?: Sensors };
      receivedAt: string;
      gateway_received_ts: number;
    }> &
      Record<string, unknown>)
  | null;

function usePolling(path: string, everyMs = 1000) {
  const [data, setData] = useState<Latest>(null);
  useEffect(() => {
    let live = true;
    const pull = async () => {
      try {
        const r = await fetch(path, { method: 'GET', cache: 'no-store' });
        const j = (await r.json()) as Latest;
        if (live) setData(j);
      } catch {
        /* ignore */
      }
    };
    pull();
    const t = setInterval(pull, everyMs);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [path, everyMs]);
  return data;
}

function extractSensors(latest: Latest): Sensors | null {
  if (!latest) return null;
  if (latest.sensors) return latest.sensors as Sensors;
  if (latest.most_recent?.sensors) return latest.most_recent.sensors ?? null;

  const ignore = new Set([
    'field',
    'device',
    'device_id',
    'ts',
    'timestamp',
    'timestamp_iso',
    'receivedAt',
    'gateway_received_ts',
    'labels',
    'nonlinear_time',
    'ok',
    'count',
    'most_recent',
    '_raw',
  ]);
  const out: Sensors = {};
  for (const [k, v] of Object.entries(latest)) {
    if (!ignore.has(k) && (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string')) {
      out[k] = v as Sensors[string];
    }
  }
  return Object.keys(out).length ? out : null;
}

function when(latest: Latest): string | null {
  const t =
    latest?.timestamp_iso ??
    (latest?.receivedAt as string | undefined) ??
    (latest?.gateway_received_ts
      ? new Date((latest.gateway_received_ts as number) * 1000).toISOString()
      : undefined);
  return t ?? null;
}

function SensorTable({ sensors }: { sensors: Sensors | null }) {
  if (!sensors) return <div className="text-gray-400 text-sm">No data yet…</div>;
  return (
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
  );
}

function FieldCard({ title, apiPath }: { title: string; apiPath: string }) {
  const data = usePolling(apiPath, 1000);
  const sensors = extractSensors(data);
  const ts = when(data);
  const live = !!sensors;
  const ageSec = ts ? Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000)) : null;

  return (
    <div className="rounded-2xl shadow p-5 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className={`px-2 py-1 rounded text-sm ${live ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {live ? 'LIVE' : 'IDLE'}
        </span>
      </div>
      <SensorTable sensors={sensors} />
      <div className="mt-3 text-xs text-gray-500">
        {ageSec !== null ? <>updated {ageSec}s ago</> : <>waiting for first sample…</>}
      </div>
    </div>
  );
}

export default function TelemetryDashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Live Telemetry</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <FieldCard title="FieldA1" apiPath="/api/telemetry/fielda1" />
          <FieldCard title="FieldB1" apiPath="/api/telemetry/fieldb1" />
        </div>
      </div>
    </main>
  );
}
