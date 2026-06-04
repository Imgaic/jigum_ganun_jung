import { NextResponse } from "next/server";
import { clearSessionCookie, readSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = getUserProfile(session.userId);

  if (!user) {
    await clearSessionCookie();
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
