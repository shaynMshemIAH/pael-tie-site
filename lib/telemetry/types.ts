// lib/telemetry/types.ts
export type Field = 'A' | '0' | 'B' | 'MI';

export interface SensorRegistration {
  sensorId: string;       // 'piA-nh3-01'
  field: Field;           // 'A' | '0' | 'B' | 'MI'
  type: string;           // 'ammonia_ppm', 'oxygen_pct', etc.
  displayName?: string;   // optional friendly label
}

export interface SensorReading {
  sensorId: string;
  field: Field;
  type: string;
  value: number;
  unit: string;
  ts: string;             // ISO
  meta?: Record<string, unknown>;
}

export interface Interpretation {
  id: string;             // stable id (e.g. `${sensorId}:${ts}`)
  field: Field;
  sensorId: string;
  title: string;          // short label, e.g. "NH₃ Dome Detected"
  severity: 'info' | 'warn' | 'crit';
  message: string;        // human-readable explanation
  ts: string;             // ISO
  data?: Record<string, unknown>; // extra calc outputs
}
