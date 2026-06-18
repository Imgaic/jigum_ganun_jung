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
  percentage: string;
  description: string;
}

type CrowdCategory = "food" | "study" | "rest";

const descriptions: Record<CrowdCategory, Record<number, string>> = {
  food: {
    1: "자리가 아주 여유롭고 대기 줄이 거의 보이지 않습니다.",
    2: "빈자리가 넉넉하며 주문 대기 시간이 매우 짧습니다.",
    3: "사람이 적당히 있고, 군데군데 빈자리가 꽤 보입니다.",
    4: "빈자리가 드물어 자리를 먼저 찾아야 하며,\n주문 대기 줄이 긴 편입니다.",
    5: "대부분의 테이블이 만석이며,\n음식 주문과 수령을 위해 오래 대기해야 합니다."
  },
  study: {
    1: "빈자리가 아주 많아 원하는 위치를 자유롭게 선택할 수 있습니다.",
    2: "빈 좌석이 넉넉하며, 전반적으로 한산하며 조용합니다.",
    3: "사람들이 조금 있으나 빈자리도 무난하게 찾을 수 있습니다.",
    4: "남는 좌석이 그리 많지 않아 빈자리를 찾아봐야 합니다.",
    5: "빈자리를 찾기 힘들거나 거의 없는 상태입니다."
  },
  rest: {
    1: "공간이 한적하고 조용하며 빈자리가 매우 많습니다.",
    2: "이용자가 적당히 분산되어 있어 비교적 한산합니다.",
    3: "사람들이 조금 있으나 빈자리도 무난하게 찾을 수 있습니다.",
    4: "이용 인원이 많아 다소 북적이며 빈자리가 드뭅니다.",
    5: "빈자리를 찾기 힘들거나 거의 없는 상태입니다."
  }
};

function determineCategory(purposes?: string[]): CrowdCategory {
  if (!purposes || purposes.length === 0) return "rest";
  if (purposes.includes("식사")) return "food";
  if (purposes.includes("공부") || purposes.includes("조용한 곳")) return "study";
  return "rest";
}

/**
 * 혼잡도 수치에 대응하는 라벨 텍스트, 글자 색상, 배경 색상, 테두리 스타일 정보를 반환합니다.
 * @param level 0 (알 수 없음) 또는 1~5 단계 혼잡도
 * @param purposes 장소의 목적 태그 목록
 */
export function getCrowdLevelInfo(level: number, purposes?: string[]): CrowdLevelInfo {
  const category = determineCategory(purposes);

  const getDesc = (lvl: number): string => {
    if (lvl === 0) return "최근 30분 내 제보가 없어 혼잡도를 알 수 없습니다.";
    if (lvl >= 1 && lvl <= 5) return descriptions[category][lvl];
    return "정보가 존재하지 않습니다.";
  };

  switch (level) {
    case 0:
      return {
        label: "알 수 없음",
        color: "#787880",
        bg: "rgba(120, 120, 128, 0.12)",
        border: "rgba(120, 120, 128, 0.25)",
        percentage: "-",
        description: getDesc(0)
      };
    case 1:
      return {
        label: "매우 여유",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.3)",
        percentage: "20% 이하",
        description: getDesc(1)
      };
    case 2:
      return {
        label: "여유",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.12)",
        border: "rgba(52, 211, 153, 0.3)",
        percentage: "20~40%",
        description: getDesc(2)
      };
    case 3:
      return {
        label: "보통",
        color: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.12)",
        border: "rgba(59, 130, 246, 0.3)",
        percentage: "40~60%",
        description: getDesc(3)
      };
    case 4:
      return {
        label: "혼잡",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.12)",
        border: "rgba(245, 158, 11, 0.3)",
        percentage: "60~80%",
        description: getDesc(4)
      };
    case 5:
      return {
        label: "매우 혼잡",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.12)",
        border: "rgba(239, 68, 68, 0.3)",
        percentage: "80% 이상",
        description: getDesc(5)
      };
    default:
      return {
        label: "정보 없음",
        color: "#6b7280",
        bg: "rgba(107, 114, 128, 0.12)",
        border: "rgba(107, 114, 128, 0.3)",
        percentage: "-",
        description: getDesc(level)
      };
  }
}
