import { PlaceHistory } from "../types";

/**
 * 최근 30분간의 제보 이력들을 기반으로 시간 감쇠 가중 평균(Time-Decay Weighted Average) 혼잡도를 계산합니다.
 * @param history 제보 이력 목록
 * @returns 0 (알 수 없음) 또는 1~5 단계 혼잡도
 */
export function calculateWeightedCrowdLevel(history: PlaceHistory[], nowMs: number): number {
  if (!history || history.length === 0) {
    return 0; // 제보가 전혀 없으면 알 수 없음
  }

  const now = nowMs;
  const limitMs = 30 * 60 * 1000; // 30분

  // 1. 최근 30분(가상 시각) 이내의 제보만 선별
  const recentReports = history.filter(
    (hist) => now - hist.timestamp >= 0 && now - hist.timestamp <= limitMs
  );

  if (recentReports.length === 0) {
    return 0; // 유효 제보가 없으면 알 수 없음
  }

  let totalWeight = 0;
  let weightedSum = 0;

  // 2. 시간-신뢰도 복합 가중치 합산 계산
  recentReports.forEach((report) => {
    const diffMs = now - report.timestamp;
    // 방금 제보 = 1.0, 30분 경과 = 0.0 으로 선형 감쇠
    const timeWeight = Math.max(0, 1 - diffMs / limitMs);
    
    // 유저 신뢰도 비율 반영 (기본값 80% / 0.8)
    const trustFactor = report.reporterTrustScore !== undefined
      ? report.reporterTrustScore / 100
      : 0.8;

    const weight = timeWeight * trustFactor;

    weightedSum += report.crowdLevel * weight;
    totalWeight += weight;
  });

  // 가중치 합이 너무 미미하면 알 수 없음 처리
  if (totalWeight < 0.01) {
    return 0;
  }

  // 3. 가중 평균 연산 및 반올림 클램핑
  const average = weightedSum / totalWeight;
  const roundedLevel = Math.round(average);

  return Math.min(5, Math.max(1, roundedLevel));
}

export interface CrowdLevelInfo {
  label: string;
  color: string;
  bg: string;
  border: string;
}

/**
 * 혼잡도 수치에 대응하는 라벨 텍스트, 글자 색상, 배경 색상, 테두리 스타일 정보를 반환합니다.
 * @param level 0 (알 수 없음) 또는 1~5 단계 혼잡도
 */
export function getCrowdLevelInfo(level: number): CrowdLevelInfo {
  switch (level) {
    case 0:
      return { label: "알 수 없음", color: "#787880", bg: "rgba(120, 120, 128, 0.12)", border: "rgba(120, 120, 128, 0.25)" };
    case 1:
      return { label: "매우 한산", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)" };
    case 2:
      return { label: "여유", color: "#34d399", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.3)" };
    case 3:
      return { label: "보통", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" };
    case 4:
      return { label: "붐빔", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" };
    case 5:
      return { label: "매우 혼잡", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)" };
    default:
      return { label: "정보 없음", color: "#6b7280", bg: "rgba(107, 114, 128, 0.12)", border: "rgba(107, 114, 128, 0.3)" };
  }
}
