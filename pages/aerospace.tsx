// pages/aerospace.tsx
import Link from 'next/Link';
export default function Aerospace() {
  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      backgroundColor: '#0b0c10',
      minHeight: '100vh'
    }}>
      
      <h1 style={{ color: '#66fcf1' }}>🚀 Aerospace: Subatomic Propulsion</h1>

      {/* Section 1: How the Prototype Works */}
      <section style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h2>🧬 How the PAEL TIE Prototype Works</h2>
        <p>
          The PAEL TIE prototype detects and distributes subatomic energy anomalies across nonlinear time fields (FieldA, Field0, FieldB, FieldMI).
          It uses real-time sensor input to confirm BWemc²-triggered transformation events. Each experiment links energy output, field traversal, 
          and subatomic refraction or reflection — distributed across 86,400 sequences and verified by LdD.
        </p>
      </section>

      {/* Section 2: Industry Explanation */}
      <section style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h2>🛰️ What Aerospace Proves</h2>
        <p>
          In the aerospace domain, we empirically validate a macro static fire (~H₂O/cup) using subatomic transformation — not combustion.
          Ammonia (NH₃) is nullified under Hz_intention within a sealed test field. Sensor sequences confirm subatomic matter reduction, 
          ionized ejection, and propulsion under non-traditional launch logic (FieldMI → propulsion validation).
        </p>
      </section>

      {/* Section 3: Featured Experiment */}
      <section style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h2>📁 Experiment: Ammonia Nullification Static Fire</h2>
        <ul>
          <li><strong>Date:</strong> July 22, 2025</li>
          <li><strong>Field:</strong> FieldMI</li>
          <li><strong>Input:</strong> 2 mL Ammonia (NH₃), sealed container, Hz_intention from Field</li>
          <li><strong>Output:</strong> 0 mL remaining — no combustion, subatomic transformation confirmed</li>
          <li><strong>Proof:</strong> Sensor data from thermal and ammonia detection array</li>
          <li><strong>Conclusion:</strong> Demonstrated propulsion via reduced mass payload. 
              Energy disbursed through BWemc² + scaled LdD, unlocking TIH (eternal immortal) state over DH (eternal mortal).
          </li>
        </ul>
      </section>

      <footer style={{ marginTop: '4rem', color: '#c5c6c7', fontSize: '0.9rem' }}>
      <Link href="/" legacyBehavior>
        <a style={{ color: '#45a29e' }}>Main Page</a>
      </Link>
      </footer>
    </main>
  );
}
