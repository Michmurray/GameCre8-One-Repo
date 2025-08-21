import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Input: { config, choiceId }
 * - choiceId matches one of config.evolve[].id
 * Output: updated config
 */
export async function POST(req: Request) {
  const { config, choiceId } = await req.json().catch(() => ({} as any));
  if (!config || !choiceId) {
    return NextResponse.json({ error: "Missing config or choiceId" }, { status: 400 });
  }

  const choice = (config.evolve || []).find((c: any) => c.id === choiceId);
  if (!choice) return NextResponse.json(config);

  const out = JSON.parse(JSON.stringify(config));
  for (const [k, v] of Object.entries(choice.effects || {})) {
    if (k in out.gameplay) out.gameplay[k] = v;
    if (k === "tripleShot") out.gameplay.tripleShot = Boolean(v);
  }
  return NextResponse.json(out);
}
