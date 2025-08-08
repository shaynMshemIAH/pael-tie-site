// pages/agi/live.tsx
import { useEffect, useState } from "react";

type Sample = {
  device_id: string;
  ts: string;
  o2: number;
  temperature: number;
  pressure: number;
  altitude: number;
};

export default function Live() {
  const [items, setItems] = useState<Sample[]>([]);
  const [busy, setBusy] = useState(false);

  async function load(n = 50) {
    setBusy(true);
    const r = await fetch(`/api/telemetry?path=recent&n=${n}`);
    const j = await r.json();
    setItems(j.items || []);
    setBusy(false);
  }

  useEffect(() => {
    load(60);
    const t = setInterval(() => load(60), 3000); // refresh every 3s
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{padding:24,maxWidth:1000,margin:"0 auto",fontFamily:"system-ui"}}>
      <h1>Live Telemetry</h1>
      <div style={{margin:"8px 0"}}>
        <button onClick={()=>load(60)} disabled={busy} style={{padding:"6px 10px"}}>{busy?"Refreshing…":"Refresh"}</button>
        <a href="/api/telemetry?path=summary" target="_blank" rel="noreferrer" style={{marginLeft:12}}>Summary JSON</a>
      </div>

      <div style={{overflowX:"auto", border:"1px solid #eee", borderRadius:8}}>
        <table style={{borderCollapse:"collapse", width:"100%"}}>
          <thead>
            <tr style={{background:"#fafafa"}}>
              <th style={th}>ts (UTC)</th>
              <th style={th}>device</th>
              <th style={th}>O₂ %</th>
              <th style={th}>Temp °C</th>
              <th style={th}>Pressure hPa</th>
              <th style={th}>Altitude m</th>
            </tr>
          </thead>
          <tbody>
            {items.slice().reverse().map((s, idx)=>(
              <tr key={idx} style={{borderTop:"1px solid #eee"}}>
                <td style={td}>{s.ts}</td>
                <td style={td}>{s.device_id}</td>
                <td style={td}>{s.o2?.toFixed(3)}</td>
                <td style={td}>{s.temperature?.toFixed(2)}</td>
                <td style={td}>{s.pressure?.toFixed(2)}</td>
                <td style={td}>{s.altitude?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          a, button { display:none }
          table { font-size: 11px }
        }
      `}</style>
    </div>
  );
}

const th: React.CSSProperties = { textAlign:"left", padding:"8px 10px", fontWeight:600, fontSize:13 };
const td: React.CSSProperties = { textAlign:"left", padding:"6px 10px", fontSize:13 };
