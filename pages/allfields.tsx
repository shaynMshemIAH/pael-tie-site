// pages/allfields.tsx
"use client";

import { useEffect, useState } from "react";

type Sensors = {
  lux?: number;
  ambient_temp?: number;
  object_temp?: number;
  mag_x?: number;
  mag_y?: number;
  mag_z?: number;
  bearing_deg?: number;
  analog_v?: number;
  laser_triggered?: boolean;
};

type PltOrbit = {
  plt_score: number;
  hemisphere: "N≥S" | "S≤N" | string;
  tih_dh: "TIH > DH" | "DH dominant" | string;
  node_deg: number;
  arg_deg: number;
  near_90_node: number;
  near_90_arg: number;
  ".mpa": number;
  true_anomaly_nu: number;
  leaf_plt: "locked" | "pending" | string;
  is_night: boolean;
};

type FieldPacket = {
  timestamp?: string;
  field_id?: string;
  sensors?: Sensors;
  plt_orbit?: PltOrbit;
  // tolerate any extra sections the backend may attach
  [k: string]: any;
};

type AllFieldsResponse = {
  fielda1?: FieldPacket;
  field01?: FieldPacket;
  fieldb1?: FieldPacket;
  fieldmi1?: FieldPacket;
};

const fetchJSON = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export default function AllFields() {
  const [data, setData] = useState<AllFieldsResponse>({});
  const [error, setError] = useState<string | null>(null);

  // poll all fields every 1s
  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      try {
        const json = await fetchJSON<AllFieldsResponse>("/api/telemetry/allfields");
        if (!cancelled) {
          setData(json || {});
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "fetch error");
      }
    };

    pull(); // initial
    const id = setInterval(pull, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const FieldCard = (title: string, keyName: keyof AllFieldsResponse) => {
    const pkt = data?.[keyName];

    return (
      <div className="border border-gray-300 rounded-lg p-4 w-full bg-white shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            <a href={`/${title.toLowerCase()}`}>{title} Telemetry</a>
          </h2>
          <span className="text-xs text-gray-500">
            {pkt?.timestamp ? new Date(pkt.timestamp).toLocaleTimeString() : "—"}
          </span>
        </div>

        {!pkt ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <>
            {renderSensors(pkt.sensors)}
            {renderPlt(pkt.plt_orbit)}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Fields Telemetry Overview</h1>
        {error ? (
          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Error: {error}</span>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Live</span>
        )}
      </div>

      {/* Row 1 */}
      <div className="flex flex-row gap-6 w-full max-w-5xl">
        {FieldCard("FieldA1", "fielda1")}
        {FieldCard("FieldMI1", "fieldmi1")}
      </div>

      {/* Row 2 */}
      <div className="w-full max-w-5xl">{FieldCard("Field01", "field01")}</div>

      {/* Row 3 */}
      <div className="w-full max-w-5xl">{FieldCard("FieldB1", "fieldb1")}</div>
    </div>
  );
}

/* ---------- render helpers ---------- */

function renderSensors(s: Sensors | undefined) {
  if (!s) return null;
  return (
    <div className="text-sm leading-6 grid grid-cols-2 md:grid-cols-3 gap-x-6">
      <p><b>Lux:</b> {fmtNum(s.lux)} lx</p>
      <p><b>Temp (Obj):</b> {fmtNum(s.object_temp)} °C</p>
      <p><b>Temp (Amb):</b> {fmtNum(s.ambient_temp)} °C</p>
      <p><b>Mag X:</b> {fmtNum(s.mag_x)}</p>
      <p><b>Mag Y:</b> {fmtNum(s.mag_y)}</p>
      <p><b>Mag Z:</b> {fmtNum(s.mag_z)}</p>
      <p><b>Bearing:</b> {fmtNum(s.bearing_deg)}°</p>
      <p><b>Analog V:</b> {fmtNum(s.analog_v)} V</p>
      <p><b>Laser:</b> {s.laser_triggered ? "Yes" : "No"}</p>
    </div>
  );
}

function renderPlt(p: PltOrbit | undefined) {
  if (!p) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
        <b>PLT Orbit:</b> waiting for COE enrich…
      </div>
    );
  }

  const pct = Math.round(p.plt_score * 100);
  const badge =
    p.leaf_plt === "locked"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-100 text-gray-700";

  const hemi =
    p.hemisphere === "N≥S"
      ? "text-emerald-700"
      : "text-amber-700";

  const tihdh =
    p.tih_dh === "TIH > DH"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-rose-100 text-rose-700";

  return (
    <div className="mt-3 p-3 bg-indigo-50/40 border border-indigo-200 rounded-md text-sm space-y-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-indigo-700">PLT Orbit</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${badge}`}>{p.leaf_plt}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${tihdh}`}>{p.tih_dh}</span>
        <span className="text-xs text-gray-500">
          {p.is_night ? "Launch window" : "Accumulating .mpa"}
        </span>
      </div>

      <p>
        <b>PLT:</b> <span className="tabular-nums">{pct}%</span>{" "}
        <span className={hemi}>({p.hemisphere})</span>
      </p>

      <p>
        <b>Ω:</b> {fmtNum(p.node_deg)}° &nbsp;
        <b>ω:</b> {fmtNum(p.arg_deg)}° &nbsp;
        <b>near-90 Ω:</b> {fmtNum(p.near_90_node)} &nbsp;
        <b>near-90 ω:</b> {fmtNum(p.near_90_arg)}
      </p>

      <p>
        <b>.mpa:</b> {fmtNum(p[".mpa"])} &nbsp; <b>ν:</b> {fmtNum(p.true_anomaly_nu)}
      </p>
    </div>
  );
}

function fmtNum(n?: number, digits = 2) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}
