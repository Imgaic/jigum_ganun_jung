"use client";

import React from "react";
import type { UserDirectoryEntry } from "../lib/types";
import { useUserContext } from "../context/UserContext";
import PlaceDirectoryPanel from "./PlaceDirectoryPanel";

const headerCellStyle: React.CSSProperties = {
  padding: "0 6px 6px",
  fontSize: "10px",
  fontWeight: 900,
  color: "var(--text-muted)",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: "11px",
  fontWeight: 800,
  color: "var(--foreground)",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

function formatDateTime(value: string | null) {
  if (!value) return "기록 없음";
  return value.replace("T", " ").slice(0, 16).replace(/^(\d{4})-(\d{2})-(\d{2}) /, "$2/$3 ");
}

function getRankAccent(entry: UserDirectoryEntry) {
  if (entry.rank === 1) return "var(--primary)";
  if (entry.rank <= 3) return "var(--secondary)";
  return "var(--text-muted)";
}

export default function UserDirectoryPanel() {
  const { currentUser, userDirectory, switchUser } = useUserContext();
  const [switchingUserId, setSwitchingUserId] = React.useState<number | null>(null);
  const [switchError, setSwitchError] = React.useState<string>("");
  const [activeTable, setActiveTable] = React.useState<"users" | "places">("users");
  const topUser = userDirectory[0];

  const handleSwitchUser = async (entry: UserDirectoryEntry) => {
    if (entry.isCurrentUser || switchingUserId) return;

    setSwitchError("");
    setSwitchingUserId(entry.id);

    const result = await switchUser(entry.id);
    if (!result.ok) {
      setSwitchError(result.message || "유저 전환 중 문제가 발생했습니다.");
    }

    setSwitchingUserId(null);
  };

  return (
    <aside className="external-user-panel">
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-md)",
        padding: "18px",
        border: "1.5px solid hsla(var(--primary-hue), 85%, 40%, 0.28)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          padding: "4px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          backgroundColor: "var(--background)",
        }}>
          {[
            { key: "users" as const, label: "유저" },
            { key: "places" as const, label: "장소" },
          ].map((tab) => {
            const isActive = activeTable === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTable(tab.key)}
                aria-pressed={isActive}
                style={{
                  height: "34px",
                  border: "1px solid var(--border)",
                  borderRadius: "9px",
                  backgroundColor: isActive ? "var(--primary)" : "var(--surface)",
                  color: isActive ? "white" : "var(--foreground)",
                  fontSize: "12px",
                  fontWeight: 950,
                  cursor: "pointer",
                  transition: "var(--transition-smooth)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTable === "users" ? (
          <>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--primary)", letterSpacing: "0.06em" }}>
            USER DATABASE
          </span>
          <h3 style={{ fontSize: "15px", fontWeight: 950, color: "var(--foreground)" }}>
            전체 유저 정보 테이블
          </h3>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}>
          {[
            { label: "전체 유저", value: `${userDirectory.length}명` },
            { label: "현재 유저", value: currentUser ? `#${currentUser.rank}` : "-" },
            { label: "1위 점수", value: topUser ? `${topUser.score}` : "-" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 800 }}>{item.label}</span>
              <strong style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 950 }}>{item.value}</strong>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800 }}>현재 로그인</span>
          <strong style={{ fontSize: "12px", color: "var(--foreground)", fontWeight: 900 }}>
            {currentUser ? `${currentUser.nickname} · @${currentUser.username}` : "로그인 정보 없음"}
          </strong>
          {switchError && (
            <span style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 800 }}>
              {switchError}
            </span>
          )}
        </div>

        <div style={{ paddingBottom: "2px" }}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 6px",
            tableLayout: "fixed",
          }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, width: "42px" }}>순위</th>
                <th style={headerCellStyle}>유저</th>
                <th style={{ ...headerCellStyle, width: "62px", textAlign: "right" }}>포인트</th>
                <th style={{ ...headerCellStyle, width: "44px", textAlign: "right" }}>제보</th>
                <th style={{ ...headerCellStyle, width: "56px", textAlign: "right" }}>점수</th>
              </tr>
            </thead>
            <tbody>
              {userDirectory.map((entry) => {
                const isSwitching = switchingUserId === entry.id;
                const isDisabled = entry.isCurrentUser || switchingUserId !== null;

                return (
                  <tr
                    key={entry.id}
                    role={entry.isCurrentUser ? undefined : "button"}
                    tabIndex={entry.isCurrentUser ? undefined : 0}
                    aria-label={entry.isCurrentUser ? undefined : `${entry.nickname} 유저로 전환`}
                    onClick={() => void handleSwitchUser(entry)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleSwitchUser(entry);
                      }
                    }}
                    style={{
                      backgroundColor: entry.isCurrentUser ? "var(--primary-light)" : "var(--surface)",
                      boxShadow: entry.isCurrentUser ? "0 0 0 1px var(--primary)" : "0 0 0 1px var(--border)",
                      cursor: isDisabled ? "default" : "pointer",
                      opacity: isSwitching ? 0.72 : 1,
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    <td style={{
                      ...cellStyle,
                      width: "42px",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      color: getRankAccent(entry),
                    }}>
                      #{entry.rank}
                    </td>
                    <td style={{ ...cellStyle, whiteSpace: "normal" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 900 }}>
                          {entry.nickname}{entry.isCurrentUser ? " · 나" : isSwitching ? " · 전환 중" : ""}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 750 }}>
                          @{entry.username}
                        </span>
                        <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 700 }}>
                          신뢰 {entry.trustScore} · 로그인 {formatDateTime(entry.lastLoginAt)}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>{entry.points}P</td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>{entry.reportCount}</td>
                    <td style={{
                      ...cellStyle,
                      textAlign: "right",
                      color: "var(--primary)",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                    }}>
                      {entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {userDirectory.length === 0 && (
            <div style={{
              padding: "26px 12px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 750,
              border: "1px dashed var(--border)",
              borderRadius: "10px",
            }}>
              표시할 유저 데이터가 없습니다.
            </div>
          )}
        </div>
          </>
        ) : (
          <PlaceDirectoryPanel />
        )}
      </div>
    </aside>
  );
}
