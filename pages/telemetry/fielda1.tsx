
import { useQuery } from '@tanstack/react-query';
import { useState } from "react";
import axios from 'axios';

export default function FieldA1TelemetryPage() {
  const [error, setError] = useState(false);  

  const { data, isError, isLoading } = useQuery({
    queryKey: ['fielda1Telemetry'],
    queryFn: async () => {
      const res = await axios.get('/api/telemetry/fielda1');
      return res.data.samples[0];
    },
    refetchInterval: 1000, // Auto-refresh every second, matching FieldMI
  });

  const sensors = data?.sensors || {};
  const formatValue = (value: any, suffix = "") => 
    value === null || value === undefined ? "N/A" : `${value}${suffix}`;

  if (isLoading) return <p>Loading FieldA1 telemetry…</p>;
  if (isError || !data) return <p>Failed to load FieldA1 data.</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>FieldA1 Telemetry</h1>

      <p>
        <strong>Timestamp:</strong>{' '}
        {new Date(data.ts).toLocaleString() || '---'} 
      </p>  

      <p><strong>O₂:</strong> {formatValue(sensors.o2)}</p>
      <p>><strong>Pressure:</strong> {formatValue(sensors.pressure, " hPa")}</p>
      <p><strong>Temperature:</strong> {formatValue(sensors.temperature, " °C")}</p>
      <p><strong>Altitude:</strong> {formatValue(sensors.altitude, " m")}</p>
    </main>
  );
}
