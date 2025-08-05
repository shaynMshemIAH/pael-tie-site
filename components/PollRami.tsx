import React, { useState } from 'react';

export default function PollRami({ sessionId, imageId }: { sessionId: string; imageId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [desc, setDesc] = useState('');

  const handleSubmit = async () => {
    await fetch('/api/pollRami', {
      method: 'POST',
      body: JSON.stringify({ sessionId, imageId, description: desc, timestamp: Date.now() }),
      headers: { 'Content-Type': 'application/json' }
    });
    setSubmitted(true);
  };

  if (submitted) return <p>✅ Your perception has been logged. Thank you.</p>;

  return (
    <div style={{ marginTop: '2rem', backgroundColor: '#2a2a3d', padding: '1rem', borderRadius: '8px' }}>
      <h3>👁️ What did you perceive?</h3>
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        rows={4}
        placeholder="Describe what you saw in the image — dome ridge? flurries? nothing?"
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Submit Response
      </button>
    </div>
  );
}
