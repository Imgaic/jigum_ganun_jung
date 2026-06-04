"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../Icons";
import { useUserContext } from "../../context/UserContext";

export default function MyInfoScreen() {
  const router = useRouter();

  // 유저 포인트 정보 컨텍스트 직접 참조
  const { userPoints, currentUser, rankings, refreshRankings, handleLogout } = useUserContext();

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
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "16px", fontWeight: "850" }}>내 정보 및 랭킹</h2>
          <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
            {currentUser?.nickname} · @{currentUser?.username}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text-muted)",
            padding: "7px 10px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          로그아웃
        </button>
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            width: "100%",
            marginTop: "10px"
          }}>
            {[
              { label: "현재 순위", value: `#${currentUser?.rank || "-"}` },
              { label: "종합점수", value: `${currentUser?.score || 0}` },
              { label: "제보수", value: `${currentUser?.reportCount || 0}` },
            ].map((item) => (
              <div key={item.label} style={{
                backgroundColor: "rgba(255, 255, 255, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                padding: "9px 6px",
                display: "flex",
                flexDirection: "column",
                gap: "3px"
              }}>
                <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontWeight: "700" }}>{item.label}</span>
                <strong style={{ fontSize: "13px", color: "var(--foreground)" }}>{item.value}</strong>
              </div>
            ))}
          </div>
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
              <h4 style={{ fontSize: "13.5px", fontWeight: "850" }}>내 등급: {currentUser && currentUser.rank <= 3 ? "CAU 제보왕" : "실시간 제보단"}</h4>
              <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1.5px" }}>
                신뢰도 {currentUser?.trustScore || 0}점 · 종합점수 공식 반영
              </p>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--foreground)", padding: "3px 8px", borderRadius: "12px" }}>
            RANK {currentUser?.rank || "-"}
          </span>
        </div>

        {/* 유저별 종합 랭킹 */}
        <div style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: "900", color: "var(--foreground)" }}>🏆 유저별 종합 랭킹 TOP 10</h4>
              <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                점수 = 포인트 + 제보수×5 + 신뢰도×2
              </p>
            </div>
            <button
              onClick={() => {
                void refreshRankings();
              }}
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface-hover)",
                color: "var(--text-muted)",
                borderRadius: "9px",
                padding: "6px 8px",
                fontSize: "10px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              새로고침
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {rankings.map((entry) => (
              <div key={`${entry.rank}-${entry.nickname}`} style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr auto",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "12px",
                border: entry.isCurrentUser ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: entry.isCurrentUser ? "var(--primary-light)" : "var(--background)"
              }}>
                <span style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: entry.rank <= 3 ? "var(--foreground)" : "var(--surface-hover)",
                  color: entry.rank <= 3 ? "white" : "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: "900"
                }}>
                  {entry.rank}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h5 style={{ fontSize: "12px", fontWeight: "900", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.nickname}{entry.isCurrentUser ? " · 나" : ""}
                  </h5>
                  <p style={{ fontSize: "9.8px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {entry.points}P · 제보 {entry.reportCount}회 · 신뢰도 {entry.trustScore}
                  </p>
                </div>
                <strong style={{ fontSize: "12px", color: entry.isCurrentUser ? "var(--primary)" : "var(--foreground)" }}>
                  {entry.score}
                </strong>
              </div>
            ))}
          </div>
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
