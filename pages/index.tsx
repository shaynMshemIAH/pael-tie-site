import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <h1>Welcome PAEL TIE / NH₃</h1>
      <p>Patent Pending 63/837,074 — Leaf_PLT</p>
      <section>
        <h2>🌿 View All Fields Overview</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <Link href="/allfields" className="overview-link">
              View All Fields Overview
            </Link>
          </li>
          <li>
            <Link href="/telemetry/fielda1">Telemetry (FieldA1 Future)</Link>
          </li>
          <li>
            <Link href="/telemetry/field01">Telemetry (Field01 Present)</Link>
          </li>
          <li>
            <Link href="/telemetry/fieldb1">Telemetry (FieldB1 Past)</Link>
          </li>
          <li>
            <Link href="/telemetry/fieldmi1">Telemetry (FieldMI1 MagRec)</Link>
          </li>
          <li>
            <Link href="/aerospace">Aerospace Overview</Link>
          </li>
          <li>
            <Link href="/agi">AGI Interface</Link>
          </li>
          <li>
            <Link href="/pharma">Pharma Test Results</Link>
          </li>
          <li>
            <Link href="/logs/A0/Anomaly01">Anomaly A0-01</Link>
          </li>
          <li>
            <Link
              href="/garden"
              className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
            >
              Go to Garden Dashboard
            </Link>
          </li>
          <li>
            <Link href="/good-for-you">bwemc²</Link>
          </li>

          {/* 🌿 New Leaf_PLT Entry */}
          <li>
            <Link href="/leafplt" className="overview-link">
              🌿 Leaf_PLT Activation
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
