"use client";

import React from "react";
import { useUserContext } from "../context/UserContext";

export default function AuthGate() {
  const {
    authMode,
    setAuthMode,
    authUsername,
    setAuthUsername,
    authPassword,
    setAuthPassword,
    authNickname,
    setAuthNickname,
    authError,
    isAuthSubmitting,
    handleAuthSubmit,
  } = useUserContext();

  const isSignup = authMode === "signup";

  return (
    <div style={{
      minHeight: "100%",
      padding: "28px 20px 34px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "18px"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "900", color: "var(--primary)", letterSpacing: "0.08em" }}>
          CAU REALTIME PLACE RANKING
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "950", color: "var(--foreground)" }}>지금 가는 중</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
          로그인하고 제보 포인트를 쌓아 교내 실시간 공간 랭킹에 참여하세요.
        </p>
      </div>

      <form onSubmit={handleAuthSubmit} style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "var(--shadow-md)"
      }}>
        <div style={{ display: "flex", backgroundColor: "var(--surface-hover)", borderRadius: "12px", padding: "4px", gap: "4px" }}>
          {(["login", "signup"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "9px",
                padding: "9px 10px",
                backgroundColor: authMode === mode ? "var(--surface)" : "transparent",
                color: authMode === mode ? "var(--primary)" : "var(--text-muted)",
                fontSize: "12px",
                fontWeight: "850",
                boxShadow: authMode === mode ? "var(--shadow-sm)" : "none",
                cursor: "pointer"
              }}
            >
              {mode === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: "800", color: "var(--text-muted)" }}>
          아이디
          <input
            value={authUsername}
            onChange={(e) => setAuthUsername(e.target.value)}
            placeholder="test01"
            autoComplete="username"
            style={inputStyle}
          />
        </label>

        {isSignup && (
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: "800", color: "var(--text-muted)" }}>
            닉네임
            <input
              value={authNickname}
              onChange={(e) => setAuthNickname(e.target.value)}
              placeholder="나의랭킹닉네임"
              autoComplete="nickname"
              style={inputStyle}
            />
          </label>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: "800", color: "var(--text-muted)" }}>
          비밀번호
          <input
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            type="password"
            placeholder="cau1234!"
            autoComplete={isSignup ? "new-password" : "current-password"}
            style={inputStyle}
          />
        </label>

        {authError && (
          <div style={{
            padding: "10px 12px",
            borderRadius: "10px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: "750",
            lineHeight: "1.4"
          }}>
            {authError}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isAuthSubmitting}
          style={{ width: "100%", opacity: isAuthSubmitting ? 0.7 : 1 }}
        >
          {isAuthSubmitting ? "처리 중..." : isSignup ? "회원가입하고 시작" : "로그인하고 시작"}
        </button>

        <div style={{
          backgroundColor: "var(--primary-light)",
          border: "1px dashed hsla(var(--primary-hue), 85%, 40%, 0.3)",
          borderRadius: "12px",
          padding: "12px",
          color: "var(--foreground)",
          fontSize: "11px",
          lineHeight: "1.6"
        }}>
          <strong style={{ color: "var(--primary)" }}>테스트 계정</strong><br />
          아이디: <strong>test01</strong> ~ <strong>test100</strong><br />
          비밀번호: <strong>cau1234!</strong>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  border: "1.5px solid var(--border)",
  borderRadius: "10px",
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
  outline: "none",
  fontSize: "14px",
  fontWeight: "700"
};
