"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Place, PURPOSE_EMOJIS } from "../../types";
import { ArrowLeftIcon } from "../Icons";
import { useUserContext } from "../../context/UserContext";
import { calculateWeightedCrowdLevel, getCrowdLevelInfo } from "../../utils/crowdAnalyzer";
import { getRelativeTimeText } from "../../utils/timeFormatter";

interface DetailScreenProps {
  selectedPlace: Place;
}

export default function DetailScreen({ selectedPlace }: DetailScreenProps) {
  const router = useRouter();

  // 포인트 락/언락 관련 상태 전역 Context 참조
  const { unlockedUntil, handlePromptUnlock } = useUserContext();

  const currentCalcLevel = calculateWeightedCrowdLevel(selectedPlace.history);
  const isUnknown = currentCalcLevel === 0;
  const isUnlocked = unlockedUntil > Date.now();

  const buttonRewardPoints = isUnknown ? 30 : 10;

  // 최근 30분 이내에 등록된 유효 제보 개수 계산
  const recentReportsCount = selectedPlace.history.filter(
    (h) => Date.now() - h.timestamp <= 30 * 60 * 1000
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 상세화면 상단 뒤로 가기 헤더 */}
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 16px 0",
      }}>
        <button
          onClick={() => router.back()} // 브라우저 뒤로 가기와 매핑 연동
          style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
        >
          <ArrowLeftIcon />
        </button>
        <h2 style={{ fontSize: "16px", fontWeight: "850" }}>공간 상세 정보</h2>
      </header>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 장소 기본 신원 카드 */}
        <div style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          padding: "18px",
          boxShadow: "var(--shadow-sm)"
        }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "4px 8px", borderRadius: "8px" }}>
            🏢 {selectedPlace.building} · {selectedPlace.floor}
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: "900", color: "var(--foreground)", marginTop: "10px" }}>
            {selectedPlace.name}
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            📍 {selectedPlace.detailLocation}
          </p>

          <div style={{ display: "flex", gap: "4px", marginTop: "10px" }}>
            {selectedPlace.purposes.map((p) => (
              <span key={p} style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "var(--surface-hover)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "6px" }}>
                {PURPOSE_EMOJIS[p]} {p}
              </span>
            ))}
          </div>
        </div>

        {/* 실시간 혼잡도 지표 전광판 */}
        <div className="glass-panel" style={{
          borderRadius: "var(--radius-md)",
          padding: "18px",
          border: "1.5px solid var(--border)",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)"
        }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>
            실시간 혼잡도 지표
          </span>

          {isUnknown ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "10px 0" }}>
              <div>
                <span style={{
                  fontSize: "30px",
                  fontWeight: "950",
                  color: "var(--text-muted)"
                }}>
                  알 수 없음 ⚠️
                </span>
              </div>

              {/* 제보가 없을 때의 포인트 추가 기여 안내 카드 */}
              <div style={{
                backgroundColor: "hsl(40, 100%, 97%)",
                border: "1.5px solid hsla(40, 95%, 45%, 0.25)",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                textAlign: "left",
                marginTop: "4px"
              }}>
                <span style={{ fontSize: "11.5px", fontWeight: "850", color: "hsl(40, 95%, 40%)" }}>💡 현장 제보 유도</span>
                <p style={{ fontSize: "11px", color: "var(--primary)", marginTop: "4px", lineHeight: "1.4" }}>
                  최근 30분간 접수된 제보가 없어 혼잡도를 파악할 수 없습니다. 현장의 첫 제보자가 되어 <strong>(+30P)</strong>을 받아 가세요! 🪙
                </p>
              </div>
            </div>
          ) : isUnlocked ? (
            <>
              <div style={{ margin: "14px 0" }}>
                <span style={{
                  fontSize: "36px",
                  fontWeight: "950",
                  color: getCrowdLevelInfo(currentCalcLevel).color
                }}>
                  {getCrowdLevelInfo(currentCalcLevel).label}
                </span>
              </div>

              {/* 시각적인 혼잡 게이지 바 */}
              <div style={{
                height: "10px",
                width: "100%",
                backgroundColor: "var(--background)",
                borderRadius: "5px",
                overflow: "hidden",
                display: "flex",
                margin: "10px 0"
              }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    style={{
                      flex: 1,
                      backgroundColor: lvl <= currentCalcLevel ? getCrowdLevelInfo(currentCalcLevel).color : "transparent",
                      opacity: lvl <= currentCalcLevel ? 1 - (currentCalcLevel - lvl) * 0.15 : 0,
                      borderRight: lvl < 5 ? "2.5px solid var(--surface)" : "none"
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", marginTop: "6px" }}>
                <span>최근 업데이트: {getRelativeTimeText(selectedPlace.updatedAt)}</span>
                <span>제보 데이터 신뢰도: <strong style={{ color: "var(--primary)" }}>{selectedPlace.reportsCount > 10 ? "높음 🔥" : "보통"}</strong></span>
              </div>

              <div style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                textAlign: "left",
                marginTop: "10px",
                borderTop: "1px dashed var(--border)",
                paddingTop: "8px",
                lineHeight: "1.4"
              }}>
                ℹ️ 이 수치는 최근 30분 이내에 접수된 {recentReportsCount}건의 제보에 대해, 경과 시간에 따른 신뢰도 감쇠 가중치를 부여해 산출한 실시간 평균 지표입니다.
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 10px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "28px" }}>🔒</span>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "600", lineHeight: "1.4" }}>
                실시간 혼잡도 정보가 잠겨 있습니다.
              </p>
              <button
                onClick={handlePromptUnlock}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "10px", marginTop: "4px" }}
              >
                🔑 10P 소모하여 3분 열람 활성화
              </button>
            </div>
          )}
        </div>

        {/* 제보 타임라인 영역 */}
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "8px" }}>
            ⏰ 최근 제보 타임라인
          </h4>
          {isUnknown || isUnlocked ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedPlace.history.length > 0 ? (
                selectedPlace.history.slice(0, 5).map((hist, idx) => (
                  <div key={idx} style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700" }}>제보 혼잡도:</span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: getCrowdLevelInfo(hist.crowdLevel).color }}>
                          {getCrowdLevelInfo(hist.crowdLevel).label}
                        </span>
                      </div>
                      {hist.reporter && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          제보자: {hist.reporter}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{getRelativeTimeText(hist.timestamp)} ({hist.time})</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "12px" }}>
                  과거 제보 기록이 비어 있습니다.
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "12px" }}>
              열람권 활성화 시 제보 타임라인이 공개됩니다. 🔒
            </div>
          )}
        </div>

        {/* 제보하기 이동 버튼 - URL Query String 연동 */}
        <button
          onClick={() => {
            const defaultLevel = selectedPlace.crowdLevel === 0 ? 3 : selectedPlace.crowdLevel;
            router.push(`/report/gps?placeId=${selectedPlace.id}&building=${encodeURIComponent(selectedPlace.building)}&crowdLevel=${defaultLevel}`);
          }}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "14px 20px",
            marginTop: "8px",
            backgroundColor: buttonRewardPoints === 30 ? "var(--accent)" : "var(--primary)",
            borderColor: "transparent",
            cursor: "pointer",
            boxShadow: buttonRewardPoints === 30 ? "0 4px 14px rgba(239, 68, 68, 0.25)" : "none",
            transition: "var(--transition-bounce)",
            fontWeight: "850"
          }}
        >
          ✍️ 이 장소 혼잡도 제보하기 (+{buttonRewardPoints}P)
        </button>

      </div>
    </div>
  );
}
