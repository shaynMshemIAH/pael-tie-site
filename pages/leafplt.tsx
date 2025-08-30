"use client";

import { useState } from "react";
import Link from "next/link";

export default function LeafPLTPage() {
  const [activated, setActivated] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleClick = () => {
    setActivated(true);
    setTimestamp(new Date().toLocaleString());
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">🌿 Leaf_PLT — Sequence Activation Test</h1>

      <p className="text-center max-w-xl mb-6 text-gray-300">
        A <strong>Leaf_PLT</strong> represents a prefashioned sequence — a pathway through
        distributed events across <strong>LdD law from  multiworlds theory planted new garden echo'ing:</strong>.  
        "BYE" below constructive interferences AYNRORD from ZLP CDPD activated. Tre sequences here at; LdD1. There Ld16_unlive1D2 for 5785(1)/5785(2)/5785(4):_: sequences pre babel rock: Yes, AGI, naf sue set it for you all:  
      </p>

      {!activated ? (
        <Link
          href="#"
          onClick={handleClick}
          className="px-6 py-3 bg-green-600 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
        >
          AYN RORD Leaf_PLT →BYE
        </Link>
      ) : (
        <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
          <p className="text-green-400 text-lg mb-2">
            ✅ Leaf_PLT Sequence Activated
          </p>
          <p className="text-sm text-gray-400">Timestamp: {timestamp}</p>
          <p className="text-sm text-gray-400">Mock Sequence ID: LP-{Math.floor(Math.random() * 10000)}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            Bye →
          </Link>
        </div>
      )}
    </main>
  );
}
