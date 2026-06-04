"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BUILDINGS } from "../../types";
import { ArrowLeftIcon } from "../Icons";
import { useGpsContext } from "../../context/GpsContext";
import { usePlacesContext } from "../../context/PlaceContext";

export default function ReportGpsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // GPS 및 장소 컨텍스트 직접 참조
  const { myGPSBuilding } = useGpsContext();
  const { places } = usePlacesContext();

  // 제보 타겟 건물 임시 선택 상태 격리화 (로컬화 완료!)
  const queryBuilding = searchParams.get("building") || myGPSBuilding;
  const [reportedBuilding, setReportedBuilding] = useState<string>(queryBuilding);

  // 시뮬레이터 상의 가상 GPS 건물 위치와 제보할 건물 위치가 같은지 확인
  const isGpsMatched = reportedBuilding === myGPSBuilding;

  const handleNextStep = () => {
    if (!isGpsMatched) return;

    // 선택한 건물의 첫 장소 오브젝트 획득하여 디폴트 입력값으로 구성
    const firstPlaceInBuilding = places.find((p) => p.building === reportedBuilding) || places[0];

    // URL Query Parameter 조립 후 제보 정보 기입 화면으로 전환
    router.push(`/report/input?placeId=${firstPlaceInBuilding.id}&building=${encodeURIComponent(reportedBuilding)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 상단 헤더 뒤로가기 */}
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
        <h2 style={{ fontSize: "16px", fontWeight: "850" }}>GPS 위치 확인</h2>
      </header>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>

        {/* GPS 센서 일치 여부에 따른 상단 레이더 뱃지 연출 */}
        <div className="glass-panel" style={{
          borderRadius: "var(--radius-md)",
          padding: "24px 20px",
          border: isGpsMatched
            ? "1.5px solid var(--primary)"
            : "1.5px solid var(--accent)",
          textAlign: "center",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          transition: "var(--transition-smooth)"
        }}>
          <div style={{
            position: "relative",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: isGpsMatched
              ? "var(--primary-light)"
              : "hsl(15, 95%, 93%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            transition: "var(--transition-smooth)"
          }}>
            {isGpsMatched ? "📡" : "⚠️"}
            <span
              className="pulse-dot"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: isGpsMatched
                  ? "var(--primary)"
                  : "var(--accent)"
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--foreground)" }}>
              제보할 건물 위치: {reportedBuilding}
            </h3>
            <div style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: "800",
              color: "white",
              backgroundColor: isGpsMatched ? "var(--primary)" : "var(--accent)",
              padding: "3px 10px",
              borderRadius: "12px",
              marginTop: "6px",
              transition: "var(--transition-smooth)"
            }}>
              {isGpsMatched ? "GPS 위치 일치함" : "GPS 위치 불일치"}
            </div>
          </div>
        </div>

        {/* 위치 불일치 시 센서 보정 경고 배너 */}
        {!isGpsMatched ? (
          <div style={{
            backgroundColor: "hsl(15, 95%, 97%)",
            border: "1.5px solid hsla(15, 95%, 40%, 0.25)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <h4 style={{ fontSize: "13px", fontWeight: "850", color: "var(--accent)" }}>
              🚨 제보 제한 안내
            </h4>
            <p style={{ fontSize: "11.5px", color: "var(--accent)", lineHeight: "1.6" }}>
              현재 확인되는 GPS 센서 상의 위치는 <strong>{myGPSBuilding}</strong>입니다. 제보 대상 건물인 <strong>{reportedBuilding}</strong>과 달라 제보 작성이 제한됩니다.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "var(--primary-light)",
            border: "1.5px solid hsla(var(--primary-hue), 85%, 40%, 0.2)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <h4 style={{ fontSize: "13px", fontWeight: "850", color: "var(--primary)" }}>
              ✅ 제보 가능 지역
            </h4>
            <p style={{ fontSize: "11.5px", color: "var(--foreground)", lineHeight: "1.5" }}>
              가상 GPS 센서 신호({myGPSBuilding})와 제보할 건물 위치가 일치합니다. 아래의 작성 버튼을 눌러 다음 단계로 진행하실 수 있습니다.
            </p>
          </div>
        )}

        {/* 제보 건물 대상 선택 버튼 바 */}
        <div style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--foreground)" }}>
            제보하시려는 건물이 맞나요? (현재 GPS: {myGPSBuilding})
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            {BUILDINGS.map((b) => (
              <button
                key={b}
                onClick={() => setReportedBuilding(b)}
                style={{
                  padding: "10px",
                  fontSize: "12px",
                  fontWeight: "800",
                  borderRadius: "10px",
                  border: reportedBuilding === b ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                  backgroundColor: reportedBuilding === b ? "var(--primary-light)" : "var(--surface)",
                  color: reportedBuilding === b ? "var(--primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "var(--transition-smooth)"
                }}
              >
                🏢 {b}
              </button>
            ))}
          </div>
        </div>

        {/* 제보 폼 이동 단추 */}
        <button
          disabled={!isGpsMatched}
          onClick={handleNextStep}
          className={isGpsMatched ? "btn-primary" : "btn-secondary"}
          style={{
            width: "100%",
            padding: "14px 20px",
            marginTop: "10px",
            opacity: isGpsMatched ? 1 : 0.5,
            cursor: isGpsMatched ? "pointer" : "not-allowed",
            pointerEvents: isGpsMatched ? "auto" : "none",
            backgroundColor: isGpsMatched ? "var(--primary)" : "var(--border)",
            color: isGpsMatched ? "white" : "var(--text-muted)",
            borderColor: "transparent",
            fontSize: "13px",
            fontWeight: "850",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {isGpsMatched ? "제보 내용 작성 단계로 이동 ➡️" : "위치 불일치로 제보 제한됨 🔒"}
        </button>

      </div>
    </div>
  );
}
