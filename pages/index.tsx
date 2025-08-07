import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem' }}>
      <h1>Welcome to PAEL TIE</h1>
      <p>RAMI Node is configured. API routes are separate from pages.</p>

      <nav style={{ marginTop: '2rem' }}>
        <h3>Navigate:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><Link href="/agi">AGI Interface</Link></li>
          <li><Link href="/pharma">Pharma Test Results</Link></li>
          <li><Link href="/logs/A0/Anomaly01">Anomaly A0-01</Link></li>
          <li><Link href="/aerospace">Aerospace Overview</Link></li>
          <li><Link href="/api/rami">API: RAMI Node Status</Link></li>
          <li><Link href="/good-for-you">Wellbeing Tracker</Link></li> 
        </ul>
      </nav>
    </div>
  );
}
