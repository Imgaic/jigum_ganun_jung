"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PURPOSE_EMOJIS } from "../../types";
import { ArrowLeftIcon, ClockIcon } from "../Icons";
import { usePlacesContext } from "../../context/PlaceContext";
import { useUserContext } from "../../context/UserContext";
import { useGpsContext } from "../../context/GpsContext";
import { calculateWeightedCrowdLevel } from "../../utils/crowdAnalyzer";
import { getRelativeTimeText } from "../../utils/timeFormatter";
import { getVirtualNow } from "../../utils/timeSpeed";
import CrowdBadge from "../CrowdBadge";

export default function ListScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 전역 데이터 및 GPS 상태 구독
  const { places } = usePlacesContext();
  const { unlockedUntil, handlePromptUnlock } = useUserContext();
  const { myGPSBuilding } = useGpsContext();

  const [sortBy, setSortBy] = useState<"distance" | "crowd" | "updated">("distance");

  // URL Query Parameters 파싱 (검색 조건 획득)
  const queryBuilding = searchParams.get("building");
  const queryPurpose = searchParams.get("purpose");
  const queryFloor = searchParams.get("floor");
  const queryExclude = searchParams.get("exclude") === "true";
  const queryQ = searchParams.get("q");

  const selectedBuildings = queryBuilding ? queryBuilding.split(",") : [];
  const selectedPurposes = queryPurpose ? queryPurpose.split(",") : [];
  const selectedFloors = queryFloor ? queryFloor.split(",") : [];
  const excludeCrowded = queryExclude;
  const searchText = queryQ || "";

  // 1. 검색어 및 필터 조건에 대응하는 장소 필터링 (로컬 연산)
  const getFilteredPlaces = () => {
    return places.filter((place) => {
      // 텍스트 검색 조건 검사
      if (searchText) {
        const query = searchText.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesBuilding = place.building.toLowerCase().includes(query);
        const matchesPurpose = place.purposes.some((p) => p.toLowerCase().includes(query));
        if (!matchesName && !matchesBuilding && !matchesPurpose) return false;
      }

      // 목적 태그 조건 검사
      if (selectedPurposes.length > 0) {
        const matchesAnyPurpose = selectedPurposes.some((p) => place.purposes.includes(p));
        if (!matchesAnyPurpose) return false;
      }

      // 건물 이름 조건 검사
      if (selectedBuildings.length > 0) {
        if (!selectedBuildings.includes(place.building)) return false;
      }

      // 층 범위 조건 검사
      if (selectedFloors.length > 0) {
        const isHighFloor = (floorStr: string) => {
          const num = parseInt(floorStr.replace(/[^0-9]/g, ""), 10);
          return isNaN(num) ? false : num >= 4;
        };

        const matchesFloor = selectedFloors.some((f) => {
          if (f === "4층 이상") return isHighFloor(place.floor);
          return place.floor === f;
        });
        if (!matchesFloor) return false;
      }

      // 붐빔 제외 토글 검사
      if (excludeCrowded) {
        const currentCalcLevel = calculateWeightedCrowdLevel(place.history);
        if (currentCalcLevel >= 4) return false; // 4(붐빔), 5(매우 혼잡) 제외
      }

      return true;
    });
  };

  // 2. 정렬 로직 (로컬 연산)
  const getSortedPlaces = (placesList: typeof places) => {
    return [...placesList].sort((a, b) => {
      const aLevel = calculateWeightedCrowdLevel(a.history);
      const bLevel = calculateWeightedCrowdLevel(b.history);

      if (sortBy === "distance") {
        // 거리 정렬: 현재 내 GPS 건물에 속해있는 장소를 최상단에 배치
        const aIsMyBuilding = a.building === myGPSBuilding ? 1 : 0;
        const bIsMyBuilding = b.building === myGPSBuilding ? 1 : 0;
        if (aIsMyBuilding !== bIsMyBuilding) {
          return bIsMyBuilding - aIsMyBuilding;
        }
        return a.id - b.id;
      } else if (sortBy === "crowd") {
        // 혼잡도 정렬: 한산한 곳(낮은 혼잡도 수치)이 먼저 옴
        return aLevel - bLevel;
      } else if (sortBy === "updated") {
        // 최근 업데이트 시간 역순 정렬
        return b.updatedAt - a.updatedAt;
      }
      return 0;
    });
  };

  const filteredPlaces = getFilteredPlaces();
  const sortedPlaces = getSortedPlaces(filteredPlaces);
  const matchedPlacesCount = filteredPlaces.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* 리스트 상단 헤더 */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 16px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => router.push("/search")}
            style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "900" }}>장소 리스트</h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>조건 매칭 {matchedPlacesCount}건</span>
          </div>
        </div>

        {/* 정렬 셀렉터 */}
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            padding: "6px 8px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--foreground)",
            outline: "none"
          }}
        >
          <option value="distance">가까운 순 🏢</option>
          <option value="crowd">여유로운 순 🍀</option>
          <option value="updated">최신 정보 순 ⏰</option>
        </select>
      </header>

      {/* 매칭 적용된 필터 태그 목록 바 */}
      <div style={{ display: "flex", gap: "6px", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {selectedBuildings.map((b) => (
          <span key={b} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
            🏢 {b}
          </span>
        ))}
        {selectedPurposes.map((p) => (
          <span key={p} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
            {PURPOSE_EMOJIS[p]} {p}
          </span>
        ))}
        {selectedFloors.map((f) => (
          <span key={f} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
            ↕️ {f}
          </span>
        ))}
        {excludeCrowded && (
          <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "hsl(15, 95%, 95%)", color: "var(--accent)", fontWeight: "700", whiteSpace: "nowrap" }}>
            ⚠️ 혼잡 제외
          </span>
        )}
      </div>

      {/* 필터링된 장소 스크롤 뷰 */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {sortedPlaces.length > 0 ? (
          sortedPlaces.map((place) => {
            const isExpired = getVirtualNow() - place.updatedAt > 30 * 60 * 1000;

            return (
              <div
                key={place.id}
                onClick={() => {
                  if (unlockedUntil <= Date.now()) {
                    handlePromptUnlock();
                  } else {
                    router.push(`/detail/${place.id}`);
                  }
                }}
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "var(--transition-smooth)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "2.5px 6px", borderRadius: "6px" }}>
                      {place.building} {place.floor}
                    </span>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--foreground)", marginTop: "4px" }}>
                      {place.name}
                    </h4>
                  </div>

                  {/* 공통 CrowdBadge 마운트 */}
                  <CrowdBadge place={place} customClick />
                </div>

                <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  {place.detailLocation}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "2.5px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {place.purposes.map((p) => (
                      <span key={p} style={{ fontSize: "9px", fontWeight: "700", backgroundColor: "var(--surface-hover)", color: "var(--text-muted)", padding: "2px 5px", borderRadius: "4px" }}>
                        {PURPOSE_EMOJIS[p] || ""} {p}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: "700", color: isExpired ? "var(--accent)" : "var(--text-muted)" }}>
                    <ClockIcon size={12} />
                    <span>
                      {isExpired ? "업데이트 필요 ⚠️" : getRelativeTimeText(place.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)", fontSize: "13px" }}>
            일치하는 장소가 없습니다. 필터를 초기화해 보세요! 🔄
          </div>
        )}
      </div>
    </div>
  );
}
