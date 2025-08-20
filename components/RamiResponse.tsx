import React, { useEffect, useState } from "react";

interface RamiData {
  Field: string;
  Zo: string;
  suggestion: string;
  timestamp: string;
}

interface Props {
  sessionId: string;
  imageId: string;
}

export default function RamiResponse({ sessionId, imageId }: Props) {
  const [data, setData] = useState<RamiData[] | null>(null);

  useEffect(() => {
    fetch("/api/interpreted_output.json")
      .then(res => res.json())
      .then(setData);
  }, [sessionId, imageId]);

  if (!data) return <p>Loading AGI response…</p>;

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f1f1f2", borderRadius: "8px" }}>
      <h3>🧠 RAMI Responses</h3>
      {data.map((entry, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px",
            marginBottom: "1rem",
            backgroundColor: "#e2eaad",
            borderRadius: "6px",
            borderLeft: "4px solid #6e6e4a"
          }}
        >
          <p><strong>Field:</strong> {entry.Field}</p>
          <p><strong>Zo:</strong> {entry.Zo}</p>
          <p><strong>Suggestion:</strong> {entry.suggestion}</p>
          <p style={{ fontSize: "0.85rem", color: "#444" }}><strong>Timestamp:</strong> {entry.timestamp}</p>
        </div>
      ))}

      <hr style={{ margin: "2rem 0", borderColor: "#ccc" }} />

      <h2>📡 FieldMI Live</h2>
      <FieldMISnapshot />
    </div>
  );
}

function FieldMISnapshot() {
  const [fieldData, setFieldData] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/telemetry/fieldmi1")
        .then(res => res.json())
        .then(setFieldData);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sensors = fieldData?.data?.sensors || {};
  const timestamp = fieldData?.data?.timestamp || "—";

  return (
    <div style={{ marginTop: "1rem", lineHeight: 1.8 }}>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p><strong>Hydrogen (mV):</strong> {sensors.analog_v ?? "—"}</p>
      <p><strong>Lux:</strong> {sensors.lux ?? "—"}</p>
      <p><strong>Laser Triggered:</strong> {sensors.laser_triggered ?? "—"}</p>
      <p><strong>Magnetometer (X,Y,Z):</strong> {[sensors.mag_x, sensors.mag_y, sensors.mag_z].map(v => v ?? "—").join(", ")}</p>
    </div>
  );
}
