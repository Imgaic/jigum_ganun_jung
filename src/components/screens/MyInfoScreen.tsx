"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../Icons";
import { useUserContext } from "../../context/UserContext";

export default function MyInfoScreen() {
  const router = useRouter();

  // 유저 포인트 정보 컨텍스트 직접 참조
  const { userPoints } = useUserContext();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 마이페이지 상단 뒤로가기 */}
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
        <h2 style={{ fontSize: "16px", fontWeight: "850" }}>내 정보 및 기여도</h2>
      </header>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 포인트 현황 전광판 */}
        <div className="glass-panel" style={{
          borderRadius: "var(--radius-md)",
          padding: "24px 20px",
          border: "1.5px solid var(--primary)",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>
            보유 활동 포인트
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
            <span style={{ fontSize: "36px" }}>🪙</span>
            <span style={{ fontSize: "36px", fontWeight: "950", color: "var(--primary)" }}>{userPoints} P</span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            포인트는 실시간 교내 제보에 참여하면 매회 10P씩 지급됩니다!
          </p>
        </div>

        {/* 게임 요소 등급 카드 */}
        <div style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🎒</span>
            <div>
              <h4 style={{ fontSize: "13.5px", fontWeight: "850" }}>내 등급: CAU 제보왕</h4>
              <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1.5px" }}>실시간 제보로 정보 순환에 크게 기여 중</p>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--foreground)", padding: "3px 8px", borderRadius: "12px" }}>
            LV. 3
          </span>
        </div>

        {/* 포인트 혜택 기획 */}
        <div style={{
          backgroundColor: "var(--primary-light)",
          border: "1px dashed hsla(var(--primary-hue), 85%, 40%, 0.3)",
          padding: "16px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <h4 style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--primary)" }}>🎁 제보자 혜택 안내 (Exchange Point)</h4>
          <p style={{ fontSize: "11px", color: "var(--foreground)", opacity: 0.9, lineHeight: "1.6" }}>
            1. <strong>커피 쿠폰</strong>: 교내 CAU 생활협동조합 매장에서 300P당 아메리카노 1잔 무료 교환.<br />
            2. <strong>생협 할인권</strong>: 교내 서점/문구점에서 구매 시 포인트 금액만큼 즉시 차감 결제 가능.
          </p>
        </div>

      </div>
    </div>
  );
}
