import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ backgroundColor: '#0b0c1c', color: '#ffffff', fontFamily: 'Arial', lineHeight: '1.6', padding: 0, margin: 0 }}>
      <header style={{ backgroundColor: '#1f2833', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#66fcf1' }}>
          Had proven subatomic energy disbursal on matter across aerospace, pharma, and AGI logic trees — repeatable, physical, and tied to human BWemc².
        </h1>
        <p>We’re funding scale.</p>
        <blockquote style={{ fontStyle: 'italic', color: '#6c5cc7' }}>
          “Are, bit morbid about our endurance; monsoon vacation.” — Edgar 4^17
        </blockquote>
      </header>

      <nav style={{ textAlign: 'center', backgroundColor: '#4a52ae', padding: '1rem 0' }}>
        <Link 
          href="/aerospace" 
          style={{ fontWeight: 'bold', textDecoration: 'none', color: '#00b6ce', margin: '0 1rem' }}
        >
          Aerospace
        </Link>
        <Link 
          href="/pharma"
          style={{ fontWeight: 'bold', textDecoration: 'none', color: '#00b6ce', margin: '0 1rem' }}
        >
          Pharma
        </Link>
        <Link 
          href="/agi"
          style={{ fontWeight: 'bold', textDecoration: 'none', color: '#00b6ce', margin: '0 1rem' }}
        >
          AGI
        </Link>
      </nav>

      <section style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
        <h2>PAEL TIE Prototype</h2>
        <p>
          Our prototype distributes detected subatomic energy anomaly; from and across nonlinear time Fields (FieldA, 0, B, MI).
          It enables real-time BWemc²-based transformation proof, used across propulsion, regeneration, and logic-chain validation.
        </p>
        <p><strong>Patent Pending:</strong> U.S. Application No. 63/837,074</p>
      </section>

      <section style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
        <h2>Join Us</h2>
        <p>
          We are building a multi-industry; systematically responsible system.— 
          <a href="#"> join the intern crew.</a>
        </p>
      </section>

      <footer style={{ backgroundColor: '#1f2833', textAlign: 'center', padding: '2rem', color: '#6c5cc7', fontSize: '0.9rem' }}>
        © 2025 PAEL TIE LLC. All rights reserved.
      </footer>
    </div>
  );
}
