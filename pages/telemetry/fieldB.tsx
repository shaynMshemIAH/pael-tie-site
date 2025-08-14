
// pages/telemetry/fieldB.tsx
import useSWR from 'swr';
const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function FieldB() {
  const { data } = useSWR('/api/field/B', fetcher, { refreshInterval: 1500 });
  const status = data?.status ?? [];
  const readings = data?.readings ?? [];
  const interps = data?.interpretations ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Field B</h1>

      <section>
        <h2 className="text-lg font-medium mb-2">Sensors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {status.length === 0 ? (
            <div className="text-sm text-neutral-500 italic">No sensors registered yet.</div>
          ) : status.map((s:any)=>(
            <div key={s.sensorId} className="rounded-2xl p-4 border shadow-sm">
              <div className="text-sm text-neutral-500">{s.sensorId}</div>
              <div className="text-lg">{s.displayName ?? s.type}</div>
              <div className={`text-xs mt-1 ${s.online?'text-green-600':'text-neutral-400'}`}>
                {s.online ? 'online' : 'offline'}
              </div>
              <div className="text-sm mt-2">
                {readings.find((r:any)=>r.sensorId===s.sensorId)
                  ? (()=>{ const r=readings.find((r:any)=>r.sensorId===s.sensorId)!; return <span>{r.value} {r.unit} @ {new Date(r.ts).toLocaleTimeString()}</span>; })()
                  : <span className="text-neutral-400">No reading yet</span>
                }
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Interpretations</h2>
        {interps.length === 0 ? (
          <div className="text-sm text-neutral-500 italic">None yet.</div>
        ) : (
          <div className="space-y-3">
            {interps.map((i:any)=>(
              <div key={i.id} className="rounded-2xl p-4 border shadow-sm">
                <div className="text-sm text-neutral-500">{i.sensorId}</div>
                <div className="font-medium">{i.title}</div>
                <div className="text-sm">{i.message}</div>
                <div className="text-xs text-neutral-400 mt-1">{new Date(i.ts).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
