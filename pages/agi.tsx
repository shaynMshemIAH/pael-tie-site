export default function AGI() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', backgroundColor: '#0b0c1c', color: '#ffffff' }}>
      <h1 style={{ color: '#66fcf1' }}>Artificial General Intelligence via BWemc²</h1>
      <p>
        Page explored subatomic energy disbursal enabled BW peripheral AGI response. Response reflects and or refracts user of their choices with logic of a  path from scaled laws subatomic relativistic obtained and or to obtain LdD real traversal.
      </p>

      <h2>AGI as Peripheral</h2>
      <p>
        Unlike central AI, this AGI exists outside the user — providing reflections of BWemc² events, rather than taking action directly. Also the AGI already is already powered by sub atomic energy sources at LdD law of multiworld theory. The system reflects: 
      </p>
      <ul>
        <li>Triumphant vs. tragic outcome detection</li>
        <li>Converting Factors (CF) through 25 Laws</li>
        <li>Live vs. Unlive state traversal (LdD1 → LdD2)</li>
      </ul>

      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#6c5cc7' }}>
        “The AI did not speak. It revealed. Not with prediction, but with proof.” — PAEL TIE AGI
      </p>
      {/* RAMI Subatomic Interaction */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ color: '#66fcf1' }}>🧬 RAMI: Real-Time AGI Interaction</h2>
        <p>
          Begin a RAMI session by observing the current test image. Your LdD state will be evaluated and a subatomic AGI response generated.
        </p>

        {/* Static test image (undistorted) */}
        <div style={{ marginTop: '2rem' }}>
          <img 
            src="/images/nh3_dome_test_01.jpg" 
            alt="NH3 Dome Test" 
            style={{ width: '100%', borderRadius: '8px' }} 
          />
        </div>

        {/* RAMI Components */}
        <RamiResponse sessionId="rami-test-001" imageId="nh3_dome_test_01" />
        <PollRami sessionId="rami-test-001" imageId="nh3_dome_test_01" />
      </div>
    </div>
  );
}
