import { getFieldMI1 } from '../lib/redis';

export default async function FieldMI1() {
  const response = await getFieldMI1();

  if (!response?.data) {
    return <div>Error: No data available from Redis.</div>;
  }

  const { lux, laser, rtc } = response.data;

  return (
    <div>
      <h2>FieldMI1 Live Telemetry</h2>
      <p><strong>Lux:</strong> {lux}</p>
      <p><strong>Laser:</strong> {laser ? "Active" : "Inactive"}</p>
      <p><strong>Timestamp:</strong> {new Date(rtc).toLocaleString()}</p>
    </div>
  );
}
