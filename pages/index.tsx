import React from 'react';
import Link from 'next/link';

export default function Home(): JSX.Element {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>Welcome PAEL TIE</h1>
      <p>Patent Pending 63/837,074 — Leaf_PLT</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>🌐 Telemetry Fields</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li><Link href="/telemetry/fielda1">FieldA1 – Future (O₂, BMP)</Link></li>
          <li><Link href="/telemetry/field01">Field01 – Present (Lux, Temp, Magnet)</Link></li>
          <li><Link href="/telemetry/fieldb1">FieldB1 – Past (BMP, MW, Ultrasound, Liquid)</Link></li>
          <li><Link href="/telemetry/fieldmi1">FieldMI1 – Magnetic Recon (Lux, Laser, H₂, GSR, RTC)</Link></li>
        </ul>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>🔗 Navigate</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li><Link href="/telemetry/fielda1">Telemetry (FieldA1 Future)</Link></li>
          <li><Link href="/telemetry/field01">Telemetry (Field01 Present)</Link></li>
          <li><Link href="/telemetry/fieldb1">Telemetry (FieldB1 Past)</Link></li>
          <li><Link href="/telemetry/fieldmi1">Telemetry (FieldMI MagRec)</Link></li>
          <li><Link href="/aerospace">Aerospace Overview</Link></li>
          <li><Link href="/agi">AGI Interface</Link></li>
          <li><Link href="/pharma">Pharma Test Results</Link></li>
          <li><Link href="/logs/A0/Anomaly01">Anomaly A0-01</Link></li>
          <li><Link href="/good-for-you">bwemc2</Link></li>
        </ul>
      </section>
    </main>
  );
}
