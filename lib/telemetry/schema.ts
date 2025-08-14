// lib/telemetry/schema.ts
import { z } from 'zod';

export const registrationSchema = z.object({
  sensorId: z.string().min(1),
  field: z.enum(['A','0','B','MI']),
  type: z.string().min(1),
  displayName: z.string().optional(),
});

export const readingSchema = z.object({
  sensorId: z.string().min(1),
  field: z.enum(['A','0','B','MI']),
  type: z.string().min(1),
  value: z.number().finite(),
  unit: z.string().min(1),
  ts: z.string().datetime(),
  meta: z.record(z.any()).optional()
});

export const interpretationSchema = z.object({
  id: z.string().min(1),
  field: z.enum(['A','0','B','MI']),
  sensorId: z.string().min(1),
  title: z.string().min(1),
  severity: z.enum(['info','warn','crit']),
  message: z.string().min(1),
  ts: z.string().datetime(),
  data: z.record(z.any()).optional()
});
