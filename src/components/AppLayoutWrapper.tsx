"use client";

import React, { useState, useEffect } from "react";
import { useGpsContext } from "../context/GpsContext";
import { usePlacesContext } from "../context/PlaceContext";
import { useUserContext } from "../context/UserContext";
import { getVirtualNow, formatVirtualTime } from "../utils/timeSpeed";

// Import layouts/HUD
import ExternalHud from "./ExternalHud";
import NotificationBanner from "./NotificationBanner";
import UnlockModal from "./UnlockModal";
import BottomTabBar from "./BottomTabBar";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { myGPSBuilding, setMyGPSBuilding } = useGpsContext();
  const {
    places,
    isSimulating,
    setIsSimulating,
    simLogs,
    targetCount,
    setTargetCount,
    generatedCount
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
  } = useUserContext();

  const [currentTime, setCurrentTime] = useState<string>("13:43");

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

  return (
    <div className="app-wrapper">
      {/* ==========================================
          EXTERNAL HUD PANEL (Visible only on PC viewports)
          ========================================== */}
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
      />

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

        {/* ==========================================
            ACTIVE PROTOTYPE NOTIFICATION BANNER (Phase 4 Simulation)
            ========================================== */}
        <NotificationBanner
          showNotification={showReReportNotification}
          setShowNotification={setShowReReportNotification}
        />

        {/* Main Phone Screen View */}
        <main className="phone-screen animate-slide-up" style={{ paddingBottom: "76px" }}>
          {children}
        </main>

        {/* Elegant Floating Bottom Tab Bar */}
        <BottomTabBar />

        {/* Unlocked Pass Activation Modal */}
        <UnlockModal
          showUnlockModal={showUnlockModal}
          setShowUnlockModal={setShowUnlockModal}
          userPoints={userPoints}
          handleConfirmUnlock={handleConfirmUnlock}
        />
      </div>
    </div>
  );
}
