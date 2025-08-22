import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Input: { session_id, rating, text, meta }
 * Uses SUPABASE_SERVICE_ROLE_KEY (server-only) to insert a row.
 */
export async function POST(req: Request) {
  const { session_id, rating, text, meta } = await req.json().catch(() => ({} as any));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !srv) {
    return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });
  }

  const supa = createClient(url, srv, { auth: { persistSession: false } });
  const { error } = await supa.from("feedback").insert([
    { session_id, rating, text, meta }
  ]);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
