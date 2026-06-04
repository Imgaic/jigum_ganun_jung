"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PURPOSE_EMOJIS, BUILDINGS } from "../../types";
import { ArrowLeftIcon, SearchIcon } from "../Icons";
import { usePlacesContext } from "../../context/PlaceContext";
import { useUserContext } from "../../context/UserContext";
import { calculateWeightedCrowdLevel } from "../../utils/crowdAnalyzer";

export default function SearchScreen() {
  const router = useRouter();
  
  // 전체 장소 데이터 구독
  const { places } = usePlacesContext();
  const { nowMs } = useUserContext();

  // 검색/필터 입력값을 전역이 아닌 페이지 내부 로컬 상태로 완전 캡슐화
  const [searchText, setSearchText] = useState<string>("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [excludeCrowded, setExcludeCrowded] = useState<boolean>(false);

  // 로컬 필터 조건에 대응하는 매칭 개수 동적 연산
  const getFilteredCount = () => {
    return places.filter((place) => {
      if (searchText) {
        const query = searchText.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesBuilding = place.building.toLowerCase().includes(query);
        const matchesPurpose = place.purposes.some((p) => p.toLowerCase().includes(query));
        if (!matchesName && !matchesBuilding && !matchesPurpose) return false;
      }

      if (selectedPurposes.length > 0) {
        const matchesAnyPurpose = selectedPurposes.some((p) => place.purposes.includes(p));
        if (!matchesAnyPurpose) return false;
      }

      if (selectedBuildings.length > 0) {
        if (!selectedBuildings.includes(place.building)) return false;
      }

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

      if (excludeCrowded) {
        const currentCalcLevel = calculateWeightedCrowdLevel(place.history, nowMs);
        if (currentCalcLevel >= 4) return false;
      }

      return true;
    }).length;
  };

  const matchedPlacesCount = getFilteredCount();

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedPurposes([]);
    setSelectedBuildings([]);
    setSelectedFloors([]);
    setExcludeCrowded(false);
  };

  // 결과 장소 보기 클릭 시 URL Query String 파라미터를 완성하여 목록 화면(/list)으로 내비게이션
  const handleShowResults = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    if (selectedPurposes.length > 0) params.set("purpose", selectedPurposes.join(","));
    if (selectedBuildings.length > 0) params.set("building", selectedBuildings.join(","));
    if (selectedFloors.length > 0) params.set("floor", selectedFloors.join(","));
    if (excludeCrowded) params.set("exclude", "true");

    router.push(`/list?${params.toString()}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 상단 뒤로 가기 */}
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 16px 0",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "4px",
            color: "var(--foreground)"
          }}
        >
          <ArrowLeftIcon />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "800" }}>원하는 조건 장소 탐색</h2>
      </header>

      {/* 키워드 검색 인풋 */}
      <div style={{ padding: "0 16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          backgroundColor: "var(--surface)",
          border: "1.5px solid var(--primary)",
          borderRadius: "var(--radius-sm)"
        }}>
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="장소명, 목적, 건물명 입력..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: "none",
              background: "none",
              width: "100%",
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--foreground)",
              outline: "none"
            }}
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              style={{ border: "none", background: "none", fontSize: "14px", color: "var(--text-muted)", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 조작 영역 */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 1. 방문 목적 태그 */}
        <div>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>방문 목적</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {["공부", "식사", "휴식", "대화", "조용한 곳"].map((purpose) => {
              const isSelected = selectedPurposes.includes(purpose);
              return (
                <button
                  key={purpose}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedPurposes(selectedPurposes.filter((p) => p !== purpose));
                    } else {
                      setSelectedPurposes([...selectedPurposes, purpose]);
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    borderRadius: "20px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-muted)"
                  }}
                >
                  {PURPOSE_EMOJIS[purpose] || ""} {purpose}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 건물 명 태그 */}
        <div>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>건물 선택</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {BUILDINGS.map((b) => {
              const isSelected = selectedBuildings.includes(b);
              return (
                <button
                  key={b}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedBuildings(selectedBuildings.filter((item) => item !== b));
                    } else {
                      setSelectedBuildings([...selectedBuildings, b]);
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-muted)"
                  }}
                >
                  🏢 {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 층수 범위 */}
        <div>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>층수</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {["1층", "2층", "3층", "4층 이상"].map((floor) => {
              const isSelected = selectedFloors.includes(floor);
              return (
                <button
                  key={floor}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedFloors(selectedFloors.filter((f) => f !== floor));
                    } else {
                      setSelectedFloors([...selectedFloors, floor]);
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-muted)"
                  }}
                >
                  ↕️ {floor}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 붐빔 장소 제외 버튼 토글 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--surface-hover)",
          padding: "14px 16px",
          borderRadius: "var(--radius-sm)",
          marginTop: "8px",
          cursor: "pointer"
        }}
          onClick={() => setExcludeCrowded(!excludeCrowded)}
        >
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--foreground)" }}>⚠️ 혼잡 장소 제외</h4>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>붐비거나 매우 혼잡한 장소를 리스트에서 가립니다.</p>
          </div>

          <div style={{
            width: "22px",
            height: "22px",
            border: "2px solid var(--primary)",
            borderRadius: "6px",
            backgroundColor: excludeCrowded ? "var(--primary)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "var(--transition-smooth)"
          }}>
            {excludeCrowded && <span style={{ color: "white", fontSize: "12px", fontWeight: "900" }}>✓</span>}
          </div>
        </div>

        {/* 초기화 리셋 링크 */}
        {(selectedPurposes.length > 0 || selectedBuildings.length > 0 || selectedFloors.length > 0 || excludeCrowded || searchText) && (
          <button
            onClick={handleResetFilters}
            style={{
              border: "none",
              background: "none",
              color: "var(--accent)",
              fontSize: "12px",
              fontWeight: "700",
              alignSelf: "flex-end",
              cursor: "pointer"
            }}
          >
            🔄 필터 초기화
          </button>
        )}

      </div>

      {/* 필터링 결과 매칭 개수 버튼 */}
      <div style={{ padding: "10px 16px 20px", marginTop: "auto" }}>
        <button
          onClick={handleShowResults}
          className="btn-primary"
          style={{ width: "100%", padding: "15px 20px" }}
        >
          조건에 맞는 {matchedPlacesCount}개 장소 보기
        </button>
      </div>
    </div>
  );
}
