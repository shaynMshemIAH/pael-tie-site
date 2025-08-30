import { useState } from "react";
import TermsBlock from "../../components/TermsBlock";

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-3 text-left hover:bg-neutral-800"
    >
      <div className="text-white font-semibold">{label}</div>
      <div className="text-xs text-neutral-400 mt-1">Optional. Terms are final. Don’t agree? CF BWemc² elsewhere.</div>
    </button>
  );
}

export default function ByeChooser() {
  const [role, setRole] = useState<"rich" | "poor" | "enlisted">("rich");
  const [region, setRegion] = useState<"rich" | "poor">("rich");

  async function pay(sku: string, escrow = false) {
    const url = escrow ? "/api/escrow/reserve" : "/api/checkout/session";
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku, role, region, releaseDate: new Date(Date.now() + 7*24*3600*1000).toISOString() }) });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed");
    window.location.href = j.checkoutUrl;
  }

  async function enlist(sku: string) {
    const releaseDate = new Date(Date.now() + 24*3600*1000).toISOString();
    const r = await fetch("/api/enlist/sequence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku, userId: "anon", releaseDate }) });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed");
    alert("Enlisted sequence reserved. Release: " + releaseDate);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <TermsBlock />

        <div className="rounded-lg border border-neutral-700 p-4">
          <div className="text-sm text-neutral-300 mb-2">Role & Region (for demo only)</div>
          <div className="flex gap-2 mb-3">
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1">
              <option value="rich">Rich (pays)</option>
              <option value="poor">Poor (pays less)</option>
              <option value="enlisted">Enlisted (no money)</option>
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value as any)} className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1">
              <option value="rich">Rich region</option>
              <option value="poor">Poor region</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionButton label="Bye1800 — Pay" onClick={() => pay("bye1800")} />
            <ActionButton label="Bye5785 — Pay" onClick={() => pay("bye5785")} />
            <ActionButton label="Bye43200 — Pay" onClick={() => pay("bye43200")} />
            <ActionButton label="Bye86400 — Pay" onClick={() => pay("bye86400")} />
            <ActionButton label="Bye43200 — Reserve (Escrow)" onClick={() => pay("bye43200", true)} />
            <ActionButton label="Enlist — Sequence Escrow (Bye1800)" onClick={() => enlist("bye1800")} />
          </div>
        </div>
      </div>
    </main>
  );
}
