"use client";
import { useEffect, useMemo, useState } from "react";

type TemplateCard = { slug: string; genre: string; cover?: string; tagline?: string };

export default function Page() {
  const [templates, setTemplates] = useState<TemplateCard[]>([]);
  const [cfg, setCfg] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { (async () => {
    const r = await fetch("/api/templates");
    setTemplates(await r.json());
  })(); }, []);

  async function createAndPlay(slug: string) {
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    const c = await r.json();
    setCfg(c);
    setPlaying(true);
  }

  return (
    <div style={{padding:"16px"}}>
      {!playing && (
        <>
          <h1 style={{margin:"6px 0 10px"}}>Game Room</h1>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
            {templates.map(t => (
              <div key={t.slug} style={{background:"#0b0f18",border:"1px solid #1c2333",borderRadius:12,padding:10}}>
                <div style={{fontWeight:700,textTransform:"capitalize"}}>{t.slug.replace("-", " ")}</div>
                <div style={{fontSize:12,opacity:.7}}>{t.genre}</div>
                <button onClick={()=>createAndPlay(t.slug)} style={{marginTop:8,padding:"8px 10px",border:0,borderRadius:8,background:"#4b6bff",color:"#fff",fontWeight:700}}>
                  Create & Play
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {playing && (
        <>
          <iframe
            title="Game"
            srcDoc={useMemo(()=>singleFile(cfg),[cfg])}
            style={{width:"100%",aspectRatio:"16/9",border:"0",borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,.35)"}}
          />
          <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
            {(cfg?.evolve||[]).slice(0,3).map((e:any)=>(
              <button key={e.id}
                onClick={async()=>{
                  const r=await fetch("/api/evolve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({config:cfg,choiceId:e.id})});
                  const c=await r.json(); setCfg(c);
                }}
                style={{padding:"8px 10px",border:0,borderRadius:8,background:"#2bb673",color:"#061",fontWeight:700}}>
                {e.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function singleFile(c:any){
  return `<!DOCTYPE html><meta charset=utf-8><style>html,body{margin:0;background:#000}</style>
  <canvas id=c width=960 height=540></canvas>
  <script>
  const CFG=${JSON.stringify(c)};
  const k={};addEventListener('keydown',e=>k[e.key]=1);addEventListener('keyup',e=>k[e.key]=0);
  const C=document.getElementById('c'),X=C.getContext('2d');
  let P={x:430,y:440,w:56,h:56,cd:0},B=[],E=[],M=[];
  let iP=new Image(),iE=new Image(),iM=new Image(),iBg=new Image();
  iP.src=CFG.sprites.player;iE.src=CFG.sprites.enemy;iM.src=CFG.sprites.meteor;iBg.src=CFG.sprites.background;
  function spawn(){if(Math.random()<CFG.gameplay.enemySpawnBase)E.push({x:Math.random()*900,y:-60,w:56,h:56,dy:CFG.gameplay.enemySpeedBase});
                  if(Math.random()<CFG.gameplay.meteorSpawnBase)M.push({x:Math.random()*900,y:-60,w:64,h:64,dy:2.2});}
  function tick(){requestAnimationFrame(tick);spawn();X.drawImage(iBg,0,0,960,540);
    if(k['ArrowLeft']||k['a'])P.x-=CFG.gameplay.playerSpeed;if(k['ArrowRight']||k['d'])P.x+=CFG.gameplay.playerSpeed;
    if(k[' ']&&P.cd<=0){B.push({x:P.x+P.w/2-2,y:P.y,dy:-9});if(CFG.gameplay.tripleShot){B.push({x:P.x+8,y:P.y,dy:-9});B.push({x:P.x+P.w-12,y:P.y,dy:-9});}P.cd=CFG.gameplay.bulletCooldown;}
    if(P.cd>0)P.cd--;P.x=Math.max(0,Math.min(960-P.w,P.x));
    B.forEach(b=>{b.y+=b.dy});E.forEach(e=>{e.y+=e.dy});M.forEach(m=>{m.y+=m.dy});
    B=B.filter(b=>b.y>-20);E=E.filter(e=>e.y<600);M=M.filter(m=>m.y<600);
    E.forEach(e=>X.drawImage(iE,e.x,e.y,e.w,e.h));M.forEach(m=>X.drawImage(iM,m.x,m.y,m.w,m.h));X.drawImage(iP,P.x,P.y,P.w,P.h);
  } tick();<\/script>`;
}
