import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function FieldMI1TelemetryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fieldmi1'],
    queryFn: async () => {
      const response = await axios.get('/api/telemetry/fieldmi1');
      console.log('Telemetry sample:', response.data.samples?.[0]);
      return response.data.samples?.[0];
    },
    refetchInterval: 1000, // Auto-refresh every second
  });

  if (isLoading) return <p>Loading FieldMI1 telemetry…</p>;
  if (isError || !data) return <p>Failed to load FieldMI1 data.</p>;

  const sensors = data?.sensors || {};
  const parsedSensors =
    typeof sensors === 'string' ? JSON.parse(sensors) : sensors;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>FieldMI1 Live</h1>
      <p><strong>Timestamp:</strong> {new Date(data.ts).toLocaleString()}</p>
      <p><strong>Hydrogen (mV):</strong> {parsedSensors.analog_v ?? '--'}</p>
      <p><strong>Lux:</strong> {parsedSensors.lux ?? '--'}</p>
      <p>
        <strong>Laser Triggered:</strong>{' '}
        {parsedSensors.laser_triggered == null
          ? '--'
          : parsedSensors.laser_triggered
          ? 'Yes'
          : 'No'}
      </p>
      <p>
        <strong>Magnetometer Raw:</strong>{' '}
        {parsedSensors.mag_x ?? '--'}, {parsedSensors.mag_y ?? '--'},{' '}
        {parsedSensors.mag_z ?? '--'}
      </p>
    </main>
  );
}
