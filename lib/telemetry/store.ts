// lib/telemetry/store.ts
import type { SensorRegistration, SensorReading, Interpretation } from './types';

const regs = new Map<string, SensorRegistration>();     // sensorId -> registration
const beats = new Map<string, number>();                // sensorId -> epoch ms
const latest = new Map<string, SensorReading>();        // sensorId -> latest reading
const interps = new Map<string, Interpretation>();      // id -> interpretation

export function upsertRegistration(r: SensorRegistration) {
  regs.set(r.sensorId, r);
  beats.set(r.sensorId, Date.now());
}

export function heartbeat(sensorId: string) {
  beats.set(sensorId, Date.now());
}

export function upsertReading(x: SensorReading) {
  latest.set(x.sensorId, x);
  heartbeat(x.sensorId);
}

export function addInterpretation(i: Interpretation) {
  interps.set(i.id, i);
}

export function getFieldState(field: 'A'|'0'|'B'|'MI') {
  const now = Date.now();
  const ONLINE_MS = 60_000; // 60s considered "online"
  const sensors = [...regs.values()].filter(r => r.field === field);
  const readings = sensors.map(r => latest.get(r.sensorId)).filter(Boolean) as SensorReading[];
  const status = sensors.map(r => ({
    sensorId: r.sensorId,
    field: r.field,
    type: r.type,
    displayName: r.displayName,
    online: (now - (beats.get(r.sensorId) ?? 0)) < ONLINE_MS
  }));
  const interpretations = [...interps.values()].filter(i => i.field === field);
  return { sensors, readings, status, interpretations };
}
