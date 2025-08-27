import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function FieldB1TelemetryPage() {
  const [error, setError] = useState(false);

  // React Query — fetch data every 2 seconds
  const { data, isError, isLoading } = useQuery({
    queryKey: ["fieldb1Telemetry"],
    queryFn: async () => {
      const res = await axios.get("/api/telemetry/fieldb1");
      return res.data.samples[0];
    },
    refetchInterval: 1000,
  });

  const sensors = data?.sensors || {};
  const formatValue = (value: any, suffix = "") => 
    value === null || value === undefined ? "N/A" : `${value}${suffix}`;

  // Early states
  if (isLoading) return <p>Loading FieldB1 telemetry...</p>;
  if (isError || !data) return <p className="text-red-500">Failed to load FieldB1 data.</p>;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>FieldB1 Live Telemetry</h1>
     

      <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
      <p><strong>Motion Detected:</strong> {sensors.motion ? "✅ Yes" : "❌ No"}</p>
      <p><strong>Ultrasonic Distance:</strong> {formatValue(sensors.ultrasonic, " m")}</p>
      <p><strong>Liquid Level:</strong> {sensors.liquid_pin ? "✅ Yes" : "❌ No"}</p>
    </main>
  );
}
