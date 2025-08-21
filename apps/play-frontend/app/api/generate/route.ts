import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Minimal, dependency-free generator.
 * Input: { slug?: string }
 * Output: { meta, sprites, gameplay, evolve[] }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const slug = (body?.slug || "galaxy-blaster") as string;

  const ASSETS_BASE = (process.env.ASSETS_BASE || "").replace(/\/+$/, "");
  if (!ASSETS_BASE) {
    return NextResponse.json({ error: "ASSETS_BASE missing" }, { status: 500 });
  }

  // Canonical asset paths (you only overwrite the files in Supabase)
  const commonSprites = {
    background: `${ASSETS_BASE}/Backgrounds/black.png`,
    player:     `${ASSETS_BASE}/Spritesheet/playerShip1_blue.png`,
    enemy:      `${ASSETS_BASE}/Enemies/enemyBlue3.png`,
    meteor:     `${ASSETS_BASE}/Meteors/meteorBrown_big1.png`,
    bullet:     `${ASSETS_BASE}/Lasers/laserBlue06.png`,
  };

  // Per-template defaults (can be tuned later)
  const templates: Record<string, any> = {
    "galaxy-blaster": {
      genre: "shooter",
      sprites: commonSprites,
      gameplay: {
        playerSpeed: 4.2,
        bulletCooldown: 9,
        enemySpeedBase: 2.6,
        enemySpawnBase: 0.024,
        meteorSpawnBase: 0.02,
        tripleShot: false,
        enemySpeedMultiplier: 1,
        meteorMultiplier: 1
      },
      evolve: [
        { id: "triple",  label: "🔱 Triple Shot",      effects: { tripleShot: true, bulletCooldown: 7 } },
        { id: "faster",  label: "⚡ Faster Enemies",   effects: { enemySpeedBase: 3.0, enemySpawnBase: 0.03 } },
        { id: "meteors", label: "☄️ More Meteors",     effects: { meteorSpawnBase: 0.035 } }
      ]
    },
    "unicorn-jumper": {
      genre: "runner",
      sprites: commonSprites,
      gameplay: { ...commonSprites, playerSpeed: 4.5, bulletCooldown: 8, enemySpeedBase: 2.2, enemySpawnBase: 0.02, meteorSpawnBase: 0.015, tripleShot: false, enemySpeedMultiplier: 1, meteorMultiplier: 1 },
      evolve: [
        { id: "dash",   label: "✨ Magic Dash",        effects: { playerSpeed: 5.0 } },
        { id: "rapid",  label: "💨 Rapid Fire",        effects: { bulletCooldown: 6 } }
      ]
    },
    "turbo-racer": {
      genre: "racer",
      sprites: commonSprites,
      gameplay: { playerSpeed: 5.0, bulletCooldown: 10, enemySpeedBase: 2.0, enemySpawnBase: 0.02, meteorSpawnBase: 0.015, tripleShot: false, enemySpeedMultiplier: 1, meteorMultiplier: 1 },
      evolve: [
        { id: "nitro",  label: "🧪 Nitro Boost",       effects: { playerSpeed: 5.8 } },
        { id: "traffic",label: "🚗 More Traffic",      effects: { enemySpawnBase: 0.032 } }
      ]
    },
    "crystal-puzzle": {
      genre: "puzzle",
      sprites: commonSprites,
      gameplay: { playerSpeed: 3.8, bulletCooldown: 12, enemySpeedBase: 1.8, enemySpawnBase: 0.016, meteorSpawnBase: 0.012, tripleShot: false, enemySpeedMultiplier: 1, meteorMultiplier: 1 },
      evolve: [
        { id: "combo",  label: "💎 Bigger Combos",     effects: { enemySpawnBase: 0.02 } },
        { id: "swift",  label: "🌀 Swift Moves",       effects: { playerSpeed: 4.4 } }
      ]
    },
    "mini-builder": {
      genre: "builder",
      sprites: commonSprites,
      gameplay: { playerSpeed: 3.6, bulletCooldown: 11, enemySpeedBase: 1.6, enemySpawnBase: 0.014, meteorSpawnBase: 0.012, tripleShot: false, enemySpeedMultiplier: 1, meteorMultiplier: 1 },
      evolve: [
        { id: "autos",  label: "🤖 Auto-Collect",      effects: {} },
        { id: "expand", label: "🏗️ Expand Field",      effects: {} }
      ]
    }
  };

  const base = templates[slug] || templates["galaxy-blaster"];
  const cfg = {
    meta: { template: slug, seed: Date.now() },
    sprites: base.sprites,
    gameplay: base.gameplay,
    evolve: base.evolve
  };

  return NextResponse.json(cfg);
}
