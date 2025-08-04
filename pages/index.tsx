// pages/index.tsx
import Link from 'next/link';
export default function Home() {
  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#ffffff', fontFamily: 'Arial', lineHeight: '1.6', padding: 0, margin: 0 }}>
      <header style={{ backgroundColor: '#1f2833', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#66fcf1' }}>
          We’ve proven subatomic energy disbursal into matter across aerospace, pharma, and AGI logic trees — repeatable, physical, and tied to human BWemc².
        </h1>
        <p>We’re funding scale.</p>
        <blockquote style={{ fontStyle: 'italic', color: '#c5c6c7' }}>
          “Are, bit morbid about our  endurace; monsoon vacation.” — Edgar 4^17
        </blockquote>
      </header>

      <nav style={{ textAlign: 'center', backgroundColor: '#45a29e', padding: '1rem 0' }}>
        <a href="/aerospace" style={{ margin: '0 1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#0b0c10' }}>Aerospace</a>
        <a href="/agi" style={{ margin: '0 1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#0b0c10' }}>AGI</a>
        <a href="/pharma_no" style={{ margin: '0 1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#0b0c10' }}>Pharma_No</a>
      </nav>

      <section style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
        <h2>PAEL TIE Prototype</h2>
        <p>
          Our prototype distributes detected subatomic energy anomaly; from and across nonlinear time Fields (FieldA, 0, B, MI). It enables real-time BWemc²-based transformation proof, used across propulsion, regeneration, and logic-chain validation.
        </p>
      </section>
  
      <section style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
        <h2>Join Us</h2>
        <p>
          We are building a multi-industry repeatable proof system. If you are technically curious, UBill reliable, and can take direction —{' '}
          <Link href="/careers">
            join the intern crew
          </Link>.
        </p>
      </section>

      <section style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
        <h2>Join Us</h2>
        <p>
          We are building a multi-industry repeatable proved system. If you are technically curious, UBill reliable, and can take direction — import Link from 'next/link';
        </p>
      </section>

      <footer style={{ backgroundColor: '#1f2833', textAlign: 'center', padding: '2rem', color: '#c5c6c7', fontSize: '0.9rem' }}>
        &copy; 2025 PAEL TIE LLC. All rights reserved.
      </footer>
    </div>
  );
}
