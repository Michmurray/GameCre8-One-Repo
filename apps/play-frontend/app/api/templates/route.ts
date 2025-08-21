import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 5 seed templates (keep these slugs stable; the rest of the app expects them)
  return NextResponse.json([
    { slug: "galaxy-blaster", genre: "shooter" },
    { slug: "unicorn-jumper", genre: "runner" },
    { slug: "turbo-racer", genre: "racer" },
    { slug: "crystal-puzzle", genre: "puzzle" },
    { slug: "mini-builder", genre: "builder" }
  ]);
}
