"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { setGlobalTimeSpeed, getVirtualNow } from "../utils/timeSpeed";

interface UserContextType {
  userPoints: number;
  setUserPoints: React.Dispatch<React.SetStateAction<number>>;
  unlockedUntil: number;
  setUnlockedUntil: React.Dispatch<React.SetStateAction<number>>;
  unlockTimeLeft: number;
  setUnlockTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  showUnlockModal: boolean;
  setShowUnlockModal: React.Dispatch<React.SetStateAction<boolean>>;
  reportedPlaces: number[];
  setReportedPlaces: React.Dispatch<React.SetStateAction<number[]>>;
  activeReport: { placeId: number; duration: number; timestamp: number } | null;
  setActiveReport: React.Dispatch<React.SetStateAction<{ placeId: number; duration: number; timestamp: number } | null>>;
  showReReportNotification: boolean;
  setShowReReportNotification: React.Dispatch<React.SetStateAction<boolean>>;
  timeSpeed: number;
  setTimeSpeed: React.Dispatch<React.SetStateAction<number>>;
  formatTimeLeft: (seconds: number) => string;
  handlePromptUnlock: () => void;
  handleConfirmUnlock: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userPoints, setUserPoints] = useState<number>(120); // 초기 포인트
  const [unlockedUntil, setUnlockedUntil] = useState<number>(0);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState<number>(0);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [reportedPlaces, setReportedPlaces] = useState<number[]>([]);
  const [activeReport, setActiveReport] = useState<{ placeId: number; duration: number; timestamp: number } | null>(null);
  const [showReReportNotification, setShowReReportNotification] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(1); // 기본값: 1배속 (실시간)

  // timeSpeed 변경 시 전역 모듈 값 동기화
  useEffect(() => {
    setGlobalTimeSpeed(timeSpeed);
  }, [timeSpeed]);

  // 가속 연동 잔여시간 갱신 타이머 (가상 시간 반영을 위해 200ms 주기로 갱신하여 가속 연출)
  useEffect(() => {
    if (unlockedUntil <= 0) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((unlockedUntil - getVirtualNow()) / 1000));
      setUnlockTimeLeft(remaining);

      if (remaining === 0) {
        setUnlockedUntil(0);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [unlockedUntil]);

  // 시뮬레이터 연출용: 사용자 제보에 따른 유효기간 알림 타이머 스케줄러 (배속 제어 연동)
  useEffect(() => {
    if (!activeReport) {
      // 제보가 없을 때: 초기 진입 후 15초 경과 시 데모용 더미 알림 발송 (폴백, 배속 반영)
      const timer = setTimeout(() => {
        setShowReReportNotification(true);
      }, 15000 / timeSpeed);
      return () => clearTimeout(timer);
    }

    // 제보가 있을 때: 예상 체류시간(분) 대비 5분 전(실제 밀리초) 대비 배속 적용
    // 공식: ( (duration - 5) * 60 * 1000 ) / timeSpeed ms 후 알림
    const targetMins = activeReport.duration - 5;
    const realDelaySeconds = (targetMins > 0 ? targetMins : 5) * 60;
    const delayMs = (realDelaySeconds * 1000) / timeSpeed;
    
    const timer = setTimeout(() => {
      setShowReReportNotification(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [activeReport, timeSpeed]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handlePromptUnlock = () => {
    setShowUnlockModal(true);
  };

  const handleConfirmUnlock = () => {
    if (userPoints < 10) {
      alert("포인트가 부족합니다! 현장 정보를 제보하여 포인트를 획득하세요. (+10P~+30P)");
      setShowUnlockModal(false);
      return;
    }
    setUserPoints((prev) => prev - 10);
    setUnlockedUntil(getVirtualNow() + 3 * 60 * 1000); // 3분 열람권 부여 (가상 시간 기준)
    setUnlockTimeLeft(180);
    setShowUnlockModal(false);
  };

  return (
    <UserContext.Provider
      value={{
        userPoints,
        setUserPoints,
        unlockedUntil,
        setUnlockedUntil,
        unlockTimeLeft,
        setUnlockTimeLeft,
        showUnlockModal,
        setShowUnlockModal,
        reportedPlaces,
        setReportedPlaces,
        activeReport,
        setActiveReport,
        showReReportNotification,
        setShowReReportNotification,
        timeSpeed,
        setTimeSpeed,
        formatTimeLeft,
        handlePromptUnlock,
        handleConfirmUnlock,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
