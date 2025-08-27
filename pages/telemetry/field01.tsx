import { useQuery } from '@tanstack/react-query';
import { useState } from "react";
import axios from 'axios';

export default function Field01TelemetryPage() {
  const [error, setError] = useState(false);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['field01Telemetry'],
    queryFn: async () => {
      const res = await axios.get('/api/telemetry/field01');
      return res.data.samples[0];
    },
    refetchInterval: 1000, // Auto-refresh every second, matching FieldMI
  });

  const sensors = data?.sensors || {};

  const formatValue = (value: any, suffix = "") =>
    value === null || value === undefined ? "N/A" : `${value}${suffix}`;

  if (isLoading) return <p>Loading Field01 telemetry…</p>;
  if (isError || !data) return <p>Failed to load Field01 data.</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Field01 Telemetry</h1>

      <p>
        <strong>Timestamp:</strong>{' '}
        {new Date(data.ts).toLocaleString() || '---'}
      </p>

      <p><strong>Lux:</strong> {formatValue(sensors.lux, ' lx')}</p>
      <p><strong>Temperature (Object):</strong> {formatValue(sensors.temp_object, ' °C')}</p>
      <p><strong>Temperature (Ambient):</strong> {formatValue(sensors.temp_ambient, ' °C')}</p>
      <p><strong>Mag X:</strong> {formatValue(sensors.mag_x)}</p>
      <p><strong>Mag Y:</strong> {formatValue(sensors.mag_y)}</p>
      <p><strong>Mag Z:</strong> {formatValue(sensors.mag_z)}</p>
      <p><strong>Bearing:</strong> {formatValue(sensors.bearing_deg, '°')}</p>
      <p><strong>Laser Triggered:</strong> {sensors.laser_triggered ? 'Yes' : 'No'}</p>
    </main>
  );
}


