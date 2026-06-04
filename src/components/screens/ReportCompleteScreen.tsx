"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlacesContext } from "../../context/PlaceContext";
import { getCrowdLevelInfo } from "../../utils/crowdAnalyzer";

export default function ReportCompleteScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { places } = usePlacesContext();

  // URL Query Parameters 파싱을 통해 제보 완료 정보 수집
  const earnedPointsThisTime = Number(searchParams.get("points") || "10");
  const reportedPlaceId = Number(searchParams.get("placeId") || "1");
  const reportedCrowdLevel = Number(searchParams.get("crowdLevel") || "3") as 1 | 2 | 3 | 4 | 5;
  const reportedDuration = Number(searchParams.get("duration") || "30");
  const reportedBuilding = searchParams.get("building") || "310관";

  const reportedPlace = places.find((p) => p.id === reportedPlaceId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "30px 16px", textAlign: "center" }}>

      {/* 축하 폭죽 연출 카드 */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-lg)",
        padding: "36px 20px",
        border: "1.5px solid var(--primary)",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
      }}>
        <div style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          backgroundColor: "var(--primary-light)",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)"
        }}>
          🎉
        </div>

        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "950", color: "var(--foreground)" }}>
            제보 등록 완료!
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            작성해주신 정보가 즉각적으로 동기화되었습니다.
          </p>
        </div>

        {/* 포인트 적립 안내 배지 */}
        <div style={{
          padding: "8px 16px",
          backgroundColor: "var(--primary-light)",
          border: "1px dashed var(--primary)",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "800",
          color: "var(--primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          animation: "pulseGlow 2s infinite"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🪙</span>
            <span>+{earnedPointsThisTime} 포인트 적립되었습니다!</span>
          </div>
          {earnedPointsThisTime === 30 && (
            <span style={{
              fontSize: "10.5px",
              color: "white",
              backgroundColor: "var(--primary)",
              padding: "2px 8px",
              borderRadius: "10px",
              fontWeight: "900",
              marginTop: "4px"
            }}>
              정보 공백 복구 (30P)
            </span>
          )}
          {earnedPointsThisTime === 20 && (
            <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "800", marginTop: "2px" }}>
              재제보 갱신 (20P)
            </span>
          )}
        </div>
      </div>

      {/* 영수증 요약 상세 카드 */}
      <div style={{
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        padding: "16px",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)" }}>제보 내역 요약</span>
        <h3 style={{ fontSize: "14px", fontWeight: "900" }}>{reportedPlace?.name}</h3>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
          <span style={{ color: "var(--text-muted)" }}>반영된 혼잡도:</span>
          <span style={{ fontWeight: "800", color: getCrowdLevelInfo(reportedCrowdLevel).color }}>{getCrowdLevelInfo(reportedCrowdLevel).label}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "var(--text-muted)" }}>예상 체류시간:</span>
          <span style={{ fontWeight: "800" }}>{reportedDuration}분</span>
        </div>
      </div>

      {/* 하단 내비게이션 단추들 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
        <button
          onClick={() => {
            // 해당 건물의 조건 매치 목록으로 다이렉트 Query 내비게이션
            router.push(`/list?building=${encodeURIComponent(reportedBuilding)}`);
          }}
          className="btn-primary"
          style={{ width: "100%", padding: "14px" }}
        >
          주변 다른 장소 현황 보기
        </button>
        <button
          onClick={() => router.push("/")}
          className="btn-secondary"
          style={{ width: "100%", padding: "14px" }}
        >
          홈 화면으로 복귀
        </button>
      </div>

    </div>
  );
}
