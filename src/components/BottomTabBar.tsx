"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 브라우저 URL 경로에 따라 활성화할 탭을 판단합니다.
  const isHome = pathname === "/";
  const isSearch = pathname === "/search" || pathname === "/list" || pathname.startsWith("/detail");
  const isReport = pathname.startsWith("/report");
  const isChat = pathname === "/chatbot";
  const isMy = pathname === "/myinfo";

  return (
    <nav className="glass-panel" style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "76px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      paddingBottom: "10px",
      zIndex: 999
    }}>
      {/* 홈 탭 */}
      <button
        onClick={() => router.push("/")}
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: isHome ? "var(--primary)" : "var(--text-muted)",
          cursor: "pointer",
          fontWeight: isHome ? "800" : "500",
          fontSize: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>🏠</span>
        <span>홈</span>
      </button>

      {/* 장소 검색 탭 */}
      <button
        onClick={() => router.push("/search")}
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: isSearch ? "var(--primary)" : "var(--text-muted)",
          cursor: "pointer",
          fontWeight: isSearch ? "800" : "500",
          fontSize: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>🔍</span>
        <span>장소 검색</span>
      </button>

      {/* 제보하기 탭 */}
      <button
        onClick={() => router.push("/report/gps")}
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: isReport ? "var(--primary)" : "var(--text-muted)",
          cursor: "pointer",
          fontWeight: isReport ? "800" : "500",
          fontSize: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>✍️</span>
        <span>제보하기</span>
      </button>

      {/* AI 추천 챗봇 탭 */}
      <button
        onClick={() => router.push("/chatbot")}
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: isChat ? "var(--primary)" : "var(--text-muted)",
          cursor: "pointer",
          fontWeight: isChat ? "800" : "500",
          fontSize: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>💬</span>
        <span>장소 추천 AI</span>
      </button>

      {/* 마이 탭 */}
      <button
        onClick={() => router.push("/myinfo")}
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: isMy ? "var(--primary)" : "var(--text-muted)",
          cursor: "pointer",
          fontWeight: isMy ? "800" : "500",
          fontSize: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>👤</span>
        <span>마이</span>
      </button>
    </nav>
  );
}
