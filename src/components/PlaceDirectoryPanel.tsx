"use client";

import React from "react";
import type { Place } from "../types";
import { usePlacesContext } from "../context/PlaceContext";
import { calculateWeightedCrowdLevel, getCrowdLevelInfo } from "../utils/crowdAnalyzer";
import { getRelativeTimeText } from "../utils/timeFormatter";
import { getVirtualNow } from "../utils/timeSpeed";

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

interface PlaceDirectoryRow {
  place: Place;
  currentLevel: number;
  crowdInfo: ReturnType<typeof getCrowdLevelInfo>;
  recentHistoryCount: number;
}

function getRecentHistoryCount(place: Place, nowMs: number) {
  const limitMs = 30 * 60 * 1000;
  return place.history.filter((history) => nowMs - history.timestamp >= 0 && nowMs - history.timestamp <= limitMs).length;
}

export default function PlaceDirectoryPanel() {
  const { places } = usePlacesContext();
  const nowMs = getVirtualNow();

  const rows = React.useMemo<PlaceDirectoryRow[]>(() => {
    return places
      .map((place) => {
        const currentLevel = calculateWeightedCrowdLevel(place.history, nowMs);
        return {
          place,
          currentLevel,
          crowdInfo: getCrowdLevelInfo(currentLevel),
          recentHistoryCount: getRecentHistoryCount(place, nowMs),
        };
      })
      .sort((a, b) => a.place.id - b.place.id);
  }, [places, nowMs]);

  const reportedPlacesCount = rows.filter((row) => row.place.reportsCount > 0 || row.place.history.length > 0).length;
  const unknownPlacesCount = rows.filter((row) => row.currentLevel === 0).length;
  const busyPlacesCount = rows.filter((row) => row.currentLevel >= 4).length;
  const latestUpdatedAt = rows.reduce((latest, row) => Math.max(latest, row.place.updatedAt || 0), 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--primary)", letterSpacing: "0.06em" }}>
            PLACE DATABASE
          </span>
          <h3 style={{ fontSize: "15px", fontWeight: 950, color: "var(--foreground)" }}>
            전체 장소 정보 테이블
          </h3>
        </div>
        <div style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          color: "var(--text-muted)",
          borderRadius: "8px",
          padding: "7px 9px",
          fontSize: "11px",
          fontWeight: 850,
          whiteSpace: "nowrap",
        }}>
          {getRelativeTimeText(latestUpdatedAt, nowMs)}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "8px",
      }}>
        {[
          { label: "전체 장소", value: `${rows.length}개` },
          { label: "제보 있음", value: `${reportedPlacesCount}개` },
          { label: "알 수 없음", value: `${unknownPlacesCount}개` },
          { label: "혼잡 이상", value: `${busyPlacesCount}개` },
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

      <div style={{ overflowX: "auto", paddingBottom: "2px" }}>
        <table style={{
          width: "100%",
          minWidth: "760px",
          borderCollapse: "separate",
          borderSpacing: "0 6px",
          tableLayout: "fixed",
        }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: "44px" }}>ID</th>
              <th style={{ ...headerCellStyle, width: "82px" }}>건물</th>
              <th style={{ ...headerCellStyle, width: "70px" }}>층</th>
              <th style={{ ...headerCellStyle, width: "170px" }}>장소</th>
              <th style={{ ...headerCellStyle, width: "170px" }}>상세 위치</th>
              <th style={{ ...headerCellStyle, width: "120px" }}>목적</th>
              <th style={{ ...headerCellStyle, width: "86px", textAlign: "right" }}>혼잡도</th>
              <th style={{ ...headerCellStyle, width: "54px", textAlign: "right" }}>제보</th>
              <th style={{ ...headerCellStyle, width: "72px", textAlign: "right" }}>최근</th>
              <th style={{ ...headerCellStyle, width: "70px", textAlign: "right" }}>이미지</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.place.id}
                style={{
                  backgroundColor: "var(--surface)",
                  boxShadow: "0 0 0 1px var(--border)",
                }}
              >
                <td style={{
                  ...cellStyle,
                  width: "44px",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                  color: "var(--text-muted)",
                }}>
                  #{row.place.id}
                </td>
                <td style={cellStyle}>{row.place.building}</td>
                <td style={cellStyle}>{row.place.floor}</td>
                <td style={{ ...cellStyle, whiteSpace: "normal" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 900 }}>{row.place.name}</span>
                    <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 750 }}>
                      이력 {row.place.history.length}건 · 유효 {row.recentHistoryCount}건
                    </span>
                  </div>
                </td>
                <td style={{ ...cellStyle, whiteSpace: "normal", color: "var(--text-muted)", fontWeight: 750 }}>
                  {row.place.detailLocation}
                </td>
                <td style={{ ...cellStyle, whiteSpace: "normal" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {row.place.purposes.map((purpose) => (
                      <span
                        key={purpose}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "7px",
                          padding: "3px 5px",
                          color: "var(--text-muted)",
                          fontSize: "9.5px",
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        {purpose}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "64px",
                    padding: "5px 7px",
                    borderRadius: "8px",
                    backgroundColor: row.crowdInfo.bg,
                    border: `1px solid ${row.crowdInfo.border}`,
                    color: row.crowdInfo.color,
                    fontSize: "10px",
                    fontWeight: 900,
                  }}>
                    {row.crowdInfo.label}
                  </span>
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{row.place.reportsCount}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{getRelativeTimeText(row.place.updatedAt, nowMs)}</td>
                <td style={{
                  ...cellStyle,
                  textAlign: "right",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                  color: row.place.imageUrl ? "var(--primary)" : "var(--text-muted)",
                }}>
                  {row.place.imageUrl ? "있음" : "없음"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div style={{
            padding: "26px 12px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "12px",
            fontWeight: 750,
            border: "1px dashed var(--border)",
            borderRadius: "10px",
          }}>
            표시할 장소 데이터가 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
