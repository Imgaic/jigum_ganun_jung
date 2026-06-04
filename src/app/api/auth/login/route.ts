import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { findUserByUsername, getUserProfile, touchLastLogin } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { normalizeText } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const username = normalizeText(data.username);
  const password = normalizeText(data.password);
  const user = findUserByUsername(username);

  if (!user) {
    return NextResponse.json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return NextResponse.json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  touchLastLogin(user.id);
  await setSessionCookie({ userId: user.id, username: user.username });

  return NextResponse.json({ user: getUserProfile(user.id) });
}
