// components/RamiResponse.tsx
import React, { useEffect, useState } from 'react';

export default function RamiResponse() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry/fieldmi1');
        const json = await res.json();
        if (json.ok) {
          setData(json.data);
        } else {
          setError(json.error || 'No data yet');
        }
      } catch (err) {
        setError('Fetch failed');
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginTop: '2rem', backgroundColor: '#121212', padding: '1rem', borderRadius: '8px', color: '#eee' }}>
      <h3>📡 FieldMI1 Live Telemetry</h3>
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      {data ? (
        <div style={{ lineHeight: 1.6 }}>
          <strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()} <br />
          <strong>Hydrogen (mV):</strong> {data.sensors?.analog_v} <br />
          <strong>Lux:</strong> {data.sensors?.lux} <br />
          <strong>Laser Triggered:</strong> {data.sensors?.laser_triggered ? 'Yes' : 'No'} <br />
          <strong>Magnetometer:</strong> {data.sensors?.mag_x}, {data.sensors?.mag_y}, {data.sensors?.mag_z} <br />
          <strong>Bearing:</strong> {data.sensors?.bearing_deg}°
        </div>
      ) : (
        !error && <p>🔄 Loading...</p>
      )}
    </div>
  );
}
