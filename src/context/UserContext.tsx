"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { RankingEntry, UserDirectoryEntry, UserProfile } from "../lib/types";

type AuthMode = "login" | "signup";
type AuthStatus = "checking" | "guest" | "authenticated";

interface AuthApiResponse {
  user?: UserProfile | null;
  message?: string;
}

interface RankingsApiResponse {
  rankings?: RankingEntry[];
}

interface UsersApiResponse {
  users?: UserDirectoryEntry[];
}

interface ReportSyncResult {
  ok: boolean;
  message?: string;
}

interface UserContextType {
  authStatus: AuthStatus;
  authMode: AuthMode;
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  authUsername: string;
  setAuthUsername: React.Dispatch<React.SetStateAction<string>>;
  authPassword: string;
  setAuthPassword: React.Dispatch<React.SetStateAction<string>>;
  authNickname: string;
  setAuthNickname: React.Dispatch<React.SetStateAction<string>>;
  authError: string;
  isAuthSubmitting: boolean;
  currentUser: UserProfile | null;
  rankings: RankingEntry[];
  userDirectory: UserDirectoryEntry[];
  nowMs: number;
  handleAuthSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleLogout: () => Promise<void>;
  refreshRankings: () => Promise<void>;
  refreshUserDirectory: () => Promise<void>;
  syncReportWithServer: (placeId: number, crowdLevel: number, durationMinutes: number, pointsAwarded: number) => Promise<ReportSyncResult>;
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authNickname, setAuthNickname] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [userDirectory, setUserDirectory] = useState<UserDirectoryEntry[]>([]);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [userPoints, setUserPoints] = useState<number>(0);
  const [unlockedUntil, setUnlockedUntil] = useState<number>(0);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState<number>(0);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [reportedPlaces, setReportedPlaces] = useState<number[]>([]);
  const [activeReport, setActiveReport] = useState<{ placeId: number; duration: number; timestamp: number } | null>(null);
  const [showReReportNotification, setShowReReportNotification] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(1); // 기본값: 1배속 (실시간)

  const applyUserSession = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    setUserPoints(user.points);
    setAuthStatus("authenticated");
  }, []);

  const refreshRankings = useCallback(async () => {
    const response = await fetch("/api/rankings", { cache: "no-store" });
    if (!response.ok) return;

    const data = (await response.json()) as RankingsApiResponse;
    setRankings(data.rankings || []);
  }, []);

  const refreshUserDirectory = useCallback(async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    if (!response.ok) return;

    const data = (await response.json()) as UsersApiResponse;
    setUserDirectory(data.users || []);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as AuthApiResponse;

        if (!response.ok || !data.user) {
          setAuthStatus("guest");
          return;
        }

        applyUserSession(data.user);
        await Promise.all([refreshRankings(), refreshUserDirectory()]);
      } catch {
        setAuthStatus("guest");
      }
    };

    loadSession();
  }, [applyUserSession, refreshRankings, refreshUserDirectory]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setIsAuthSubmitting(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
          nickname: authNickname,
        }),
      });
      const data = (await response.json()) as AuthApiResponse;

      if (!response.ok || !data.user) {
        setAuthError(data.message || "로그인 처리 중 문제가 발생했습니다.");
        return;
      }

      applyUserSession(data.user);
      await Promise.all([refreshRankings(), refreshUserDirectory()]);
    } catch {
      setAuthError("서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setRankings([]);
    setUserDirectory([]);
    setUserPoints(0);
    setAuthPassword("");
    setAuthStatus("guest");
  };

  const syncReportWithServer = async (placeId: number, crowdLevel: number, durationMinutes: number, pointsAwarded: number) => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, crowdLevel, durationMinutes, pointsAwarded }),
      });
      const data = (await response.json()) as AuthApiResponse & RankingsApiResponse & UsersApiResponse;

      if (!response.ok) {
        if (response.status === 401) {
          setCurrentUser(null);
          setAuthStatus("guest");
        }
        return { ok: false, message: data.message || "제보 등록 중 문제가 발생했습니다." };
      }

      if (data.user) {
        applyUserSession(data.user);
      }
      if (data.rankings) {
        setRankings(data.rankings);
      }
      if (data.users) {
        setUserDirectory(data.users);
      }

      return { ok: true };
    } catch {
      return { ok: false, message: "서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요." };
    }
  };

  // 1초 간격 정보 열람 Pass 잔여시간 갱신 타이머
  useEffect(() => {
    if (unlockedUntil <= 0) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((unlockedUntil - Date.now()) / 1000));
      setUnlockTimeLeft(remaining);

      if (remaining === 0) {
        setUnlockedUntil(0);
      }
    }, 1000);

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
    setUnlockedUntil(Date.now() + 3 * 60 * 1000); // 3분 열람권 부여
    setUnlockTimeLeft(180);
    setShowUnlockModal(false);
  };

  return (
    <UserContext.Provider
      value={{
        authStatus,
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
        currentUser,
        rankings,
        userDirectory,
        nowMs,
        handleAuthSubmit,
        handleLogout,
        refreshRankings,
        refreshUserDirectory,
        syncReportWithServer,
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
