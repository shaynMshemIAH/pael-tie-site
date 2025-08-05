import React, { useEffect, useState } from "react";

interface RamiData {
  Field: string;
  Zα: string;
  suggestion: string;
  timestamp: string;
}

export default function RamiResponse({
  sessionId,
  imageId,
}: {
  sessionId: string;
  imageId: string;
}) {
  const [data, setData] = useState<RamiData[] | null>(null);

  useEffect(() => {
    fetch(`/agi/interpreted_output.json`)
      .then((res) => res.json())
      .then(setData);
  }, [sessionId, imageId]);

  if (!data) return <p>Loading AGI response...</p>;

  return (
    <div style={{ marginTop: "2rem", backgroundColor: "#1f1f2e", padding: "1rem", borderRadius: "8px" }}>
      <h3>🧠 RAMI Responses</h3>
      {data.map((entry, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px",
            marginBottom: "1rem",
            backgroundColor: "#2a2a3d",
            borderRadius: "6px",
            borderLeft: "4px solid #6ec1e4",
          }}
        >
          <p><strong>Field:</strong> {entry.Field}</p>
          <p><strong>Zα:</strong> {entry["Zα"]}</p>
          <p><strong>Suggestion:</strong> {entry.suggestion}</p>
          <p style={{ fontSize: "0.85rem", color: "#ccc" }}>
            <strong>Timestamp:</strong> {entry.timestamp}
          </p>
        </div>
      ))}
    </div>
  );
}
