import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (process.env.ASSETS_BASE || "").replace(/\/+$/, "");
  if (!base) return NextResponse.json({ ok: false, error: "ASSETS_BASE missing" }, { status: 500 });

  const urls = [
    `${base}/Backgrounds/black.png`,
    `${base}/Spritesheet/playerShip1_blue.png`,
    `${base}/Enemies/enemyBlue3.png`,
    `${base}/Meteors/meteorBrown_big1.png`,
    `${base}/Lasers/laserBlue06.png`
  ];

  const results = await Promise.all(urls.map(async (u) => {
    try {
      const r = await fetch(u, { method: "HEAD", cache: "no-store" });
      return { url: u, ok: r.ok, status: r.status };
    } catch (e:any) {
      return { url: u, ok: false, status: 0, error: e?.message || "fetch failed" };
    }
  }));

  const ok = results.every(r => r.ok);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 500 });
}
