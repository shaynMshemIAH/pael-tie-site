import { useState } from "react";

export default function RamiProxyTool() {
  const [path, setPath] = useState("health"); // e.g. "run", "ingest"
  const [method, setMethod] = useState<"GET"|"POST"|"PUT"|"DELETE">("POST");
  const [body, setBody] = useState<string>('{"theta":0.7,"shots":1000}');
  const [out, setOut] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function call() {
    setBusy(true); setOut(null);
    try {
      const opts: RequestInit = { method };
      if (method !== "GET" && method !== "HEAD") {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = body;
      }
      const r = await fetch(`/api/rami/${path.replace(/^\/+/, "")}`, opts);
      const text = await r.text();
      // try json, else raw text
      try { setOut(JSON.parse(text)); } catch { setOut(text); }
    } catch (e:any) {
      setOut({ ok:false, error: e?.message });
    } finally { setBusy(false); }
  }

  return (
    <main style={{maxWidth:780, margin:"40px auto", fontFamily:"ui-sans-serif"}}>
      <h1 style={{fontSize:28, marginBottom:16}}>RAMI / CUDA-Q Proxy</h1>
      <div style={{display:"grid", gap:12}}>
        <label>Endpoint path under <code>/api/rami/</code>:
          <input value={path} onChange={e=>setPath(e.target.value)} style={{marginLeft:8, width:"60%"}}/>
        </label>
        <label>Method:
          <select value={method} onChange={e=>setMethod(e.target.value as any)} style={{marginLeft:8}}>
            <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
          </select>
        </label>
        <label>Body (JSON):
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} style={{display:"block", width:"100%", marginTop:6}} />
        </label>
        <button onClick={call} disabled={busy} style={{padding:"8px 14px"}}>
          {busy ? "Calling…" : "Send"}
        </button>
      </div>
      {out && (
        <pre style={{marginTop:20, background:"#111", color:"#eee", padding:12, borderRadius:8, overflow:"auto"}}>
{typeof out === "string" ? out : JSON.stringify(out,null,2)}
        </pre>
      )}
    </main>
  );
}
