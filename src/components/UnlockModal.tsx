"use client";

import React from "react";

interface UnlockModalProps {
  showUnlockModal: boolean;
  setShowUnlockModal: (show: boolean) => void;
  userPoints: number;
  handleConfirmUnlock: () => void;
}

export default function UnlockModal({
  showUnlockModal,
  setShowUnlockModal,
  userPoints,
  handleConfirmUnlock,
}: UnlockModalProps) {
  if (!showUnlockModal) return null;

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 3000
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        borderRadius: "var(--radius-md)",
        padding: "24px 20px",
        border: "1.5px solid var(--primary)",
        backgroundColor: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        textAlign: "center",
        boxShadow: "var(--shadow-lg)",
        animation: "slideUp 0.3s ease-out"
      }}>
        <span style={{ fontSize: "36px" }}>🔑</span>
        <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--foreground)" }}>
          실시간 혼잡도 열람 활성화
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
          <strong>10포인트</strong>를 소모하여 <strong>3분간</strong> 교내 전체 공간의 실시간 혼잡도 데이터를 열람할 수 있습니다.
        </p>
        <div style={{
          backgroundColor: "var(--background)",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "700"
        }}>
          현재 보유 포인트: <span style={{ color: "var(--primary)" }}>{userPoints} P</span>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            onClick={handleConfirmUnlock}
            className="btn-primary"
            style={{ flex: 1, padding: "10px", fontSize: "12px", borderRadius: "10px" }}
          >
            열람 활성화 (-10P)
          </button>
          <button
            onClick={() => setShowUnlockModal(false)}
            className="btn-secondary"
            style={{ flex: 1, padding: "10px", fontSize: "12px", borderRadius: "10px" }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
