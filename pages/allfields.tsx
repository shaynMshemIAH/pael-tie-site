"use client";

import { useEffect, useState } from "react";

const fetchData = async (endpoint: string) => {
  const res = await fetch(`/api/telemetry/${endpoint}`);
  return res.json();
};

export default function AllFields() {
  const [fieldA1, setFieldA1] = useState<any>(null);
  const [fieldMI1, setFieldMI1] = useState<any>(null);
  const [field01, setField01] = useState<any>(null);
  const [fieldB1, setFieldB1] = useState<any>(null);

  // Fetch on page load ONLY — no auto-refresh, manual persistence.
  useEffect(() => {
    fetchData("fielda1").then(setFieldA1);
    fetchData("fieldmi1").then(setFieldMI1);
    fetchData("field01").then(setField01);
    fetchData("fieldb1").then(setFieldB1);
  }, []);

  const renderField = (title: string, data: any) => (
    <div className="border border-gray-400 rounded-md p-4 w-full bg-white shadow-md">
      <h2 className="text-lg font-bold mb-2">
        <a href={`/${title.toLowerCase()}`}>{title} Telemetry</a>
      </h2>
      {!data ? (
        <p>Loading...</p>
      ) : (
        <div className="text-sm leading-6">
          <p><b>Timestamp:</b> {new Date(data.timestamp).toLocaleString()}</p>
          <p><b>Lux:</b> {data.sensors?.lux} lx</p>
          {data.sensors?.object_temp !== undefined && (
            <p><b>Temperature (Object):</b> {data.sensors.object_temp} °C</p>
          )}
          {data.sensors?.ambient_temp !== undefined && (
            <p><b>Temperature (Ambient):</b> {data.sensors.ambient_temp} °C</p>
          )}
          <p><b>Mag X:</b> {data.sensors?.mag_x}</p>
          <p><b>Mag Y:</b> {data.sensors?.mag_y}</p>
          <p><b>Mag Z:</b> {data.sensors?.mag_z}</p>
          <p><b>Bearing:</b> {data.sensors?.bearing_deg}°</p>
          <p><b>Laser Triggered:</b> {data.sensors?.laser_triggered ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
      <h1 className="text-2xl font-bold mb-6">All Fields Telemetry Overview</h1>

      {/* Top Row: FieldA1 + FieldMI1 */}
      <div className="flex flex-row space-x-6 w-full max-w-5xl">
        {renderField("FieldA1", fieldA1)}
        {renderField("FieldMI1", fieldMI1)}
      </div>

      {/* Second Row: Field01 */}
      <div className="w-full max-w-5xl">
        {renderField("Field01", field01)}
      </div>

      {/* Third Row: FieldB1 */}
      <div className="w-full max-w-5xl">
        {renderField("FieldB1", fieldB1)}
      </div>
    </div>
  );
}
