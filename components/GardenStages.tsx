import React from "react";
import useSWR from "swr";

// --- Fetcher ---------------------------------------------------------------
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Types -----------------------------------------------------------------
type TelemetrySample = {
  ts: string;
  sensors: Record<string, number | null>;
};

type TelemetryResponse = {
  samples: TelemetrySample[];
};

// --- Helpers ---------------------------------------------------------------
function lastSample(data?: TelemetryResponse): TelemetrySample | null {
  if (!data || !data.samples || data.samples.length === 0) return null;
  return data.samples[data.samples.length - 1];
}

// Smooth clamp into [0,1]
function norm(val: number | null | undefined, min: number, max: number) {
  if (val == null || isNaN(val)) return 0;
  if (max === min) return 0;
  const x = (val - min) / (max - min);
  return Math.max(0, Math.min(1, x));
}

// Compute provisional TIH and DH scores from raw sensors.
// These are deliberately simple and transparent so you can tune live.
// TIH proxies: oxygen stability, NH3 consumption rate, magnetometer coherence,
//              lux↔laser correlation (as a placeholder, we check laser_triggered)
// DH proxies:  hydrogen gas presence, temperature spikes, liquid/ultrasound alerts,
//              GSR volatility
function computeScores(fields: {
  fielda1?: TelemetryResponse;
  field01?: TelemetryResponse;
  fieldb1?: TelemetryResponse;
  fieldmi1?: TelemetryResponse;
}) {
  const A = lastSample(fields.fielda1);
  const O = lastSample(fields.field01);
  const B = lastSample(fields.fieldb1);
  const M = lastSample(fields.fieldmi1);

  // --- TIH components ------------------------------------------------------
  const o2 = norm((A?.sensors?.o2 as number) ?? null, 18, 24); // 0–1 by stability window
  const nh3_consumption = norm(
    // Placeholder: if water sensor down and hydrogen low but pressure shifts, infer NH3↘️
    (B?.sensors?.water ?? 0) === 0 && ((M?.sensors?.analog_v as number) ?? 0) < 0.3
      ? 0.8
      : 0.2,
    0,
    1
  );
  const mag_coherence = norm((O?.sensors?.bearing_deg as number) ?? null, 0, 180); // steadier bearings → mid-high
  const laser_lock = ((O?.sensors?.laser_triggered as number) ?? 0) > 0 ? 1 : 0; // 1 if triggered

  const TIH = 0.35 * o2 + 0.25 * nh3_consumption + 0.25 * mag_coherence + 0.15 * laser_lock;

  // --- DH components -------------------------------------------------------
  const hydrogen = norm((M?.sensors?.hydrogen as number) ?? null, 0, 1); // 0–1 scaled
  const tempSpike = norm((O?.sensors?.temperature as number) ?? null, 10, 45); // IR °C
  const liquidAlert = ((B?.sensors?.liquid_level as number) ?? 0) > 0 ? 1 : 0;
  const gsrVol = norm((M?.sensors?.gsr as number) ?? null, 0, 3.3);

  const DH = 0.35 * hydrogen + 0.3 * tempSpike + 0.2 * liquidAlert + 0.15 * gsrVol;

  // Classification logic with explicit equality path.
  // Stage A: Barren Red (Inhospitable) when DH >= TIH (equality emphasized)
  // Stage B: Terraformed Blue (Hospitable) when TIH > DH
  const stage = TIH > DH ? "BLUE_TERRAFORMED" : "RED_BARREN"; // equality flows to RED by design

  return { TIH, DH, stage, components: { o2, nh3_consumption, mag_coherence, laser_lock, hydrogen, tempSpike, liquidAlert, gsrVol } };
}

// Visual chip
function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <span className="font-semibold">{label}</span>
      <span className="tabular-nums">{value.toFixed(2)}</span>
    </div>
  );
}

// --- Main Component --------------------------------------------------------
export default function GardenStages() {
  const { data: fielda1 } = useSWR<TelemetryResponse>("/api/telemetry/fielda1", fetcher, { refreshInterval: 4000 });
  const { data: field01 } = useSWR<TelemetryResponse>("/api/telemetry/field01", fetcher, { refreshInterval: 4000 });
  const { data: fieldb1 } = useSWR<TelemetryResponse>("/api/telemetry/fieldb1", fetcher, { refreshInterval: 4000 });
  const { data: fieldmi1 } = useSWR<TelemetryResponse>("/api/telemetry/fieldmi1", fetcher, { refreshInterval: 4000 });

  const scores = computeScores({ fielda1, field01, fieldb1, fieldmi1 });

  const red = scores.stage === "RED_BARREN";
  const blue = scores.stage === "BLUE_TERRAFORMED";

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Garden Stages — TIH vs DH</h1>
      <p className="mb-6 text-sm opacity-80">
        Equality is intentional: when <span className="font-semibold">TIH = DH</span>, the system classifies as <span className="font-semibold">RED (Barren)</span>. Only strict
        superiority <span className="font-semibold">TIH &gt; DH</span> shifts to <span className="font-semibold">BLUE (Terraformed)</span>.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* RED BARREN */}
        <div className={`relative overflow-hidden rounded-2xl border shadow-sm ${red ? "ring-2 ring-red-500" : ""}`}>
          <div className="absolute inset-0 -z-10 bg-[url('/mars-red.jpg')] bg-cover bg-center opacity-40" />
          <div className="space-y-4 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Stage A — Barren Red (DH ≥ TIH)</h2>
              <span className="rounded-full border px-3 py-1 text-xs">{red ? "ACTIVE" : "Standby"}</span>
            </div>
            <p className="text-sm opacity-80">
              Inhospitable atmosphere: DH (eternal mortal/black electron) dominates or ties TIH. Subatomic duration still flows, but
              it expresses as tragic angstrom PLT unless redirected via CF·BW·emc² and ZraSW prerequisites.
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip label="TIH" value={scores.TIH} />
              <Chip label="DH" value={scores.DH} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border p-3">
                <div className="mb-1 font-semibold">Cause α — DH pressure</div>
                <ul className="list-inside list-disc opacity-80">
                  <li>Hydrogen ↑ / temp spikes ↑</li>
                  <li>Liquid/ultrasound alerts present</li>
                  <li>GSR volatility uncorrected</li>
                </ul>
              </div>
              <div className="rounded-xl border p-3">
                <div className="mb-1 font-semibold">Cause β — Equality path</div>
                <ul className="list-inside list-disc opacity-80">
                  <li>TIH equals DH → defaults to Red</li>
                  <li>Signals undecided; tragic PLT holds</li>
                  <li>Requires Ayn Rord + ZraSW to flip</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BLUE TERRAFORMED */}
        <div className={`relative overflow-hidden rounded-2xl border shadow-sm ${blue ? "ring-2 ring-sky-500" : ""}`}>
          <div className="absolute inset-0 -z-10 bg-[url('/mars-blue.jpg')] bg-cover bg-center opacity-40" />
          <div className="space-y-4 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Stage B — Terraformed Blue (TIH &gt; DH)</h2>
              <span className="rounded-full border px-3 py-1 text-xs">{blue ? "ACTIVE" : "Standby"}</span>
            </div>
            <p className="text-sm opacity-80">
              Hospitable atmosphere: TIH (eternal immortal/white electron) strictly exceeds DH. Dynamo-core metaphor holds; sufficient
              O₂ stability + NH₃ enthalpy conversion + coherent bearings = blue sky regime.
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip label="TIH" value={scores.TIH} />
              <Chip label="DH" value={scores.DH} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border p-3">
                <div className="mb-1 font-semibold">Cause γ — TIH ascendancy</div>
                <ul className="list-inside list-disc opacity-80">
                  <li>O₂ stable; NH₃ → null (consumption)</li>
                  <li>Laser lock; bearings coherent</li>
                  <li>Low hydrogen &amp; liquid alerts</li>
                </ul>
              </div>
              <div className="rounded-xl border p-3">
                <div className="mb-1 font-semibold">Cause δ — CF control</div>
                <ul className="list-inside list-disc opacity-80">
                  <li>CF·BW·emc² redirects tragic angstroms</li>
                  <li>ZraSW prerequisites met (LdD1)</li>
                  <li>GOYA (white) regeneration path</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="mt-8 rounded-2xl border p-6">
        <h3 className="mb-3 text-lg font-semibold">Component Scores (tune live)</h3>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {Object.entries(scores.components).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="capitalize">{k.replace(/_/g, " ")}</span>
              <span className="tabular-nums">{v.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs opacity-70">
          Tuning tip: increase TIH weights to favor oxygen stability, NH₃ consumption, and bearing coherence; increase DH weights to
          emphasize hydrogen spikes, temperature extremes, and liquid alerts.
        </p>
      </div>

      {/* Raw data peek */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <RawPeek title="FieldA1 (O₂/Pressure)" data={fielda1} />
        <RawPeek title="Field01 (IR/Lux/Mag)" data={field01} />
        <RawPeek title="FieldB1 (Ultrasonic/Liquid)" data={fieldb1} />
        <RawPeek title="FieldMI1 (Hydrogen/GSR)" data={fieldmi1} />
      </div>
    </div>
  );
}

function RawPeek({ title, data }: { title: string; data?: TelemetryResponse }) {
  const sample = lastSample(data);
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-xs opacity-70">{sample?.ts ? new Date(sample.ts).toLocaleString() : "–"}</span>
      </div>
      <pre className="max-h-56 overflow-auto rounded-lg bg-black/90 p-3 text-xs leading-relaxed text-green-200">
        {sample ? JSON.stringify(sample, null, 2) : "{ /* no data yet */ }"}
      </pre>
    </div>
  );
}

