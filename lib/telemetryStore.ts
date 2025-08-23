// lib/telemetryStore.ts

type TelemetryRecord = {
  field_id: string;
  timestamp: string;
  sensors: Record<string, any>;
};

let telemetryData: Record<string, TelemetryRecord> = {};

export function ingestTelemetry(data: TelemetryRecord) {
  telemetryData[data.field_id] = data;
}

export function getTelemetryByFieldId(field_id: string) {
  return telemetryData[field_id] || null;
}
