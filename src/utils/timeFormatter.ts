import { getVirtualNow } from "./timeSpeed";

/**
 * 밀리초 타임스탬프를 입력받아 상대적인 시간 경과 텍스트를 반환합니다.
 * 타임스탬프가 유효하지 않거나 0 이하일 경우 "제보 없음"을 반환합니다.
 */
export const getRelativeTimeText = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) return "제보 없음";
  
  const diffMs = getVirtualNow() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "방금 전";
  return `${diffMins}분 전`;
};
