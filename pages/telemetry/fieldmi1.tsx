import useSWR from "swr";

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function FieldMIPage() {
  const { data, error } = useSWR("/api/telemetry/fieldmi1", fetcher, { refreshInterval: 1000 });

  if (error) return <div>error</div>;
  if (!data) return <div>loading…</div>;

  const d = data?.data || {};
  const mag = d?.magnetometer_ut || {};
  return (
    <main style={{maxWidth:720, margin:"40px auto", fontFamily:"ui-sans-serif"}}>
      <h1 style={{fontSize:28, marginBottom:16}}>FieldMI live</h1>
      <div style={{display:"grid", gap:10}}>
        <div>timestamp: <b>{d?.timestamp || "—"}</b></div>
        <div>hydrogen (mV): <b>{d?.hydrogas_mv ?? "—"}</b></div>
        <div>lux: <b>{d?.lux ?? "—"}</b></div>
        <div>laser_triggered: <b>{String(d?.laser_triggered ?? "—")}</b></div>
        <div>magnetometer raw: <b>{["x","y","z"].map(k=>mag?.[k]??"—").join(", ")}</b></div>
      </div>
      {!data?.hasData && <p style={{marginTop:12, color:"#888"}}>No FieldMI data yet.</p>}
    </main>
  );
}
