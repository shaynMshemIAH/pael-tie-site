// pages/aerospace.tsx
import Link from 'next/link';
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
        <h2> PAEL TIE Prototype operate</h2>
        <p>
          PAEL TIE prototype detects relativistic anomalies and distributes subatomic energy anomalies across nonlinear time fields (FieldA, Field0, FieldB, FieldMI).
          Used are real-time sensor inputs; confirm BWemc²-triggered transformation sub atomic duration distributed event. Each experiment links energy output, field traversal, 
          and subatomic refraction or reflection — distributed across 86,400 sequences and verified by LdD.
        </p>
      </section>

      {/* Section 2: Industry Explanation */}
      <section style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h2>️Aerospace Profs</h2>
        <p>
          For aerospace domain, we empirically validate a macro static fire (~H₂O is to a cup of) using subatomic transformation — not combustion.
          Ammonia (NH₃) is nullified under Hz_intention within a sealed test field. Sensor sequences confirm subatomic matter reduction, 
          ionized ejection, thus propulsion under anew launch logic (FieldMI → propulsion validation).
        </p>
      </section>

      {/* Section 3: Featured Experiment */}
      <section style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h2>📁 Experiment: Ammonia Nullification Static Fire</h2>
        <ul>
          <li><strong>Date:</strong> TBD 22, 2025</li>
          <li><strong>Field:</strong> FieldMI</li>
          <li><strong>Input:</strong> Hz_intended Ammonia (NH₃), sealed, Hz_intention from Field</li>
          <li><strong>Output:</strong> mL detected --> with no combustion, nor relativistic ammonia, physical. --> subatomic transformation confirmed</li>
          <li><strong>Proof:</strong> Sensor data from detection array</li>
          <li><strong>Conclusion:</strong> Demonstrated propulsion via reduced mass payload. 
              Energy disbursed through BWemc² + scaled LdD, unlocking TIH (eternal immortal) state over DH (eternal mortal).
          </li>
        </ul>
      </section>

      <Link href="/" legacyBehavior>
        <a style={{ color: '#45a29e' }}>Main Page</a>
      </Link>
    </main>
  );
}
