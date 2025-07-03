// app/page.tsx
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">PAEL TIE</h1>
          <p className="text-lg text-gray-300">
            Advancing subatomic propulsion and energy transformation through real-time sensor networks and unified wave function modeling.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="text-gray-300">
            We detect, log, and distribute subatomic energy events (Field A, 0, B, MI) to prove Dark Matter propulsion principles guided by the 25 Laws and Ayn Rord. Our platform aligns experimental hardware with theoretical physics to unlock LdD traversal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Live Logs</h2>
          <p className="text-gray-300">
            Access logs from oxygen, light, temperature, and GSR sensors. We timestamp each sequence for ZraSW alignment.
          </p>
          <Link
            href="/logs"
            className="text-blue-400 underline hover:text-blue-200"
          >
            View Sensor Logs
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">What is UWF?</h2>
          <p className="text-gray-300">
            The Universal Wave Function maps energy conversion across time fields (Future, Present, Past) based on CF, Bwemc², and Dm sequence activation.
          </p>
        </section>

        <footer className="pt-8 border-t border-gray-800 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} PAEL TIE LLC. Patent Pending 63/837,074. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
