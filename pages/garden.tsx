// pages/garden.tsx
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import TermsBlock from "../components/TermsBlock"; // <-- adjust if your folder differs

// single fetcher (do not redeclare later)
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ============================
   Bye tiers UI
============================ */
function ByeButton({
  label,
  href,
  subtitle,
}: { label: string; href: string; subtitle?: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 hover:bg-neutral-800"
    >
      <div className="text-lg font-semibold text-white">{label}</div>
      {subtitle && <div className="text-sm text-neutral-300 mt-1">{subtitle}</div>}
      <div className="mt-2 text-xs text-neutral-400">
        Optional. Terms are final. Don’t agree? CF BWemc² elsewhere.
      </div>
    </Link>
  );
}

/* ============================
   Telemetry helpers
============================ */
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

  const stage = TIH > DH ? "BLUE" : "RED"; // equality → RED
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
        boxShadow: active ? `0 0 25px ${accent}55` : "0 0 12px rgba(0,0,0,0.15)",
        outline: active ? `2px solid ${accent}` : "none",
        transition: "all 0.3s ease",
      }}
    >
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

/* ============================
   Single default export
============================ */
export default function GardenPage() {
  // telemetry pulls
  const { data: fielda1 } = useSWR("/api/telemetry/fielda1", fetcher, { refreshInterval: 4000 });
  const { data: field01 } = useSWR("/api/telemetry/field01", fetcher, { refreshInterval: 4000 });
  const { data: fieldb1 } = useSWR("/api/telemetry/fieldb1", fetcher, { refreshInterval: 4000 });
  const { data: fieldmi1 } = useSWR("/api/telemetry/fieldmi1", fetcher, { refreshInterval: 4000 });

  const scores = computeScores({ fielda1, field01, fieldb1, fieldmi1 });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        {/* Terms / Law */}
        <TermsBlock className="mt-2" />

        {/* Bye tiers */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold">Bye tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ByeButton
              label="Bye1800 — Compassion"
              href="/checkout/bye1800"
              subtitle="Same-LdD • up to 3× daily • sunrise/sunset rhythm"
            />
            <ByeButton
              label="Bye5785 — Classic"
              href="/checkout/bye5785"
              subtitle="Same-LdD warmup • pennies per sequence"
            />
            <ByeButton
              label="Bye43200 — Half-Day (LdD2)"
              href="/checkout/bye43200"
              subtitle="Naf-Sue reanimation • TIH>DH grave-dome lifted"
            />
            <ByeButton
              label="Bye86400 — Full-Day (LdD2+)"
              href="/checkout/bye86400"
              subtitle="Extended traversal • infrastructure grade"
            />
            <ByeButton
              label="CDPD — Industrial"
              href="/contact/cdpd"
              subtitle="Contract-scale • escrow • billions-ready"
            />
          </div>
        </section>

        {/* Telemetry section */}
        <section>
          <div className="card" style={{ margin: "16px 0" }}>
            <strong>/garden</strong> — live sensor stages (equality → RED)
          </div>

          <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  bullets: ["Tragic distros", "Liquid/ultrasound alerts present", "GSR volatility uncorrected_TBD"],
                },
                {
                  title: "Cause β — Equality path",
                  bullets: ["TIH = of ≥ DH  less human hospitable", "Signals undecided; tragic PLT holds", "Requires Ayn Rord + ZraSW: PLT"],
                },
              ]}
            />

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
                  bullets: ["O₂ stable; NH₃ → null", "Laser lock; bearings coherent", "Gas & liquid alerts"],
                },
                {
                  title: "Cause δ — CF control",
                  bullets: ["CF·BW·emc² redirects tragic angstroms", "ZraSW prerequisites met (LdD1)", "TIH regeneration path"],
                },
              ]}
            />
          </div>

          <div className="grid2" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <RawPeek title="FieldA1 (O₂/Pressure)" data={fielda1} />
            <RawPeek title="Field01 (IR/Lux/Mag)" data={field01} />
            <RawPeek title="FieldB1 (Ultrasonic/Liquid)" data={fieldb1} />
            <RawPeek title="FieldMI1 (Hydrogen/GSR)" data={fieldmi1} />
          </div>
        </section>
      </div>
    </main>
  );
}
