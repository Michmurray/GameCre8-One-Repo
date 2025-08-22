"use client";
import { useState } from "react";

export default function HealthPage() {
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const r = await fetch("/api/smoke", { cache: "no-store" });
      const j = await r.json();
      setOut({ status: r.status, ...j });
    } catch (e:any) {
      setOut({ status: 0, ok: false, error: e?.message || "failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:16,fontFamily:"ui-sans-serif,system-ui",color:"#e8e8f0",background:"#000",minHeight:"100vh"}}>
      <h1 style={{margin:"6px 0 12px"}}>Health Check</h1>
      <button
        onClick={run}
        disabled={loading}
        style={{padding:"10px 14px",border:0,borderRadius:10,background:"#4b6bff",color:"#fff",fontWeight:800,cursor:"pointer"}}
      >
        {loading ? "Checking…" : "Run Smoke Test"}
      </button>

      {out && (
        <div style={{marginTop:16,background:"#0b0f18",border:"1px solid #1c2333",borderRadius:12,padding:12}}>
          <div>Status: <strong style={{color: out.ok ? "#7CFC7C" : "#ff8a80"}}>{out.ok ? "OK" : "FAIL"}</strong> (HTTP {out.status})</div>
          {out.results && (
            <ul style={{marginTop:8,lineHeight:"1.6"}}>
              {out.results.map((r:any)=>(
                <li key={r.url}>
                  <code style={{fontSize:12}}>{r.url}</code> — {r.ok ? "OK ✅" : `FAIL ❌ (${r.status})`}
                </li>
              ))}
            </ul>
          )}
          {out.error && <div style={{marginTop:8,color:"#ff8a80"}}>{out.error}</div>}
        </div>
      )}
    </div>
  );
}
