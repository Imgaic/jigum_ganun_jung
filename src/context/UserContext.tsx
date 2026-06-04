"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import seedStore from "../data/seedStore.json";
import { isValidNickname, isValidPassword, isValidUsername, normalizeText } from "../lib/api";
import type { RankingEntry, UserDirectoryEntry, UserProfile } from "../lib/types";
import { getVirtualNow, setGlobalTimeSpeed } from "../utils/timeSpeed";

type AuthMode = "login" | "signup";
type AuthStatus = "checking" | "guest" | "authenticated";

interface RuntimeUser {
  id: number;
  username: string;
  password: string;
  nickname: string;
  points: number;
  reportCount: number;
  trustScore: number;
  createdAt: string;
  lastLoginAt: string | null;
}

interface RuntimeReport {
  id: number;
  userId: number;
  placeId: number;
  crowdLevel: number;
  durationMinutes: number;
  createdAt: string;
}

interface RankedUser extends RuntimeUser {
  rank: number;
  score: number;
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
  switchUser: (userId: number) => Promise<ReportSyncResult>;
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

function createInitialUsers(): RuntimeUser[] {
  return seedStore.users.map((user) => ({ ...user }));
}

function createInitialReports(): RuntimeReport[] {
  return seedStore.reports.map((report) => ({ ...report }));
}

function getNextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function getScore(user: Pick<RuntimeUser, "points" | "reportCount" | "trustScore">) {
  return user.points + user.reportCount * 5 + user.trustScore * 2;
}

function getRankedUsers(users: RuntimeUser[]): RankedUser[] {
  return [...users]
    .map((user) => ({
      ...user,
      score: getScore(user),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
      if (b.points !== a.points) return b.points - a.points;
      return a.nickname.localeCompare(b.nickname, "ko");
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
}

function toUserProfile(user: RankedUser): UserProfile {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    points: user.points,
    reportCount: user.reportCount,
    trustScore: user.trustScore,
    rank: user.rank,
    score: user.score,
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("guest");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authNickname, setAuthNickname] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [users, setUsers] = useState<RuntimeUser[]>(createInitialUsers);
  const [, setReports] = useState<RuntimeReport[]>(createInitialReports);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => getVirtualNow());
  const [unlockedUntil, setUnlockedUntil] = useState<number>(0);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState<number>(0);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [reportedPlaces, setReportedPlaces] = useState<number[]>([]);
  const [activeReport, setActiveReport] = useState<{ placeId: number; duration: number; timestamp: number } | null>(null);
  const [showReReportNotification, setShowReReportNotification] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(1);

  const rankedUsers = useMemo(() => getRankedUsers(users), [users]);

  const currentUser = useMemo(() => {
    const user = rankedUsers.find((entry) => entry.id === currentUserId);
    return user ? toUserProfile(user) : null;
  }, [currentUserId, rankedUsers]);

  const rankings = useMemo<RankingEntry[]>(
    () =>
      rankedUsers.slice(0, 10).map((user) => ({
        rank: user.rank,
        nickname: user.nickname,
        points: user.points,
        reportCount: user.reportCount,
        trustScore: user.trustScore,
        score: user.score,
        isCurrentUser: user.id === currentUserId,
      })),
    [currentUserId, rankedUsers]
  );

  const userDirectory = useMemo<UserDirectoryEntry[]>(
    () =>
      rankedUsers.map((user) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        points: user.points,
        reportCount: user.reportCount,
        trustScore: user.trustScore,
        rank: user.rank,
        score: user.score,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isCurrentUser: user.id === currentUserId,
      })),
    [currentUserId, rankedUsers]
  );

  const userPoints = currentUser?.points || 0;

  const setUserPoints = useCallback<React.Dispatch<React.SetStateAction<number>>>(
    (value) => {
      if (!currentUserId) return;

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== currentUserId) return user;

          const nextPoints = typeof value === "function" ? value(user.points) : value;
          return { ...user, points: nextPoints };
        })
      );
    },
    [currentUserId]
  );

  const refreshRankings = useCallback(async () => {
    return;
  }, []);

  const refreshUserDirectory = useCallback(async () => {
    return;
  }, []);

  const touchLastLogin = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, lastLoginAt: new Date().toISOString() } : user
      )
    );
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setIsAuthSubmitting(true);

    const username = normalizeText(authUsername);
    const password = normalizeText(authPassword);
    const nickname = normalizeText(authNickname);

    if (authMode === "login") {
      const user = users.find((entry) => entry.username === username);

      if (!user || user.password !== password) {
        setAuthError("아이디 또는 비밀번호가 올바르지 않습니다.");
        setIsAuthSubmitting(false);
        return;
      }

      touchLastLogin(user.id);
      setCurrentUserId(user.id);
      setAuthStatus("authenticated");
      setAuthPassword("");
      setIsAuthSubmitting(false);
      return;
    }

    if (!isValidUsername(username)) {
      setAuthError("아이디는 영문/숫자/_ 조합 4~20자로 입력해 주세요.");
      setIsAuthSubmitting(false);
      return;
    }

    if (!isValidPassword(password)) {
      setAuthError("비밀번호는 8자 이상이어야 합니다.");
      setIsAuthSubmitting(false);
      return;
    }

    if (!isValidNickname(nickname)) {
      setAuthError("닉네임은 2~16자로 입력해 주세요.");
      setIsAuthSubmitting(false);
      return;
    }

    if (users.some((entry) => entry.username === username)) {
      setAuthError("이미 사용 중인 아이디입니다.");
      setIsAuthSubmitting(false);
      return;
    }

    const createdAt = new Date().toISOString();
    const userId = getNextId(users);
    const newUser: RuntimeUser = {
      id: userId,
      username,
      password,
      nickname,
      points: 0,
      reportCount: 0,
      trustScore: 70,
      createdAt,
      lastLoginAt: createdAt,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(userId);
    setAuthStatus("authenticated");
    setAuthPassword("");
    setAuthNickname("");
    setIsAuthSubmitting(false);
  };

  const handleLogout = async () => {
    setCurrentUserId(null);
    setAuthPassword("");
    setAuthStatus("guest");
  };

  const switchUser = async (userId: number) => {
    if (currentUserId === userId) {
      return { ok: true };
    }

    const user = users.find((entry) => entry.id === userId);

    if (!user) {
      return { ok: false, message: "전환할 유저를 찾을 수 없습니다." };
    }

    touchLastLogin(user.id);
    setCurrentUserId(user.id);
    setAuthStatus("authenticated");
    setAuthError("");
    setAuthPassword("");

    return { ok: true };
  };

  const syncReportWithServer = async (placeId: number, crowdLevel: number, durationMinutes: number, pointsAwarded: number) => {
    if (!currentUserId) {
      setAuthStatus("guest");
      return { ok: false, message: "로그인이 필요합니다." };
    }

    const createdAt = new Date().toISOString();

    setReports((prev) => [
      ...prev,
      {
        id: getNextId(prev),
        userId: currentUserId,
        placeId,
        crowdLevel,
        durationMinutes,
        createdAt,
      },
    ]);

    setUsers((prev) =>
      prev.map((user) =>
        user.id === currentUserId
          ? {
              ...user,
              points: user.points + pointsAwarded,
              reportCount: user.reportCount + 1,
              trustScore: Math.min(100, user.trustScore + 1),
            }
          : user
      )
    );

    return { ok: true };
  };

  useEffect(() => {
    setGlobalTimeSpeed(timeSpeed);
  }, [timeSpeed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(getVirtualNow());
    }, 200);

    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (!activeReport) {
      return;
    }

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
    setUnlockedUntil(getVirtualNow() + 3 * 60 * 1000);
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
        switchUser,
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
