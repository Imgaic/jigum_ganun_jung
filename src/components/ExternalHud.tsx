"use client";

import React from "react";
import { BUILDINGS } from "../types";

interface ExternalHudProps {
  myGPSBuilding: string;
  setMyGPSBuilding: (building: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simLogs: string[];
  targetCount: number;
  setTargetCount: (count: number) => void;
  generatedCount: number;
  timeSpeed: number;
  setTimeSpeed: (speed: number) => void;
}

export default function ExternalHud({
  myGPSBuilding,
  setMyGPSBuilding,
  isSimulating,
  setIsSimulating,
  simLogs,
  targetCount,
  setTargetCount,
  generatedCount,
  timeSpeed,
  setTimeSpeed,
}: ExternalHudProps) {
  return (
    <div className="external-control-hud">
      {/* Virtual GPS Controller */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-md)",
        padding: "20px",
        border: "1.5px solid hsla(var(--primary-hue), 85%, 40%, 0.35)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: "14px", fontWeight: "900", color: "var(--primary)" }}>가상 GPS 센서 스위치 (HUD)</span>
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          이 패널은 데스크톱 시연 전용 대시보드입니다. 스마트폰 외부에서 모의 GPS 위치를 변경하여 내부 화면의 실시간 반응을 볼 수 있습니다.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
          <span style={{ fontSize: "16px" }}>📍</span>
          <span style={{ fontSize: "13.5px", fontWeight: "800" }}>
            현재 가상 위치: <span style={{ color: "var(--primary)" }}>{myGPSBuilding}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginTop: "4px" }}>
          {BUILDINGS.map((b) => (
            <button
              key={b}
              onClick={() => setMyGPSBuilding(b)}
              style={{
                padding: "10px 8px",
                fontSize: "12px",
                fontWeight: "800",
                borderRadius: "10px",
                border: myGPSBuilding === b ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: myGPSBuilding === b ? "var(--primary-light)" : "var(--surface)",
                color: myGPSBuilding === b ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
                textAlign: "center"
              }}
            >
              🏢 {b}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Engine Toggle */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        border: "1.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "var(--shadow-md)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🤖</span>
            <span style={{ fontSize: "13px", fontWeight: "900" }}>실시간 제보 시뮬레이터</span>
          </div>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: isSimulating ? "var(--primary)" : "var(--accent)",
            boxShadow: isSimulating ? "0 0 8px var(--primary)" : "none",
            transition: "var(--transition-smooth)"
          }} />
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          가상 학생 100명이 교내 전역에서 무작위로 혼잡도를 제보하여 데이터를 동적 갱신하는 상태를 재현합니다.
        </p>

        {/* 제보 생성 개수 입력 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          marginTop: "2px",
          borderTop: "1px dashed var(--border)",
          paddingTop: "8px"
        }}>
          <span style={{ fontSize: "11.5px", fontWeight: "800", color: "var(--foreground)" }}>자동 생성 개수:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="number"
              min={1}
              max={500}
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isSimulating}
              style={{
                width: "60px",
                padding: "4px 6px",
                fontSize: "11.5px",
                fontWeight: "800",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                textAlign: "center"
              }}
            />
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "600" }}>개</span>
          </div>
        </div>

        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={isSimulating ? "btn-secondary" : "btn-primary"}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "800",
            borderRadius: "8px",
            marginTop: "2px",
            backgroundColor: isSimulating ? "hsl(15, 95%, 95%)" : "var(--primary)",
            color: isSimulating ? "var(--accent)" : "white",
            borderColor: isSimulating ? "var(--accent)" : "transparent",
            cursor: "pointer",
            transition: "var(--transition-smooth)"
          }}
        >
          {isSimulating
            ? `시뮬레이션 중지 🔴 (${generatedCount} / ${targetCount})`
            : "시뮬레이션 시작 🟢"}
        </button>

        {/* Minimal sync debug logs to verify simulation is actually running */}
        <div style={{
          backgroundColor: "var(--background)",
          border: "1.5px solid var(--border)",
          borderRadius: "8px",
          padding: "10px 12px",
          marginTop: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "5px"
        }}>
          <span style={{ fontSize: "10.5px", fontWeight: "850", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            🛰️ 실시간 제보 로그 기록 (누적 {simLogs.length}건 수신)
          </span>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            borderTop: "1px dashed var(--border)",
            paddingTop: "6px",
            marginTop: "2px",
            maxHeight: "160px",
            overflowY: "auto",
            paddingRight: "4px"
          }}>
            {simLogs.length > 0 ? (
              simLogs.map((log, idx) => (
                <div key={idx} style={{
                  fontSize: "10.5px",
                  fontFamily: "monospace",
                  color: idx === 0 ? "var(--primary)" : "var(--foreground)",
                  fontWeight: idx === 0 ? "bold" : "normal",
                  opacity: idx === 0 ? 1 : 0.75,
                  lineHeight: "1.4",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flexShrink: 0
                }}>
                  {log}
                </div>
              ))
            ) : (
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                가상 제보 대기 중... ⏳
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Time Acceleration Control (HUD) */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        border: "1.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "var(--shadow-md)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <span style={{ fontSize: "13px", fontWeight: "900", color: "var(--foreground)" }}>재제보 푸시 시간 가속기 (HUD)</span>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          제보 이후 유효기간(예상 체류시간) 만료 5분 전의 알림 발송 속도를 조절합니다. 실시간을 기본으로 하되 배속을 높여 즉시 확인을 연출할 수 있습니다.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginTop: "4px" }}>
          {[
            { value: 1, label: "1배속 (실시간)" },
            { value: 60, label: "60배속 (1분=1초)" },
            { value: 300, label: "300배속 (5분=1초)" },
            { value: 600, label: "600배속 (10분=1초)" }
          ].map((speed) => (
            <button
              key={speed.value}
              onClick={() => setTimeSpeed(speed.value)}
              style={{
                padding: "8px 4px",
                fontSize: "11px",
                fontWeight: "800",
                borderRadius: "8px",
                border: timeSpeed === speed.value ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: timeSpeed === speed.value ? "var(--primary-light)" : "var(--surface)",
                color: timeSpeed === speed.value ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
                textAlign: "center"
              }}
            >
              🚀 {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Guide Tips */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-md)",
        padding: "20px",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "var(--shadow-md)"
      }}>
        <h4 style={{ fontSize: "13px", fontWeight: "900", color: "var(--foreground)" }}>💡 기말 시연 시나리오 팁</h4>
        <ul style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "14px", lineHeight: "1.5" }}>
          <li><strong>목적별 탐색</strong>: 스마트폰 내부 홈 화면의 📚 <strong>공부</strong>, 🍔 <strong>식사</strong> 등의 버튼을 누르면 빠른 조건 필터링이 가동됩니다.</li>
          <li><strong>실시간 제보 시연</strong>: 하단 <strong>제보하기</strong> 탭을 누르면 모의 GPS 검증 모션을 거쳐 혼잡도를 기입하고 🪙 <strong>+10P</strong>를 즉시 획득합니다.</li>
          <li><strong>챗봇 추천 시연</strong>: <strong>AI 추천 챗봇</strong> 탭에서 칩 질문을 던지면 챗봇 메시지에 <strong>인터랙티브 추천 카드</strong>가 매핑됩니다.</li>
          <li><strong>푸시 배너 연출</strong>: 앱 실행 15초 후 스마트폰 상단에 유효기간 체크 푸시 알림 배너가 튀어나옵니다!</li>
        </ul>
      </div>
    </div>
  );
}
