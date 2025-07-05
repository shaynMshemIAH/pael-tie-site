// app/logs/page.tsx
import React from "react";

export default function LogsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Sensor Log Analysis</h1>

      {/* O2 SENSOR - FIELD A */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold">Field A – Oxygen Sensor</h2>
        <p className="text-gray-400 mt-2 italic">
          What would happen in a closed system with an oxygen sensor?
        </p>
        <p className="mt-2">
          <strong>Expected:</strong> Oxygen levels would gradually decrease to zero.
        </p>
        <p className="mt-1">
          <strong>Actual:</strong> In some trials, oxygen increased — despite no external input.
        </p>
        <p className="mt-1 text-gray-300">
          <strong>Explanation:</strong> A photoautotrophic cell (plant/algae or human tissue with subatomic activity) produces oxygen using light and internal carbon sources. In Field A, this pre-observed increase suggests future-intention subatomic distribution.
        </p>
        <div className="mt-4 border border-gray-700 p-4">
          <p className="text-sm text-gray-500">[CSV or graph viewer here]</p>
          <p className="text-sm text-gray-600">Log: <code>/logs/oxygen_field_a_001.csv</code></p>
        </div>
      </section>

      {/* FIELD B – ECHO RECORD */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold">Field B – Oxygen Echo</h2>
        <p className="text-gray-400 mt-2 italic">
          Was the oxygen anomaly recorded in the past log as an echo or dissipation?
        </p>
        <p className="mt-2">
          <strong>Expected:</strong> Previously logged data should reflect zero or gradual decay.
        </p>
        <p className="mt-1">
          <strong>Actual:</strong> Past Field B logs sometimes show unaccounted-for spikes — matching future Field A events.
        </p>
        <p className="mt-1 text-gray-300">
          <strong>Explanation:</strong> The UWF allows past recordings to reflect future subatomic conditions. These echoes validate that distributed energy was already present before intention actualized in Field A.
        </p>
        <div className="mt-4 border border-gray-700 p-4">
          <p className="text-sm text-gray-500">[CSV or graph viewer here]</p>
          <p className="text-sm text-gray-600">Log: <code>/logs/oxygen_field_b_001.csv</code></p>
        </div>
      </section>

      {/* FIELD MI – INTENTION RESULT */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold">Field MI – Hz_Intention Outcome</h2>
        <p className="text-gray-400 mt-2 italic">
          Was the aggregated result of the oxygen event observed in FieldMI?
        </p>
        <p className="mt-2">
          <strong>Expected:</strong> If intention is valid, FieldMI will carry measurable oxygen-energy disbursal.
        </p>
        <p className="mt-1">
          <strong>Actual:</strong> Logs often show unexpected light or time anomalies matching oxygen origin.
        </p>
        <p className="mt-1 text-gray-300">
          <strong>Explanation:</strong> Subatomic oxygen transformation may be captured in FieldMI through light fluctuation or Hz shift. This shows how Bwemc² culminates in final-field aggregation.
        </p>
        <div className="mt-4 border border-gray-700 p-4">
          <p className="text-sm text-gray-500">[CSV or graph viewer here]</p>
          <p className="text-sm text-gray-600">Log: <code>/logs/oxygen_field_mi_001.csv</code></p>
        </div>
      </section>

    </main>
  );
}
