"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "../Icons";
import { usePlacesContext } from "../../context/PlaceContext";
import { useUserContext } from "../../context/UserContext";
import { calculateWeightedCrowdLevel, getCrowdLevelInfo } from "../../utils/crowdAnalyzer";
import { getVirtualNow, formatVirtualTime } from "../../utils/timeSpeed";

export default function ReportInputScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 전역 데이터 및 유저 상태 컨텍스트 참조
  const { places, setPlaces } = usePlacesContext();
  const {
    setUnlockedUntil,
    setUnlockTimeLeft,
    reportedPlaces,
    setReportedPlaces,
    setActiveReport,
    syncReportWithServer,
    currentUser,
  } = useUserContext();

  // URL Query Parameters로부터 전달된 제보 대상 정보 획득
  const queryPlaceId = Number(searchParams.get("placeId") || "1");
  const queryBuilding = searchParams.get("building") || "310관";
  const queryCrowdLevel = Number(searchParams.get("crowdLevel") || "3") as 1 | 2 | 3 | 4 | 5;

  // 폼 정보 격리화 (전역 상태에 두지 않고 페이지 로컬 상태로 캡슐화)
  const [reportedPlaceId, setReportedPlaceId] = useState<number>(queryPlaceId);
  const [reportedCrowdLevel, setReportedCrowdLevel] = useState<1 | 2 | 3 | 4 | 5>(queryCrowdLevel);
  const [reportedDuration, setReportedDuration] = useState<number>(30); // 기본 30분 예상

  const filteredPlaces = places.filter((p) => p.building === queryBuilding);

  // 제보 등록 및 보상 산정 비즈니스 로직 (하향화 완료!)
  const handleSubmitReport = async () => {
    const targetPlaceObj = places.find((p) => p.id === reportedPlaceId);
    if (!targetPlaceObj) return;

    const submittedAt = getVirtualNow();
    const currentCalcLevel = calculateWeightedCrowdLevel(targetPlaceObj.history, submittedAt);

    // 1. 차등 포인트 정책 보상금 책정
    const isUnknownPlace = currentCalcLevel === 0; // 정보 공백 상태 복구 특별 보상
    const isRereport = reportedPlaces.includes(reportedPlaceId); // 단기 재제보 보상

    let pointsToAdd = 10;
    if (isUnknownPlace) {
      pointsToAdd = 30; // +30P
    } else if (isRereport) {
      pointsToAdd = 20; // +20P
    }

    const serverResult = await syncReportWithServer(reportedPlaceId, reportedCrowdLevel, reportedDuration, pointsToAdd);
    if (!serverResult.ok) {
      alert(serverResult.message || "제보 등록 중 문제가 발생했습니다.");
      return;
    }

    // 연속 제보 보상 예외 검증을 위해 등록
    if (!isRereport) {
      setReportedPlaces((prev) => [...prev, reportedPlaceId]);
    }

    // 2. places 배열 갱신 (새 제보 히스토리 삽입)
    const nowStr = formatVirtualTime(submittedAt);
    const updatedPlaces = places.map((place) => {
      if (place.id === reportedPlaceId) {
        return {
          ...place,
          updatedAt: submittedAt,
          reportsCount: place.reportsCount + 1,
          history: [
            {
              crowdLevel: reportedCrowdLevel,
              time: nowStr,
              timestamp: submittedAt,
              reporter: currentUser ? `${currentUser.nickname} (나)` : "2025**** (나)",
              reporterTrustScore: currentUser ? currentUser.trustScore : 100,
            },
            ...place.history,
          ],
        };
      }
      return place;
    });

    setPlaces(updatedPlaces);

    // 3. 기여 보상: 3분 무료 열람 상태 활성화 (가상 시간 기준)
    setUnlockedUntil(submittedAt + 3 * 60 * 1000);
    setUnlockTimeLeft(180);

    // 활성 제보 데이터 저장 (재제보 알림 타이머 5분 전 트리거용)
    setActiveReport({
      placeId: reportedPlaceId,
      duration: reportedDuration,
      timestamp: submittedAt
    });

    // 4. 완료 화면으로 넘어가며 제보 결과 데이터를 쿼리 파라미터로 전달
    router.push(
      `/report/complete?points=${pointsToAdd}&placeId=${reportedPlaceId}&crowdLevel=${reportedCrowdLevel}&duration=${reportedDuration}&building=${encodeURIComponent(queryBuilding)}`
    );
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
          onClick={() => router.back()}
          style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
        >
          <ArrowLeftIcon />
        </button>
        <h2 style={{ fontSize: "16px", fontWeight: "850" }}>현장 상태 작성</h2>
      </header>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 건물 요약 배지 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--surface-hover)", padding: "10px 14px", borderRadius: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>건물</span>
          <span style={{ fontSize: "13px", fontWeight: "850", color: "var(--primary)" }}>🏢 {queryBuilding}</span>
        </div>

        {/* 상세 공간 선택 드롭다운 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>상세 장소 선택</span>
          <select
            value={reportedPlaceId}
            onChange={(e) => setReportedPlaceId(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              backgroundColor: "var(--surface)",
              color: "var(--foreground)",
              fontSize: "13px",
              fontWeight: "700",
              outline: "none"
            }}
          >
            {filteredPlaces.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.floor})</option>
            ))}
          </select>
        </div>

        {/* 5단계 혼잡도 선택 버튼 그리드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>현재 혼잡도는 어떤가요?</span>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {([1, 2, 3, 4, 5] as const).map((level) => {
              const lvlInfo = getCrowdLevelInfo(level);
              const isSelected = reportedCrowdLevel === level;

              return (
                <button
                  key={level}
                  onClick={() => setReportedCrowdLevel(level)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: isSelected ? `2.5px solid ${lvlInfo.color}` : "1px solid var(--border)",
                    backgroundColor: isSelected ? lvlInfo.bg : "var(--surface)",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "800", color: isSelected ? lvlInfo.color : "var(--foreground)" }}>
                    {level}단계 - {lvlInfo.label}
                  </span>

                  <span style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: isSelected ? `5px solid ${lvlInfo.color}` : "2px solid var(--border)",
                    backgroundColor: "var(--surface)",
                    transition: "var(--transition-smooth)"
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 예상 체류 시간 선택지 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>예상 추가 체류시간</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[15, 30, 60, 120].map((mins) => {
              const label = mins >= 60 ? `${mins / 60}시간` : `${mins}분`;
              const isSelected = reportedDuration === mins;

              return (
                <button
                  key={mins}
                  onClick={() => setReportedDuration(mins)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    fontSize: "12px",
                    fontWeight: "800",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-muted)"
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 최종 제출 단추 */}
        <button
          onClick={handleSubmitReport}
          className="btn-primary"
          style={{ width: "100%", padding: "15px 20px", marginTop: "10px" }}
        >
          제보 정보 등록하기 🚀
        </button>

      </div>
    </div>
  );
}
