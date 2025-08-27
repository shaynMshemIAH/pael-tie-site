"use client";
import React from "react";

interface FieldTelemetryProps {
  fieldId: string;
  data: Record<string, any>;
}

const FieldTelemetry: React.FC<FieldTelemetryProps> = ({ fieldId, data }) => {
  return (
    <div className="field-card">
      <h2>{fieldId}</h2>
      <table>
        <tbody>
          {Object.entries(data).map(([sensor, value]) => (
            <tr key={sensor}>
              <td><strong>{sensor}</strong></td>
              <td>{value !== null && value !== undefined ? value.toString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldTelemetry;
