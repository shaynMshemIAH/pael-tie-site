// pages/careers.tsx
export default function Careers() {
  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      backgroundColor: '#0b0c10',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#66fcf1' }}>🌱 Join the Intern Crew</h1>
      <p style={{ maxWidth: '700px', lineHeight: '1.6' }}>
        We’re looking for curious, adaptive, and reliable interns to help advance the future of subatomic energy distribution.
        Interns will collaborate across aerospace, AI, and pharma proofs — no filler tasks, just proof-driven impact.
      </p>

      <h3 style={{ marginTop: '2rem' }}>Apply via LinkedIn:</h3>
      <p>
        <a
          href="https://www.linkedin.com/in/zachary-pagett-754523308/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#45a29e', textDecoration: 'underline' }}
        >
          → View Internship Posting on LinkedIn
        </a>
      </p>

      <p style={{ marginTop: '4rem', color: '#c5c6c7' }}>
        🚀 PAEL TIE: That should be on my remote desk yesterday, now.
      </p>
    </main>
  );
}
