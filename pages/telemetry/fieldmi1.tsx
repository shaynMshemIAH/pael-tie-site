import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FieldMIPage() {
  const { data, error } = useSWR("/api/telemetry/fieldmi1", fetcher, { refreshInterval: 1000 });

  if (error) return <main style={{ padding: "2rem" }}><h1>Error loading FieldMI</h1></main>;
  if (!data) return <main style={{ padding: "2rem" }}><h1>Loading FieldMI…</h1></main>;

  const d = data?.data || {};
  const sensors = d?.sensors || {};
  const { mag_x, mag_y, mag_z } = sensors;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>FieldMI Live</h1>
      <div style={{ display: "grid", gap: "12px", fontSize: "16px" }}>
        <div><strong>Timestamp:</strong> {d.timestamp || "—"}</div>
        <div><strong>Hydrogen (mV):</strong> {sensors.analog_v ?? "—"}</div>
        <div><strong>Lux:</strong> {sensors.lux ?? "—"}</div>
        <div><strong>Laser Triggered:</strong> {sensors.laser_triggered ?? "—"}</div>
        <div><strong>Magnetometer Raw:</strong> {[mag_x, mag_y, mag_z].map(v => v ?? "—").join(", ")}</div>
      </div>
      {!data?.hasData && (
        <p style={{ marginTop: "1rem", color: "#888" }}>No FieldMI data yet.</p>
      )}
    </main>
  );
}
