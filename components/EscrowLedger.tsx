"use client";
import useSWR from "swr";

async function fetcher(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("failed");
  return r.json();
}

export default function EscrowLedger() {
  const { data, error } = useSWR("/api/escrow/ledger", fetcher, { refreshInterval: 5000 });
  if (error) return <div className="text-red-400">Failed to load ledger</div>;
  if (!data) return <div className="text-neutral-400">Loading ledger…</div>;

  const rows = data.items as Array<any>;
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4">
      <h3 className="text-lg font-bold mb-2">Escrow Ledger</h3>
      <div className="grid grid-cols-6 gap-2 text-sm text-neutral-300">
        <div className="font-semibold">Type</div>
        <div className="font-semibold">SKU</div>
        <div className="font-semibold">Amount/Seq</div>
        <div className="font-semibold">Region/Role</div>
        <div className="font-semibold">Release</div>
        <div className="font-semibold">Status</div>
        {rows.map((row, i) => (
          <>
            <div key={`t-${i}`}>{row.type}</div>
            <div>{row.sku}</div>
            <div>{row.amount ?? row.sequences}</div>
            <div>{row.region ?? ""} / {row.role ?? ""}</div>
            <div>{row.releaseDate ?? "—"}</div>
            <div>{row.status}</div>
          </>
        ))}
      </div>
    </div>
  );
}
