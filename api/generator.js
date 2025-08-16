// Heuristic game generator + refiner (no external APIs).
// Produces specs the current engine understands.
// Goals: reachable jumps, coin above platforms, 1 lava hazard,
// lightweight auto-refinement loop.

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function parsePrompt(prompt="") {
  const p = prompt.toLowerCase();
  const difficulty =
    p.includes("insane") || p.includes("expert") ? "insane" :
    p.includes("hard")   ? "hard" :
    p.includes("medium") ? "medium" : "easy";

  // themes (could be used by the engine later)
  const theme =
    p.includes("space")  ? "space"  :
    p.includes("forest") ? "forest" :
    p.includes("neon")   ? "neon"   :
    p.includes("desert") ? "desert" :
    p.includes("candy")  ? "candy"  : "classic";

  return { difficulty, theme };
}

function paramsForDifficulty(diff) {
  switch (diff) {
    case "insane": return { gapsX: [150, 190], gapsY: [70, 110], speed: 3.6, jump: 12, coins: 6 };
    case "hard":   return { gapsX: [140, 180], gapsY: [60,  95], speed: 3.4, jump: 11.5, coins: 5 };
    case "medium": return { gapsX: [120, 165], gapsY: [50,  90], speed: 3.2, jump: 11,   coins: 4 };
    default:       return { gapsX: [100, 150], gapsY: [40,  80], speed: 3.0, jump: 10.5, coins: 3 };
  }
}

function baseSpec({difficulty, theme}) {
  const W = 800, H = 480;
  const p = paramsForDifficulty(difficulty);

  const world = { width: W, height: H, gravity: 0.7 };
  const player = {
    start: { x: 40, y: H - 120 },
    size: { w: 26, h: 26 },
    speed: p.speed,
    jump:  p.jump
  };

  // ground
  const platforms = [{ x: 0, y: H - 40, w: W, h: 40 }];

  // ascending stepping stones
  const steps = p.coins + 2;
  let x = rand(120, 180);
  let y = H - rand(120, 160);
  for (let i = 0; i < steps; i++) {
    const w = rand(100, 140), h = 12;
    platforms.push({ x, y, w, h });
    x += rand(...p.gapsX);
    y -= rand(...p.gapsY);
    y = clamp(y, 140, H - 80);
    if (x > W - 140) x = rand(420, 520);       // keep in frame
  }

  // coins above non-ground platforms
  const coins = platforms.slice(1, 1 + p.coins).map(pl => ({
    x: pl.x + pl.w / 2,
    y: pl.y - 30
  }));

  // one lava patch on ground
  const lava = [{ x: rand(360, 520), y: H - 50, w: rand(90, 140), h: 10 }];

  return {
    meta: { title: "GameCre8 Placeholder", theme, difficulty },
    world, player, platforms, coins, lava,
    controls: { left: ["ArrowLeft"], right: ["ArrowRight"], jump: ["ArrowUp","Space"] }
  };
}

// simple reachability heuristic: dx and dy within a safe envelope
function reachable(a, b, jump, speed) {
  const dx = Math.abs((b.x + b.w/2) - (a.x + a.w/2));
  const dy = (a.y) - (b.y); // positive if b is higher
  return dx <= (speed * 45) && dy <= (jump * 10 + 30);
}

function evaluate(spec) {
  const { player, platforms, coins } = spec;
  let score = 0;

  // score: reachable coins (from nearest platform), fewer overlaps, coins above platforms
  for (const c of coins) {
    const support = platforms.find(pl => c.x >= pl.x && c.x <= pl.x + pl.w && c.y >= pl.y - 50);
    if (support) score += 5;
  }

  // penalize coins floating with no support
  score -= coins.filter(c => !platforms.find(pl => c.x >= pl.x && c.x <= pl.x + pl.w)).length * 3;

  // add small reward if average platform gap is comfortable
  let good = 0;
  for (let i = 1; i < Math.min(platforms.length-1, 6); i++) {
    if (reachable(platforms[i], platforms[i+1], player.jump, player.speed)) good++;
  }
  score += good * 4;

  return score;
}

function tweak(spec) {
  // mutate a copy slightly
  const s = JSON.parse(JSON.stringify(spec));
  const idx = Math.floor(rand(1, Math.min(6, s.platforms.length)));
  const pl = s.platforms[idx];
  if (pl) { pl.x += rand(-25, 25); pl.y += rand(-20, 20); }
  const cidx = Math.floor(rand(0, Math.min(4, s.coins.length)));
  const c = s.coins[cidx];
  if (c) { c.x += rand(-20, 20); c.y += rand(-15, 15); }
  return s;
}

function autoRefine(seed, iterations=18) {
  let best = seed;
  let bestScore = evaluate(seed);
  for (let i = 0; i < iterations; i++) {
    const cand = tweak(best);
    const sc = evaluate(cand);
    if (sc >= bestScore) { best = cand; bestScore = sc; }
  }
  return best;
}

function generateFromPrompt(prompt, opts={}) {
  const meta = parsePrompt(prompt);
  const seed = baseSpec(meta);
  if (opts.auto) {
    return autoRefine(seed, opts.iterations || 18);
  }
  return seed;
}

function refine(spec, feedback={}) {
  // optional: shift difficulty by feedback.difficulty, etc.
  return autoRefine(spec, clamp(feedback.iterations || 12, 4, 40));
}

module.exports = { generateFromPrompt, refine, parsePrompt, baseSpec };
