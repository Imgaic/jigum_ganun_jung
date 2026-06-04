import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createUser, findUserByUsername, getUserProfile } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { isValidNickname, isValidPassword, isValidUsername, normalizeText } from "@/lib/api";

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
  const nickname = normalizeText(data.nickname);

  if (!isValidUsername(username)) {
    return NextResponse.json({ message: "아이디는 영문/숫자/_ 조합 4~20자로 입력해 주세요." }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  if (!isValidNickname(nickname)) {
    return NextResponse.json({ message: "닉네임은 2~16자로 입력해 주세요." }, { status: 400 });
  }

  if (findUserByUsername(username)) {
    return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = createUser(username, passwordHash, nickname);
  await setSessionCookie({ userId, username });

  const user = getUserProfile(userId);
  return NextResponse.json({ user });
}
