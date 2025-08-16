// public/engine.js
// Tiny but sturdy engine. No DOM assumptions — all HUD updates are guarded.

export class TinyEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.running = false;

    this.keys = new Set();
    window.addEventListener("keydown", (e) => this.keys.add(e.key));
    window.addEventListener("keyup",   (e) => this.keys.delete(e.key));
  }

  load(spec) {
    // Optional HUD updates — only if elements exist
    const titleEl = document.getElementById("title");
    if (titleEl) titleEl.textContent = spec?.meta?.title ?? "GameCre8 Placeholder";

    // World
    this.spec = spec || {};
    const world = this.spec.world || { width: 800, height: 480, gravity: 0.7 };
    this.canvas.width  = world.width;
    this.canvas.height = world.height;
    this.gravity = world.gravity ?? 0.7;

    // Player
    const p = this.spec.player || {};
    const size  = p.size  || { w: 26, h: 26 };
    const start = p.start || { x: 40,  y: 320 };
    this.player = {
      x: start.x, y: start.y,
      w: size.w,  h: size.h,
      vx: 0, vy: 0,
      speed: p.speed ?? 3.2,
      jump:  p.jump  ?? 11,
      onGround: false,
    };

    // Level parts
    this.platforms = Array.isArray(this.spec.platforms) ? this.spec.platforms : [];
    this.lava      = Array.isArray(this.spec.lava)      ? this.spec.lava      : [];
    this.coins     = Array.isArray(this.spec.coins)
      ? this.spec.coins.map(c => ({ ...c, r: 8, taken: false }))
      : [];

    this.score = 0;

    // Start loop
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    const step = () => {
      this.update();
      this.draw();
      if (this.running) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  stop() { this.running = false; }

  _overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  update() {
    const p = this.player;
    if (!p) return;

    // input
    const left  = this.keys.has("ArrowLeft");
    const right = this.keys.has("ArrowRight");
    const jump  = this.keys.has("ArrowUp") || this.keys.has(" ") || this.keys.has("Space");

    // horizontal
    p.vx = 0;
    if (left)  p.vx -= p.speed;
    if (right) p.vx += p.speed;

    // vertical
    p.vy += this.gravity;

    // move X and resolve walls
    p.x += p.vx;
    for (const plat of this.platforms) {
      if (this._overlap({ x:p.x, y:p.y, w:p.w, h:p.h }, plat)) {
        if (p.vx > 0) p.x = plat.x - p.w;
        else if (p.vx < 0) p.x = plat.x + plat.w;
      }
    }

    // move Y and ground/ceiling
    p.y += p.vy;
    p.onGround = false;
    for (const plat of this.platforms) {
      if (this._overlap({ x:p.x, y:p.y, w:p.w, h:p.h }, plat)) {
        if (p.vy > 0) { // falling onto top
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
        } else if (p.vy < 0) { // hitting bottom
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    }

    if (jump && p.onGround) {
      p.vy = -p.jump;
      p.onGround = false;
    }

    // lava → reset
    for (const lv of this.lava) {
      if (this._overlap({ x:p.x, y:p.y, w:p.w, h:p.h }, lv)) {
        const start = this.spec.player?.start || { x: 40, y: 320 };
        p.x = start.x; p.y = start.y; p.vx = 0; p.vy = 0;
        this.score = 0;
        this.coins.forEach(c => (c.taken = false));
      }
    }

    // coins
    for (const c of this.coins) {
      if (!c.taken && this._overlap({ x:p.x, y:p.y, w:p.w, h:p.h }, { x:c.x - 8, y:c.y - 8, w:16, h:16 })) {
        c.taken = true; this.score++;
      }
    }

    // HUD score (guarded)
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.textContent = `Score: ${this.score}`;
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // platforms
    ctx.fillStyle = "#2c3e50";
    for (const plat of this.platforms) ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

    // lava
    ctx.fillStyle = "#e74c3c";
    for (const lv of this.lava) ctx.fillRect(lv.x, lv.y, lv.w, lv.h);

    // coins
    ctx.fillStyle = "#f1c40f";
    for (const c of this.coins) {
      if (!c.taken) { ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fill(); }
    }

    // player
    const p = this.player;
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}
