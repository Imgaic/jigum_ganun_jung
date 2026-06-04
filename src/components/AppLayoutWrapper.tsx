"use client";

import React, { useState, useEffect } from "react";
import { useGpsContext } from "../context/GpsContext";
import { usePlacesContext } from "../context/PlaceContext";
import { useUserContext } from "../context/UserContext";
import { getVirtualNow, formatVirtualTime } from "../utils/timeSpeed";

// Import layouts/HUD
import ExternalHud from "./ExternalHud";
import UserDirectoryPanel from "./UserDirectoryPanel";
import NotificationBanner from "./NotificationBanner";
import UnlockModal from "./UnlockModal";
import BottomTabBar from "./BottomTabBar";
import AuthGate from "./AuthGate";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { myGPSBuilding, setMyGPSBuilding } = useGpsContext();
  const {
    isSimulating,
    setIsSimulating,
    simLogs,
    targetCount,
    setTargetCount,
    generatedCount,
    simBias,
    setSimBias
  } = usePlacesContext();
  const {
    userPoints,
    showUnlockModal,
    setShowUnlockModal,
    handleConfirmUnlock,
    showReReportNotification,
    setShowReReportNotification,
    timeSpeed,
    setTimeSpeed,
    authStatus,
  } = useUserContext();

  const [currentTime, setCurrentTime] = useState<string>("13:43");
  const [showExternalHud, setShowExternalHud] = useState<boolean>(true);
  const [showUserPanel, setShowUserPanel] = useState<boolean>(true);

  // 가상 시스템 시계 업데이트 (배속 적용 및 200ms 고주파수 갱신으로 흐름 연출)
  useEffect(() => {
    const updateTime = () => {
      const vNow = getVirtualNow();
      setCurrentTime(formatVirtualTime(vNow));
    };
    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = authStatus === "authenticated";

  return (
    <div className="app-wrapper">
      <button
        type="button"
        className="panel-toggle panel-toggle-left"
        onClick={() => setShowExternalHud((prev) => !prev)}
        aria-pressed={showExternalHud}
        title={showExternalHud ? "좌측 HUD 패널 숨기기" : "좌측 HUD 패널 보이기"}
      >
        {showExternalHud ? "‹" : "›"}
        <span>HUD</span>
      </button>

      <button
        type="button"
        className="panel-toggle panel-toggle-right"
        onClick={() => setShowUserPanel((prev) => !prev)}
        aria-pressed={showUserPanel}
        title={showUserPanel ? "우측 데이터 패널 숨기기" : "우측 데이터 패널 보이기"}
      >
        <span>DATA</span>
        {showUserPanel ? "›" : "‹"}
      </button>

      {/* ==========================================
          EXTERNAL HUD PANEL (Visible only on PC viewports)
          ========================================== */}
      {showExternalHud && (
        <ExternalHud
          myGPSBuilding={myGPSBuilding}
          setMyGPSBuilding={setMyGPSBuilding}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          simLogs={simLogs}
          targetCount={targetCount}
          setTargetCount={setTargetCount}
          generatedCount={generatedCount}
          timeSpeed={timeSpeed}
          setTimeSpeed={setTimeSpeed}
          simBias={simBias}
          setSimBias={setSimBias}
        />
      )}

      <div className="device-frame">
        {/* Upper Virtual Status Bar */}
        <div className="status-bar-spacer" />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "6px 24px 0",
          fontSize: "12px",
          fontWeight: "600",
          color: "var(--foreground)",
          opacity: 0.8,
          zIndex: 100
        }}>
          <span>{currentTime}</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span>LTE</span>
            <div style={{
              width: "18px",
              height: "10px",
              border: "1px solid var(--foreground)",
              borderRadius: "3px",
              padding: "1px",
              display: "flex",
              alignItems: "center"
            }}>
              <div style={{ width: "90%", height: "100%", backgroundColor: "var(--foreground)", borderRadius: "1px" }} />
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <NotificationBanner
            showNotification={showReReportNotification}
            setShowNotification={setShowReReportNotification}
          />
        )}

        {/* Main Phone Screen View */}
        <main className="phone-screen animate-slide-up" style={{ paddingBottom: isAuthenticated ? "76px" : 0 }}>
          {authStatus === "checking" ? (
            <div style={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "24px",
              textAlign: "center"
            }}>
              <span className="pulse-dot" style={{ width: "24px", height: "24px" }} />
              <strong style={{ fontSize: "14px" }}>세션 확인 중</strong>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>저장된 로그인 정보를 불러오고 있습니다.</span>
            </div>
          ) : isAuthenticated ? (
            children
          ) : (
            <AuthGate />
          )}
        </main>

        {/* Elegant Floating Bottom Tab Bar */}
        {isAuthenticated && <BottomTabBar />}

        {/* Unlocked Pass Activation Modal */}
        {isAuthenticated && (
          <UnlockModal
            showUnlockModal={showUnlockModal}
            setShowUnlockModal={setShowUnlockModal}
            userPoints={userPoints}
            handleConfirmUnlock={handleConfirmUnlock}
          />
        )}
      </div>

      {showUserPanel && <UserDirectoryPanel />}
    </div>
  );
}
