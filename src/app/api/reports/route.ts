import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getTopRankings, getUserProfile, recordReport } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const placeId = Number(data.placeId);
  const crowdLevel = Number(data.crowdLevel);
  const durationMinutes = Number(data.durationMinutes);
  const pointsAwarded = Number(data.pointsAwarded || 10);

  if (!Number.isInteger(placeId) || placeId <= 0) {
    return NextResponse.json({ message: "장소 정보가 올바르지 않습니다." }, { status: 400 });
  }

  if (!Number.isInteger(crowdLevel) || crowdLevel < 1 || crowdLevel > 5) {
    return NextResponse.json({ message: "혼잡도는 1~5 사이여야 합니다." }, { status: 400 });
  }

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json({ message: "체류시간이 올바르지 않습니다." }, { status: 400 });
  }

  if (!Number.isInteger(pointsAwarded) || ![10, 20, 30].includes(pointsAwarded)) {
    return NextResponse.json({ message: "보상 포인트가 올바르지 않습니다." }, { status: 400 });
  }

  recordReport(session.userId, placeId, crowdLevel, durationMinutes, pointsAwarded);

  return NextResponse.json({
    user: getUserProfile(session.userId),
    rankings: getTopRankings(session.userId),
  });
}
