export class TinyEngine {
  constructor(canvas, statusEl, titleEl) {
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.statusEl = statusEl; this.titleEl = titleEl;
    this.keys = {}; this.reset();
    window.addEventListener("keydown", (e) => { this.keys[e.key] = true; });
    window.addEventListener("keyup",   (e) => { this.keys[e.key] = false; });
    this.loop = this.loop.bind(this);
  }
  load(gameJson) {
    this.data = gameJson;
    this.titleEl.textContent = gameJson?.meta?.title || "GameCre8 Placeholder";
    this.status("Loaded. Press arrows to play.");
    const { world, player, platforms, coins, lava } = gameJson;
    this.cv.width = world.width; this.cv.height = world.height;
    this.world = { ...world }; this.player = { ...player, vx:0, vy:0, grounded:false };
    this.platforms = platforms.slice(); this.coins = coins.slice(); this.lava = lava.slice();
    cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(this.loop);
  }
  reset(){ this.world={width:800,height:480,gravity:0.7}; this.player={x:40,y:40,w:28,h:28,speed:3,jump:12,vx:0,vy:0,grounded:false}; this.platforms=[]; this.coins=[]; this.lava=[]; this._raf=null; }
  status(msg){ this.statusEl.textContent = msg; }
  rect(r,c){ this.ctx.fillStyle=c; this.ctx.fillRect(r.x,r.y,r.w,r.h); }
  circle(x,y,r,c){ this.ctx.fillStyle=c; this.ctx.beginPath(); this.ctx.arc(x,y,r,0,Math.PI*2); this.ctx.fill(); }
  aabb(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
  step(){
    const p=this.player, left=this.keys["ArrowLeft"]||this.keys["a"], right=this.keys["ArrowRight"]||this.keys["d"], up=this.keys["ArrowUp"]||this.keys["w"]||this.keys[" "];
    p.vx=0; if(left) p.vx=-p.speed; if(right) p.vx=p.speed;
    if(up && p.grounded){ p.vy=-p.jump; p.grounded=false; }
    p.vy += this.world.gravity;
    p.x += p.vx; for(const plat of this.platforms){ if(this.aabb(p,plat)){ if(p.vx>0) p.x=plat.x-p.w; if(p.vx<0) p.x=plat.x+plat.w; } }
    p.y += p.vy; p.grounded=false; for(const plat of this.platforms){ if(this.aabb(p,plat)){ if(p.vy>0){ p.y=plat.y-p.h; p.vy=0; p.grounded=true; } if(p.vy<0){ p.y=plat.y+plat.h; p.vy=0; } } }
    p.x=Math.max(0,Math.min(this.world.width-p.w,p.x)); p.y=Math.max(0,Math.min(this.world.height-p.h,p.y));
    for(const l of this.lava){ if(this.aabb(p,l)){ p.x=40; p.y=40; p.vx=0; p.vy=0; this.status("Ouch! Lava. Try again."); break; } }
    for(let i=this.coins.length-1;i>=0;i--){ const c=this.coins[i], cr={x:c.x-c.size,y:c.y-c.size,w:c.size*2,h:c.size*2}; if(this.aabb(p,cr)){ this.coins.splice(i,1); if(this.coins.length===0) this.status("You collected all coins! 🎉"); } }
  }
  draw(){
    const ctx=this.ctx; ctx.clearRect(0,0,this.cv.width,this.cv.height);
    ctx.fillStyle="#f7f9ff"; ctx.fillRect(0,0,this.cv.width,this.cv.height);
    for(const plat of this.platforms) this.rect(plat,"#d0d7ff");
    for(const l of this.lava) this.rect(l,"#ffb3b3");
    for(const c of this.coins) this.circle(c.x,c.y,c.size,"#ffd766");
    this.rect(this.player,"#111111");
  }
  loop(){ this.step(); this.draw(); this._raf=requestAnimationFrame(this.loop); }
}