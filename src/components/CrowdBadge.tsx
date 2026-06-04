"use client";

import React from "react";
import { Place } from "../types";
import { useUserContext } from "../context/UserContext";
import { calculateWeightedCrowdLevel, getCrowdLevelInfo } from "../utils/crowdAnalyzer";

interface CrowdBadgeProps {
  place: Place;
  customClick?: boolean;
}

export default function CrowdBadge({ place, customClick = false }: CrowdBadgeProps) {
  const { unlockedUntil, handlePromptUnlock, nowMs } = useUserContext();
  const isUnlocked = unlockedUntil > nowMs;
  const currentCalcLevel = calculateWeightedCrowdLevel(place.history, nowMs);

  // 정보가 잠겨 있는 상태일 경우
  if (!isUnlocked) {
    return (
      <span
        onClick={(e) => {
          if (customClick) {
            e.stopPropagation();
          }
          handlePromptUnlock();
        }}
        style={{
          fontSize: "11px",
          fontWeight: "800",
          padding: "4px 8px",
          borderRadius: "20px",
          color: "var(--accent)",
          backgroundColor: "hsl(15, 95%, 95%)",
          border: "1px solid hsla(15, 95%, 55%, 0.3)",
          whiteSpace: "nowrap",
          cursor: "pointer"
        }}
      >
        🔒 10P 열람
      </span>
    );
  }

  // 정보가 해제된 경우: 가중 혼잡도에 대응하는 유색 라벨 배지 렌더링
  const crowdInfo = getCrowdLevelInfo(currentCalcLevel);
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: "850",
      padding: "4px 8px",
      borderRadius: "20px",
      color: crowdInfo.color,
      backgroundColor: crowdInfo.bg,
      border: `1px solid ${crowdInfo.border}`,
      whiteSpace: "nowrap"
    }}>
      {crowdInfo.label}
    </span>
  );
}
