import React, { useEffect, useState } from 'react';

interface RamiData {
  ldd: string;
  zrasw: string;
  fieldInfo: string;
  agiMessage: string;
}

export default function RamiResponse({ sessionId, imageId }: { sessionId: string; imageId: string }) {
  const [data, setData] = useState<RamiData | null>(null);

  useEffect(() => {
    fetch(`/api/rami?sessionId=${sessionId}&imageId=${imageId}`)
      .then(res => res.json())
      .then(setData);
  }, [sessionId, imageId]);

  if (!data) return <p>Loading AGI response...</p>;

  return (
    <div style={{ marginTop: '2rem', backgroundColor: '#1f1f2e', padding: '1rem', borderRadius: '8px' }}>
      <h3>RAMI Response</h3>
      <p><strong>LdD:</strong> {data.ldd}</p>
      <p><strong>ZraSW:</strong> {data.zrasw}</p>
      <p><strong>Field Evaluation:</strong> {data.fieldInfo}</p>
      <p style={{ fontStyle: 'italic', color: '#ccc' }}>{data.agiMessage}</p>
    </div>
  );
}
