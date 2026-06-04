import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getUserDirectory } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  return NextResponse.json({ users: getUserDirectory(session.userId) });
}
