"use client";
import React, { useEffect, useState } from "react";

type TelemetrySample = {
  ts?: string;
  sensors: Record<string, number | string | null>;
};

const FIELD_CONFIG: Record<string, string[]> = {
  fielda1: ["o2", "pressure", "temperature", "altitude"],  // A1 has O₂, BMP data
  field01: ["lux", "laser_triggered", "mag_x", "mag_y", "mag_z", "bearing_deg", "temp_object", "temp_ambient"], // Field0 sensors
  fieldb1: ["ultrasonic", "liquid_level", "mw_motion"], // FieldB sensors
  fieldmi1: ["analog_v", "lux", "laser_triggered", "mag_x", "mag_y", "mag_z", "bearing_deg"],  // FieldMI sensors
};

export default function AllFields() {
  const [data, setData] = useState<Record<string, TelemetrySample>>({});

  // Fetch all fields every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      const results: Record<string, TelemetrySample> = {};
      await Promise.all(
        Object.keys(FIELD_CONFIG).map(async (field) => {
          try {
            const res = await fetch(`/api/telemetry/${field}`);
            const json = await res.json();
            results[field] = json?.samples?.[0] || { sensors: {} };
          } catch (err) {
            console.error(`Error fetching ${field}:`, err);
            results[field] = { sensors: {} };
          }
        })
      );
      setData(results);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timestamp formatter
  const formatTimestamp = (ts?: string) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleTimeString();
  };

  // Render the sensors for each field, only showing what exists
  const renderSensors = (field: string, sensors: Record<string, any>) => {
    const expectedSensors = FIELD_CONFIG[field] || [];
    if (!expectedSensors.length) return <p>No sensors configured</p>;

    return expectedSensors.map((sensor) => {
      const value = sensors?.[sensor];
      return (
        <p key={sensor}>
          <strong>{sensor}:</strong>{" "}
          {value !== null && value !== undefined ? value.toString() : "N/A"}
        </p>
      );
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Fields — Live Telemetry</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {Object.keys(FIELD_CONFIG).map((field) => {
          const info = data[field] || { sensors: {} };
          return (
            <div
              key={field}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
                minWidth: "260px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{field}</h3>
              <p>
                <b>Timestamp:</b> {formatTimestamp(info?.ts)}
              </p>
              {renderSensors(field, info?.sensors || {})}
            </div>
          );
        })}
      </div>
    </div>
  );
}
