"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlacesContext } from "../context/PlaceContext";
import { useUserContext } from "../context/UserContext";

interface NotificationBannerProps {
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
}

export default function NotificationBanner({
  showNotification,
  setShowNotification,
}: NotificationBannerProps) {
  const { places } = usePlacesContext();
  const { activeReport, setActiveReport } = useUserContext();
  const router = useRouter();

  if (!showNotification || places.length === 0) return null;

  // 제보 이력이 있으면 해당 장소, 없으면 기본 첫 번째 장소를 대상으로 알림 발송
  const targetPlace = activeReport
    ? places.find((p) => p.id === activeReport.placeId) || places[0]
    : places[0];

  return (
    <div className="glass-panel animate-slide-up" style={{
      position: "absolute",
      top: "56px",
      left: "14px",
      right: "14px",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--primary)",
      padding: "14px",
      boxShadow: "var(--shadow-lg)",
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      background: "rgba(255, 255, 255, 0.95)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "700", fontSize: "12px" }}>
          <span className="pulse-dot" />
          <span>실시간 정보 유효기간 체크</span>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          style={{ border: "none", background: "none", fontSize: "14px", cursor: "pointer", color: "var(--text-muted)" }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", lineHeight: "1.4" }}>
        아직 <strong>{targetPlace.name}</strong>에 머물고 계신가요?
      </p>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
        {activeReport ? (
          <>작성하신 예상 체류시간(<strong>{activeReport.duration}분</strong>) 만료 5분 전입니다. 상황이 바뀌었다면 제보를 다시 갱신해 주세요!</>
        ) : (
          <>상황이 바뀌었다면 다른 학생들을 위해 혼잡도를 다시 갱신하고 포인트를 적립해 보세요!</>
        )}
      </p>
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={() => {
            // 제보 기입 화면에 필요한 인자(장소 ID, 건물 정보, 기본 혼잡도)를 URL Query String으로 전송
            const defaultLevel = targetPlace.crowdLevel === 0 ? 3 : targetPlace.crowdLevel;
            router.push(`/report/input?placeId=${targetPlace.id}&building=${encodeURIComponent(targetPlace.building)}&crowdLevel=${defaultLevel}`);
            setShowNotification(false);
          }}
          className="btn-primary"
          style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "10px", flex: 1 }}
        >
          지금 다시 제보하기
        </button>
        <button
          onClick={() => {
            // 연장 클릭 시 activeReport 객체의 체류시간을 30분으로 재조정 및 타임스탬프 갱신
            if (activeReport) {
              setActiveReport({
                ...activeReport,
                duration: 30,
                timestamp: Date.now()
              });
            } else {
              // 폴백 알림 상태였을 경우에도 갱신 연계를 위해 가상 제보 데이터 인가
              setActiveReport({
                placeId: targetPlace.id,
                duration: 30,
                timestamp: Date.now()
              });
            }
            setShowNotification(false);
            alert("정보 유효기간이 30분 연장되었습니다!");
          }}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "10px", flex: 1 }}
        >
          아직 잘 이용 중이에요
        </button>
      </div>
    </div>
  );
}
