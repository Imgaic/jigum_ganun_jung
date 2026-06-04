import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getTopRankings } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  return NextResponse.json({ rankings: getTopRankings(session?.userId) });
}
