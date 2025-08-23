import React, { useEffect, useState } from 'react';

interface SensorData {
  ts: string;
  sensors: Record<string, number | null>;
}

interface Props {
  fieldId: string;
}

export default function TelemetryLive({ fieldId }: Props) {
  const [data, setData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      const res = await fetch(`/api/telemetry/${fieldId}?field_id=${fieldId}`);
      const json = await res.json();
      if (res.ok && json.samples && json.samples.length > 0) {
        setData(json.samples[0]);
      } else {
        setError(json.msg || 'No data');
      }
    } catch (err) {
      setError('Failed to fetch');
    }
  };

  useEffect(() => {
    fetchSensorData(); // Initial load
    const interval = setInterval(fetchSensorData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fieldId]);

  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#111', borderRadius: '8px', color: '#fff' }}>
      <h2>📡 Live Sensor Data: {fieldId.toUpperCase()}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data ? (
        <div>
          <p><strong>Timestamp:</strong> {new Date(data.ts).toLocaleString()}</p>
          <ul>
            {Object.entries(data.sensors).map(([key, value]) => (
              <li key={key}>{key}: {value ?? 'N/A'}</li>
            ))}
          </ul>
        </div>
      ) : (
        !error && <p>Loading sensor data...</p>
      )}
    </div>
  );
}
