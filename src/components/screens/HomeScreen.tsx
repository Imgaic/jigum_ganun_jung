"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PURPOSE_EMOJIS } from "../../types";
import { MapPinIcon, SearchIcon, ClockIcon } from "../Icons";
import { usePlacesContext } from "../../context/PlaceContext";
import { useUserContext } from "../../context/UserContext";
import { useGpsContext } from "../../context/GpsContext";
import { calculateWeightedCrowdLevel } from "../../utils/crowdAnalyzer";
import { getRelativeTimeText } from "../../utils/timeFormatter";
import { getVirtualNow } from "../../utils/timeSpeed";
import CrowdBadge from "../CrowdBadge";

export default function HomeScreen() {
  const router = useRouter();
  
  // 기능별 전역 컨텍스트 직접 참조
  const { places } = usePlacesContext();
  const { myGPSBuilding } = useGpsContext();
  const {
    userPoints,
    unlockedUntil,
    unlockTimeLeft,
    formatTimeLeft,
    handlePromptUnlock,
  } = useUserContext();

  // 내 GPS 근처 장소 필터링
  const nearbyPlaces = places.filter((p) => p.building === myGPSBuilding);

  // 내 건물 부근 장소 중 '알 수 없음(제보 공백)'인 곳이 있으면 특별 보상 적용
  const hasUnknownNearby = nearbyPlaces.some(
    (p) => calculateWeightedCrowdLevel(p.history) === 0
  );
  const potentialReward = hasUnknownNearby ? 30 : 10;

  // 빠른 목적 선택 시 URL Query Parameter를 사용하여 매칭 조건과 함께 목록 화면으로 리다이렉션
  const handleQuickPurposeSelect = (purpose: string) => {
    router.push(`/list?purpose=${encodeURIComponent(purpose)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 홈 상단 헤더 */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px 8px",
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em" }}>
            실시간 교내 혼잡도 공유
          </span>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "var(--foreground)", marginTop: "2px" }}>
            지금 가는 중 🏃‍♂️
          </h1>
        </div>
        {/* 유저 보유 포인트 알약 버튼 */}
        <div
          onClick={() => router.push("/myinfo")}
          style={{
            backgroundColor: "var(--primary-light)",
            border: "1px solid hsla(var(--primary-hue), 85%, 40%, 0.2)",
            padding: "5px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            transition: "var(--transition-bounce)"
          }}
        >
          <span style={{ fontSize: "14px" }}>🪙</span>
          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{userPoints}P</span>
        </div>
      </header>

      {/* 정보 열람권 잠금/활성화 상태 배너 */}
      <div style={{ padding: "0 20px" }}>
        {unlockedUntil > Date.now() ? (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--primary-light)",
            border: "1.5px solid var(--primary)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary)" }}>
              🔓 실시간 혼잡도 정보 열람 중
            </span>
            <span style={{ fontSize: "12px", fontWeight: "900", color: "var(--primary)", fontFamily: "monospace" }}>
              {formatTimeLeft(unlockTimeLeft)}
            </span>
          </div>
        ) : (
          <div
            onClick={handlePromptUnlock}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "hsl(15, 95%, 95%)",
              border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--accent)" }}>
              🔒 실시간 정보 잠김 (10P 소모)
            </span>
            <span style={{ fontSize: "11px", fontWeight: "900", color: "white", backgroundColor: "var(--accent)", padding: "2.5px 8px", borderRadius: "10px" }}>
              활성화
            </span>
          </div>
        )}
      </div>

      {/* 검색창 바로가기 */}
      <div style={{ padding: "0 20px" }}>
        <div
          onClick={() => router.push("/search")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "var(--transition-smooth)"
          }}
        >
          <SearchIcon size={18} />
          <span style={{ fontSize: "14px", fontWeight: "500" }}>공부할 곳, 310관, 학식 혼잡도 검색...</span>
        </div>
      </div>

      {/* 빠른 목적 탐색 그리드 */}
      <div style={{ padding: "0 20px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
          빠른 목적 탐색
        </span>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginTop: "8px"
        }}>
          {["공부", "식사", "휴식", "조용한 곳"].map((purpose) => (
            <button
              key={purpose}
              onClick={() => handleQuickPurposeSelect(purpose)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "12px 8px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px",
                color: "var(--foreground)",
                transition: "var(--transition-bounce)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <span style={{ fontSize: "20px" }}>{PURPOSE_EMOJIS[purpose] || "✨"}</span>
              <span>{purpose}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 내 위치 주변 장소 목록 */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "800" }}>
            📍 내 위치({myGPSBuilding}) 근처 실시간 상황
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>최신 갱신 순</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {nearbyPlaces.length > 0 ? (
            nearbyPlaces.map((place) => {
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
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "var(--transition-bounce)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--foreground)" }}>{place.name}</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {place.detailLocation}
                      </p>
                    </div>

                    {/* 공통 CrowdBadge 컴포넌트 마운트 */}
                    <CrowdBadge place={place} customClick />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "2px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {place.purposes.map((p) => (
                        <span key={p} style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          backgroundColor: "var(--surface-hover)",
                          color: "var(--text-muted)",
                          padding: "2.5px 6px",
                          borderRadius: "6px"
                        }}>
                          {PURPOSE_EMOJIS[p] || ""} {p}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: "600", color: isExpired ? "var(--accent)" : "var(--text-muted)" }}>
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
            <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "13px" }}>
              이 건물 부근에 등록된 장소가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 내 현위치 실시간 제보 활성화 버튼 */}
      <div style={{ padding: "10px 20px 20px" }}>
        <button
          onClick={() => router.push("/report/gps")}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "16px 24px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            backgroundColor: potentialReward === 30 ? "var(--accent)" : "var(--primary)",
            borderColor: "transparent",
            cursor: "pointer",
            boxShadow: potentialReward === 30 ? "0 4px 14px rgba(239, 68, 68, 0.25)" : "none",
            transition: "var(--transition-bounce)"
          }}
        >
          <MapPinIcon size={18} />
          <span>지금 내 위치 현장 제보하기 (+{potentialReward}P)</span>
          {potentialReward === 30 && (
            <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "white", color: "var(--accent)", padding: "1.5px 5px", borderRadius: "6px", marginLeft: "4px" }}>
              공백 복구 특별 보상! 🔥
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
