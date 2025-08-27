// pages/garden.tsx
import useSWR from "swr";
import React from "react";

const fetcher = (u: string) => fetch(u).then(r => r.json());

function lastSample(d?: { samples: { ts: string; sensors: Record<string, number | null> }[] }) {
  if (!d?.samples?.length) return null;
  return d.samples[d.samples.length - 1];
}

function norm(v: number | null | undefined, min: number, max: number) {
  if (v == null || isNaN(v)) return 0;
  if (max === min) return 0;
  const x = (v - min) / (max - min);
  return Math.max(0, Math.min(1, x));
}

function computeScores(fields: {
  fielda1?: any;
  field01?: any;
  fieldb1?: any;
  fieldmi1?: any;
}) {
  const A = lastSample(fields.fielda1);
  const O = lastSample(fields.field01);
  const B = lastSample(fields.fieldb1);
  const M = lastSample(fields.fieldmi1);

  // TIH proxies
  const o2 = norm((A?.sensors?.o2 as number) ?? null, 18, 24);
  const nh3_consumption =
    ((B?.sensors?.water ?? 0) === 0 && ((M?.sensors?.analog_v as number) ?? 0) < 0.3) ? 0.8 : 0.2;
  const mag_coherence = norm((O?.sensors?.bearing_deg as number) ?? null, 0, 180);
  const laser_lock = ((O?.sensors?.laser_triggered as number) ?? 0) > 0 ? 1 : 0;
  const TIH = 0.35 * o2 + 0.25 * nh3_consumption + 0.25 * mag_coherence + 0.15 * laser_lock;

  // DH proxies
  const hydrogen = norm((M?.sensors?.hydrogen as number) ?? null, 0, 1);
  const tempSpike = norm((O?.sensors?.temperature as number) ?? null, 10, 45);
  const liquidAlert = ((B?.sensors?.liquid_level as number) ?? 0) > 0 ? 1 : 0;
  const gsrVol = norm((M?.sensors?.gsr as number) ?? null, 0, 3.3);
  const DH = 0.35 * hydrogen + 0.3 * tempSpike + 0.2 * liquidAlert + 0.15 * gsrVol;

  const stage = TIH > DH ? "BLUE" : "RED"; // equality → RED by design
  return { TIH, DH, stage };
}

function RawPeek({ title, data }: { title: string; data?: any }) {
  const s = lastSample(data);
  const ts = s?.ts && !Number.isNaN(new Date(s.ts).getTime())
    ? new Date(s.ts).toLocaleString()
    : "—";

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>{title}</strong>
        <span style={{ opacity: 0.7, fontSize: 12 }}>{ts}</span>
      </div>
      <pre className="raw">{s ? JSON.stringify(s, null, 2) : "{ /* no data yet */ }"}</pre>
    </div>
  );
}

export default function GardenPage() {
  const { data: fielda1 } = useSWR("/api/telemetry/fielda1", fetcher, { refreshInterval: 4000 });
  const { data: field01 } = useSWR("/api/telemetry/field01", fetcher, { refreshInterval: 4000 });
  const { data: fieldb1 } = useSWR("/api/telemetry/fieldb1", fetcher, { refreshInterval: 4000 });
  const { data: fieldmi1 } = useSWR("/api/telemetry/fieldmi1", fetcher, { refreshInterval: 4000 });

  const scores = computeScores({ fielda1, field01, fieldb1, fieldmi1 });

  return (
    <main style={{ minHeight: "100vh", padding: "16px" }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <strong>/garden</strong> — live sensor stages (equality → RED)
      </div>

      <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Stage A: Red */}
        <StageCard
          stage="RED"
          active={scores.stage === "RED"}
          scores={scores}
          backdrop="/mars-red.jpg"
          accent="#ef4444"
          title="Stage A — Barren Red (DH ≥ TIH)"
          description="Inhospitable: DH dominated if and when equaled to ≤ TIH. Durationtragic angstrom distributed until law24_PLT CR distro via CF·BW·emc² of ZraSW prerequisites with a PPF TAP Ayn Rord."
          causes={[
            {
              title: "Cause α — DH pressure",
              bullets: [
                "Tragic distros",
                "Liquid/ultrasound alerts present",
                "GSR volatility uncorrected_TBD",
              ],
            },
            {
              title: "Cause β — Equality path",
              bullets: [
                "TIH = of ≥ DH  less human hospitable",
                "Signals undecided; tragic PLT holds",
                "Requires Ayn Rord + ZraSW: PLT",
              ],
            },
          ]}
        />

        {/* Stage B: Blue */}
        <StageCard
          stage="BLUE"
          active={scores.stage === "BLUE"}
          scores={scores}
          backdrop="/mars-blue.jpg"
          accent="#38bdf8"
          title="Stage B — Terraformed Blue (TIH > DH)"
          description="Hospitable: TIH > DH. O₂ stability + NH₃ conversion + coherent bearings ≈ blue-sky regime."
          causes={[
            {
              title: "Cause γ — TIH ascendancy",
              bullets: [
                "O₂ stable; NH₃ → null",
                "Laser lock; bearings coherent",
                "Gas & liquid alerts",
              ],
            },
            {
              title: "Cause δ — CF control",
              bullets: [
                "CF·BW·emc² redirects tragic angstroms",
                "ZraSW prerequisites met (LdD1)",
                "TIH regeneration path",
              ],
            },
          ]}
        />
      </div>

      {/* Raw data blocks */}
      <div className="grid2" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <RawPeek title="FieldA1 (O₂/Pressure)" data={fielda1} />
        <RawPeek title="Field01 (IR/Lux/Mag)" data={field01} />
        <RawPeek title="FieldB1 (Ultrasonic/Liquid)" data={fieldb1} />
        <RawPeek title="FieldMI1 (Hydrogen/GSR)" data={fieldmi1} />
      </div>
    </main>
  );
}

function StageCard({
  stage,
  active,
  scores,
  backdrop,
  accent,
  title,
  description,
  causes,
}: {
  stage: "RED" | "BLUE";
  active: boolean;
  scores: { TIH: number; DH: number };
  backdrop: string;
  accent: string;
  title: string;
  description: string;
  causes: { title: string; bullets: string[] }[];
}) {
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        boxShadow: active
          ? `0 0 25px ${accent}55`
          : "0 0 12px rgba(0,0,0,0.15)",
        outline: active ? `2px solid ${accent}` : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          backgroundImage: `url(${backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "multiply",
          backgroundColor: `${accent}33`,
          opacity: 0.7,
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", padding: "16px", backdropFilter: "blur(1px)", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              color: active ? "#fff" : "#555",
              backgroundColor: active ? accent : "#e5e7eb",
            }}
          >
            {active ? "ACTIVE" : "Standby"}
          </span>
        </div>

        <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 12 }}>{description}</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: 12 }}>
          <div style={{ border: `1px solid ${accent}`, padding: "4px 10px", borderRadius: "8px" }}>
            TIH {scores.TIH.toFixed(2)}
          </div>
          <div style={{ border: `1px solid ${accent}`, padding: "4px 10px", borderRadius: "8px" }}>
            DH {scores.DH.toFixed(2)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {causes.map((cause, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "rgba(255,255,255,0.75)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{cause.title}</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8, lineHeight: "1.4em" }}>
                {cause.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
