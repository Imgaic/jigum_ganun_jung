"use client";

import { useState, useEffect } from "react";

// ==========================================
// 1. Types & Interfaces
// ==========================================
interface PlaceHistory {
  crowdLevel: number;
  time: string;
}

interface Place {
  id: number;
  building: string;
  floor: string;
  name: string;
  detailLocation: string;
  purposes: string[];
  crowdLevel: 1 | 2 | 3 | 4 | 5; // 1: 매우 적음, 2: 적음, 3: 보통, 4: 많음, 5: 매우 많음
  updatedAt: number; // timestamp in ms
  reportsCount: number;
  history: PlaceHistory[];
}

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  places?: Place[]; // recommendations
}

// ==========================================
// 2. Custom Premium Inline SVGs
// ==========================================
const MapPinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ArrowLeftIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const StarIcon = ({ size = 16, fill = "none" }: { size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChatIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const InfoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ==========================================
// 3. Core Database: CAU Places Mock Data
// ==========================================
const INITIAL_PLACES: Place[] = [
  {
    id: 1,
    building: "310관",
    floor: "3층",
    name: "310관 3층 학생라운지",
    detailLocation: "310관 3층 엘리베이터 홀 옆 창가 구역",
    purposes: ["공부", "휴식", "대화"],
    crowdLevel: 3, // 보통
    updatedAt: Date.now() - 3 * 60 * 1000, // 3분 전
    reportsCount: 14,
    history: [
      { crowdLevel: 3, time: "13:40" },
      { crowdLevel: 2, time: "13:10" },
      { crowdLevel: 3, time: "12:30" },
    ],
  },
  {
    id: 2,
    building: "310관",
    floor: "지하 4층",
    name: "310관 지하 참슬기식당",
    detailLocation: "310관 지하 4층 중앙 에스컬레이터 옆",
    purposes: ["식사"],
    crowdLevel: 4, // 많음
    updatedAt: Date.now() - 1 * 60 * 1000, // 1분 전
    reportsCount: 28,
    history: [
      { crowdLevel: 4, time: "13:42" },
      { crowdLevel: 5, time: "13:20" },
      { crowdLevel: 4, time: "12:50" },
    ],
  },
  {
    id: 3,
    building: "310관",
    floor: "5층",
    name: "310관 5층 휴게공간",
    detailLocation: "310관 5층 연구동 방향 구름다리 입구 앞",
    purposes: ["휴식", "조용한 곳"],
    crowdLevel: 1, // 매우 적음
    updatedAt: Date.now() - 7 * 60 * 1000, // 7분 전
    reportsCount: 5,
    history: [
      { crowdLevel: 1, time: "13:36" },
      { crowdLevel: 2, time: "12:40" },
    ],
  },
  {
    id: 4,
    building: "중앙도서관",
    floor: "2층",
    name: "중앙도서관 2층 제1열람실",
    detailLocation: "중앙도서관 2층 좌측 게이트 안쪽 전체 구역",
    purposes: ["공부", "조용한 곳"],
    crowdLevel: 5, // 매우 많음
    updatedAt: Date.now() - 5 * 60 * 1000, // 5분 전
    reportsCount: 32,
    history: [
      { crowdLevel: 5, time: "13:38" },
      { crowdLevel: 5, time: "13:00" },
      { crowdLevel: 4, time: "12:00" },
    ],
  },
  {
    id: 5,
    building: "중앙도서관",
    floor: "1층",
    name: "중앙도서관 1층 북카페 라운지",
    detailLocation: "중앙도서관 1층 통합라운지 입구 옆",
    purposes: ["공부", "휴식", "대화"],
    crowdLevel: 3, // 보통
    updatedAt: Date.now() - 15 * 60 * 1000, // 15분 전
    reportsCount: 19,
    history: [
      { crowdLevel: 3, time: "13:28" },
      { crowdLevel: 3, time: "12:45" },
    ],
  },
  {
    id: 6,
    building: "309관",
    floor: "2층",
    name: "309관 2층 학생식당",
    detailLocation: "309관(제2공학관) 2층 매점 뒤편 식음료 코너",
    purposes: ["식사"],
    crowdLevel: 2, // 적음
    updatedAt: Date.now() - 25 * 60 * 1000, // 25분 전
    reportsCount: 9,
    history: [
      { crowdLevel: 2, time: "13:18" },
      { crowdLevel: 3, time: "12:30" },
    ],
  },
  {
    id: 7,
    building: "309관",
    floor: "1층",
    name: "309관 1층 오픈라운지",
    detailLocation: "309관 로비 중앙 원형 테이블 배치 구역",
    purposes: ["공부", "대화"],
    crowdLevel: 3, // 보통
    updatedAt: Date.now() - 42 * 60 * 1000, // 42분 전 (만료 임박 / 업데이트 필요 유도!)
    reportsCount: 11,
    history: [
      { crowdLevel: 3, time: "13:01" },
      { crowdLevel: 4, time: "12:15" },
    ],
  },
  {
    id: 8,
    building: "203관",
    floor: "3층",
    name: "203관 3층 서라벌 라운지",
    detailLocation: "203관(서라벌홀) 3층 교수연구동 통로 코너",
    purposes: ["공부", "휴식"],
    crowdLevel: 2, // 적음
    updatedAt: Date.now() - 8 * 60 * 1000, // 8분 전
    reportsCount: 6,
    history: [
      { crowdLevel: 2, time: "13:35" },
      { crowdLevel: 1, time: "12:50" },
    ],
  },
];

// Emojis for purposes
const PURPOSE_EMOJIS: { [key: string]: string } = {
  공부: "📚",
  식사: "🍔",
  휴식: "☕",
  대화: "💬",
  "조용한 곳": "🤫",
};

export default function Home() {
  // ==========================================
  // 4. Global State Hook Definitions
  // ==========================================
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "search" | "list" | "detail" | "report_gps" | "report_input" | "report_complete" | "chatbot" | "myinfo"
  >("home");

  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
  const [userPoints, setUserPoints] = useState<number>(120); // Starting points
  const [currentTime, setCurrentTime] = useState<string>("13:43");
  const [myGPSBuilding, setMyGPSBuilding] = useState<string>("310관"); // Simulated GPS building
  const [currentPlaceId, setCurrentPlaceId] = useState<number>(1); // Selected place for detail screen

  // Search Screen States
  const [searchText, setSearchText] = useState<string>("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [excludeCrowded, setExcludeCrowded] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<"distance" | "crowd" | "updated">("distance");

  // Report Flow Temp States
  const [reportedBuilding, setReportedBuilding] = useState<string>("310관");
  const [reportedPlaceId, setReportedPlaceId] = useState<number>(1);
  const [reportedCrowdLevel, setReportedCrowdLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [reportedDuration, setReportedDuration] = useState<number>(30); // minutes

  // Active Notification Banner Simulation
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "안녕하세요! 중앙대학교 실시간 공간 도우미 챗봇입니다. 🤖\n\n'지금 공부하기 좋은 여유로운 라운지 추천해줘' 혹은 '310관 식당 자리 있어?' 같이 원하시는 장소나 상태를 물어보세요!",
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  // ==========================================
  // 5. Simulated Actions & Clock
  // ==========================================
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Trigger a fake notification banner after 10 seconds to showcase the premium active interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Get filtered places list
  const getFilteredPlaces = () => {
    return places.filter((place) => {
      // 1. Text Search (Matches building, floor, name, detailLocation, or purposes)
      if (searchText) {
        const text = searchText.toLowerCase();
        const matchesText =
          place.name.toLowerCase().includes(text) ||
          place.building.toLowerCase().includes(text) ||
          place.detailLocation.toLowerCase().includes(text) ||
          place.purposes.some((p) => p.toLowerCase().includes(text));
        if (!matchesText) return false;
      }

      // 2. Purposes filter
      if (selectedPurposes.length > 0) {
        const matchesPurpose = place.purposes.some((p) => selectedPurposes.includes(p));
        if (!matchesPurpose) return false;
      }

      // 3. Buildings filter
      if (selectedBuildings.length > 0) {
        if (!selectedBuildings.includes(place.building)) return false;
      }

      // 4. Floors filter (e.g. "3층", "1층" 등)
      if (selectedFloors.length > 0) {
        // Handle "4층 이상"
        const isHighFloor = (floorStr: string) => {
          const num = parseInt(floorStr.replace(/[^0-9]/g, ""));
          return !isNaN(num) && num >= 4;
        };

        const matchesFloor = selectedFloors.some((f) => {
          if (f === "4층 이상") {
            return isHighFloor(place.floor) && !place.floor.includes("지하");
          }
          return place.floor === f;
        });
        if (!matchesFloor) return false;
      }

      // 5. Exclude Crowded (exclude crowdLevel 4 and 5)
      if (excludeCrowded) {
        if (place.crowdLevel >= 4) return false;
      }

      return true;
    });
  };

  // Sort places list
  const getSortedPlaces = (placesList: Place[]) => {
    return [...placesList].sort((a, b) => {
      if (sortBy === "distance") {
        // Distance mockup: Simulated GPS building comes first.
        const aIsMyBuilding = a.building === myGPSBuilding ? 1 : 0;
        const bIsMyBuilding = b.building === myGPSBuilding ? 1 : 0;
        if (aIsMyBuilding !== bIsMyBuilding) {
          return bIsMyBuilding - aIsMyBuilding; // My building first
        }
        return a.building.localeCompare(b.building);
      }
      if (sortBy === "crowd") {
        return a.crowdLevel - b.crowdLevel; // Least crowded first
      }
      if (sortBy === "updated") {
        return b.updatedAt - a.updatedAt; // Most recently updated first
      }
      return 0;
    });
  };

  // Quick Action for Purpose buttons on Home Screen
  const handleQuickPurposeSelect = (purpose: string) => {
    setSelectedPurposes([purpose]);
    setSelectedBuildings([]);
    setSelectedFloors([]);
    setExcludeCrowded(false);
    setSearchText("");
    setCurrentScreen("list");
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedPurposes([]);
    setSelectedBuildings([]);
    setSelectedFloors([]);
    setExcludeCrowded(false);
    setSearchText("");
  };

  // Quick GPS Buildings list for the GPS Simulator bar
  const buildings = ["310관", "309관", "중앙도서관", "203관"];

  // Helper: Format relative updated time
  const getRelativeTimeText = (timestamp: number) => {
    const diffMins = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    const diffHrs = Math.floor(diffMins / 60);
    return `${diffHrs}시간 전`;
  };

  // Helper: Crowd Level Text & Color mapping
  const getCrowdLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { label: "매우 한산", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)" };
      case 2:
        return { label: "여유", color: "#34d399", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.3)" };
      case 3:
        return { label: "보통", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" };
      case 4:
        return { label: "붐빔", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" };
      case 5:
        return { label: "매우 혼잡", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)" };
      default:
        return { label: "정보 없음", color: "#6b7280", bg: "rgba(107, 114, 128, 0.12)", border: "rgba(107, 114, 128, 0.3)" };
    }
  };

  // Submit place crowd report
  const handleSubmitReport = () => {
    // Modify target place with reported values
    setPlaces((prevPlaces) =>
      prevPlaces.map((p) => {
        if (p.id === reportedPlaceId) {
          const nowStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
          const newHistory = [{ crowdLevel: reportedCrowdLevel, time: nowStr }, ...p.history.slice(0, 4)];
          return {
            ...p,
            crowdLevel: reportedCrowdLevel,
            updatedAt: Date.now(),
            reportsCount: p.reportsCount + 1,
            history: newHistory,
          };
        }
        return p;
      })
    );

    // Reward points
    setUserPoints((prev) => prev + 10);
    setCurrentScreen("report_complete");
  };

  // Chatbot logic simulation
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newUserMsg: ChatMessage = { id: chatMessages.length + 1, sender: "user", text: userText };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");

    // Simulate thinking and answer based on keywords
    setTimeout(() => {
      let botResponse = "";
      let recommendations: Place[] = [];

      const query = userText.toLowerCase();

      if (query.includes("공부") || query.includes("열람실") || query.includes("집중")) {
        botResponse = "중앙도서관과 310관 주변에서 공부하기 적합한 조용한 장소 목록입니다. 현재 혼잡도가 낮고 쾌적한 5층 휴게공간이나 3층 학생라운지를 적극 추천해 드려요! 📚";
        recommendations = places.filter((p) => p.purposes.includes("공부") && p.crowdLevel <= 3);
      } else if (query.includes("식사") || query.includes("식당") || query.includes("먹을")) {
        botResponse = "교내 식사 가능한 주요 식당 및 카페의 실시간 혼잡도입니다. 310관 지하 참슬기식당은 점심 교대 시간이라 많이 붐비는 상태이며, 309관 2층 학생식당은 현재 한산하여 대기 없이 빠르게 식사하실 수 있습니다! 🍔";
        recommendations = places.filter((p) => p.purposes.includes("식사"));
      } else if (query.includes("휴식") || query.includes("쉬기") || query.includes("조용한")) {
        botResponse = "조용히 휴식하거나 가볍게 휴식을 가질 만한 추천 공간 리스트입니다. 현재 310관 5층 휴게공간이 매우 여유롭습니다! ☕";
        recommendations = places.filter((p) => p.purposes.includes("휴식") || p.purposes.includes("조용한 곳"));
      } else if (query.includes("310관")) {
        botResponse = "현재 가장 많은 제보가 등록되고 있는 '310관 100주년기념관' 내부의 실시간 장소 목록입니다. 엘리베이터 이동 전 원하시는 공간의 혼잡도를 먼저 확인해 보세요! 🏢";
        recommendations = places.filter((p) => p.building === "310관");
      } else {
        botResponse = "죄송해요, 해당 조건에 맞는 장소를 정확히 필터링하지 못했어요. '공부', '식사', '310관' 등 목적이나 특정 건물을 묻는 자연어로 질문해 주시면 실시간 데이터를 반영하여 더 유용한 답변을 드리겠습니다! 🙏";
        recommendations = places.slice(0, 3);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "bot",
          text: botResponse,
          places: recommendations,
        },
      ]);
    }, 800);
  };

  // Selected place object helper
  const selectedPlace = places.find((p) => p.id === currentPlaceId) || places[0];

  // Simulated GPS matches list (places in the simulated building)
  const nearbyPlaces = places.filter((p) => p.building === myGPSBuilding);

  // Match counter for current search filters
  const matchedPlacesCount = getFilteredPlaces().length;

  return (
    <div className="app-wrapper">
      <div className="device-frame">
        {/* Upper Virtual Status Bar */}
        <div className="status-bar-spacer" />
        <div style={{
          display: "flex", 
          justifyContent: "space-between", 
          padding: "6px 24px 0",
          fontSize: "12px",
          fontWeight: "600",
          color: "var(--foreground)",
          opacity: 0.8,
          zIndex: 100
        }}>
          <span>{currentTime}</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span>LTE</span>
            <div style={{
              width: "18px",
              height: "10px",
              border: "1px solid var(--foreground)",
              borderRadius: "3px",
              padding: "1px",
              display: "flex",
              alignItems: "center"
            }}>
              <div style={{ width: "90%", height: "100%", backgroundColor: "var(--foreground)", borderRadius: "1px" }} />
            </div>
          </div>
        </div>

        {/* ==========================================
            ACTIVE PROTOTYPE NOTIFICATION BANNER (Phase 4 Simulation)
            ========================================== */}
        {showNotification && currentScreen !== "report_input" && currentScreen !== "report_complete" && (
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
              아직 <strong>{places[0].name}</strong>에 머물고 계신가요? 
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              상황이 바뀌었다면 다른 학생들을 위해 혼잡도를 다시 갱신하고 포인트를 적립해 보세요!
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button 
                onClick={() => {
                  setReportedPlaceId(places[0].id);
                  setReportedBuilding(places[0].building);
                  setReportedCrowdLevel(places[0].crowdLevel);
                  setCurrentScreen("report_input");
                  setShowNotification(false);
                }}
                className="btn-primary" 
                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "10px", flex: 1 }}
              >
                지금 다시 제보하기
              </button>
              <button 
                onClick={() => {
                  // Simply extend expiration
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
        )}

        {/* Main Phone Screen View */}
        <main className="phone-screen animate-slide-up" style={{ paddingBottom: "76px" }}>
          
          {/* =================================================================================
              SCREEN 1: HOME SCREEN ('home')
              ================================================================================= */}
          {currentScreen === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Home Header */}
              <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px 8px",
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em" }}>
                    실시간 교내 혼잡도 공유
                  </span>
                  <h1 style={{ fontSize: "22px", fontWeight: "900", color: "var(--foreground)", marginTop: "2px" }}>
                    지금 가는 중 🏃‍♂️
                  </h1>
                </div>
                {/* Virtual Point Pill */}
                <div 
                  onClick={() => setCurrentScreen("myinfo")}
                  style={{
                    backgroundColor: "var(--primary-light)",
                    border: "1px solid hsla(var(--primary-hue), 85%, 40%, 0.2)",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    transition: "var(--transition-bounce)"
                  }}
                >
                  <span style={{ fontSize: "14px" }}>🪙</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{userPoints}P</span>
                </div>
              </header>

              {/* Main Search Bar Entry */}
              <div style={{ padding: "0 20px" }}>
                <div 
                  onClick={() => setCurrentScreen("search")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    backgroundColor: "var(--surface)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <SearchIcon size={18} />
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>공부할 곳, 310관, 학식 혼잡도 검색...</span>
                </div>
              </div>

              {/* Quick Purpose Grid Selection */}
              <div style={{ padding: "0 20px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  빠른 목적 탐색
                </span>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  marginTop: "8px"
                }}>
                  {["공부", "식사", "휴식", "조용한 곳"].map((purpose) => (
                    <button
                      key={purpose}
                      onClick={() => handleQuickPurposeSelect(purpose)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        padding: "12px 8px",
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "12px",
                        color: "var(--foreground)",
                        transition: "var(--transition-bounce)",
                        boxShadow: "var(--shadow-sm)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <span style={{ fontSize: "20px" }}>{PURPOSE_EMOJIS[purpose] || "✨"}</span>
                      <span>{purpose}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Virtual GPS Controller Panel */}
              <div style={{ padding: "0 20px" }}>
                <div className="glass-panel" style={{
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  border: "1.5px solid hsla(var(--primary-hue), 85%, 40%, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div className="pulse-dot" />
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary)" }}>모의 GPS 센서 제어</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "500" }}>데모 시연용 위치 이동</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>📍</span>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      현재 위치: <span style={{ color: "var(--primary)" }}>{myGPSBuilding}</span> 주변
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                    {buildings.map((b) => (
                      <button
                        key={b}
                        onClick={() => setMyGPSBuilding(b)}
                        style={{
                          flex: 1,
                          minWidth: "60px",
                          padding: "6px 8px",
                          fontSize: "11px",
                          fontWeight: "700",
                          borderRadius: "8px",
                          border: myGPSBuilding === b ? "1px solid var(--primary)" : "1px solid var(--border)",
                          backgroundColor: myGPSBuilding === b ? "var(--primary-light)" : "var(--surface)",
                          color: myGPSBuilding === b ? "var(--primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          textAlign: "center"
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nearby Places Section */}
              <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "800" }}>
                    📍 내 위치({myGPSBuilding}) 근처 실시간 상황
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>최신 갱신 순</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {nearbyPlaces.length > 0 ? (
                    nearbyPlaces.map((place) => {
                      const crowdInfo = getCrowdLevelInfo(place.crowdLevel);
                      const isExpired = Date.now() - place.updatedAt > 30 * 60 * 1000; // Over 30 minutes expired
                      
                      return (
                        <div 
                          key={place.id}
                          onClick={() => {
                            setCurrentPlaceId(place.id);
                            setCurrentScreen("detail");
                          }}
                          style={{
                            backgroundColor: "var(--surface)",
                            padding: "14px 16px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            cursor: "pointer",
                            boxShadow: "var(--shadow-sm)",
                            transition: "var(--transition-bounce)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--foreground)" }}>{place.name}</h4>
                              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                {place.detailLocation}
                              </p>
                            </div>
                            
                            {/* Crowd Badge */}
                            <span style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "4px 8px",
                              borderRadius: "20px",
                              color: crowdInfo.color,
                              backgroundColor: crowdInfo.bg,
                              border: `1px solid ${crowdInfo.border}`,
                              whiteSpace: "nowrap"
                            }}>
                              {crowdInfo.label}
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "2px" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {place.purposes.map((p) => (
                                <span key={p} style={{
                                  fontSize: "9.5px",
                                  fontWeight: "700",
                                  backgroundColor: "var(--surface-hover)",
                                  color: "var(--text-muted)",
                                  padding: "2.5px 6px",
                                  borderRadius: "6px"
                                }}>
                                  {PURPOSE_EMOJIS[p] || ""} {p}
                                </span>
                              ))}
                            </div>

                            {/* Update Indicator */}
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: "600", color: isExpired ? "var(--accent)" : "var(--text-muted)" }}>
                              <ClockIcon size={12} />
                              <span>
                                {isExpired ? "업데이트 필요 ⚠️" : getRelativeTimeText(place.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "13px" }}>
                      이 건물 부근에 등록된 장소가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Big CTA Report Button */}
              <div style={{ padding: "10px 20px 20px" }}>
                <button 
                  onClick={() => {
                    setReportedBuilding(myGPSBuilding);
                    setCurrentScreen("report_gps");
                  }}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "16px 24px", borderRadius: "var(--radius-md)" }}
                >
                  <MapPinIcon size={18} />
                  <span>지금 내 위치 현장 제보하기 (+10P)</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 2: SEARCH SCREEN ('search')
              ================================================================================= */}
          {currentScreen === "search" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Back Header */}
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("home")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "var(--foreground)"
                  }}
                >
                  <ArrowLeftIcon />
                </button>
                <h2 style={{ fontSize: "18px", fontWeight: "800" }}>원하는 조건 장소 탐색</h2>
              </header>

              {/* Text Search Field */}
              <div style={{ padding: "0 16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: "var(--surface)",
                  border: "1.5px solid var(--primary)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <SearchIcon size={16} />
                  <input 
                    type="text"
                    placeholder="장소명, 목적, 건물명 입력..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      outline: "none"
                    }}
                  />
                  {searchText && (
                    <button 
                      onClick={() => setSearchText("")}
                      style={{ border: "none", background: "none", fontSize: "14px", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Scroll Content */}
              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* 1. Purpose selection */}
                <div>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>방문 목적</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {["공부", "식사", "휴식", "대화", "조용한 곳"].map((purpose) => {
                      const isSelected = selectedPurposes.includes(purpose);
                      return (
                        <button
                          key={purpose}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPurposes(selectedPurposes.filter((p) => p !== purpose));
                            } else {
                              setSelectedPurposes([...selectedPurposes, purpose]);
                            }
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            borderRadius: "20px",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)",
                            border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                            color: isSelected ? "var(--primary)" : "var(--text-muted)"
                          }}
                        >
                          {PURPOSE_EMOJIS[purpose] || ""} {purpose}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Building selection */}
                <div>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>건물 선택</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {buildings.map((b) => {
                      const isSelected = selectedBuildings.includes(b);
                      return (
                        <button
                          key={b}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBuildings(selectedBuildings.filter((item) => item !== b));
                            } else {
                              setSelectedBuildings([...selectedBuildings, b]);
                            }
                          }}
                          style={{
                            padding: "8px 14px",
                            fontSize: "12px",
                            fontWeight: "700",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)",
                            border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                            color: isSelected ? "var(--primary)" : "var(--text-muted)"
                          }}
                        >
                          🏢 {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Floor Selection */}
                <div>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>층수</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {["1층", "2층", "3층", "4층 이상"].map((floor) => {
                      const isSelected = selectedFloors.includes(floor);
                      return (
                        <button
                          key={floor}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFloors(selectedFloors.filter((f) => f !== floor));
                            } else {
                              setSelectedFloors([...selectedFloors, floor]);
                            }
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)",
                            border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                            color: isSelected ? "var(--primary)" : "var(--text-muted)"
                          }}
                        >
                          ↕️ {floor}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Exclude crowded toggle */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--surface-hover)",
                  padding: "14px 16px",
                  borderRadius: "var(--radius-sm)",
                  marginTop: "8px",
                  cursor: "pointer"
                }}
                  onClick={() => setExcludeCrowded(!excludeCrowded)}
                >
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--foreground)" }}>⚠️ 혼잡 장소 제외</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>붐비거나 매우 혼잡한 장소를 리스트에서 가립니다.</p>
                  </div>
                  
                  {/* Styled Checkbox */}
                  <div style={{
                    width: "22px",
                    height: "22px",
                    border: excludeCrowded ? "2px solid var(--primary)" : "2px solid var(--border)",
                    borderRadius: "6px",
                    backgroundColor: excludeCrowded ? "var(--primary)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "var(--transition-smooth)"
                  }}>
                    {excludeCrowded && <span style={{ color: "white", fontSize: "12px", fontWeight: "900" }}>✓</span>}
                  </div>
                </div>

                {/* Helper reset buttons */}
                {(selectedPurposes.length > 0 || selectedBuildings.length > 0 || selectedFloors.length > 0 || excludeCrowded || searchText) && (
                  <button 
                    onClick={handleResetFilters}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--accent)",
                      fontSize: "12px",
                      fontWeight: "700",
                      alignSelf: "flex-end",
                      cursor: "pointer"
                    }}
                  >
                    🔄 필터 초기화
                  </button>
                )}

              </div>

              {/* View Results Button */}
              <div style={{ padding: "10px 16px 20px", marginTop: "auto" }}>
                <button 
                  onClick={() => setCurrentScreen("list")}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "15px 20px" }}
                >
                  조건에 맞는 {matchedPlacesCount}개 장소 보기
                </button>
              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 3: LIST SCREEN ('list') - Phase 2 Core
              ================================================================================= */}
          {currentScreen === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* List Header */}
              <header style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 16px 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button 
                    onClick={() => setCurrentScreen("search")}
                    style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                  >
                    <ArrowLeftIcon />
                  </button>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: "900" }}>장소 리스트</h2>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>조건 매칭 {matchedPlacesCount}건</span>
                  </div>
                </div>

                {/* Sorting Select */}
                <select 
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--surface)",
                    padding: "6px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--foreground)",
                    outline: "none"
                  }}
                >
                  <option value="distance">가까운 순 🏢</option>
                  <option value="crowd">여유로운 순 🍀</option>
                  <option value="updated">최신 정보 순 ⏰</option>
                </select>
              </header>

              {/* Match overview tags bar */}
              <div style={{ display: "flex", gap: "6px", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none" }}>
                {selectedBuildings.map((b) => (
                  <span key={b} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
                    🏢 {b}
                  </span>
                ))}
                {selectedPurposes.map((p) => (
                  <span key={p} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
                    {PURPOSE_EMOJIS[p]} {p}
                  </span>
                ))}
                {selectedFloors.map((f) => (
                  <span key={f} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", whiteSpace: "nowrap" }}>
                    ↕️ {f}
                  </span>
                ))}
                {excludeCrowded && (
                  <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", backgroundColor: "hsl(15, 95%, 95%)", color: "var(--accent)", fontWeight: "700", whiteSpace: "nowrap" }}>
                    ⚠️ 혼잡 제외
                  </span>
                )}
              </div>

              {/* Places List scrollable */}
              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {getSortedPlaces(getFilteredPlaces()).length > 0 ? (
                  getSortedPlaces(getFilteredPlaces()).map((place) => {
                    const crowdInfo = getCrowdLevelInfo(place.crowdLevel);
                    const isExpired = Date.now() - place.updatedAt > 30 * 60 * 1000;
                    
                    return (
                      <div 
                        key={place.id}
                        onClick={() => {
                          setCurrentPlaceId(place.id);
                          setCurrentScreen("detail");
                        }}
                        style={{
                          backgroundColor: "var(--surface)",
                          padding: "14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          cursor: "pointer",
                          boxShadow: "var(--shadow-sm)",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "2.5px 6px", borderRadius: "6px" }}>
                              {place.building} {place.floor}
                            </span>
                            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--foreground)", marginTop: "4px" }}>
                              {place.name}
                            </h4>
                          </div>

                          <span style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "4px 8px",
                            borderRadius: "20px",
                            color: crowdInfo.color,
                            backgroundColor: crowdInfo.bg,
                            border: `1px solid ${crowdInfo.border}`
                          }}>
                            {crowdInfo.label}
                          </span>
                        </div>

                        <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                          {place.detailLocation}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "2.5px" }}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {place.purposes.map((p) => (
                              <span key={p} style={{ fontSize: "9px", fontWeight: "700", backgroundColor: "var(--surface-hover)", color: "var(--text-muted)", padding: "2px 5px", borderRadius: "4px" }}>
                                {PURPOSE_EMOJIS[p] || ""} {p}
                              </span>
                            ))}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: "700", color: isExpired ? "var(--accent)" : "var(--text-muted)" }}>
                            <ClockIcon size={12} />
                            <span>
                              {isExpired ? "업데이트 필요 ⚠️" : getRelativeTimeText(place.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)", fontSize: "13px" }}>
                    일치하는 장소가 없습니다. 필터를 초기화해 보세요! 🔄
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 4: DETAIL SCREEN ('detail') - Phase 2 Core
              ================================================================================= */}
          {currentScreen === "detail" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Back header */}
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("list")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                >
                  <ArrowLeftIcon />
                </button>
                <h2 style={{ fontSize: "16px", fontWeight: "850" }}>공간 상세 정보</h2>
              </header>

              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Main Identity card */}
                <div style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  padding: "18px",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "4px 8px", borderRadius: "8px" }}>
                    🏢 {selectedPlace.building} · {selectedPlace.floor}
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "var(--foreground)", marginTop: "10px" }}>
                    {selectedPlace.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    📍 {selectedPlace.detailLocation}
                  </p>

                  <div style={{ display: "flex", gap: "4px", marginTop: "10px" }}>
                    {selectedPlace.purposes.map((p) => (
                      <span key={p} style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "var(--surface-hover)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "6px" }}>
                        {PURPOSE_EMOJIS[p]} {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Big Live Crowd Card */}
                <div className="glass-panel" style={{
                  borderRadius: "var(--radius-md)",
                  padding: "18px",
                  border: "1.5px solid var(--border)",
                  textAlign: "center",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    실시간 혼잡도 지표
                  </span>
                  
                  <div style={{ margin: "14px 0" }}>
                    <span style={{
                      fontSize: "36px",
                      fontWeight: "950",
                      color: getCrowdLevelInfo(selectedPlace.crowdLevel).color
                    }}>
                      {getCrowdLevelInfo(selectedPlace.crowdLevel).label}
                    </span>
                  </div>

                  {/* Visual gauge simulation */}
                  <div style={{
                    height: "10px",
                    width: "100%",
                    backgroundColor: "var(--background)",
                    borderRadius: "5px",
                    overflow: "hidden",
                    display: "flex",
                    margin: "10px 0"
                  }}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div 
                        key={lvl}
                        style={{
                          flex: 1,
                          backgroundColor: lvl <= selectedPlace.crowdLevel ? getCrowdLevelInfo(selectedPlace.crowdLevel).color : "transparent",
                          opacity: lvl <= selectedPlace.crowdLevel ? 1 - (selectedPlace.crowdLevel - lvl) * 0.15 : 0,
                          borderRight: lvl < 5 ? "2.5px solid var(--surface)" : "none"
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", marginTop: "6px" }}>
                    <span>최근 업데이트: {getRelativeTimeText(selectedPlace.updatedAt)}</span>
                    <span>제보 데이터 신뢰도: <strong style={{ color: "var(--primary)" }}>{selectedPlace.reportsCount > 10 ? "높음 🔥" : "보통"}</strong></span>
                  </div>
                </div>

                {/* Recent Reports Timeline */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "8px" }}>
                    ⏰ 최근 제보 타임라인
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedPlace.history.map((hist, idx) => (
                      <div key={idx} style={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>제보 혼잡도:</span>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: getCrowdLevelInfo(hist.crowdLevel).color }}>
                            {getCrowdLevelInfo(hist.crowdLevel).label}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{hist.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instant CTA to report this place */}
                <button 
                  onClick={() => {
                    setReportedPlaceId(selectedPlace.id);
                    setReportedBuilding(selectedPlace.building);
                    setReportedCrowdLevel(selectedPlace.crowdLevel);
                    setCurrentScreen("report_gps");
                  }}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "14px 20px", marginTop: "8px" }}
                >
                  ✍️ 이 장소 혼잡도 제보하기 (+10P)
                </button>

              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 5: LOCATION CONFIRM GPS SCREEN ('report_gps') - Phase 3 Core
              ================================================================================= */}
          {currentScreen === "report_gps" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("home")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                >
                  <ArrowLeftIcon />
                </button>
                <h2 style={{ fontSize: "16px", fontWeight: "850" }}>GPS 위치 확인</h2>
              </header>

              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* Simulated Radar Box */}
                <div className="glass-panel" style={{
                  borderRadius: "var(--radius-md)",
                  padding: "30px 20px",
                  border: "1.5px solid var(--primary)",
                  textAlign: "center",
                  boxShadow: "var(--shadow-md)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    position: "relative",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>
                    📡
                    <span className="pulse-dot" style={{ position: "absolute", width: "100%", height: "100%" }} />
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--foreground)" }}>
                      현재 감지된 건물: {reportedBuilding}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      기기 GPS 위성 신호가 안전하게 확보되었습니다.
                    </p>
                  </div>
                </div>

                {/* Building Confirmation Box */}
                <div style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--foreground)" }}>
                    제보하시려는 건물이 맞나요?
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                    {buildings.map((b) => (
                      <button
                        key={b}
                        onClick={() => setReportedBuilding(b)}
                        style={{
                          padding: "10px",
                          fontSize: "12px",
                          fontWeight: "800",
                          borderRadius: "10px",
                          border: reportedBuilding === b ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                          backgroundColor: reportedBuilding === b ? "var(--primary-light)" : "var(--surface)",
                          color: reportedBuilding === b ? "var(--primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        🏢 {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Action */}
                <button 
                  onClick={() => {
                    // Match a place in this building for input screen pre-fill
                    const firstPlaceInBuilding = places.find((p) => p.building === reportedBuilding) || places[0];
                    setReportedPlaceId(firstPlaceInBuilding.id);
                    setCurrentScreen("report_input");
                  }}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "14px 20px", marginTop: "10px" }}
                >
                  제보 내용 작성 단계로 이동 ➡️
                </button>

              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 6: REPORT INPUT FIELD SCREEN ('report_input') - Phase 3 Core
              ================================================================================= */}
          {currentScreen === "report_input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("report_gps")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                >
                  <ArrowLeftIcon />
                </button>
                <h2 style={{ fontSize: "16px", fontWeight: "850" }}>현장 상태 작성</h2>
              </header>

              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Building Indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--surface-hover)", padding: "10px 14px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>건물</span>
                  <span style={{ fontSize: "13px", fontWeight: "850", color: "var(--primary)" }}>🏢 {reportedBuilding}</span>
                </div>

                {/* Detailed Place Selection */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>상세 장소 선택</span>
                  <select 
                    value={reportedPlaceId}
                    onChange={(e) => setReportedPlaceId(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      backgroundColor: "var(--surface)",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      fontWeight: "700",
                      outline: "none"
                    }}
                  >
                    {places.filter((p) => p.building === reportedBuilding).map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.floor})</option>
                    ))}
                  </select>
                </div>

                {/* 5-Level Crowd Selection buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>현재 혼잡도는 어떤가요?</span>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {([1, 2, 3, 4, 5] as const).map((level) => {
                      const lvlInfo = getCrowdLevelInfo(level);
                      const isSelected = reportedCrowdLevel === level;
                      
                      return (
                        <button
                          key={level}
                          onClick={() => setReportedCrowdLevel(level)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: isSelected ? `2.5px solid ${lvlInfo.color}` : "1px solid var(--border)",
                            backgroundColor: isSelected ? lvlInfo.bg : "var(--surface)",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <span style={{ fontSize: "13px", fontWeight: "800", color: isSelected ? lvlInfo.color : "var(--foreground)" }}>
                            {level}단계 - {lvlInfo.label}
                          </span>

                          <span style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: isSelected ? `5px solid ${lvlInfo.color}` : "2px solid var(--border)",
                            backgroundColor: "var(--surface)",
                            transition: "var(--transition-smooth)"
                          }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stay Duration Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-muted)" }}>예상 추가 체류시간</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[15, 30, 60, 120].map((mins) => {
                      const label = mins >= 60 ? `${mins / 60}시간` : `${mins}분`;
                      const isSelected = reportedDuration === mins;
                      
                      return (
                        <button
                          key={mins}
                          onClick={() => setReportedDuration(mins)}
                          style={{
                            flex: 1,
                            padding: "10px 6px",
                            fontSize: "12px",
                            fontWeight: "800",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)",
                            border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                            color: isSelected ? "var(--primary)" : "var(--text-muted)"
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Submit CTA */}
                <button 
                  onClick={handleSubmitReport}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "15px 20px", marginTop: "10px" }}
                >
                  제보 정보 등록하기 🚀
                </button>

              </div>
            </div>
          )}

          {/* =================================================================================
              SCREEN 7: COMPLETE SCREEN ('report_complete') - Phase 3 Core
              ================================================================================= */}
          {currentScreen === "report_complete" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "30px 16px", textAlign: "center" }}>
              
              {/* Confetti simulation card */}
              <div className="glass-panel" style={{
                borderRadius: "var(--radius-lg)",
                padding: "36px 20px",
                border: "1.5px solid var(--primary)",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)"
                }}>
                  🎉
                </div>

                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "950", color: "var(--foreground)" }}>
                    제보 등록 완료!
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    작성해주신 정보가 즉각적으로 동기화되었습니다.
                  </p>
                </div>

                {/* Animated points earned pill */}
                <div style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--primary-light)",
                  border: "1px dashed var(--primary)",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  animation: "pulseGlow 2s infinite"
                }}>
                  <span>🪙</span>
                  <span>+10 포인트 적립되었습니다!</span>
                </div>
              </div>

              {/* Summary details card */}
              <div style={{
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "16px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)" }}>제보 내역 요약</span>
                <h3 style={{ fontSize: "14px", fontWeight: "900" }}>{places.find((p) => p.id === reportedPlaceId)?.name}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>반영된 혼잡도:</span>
                  <span style={{ fontWeight: "800", color: getCrowdLevelInfo(reportedCrowdLevel).color }}>{getCrowdLevelInfo(reportedCrowdLevel).label}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>예상 체류시간:</span>
                  <span style={{ fontWeight: "800" }}>{reportedDuration}분</span>
                </div>
              </div>

              {/* Navigation Back CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <button 
                  onClick={() => {
                    // Preselect reported building for filtered viewing
                    setSelectedBuildings([reportedBuilding]);
                    setSelectedPurposes([]);
                    setSelectedFloors([]);
                    setExcludeCrowded(false);
                    setSearchText("");
                    setCurrentScreen("list");
                  }}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "14px" }}
                >
                  주변 다른 장소 현황 보기
                </button>
                <button 
                  onClick={() => setCurrentScreen("home")}
                  className="btn-secondary" 
                  style={{ width: "100%", padding: "14px" }}
                >
                  홈 화면으로 복귀
                </button>
              </div>

            </div>
          )}

          {/* =================================================================================
              SCREEN 8: CHATBOT QUESTIONS SCREEN ('chatbot') - Phase 4 Core
              ================================================================================= */}
          {currentScreen === "chatbot" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("home")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                >
                  <ArrowLeftIcon />
                </button>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: "900" }}>AI 장소 추천 챗봇</h2>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>실시간 혼잡도 분석 매핑</span>
                </div>
              </header>

              {/* Quick Prompt Recommendation Chips */}
              <div style={{ display: "flex", gap: "6px", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
                {[
                  "📖 조용한 공부 장소",
                  "🍔 한산한 학식 정보",
                  "☕ 310관 여유로운 공간",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      const text = chip.substring(2); // Strip emoji
                      setChatInput(`지금 ${text} 추천해줘`);
                    }}
                    style={{
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--surface)",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      cursor: "pointer"
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Thread Messages */}
              <div style={{
                flex: 1,
                padding: "10px 16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}>
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    {/* Message Bubble */}
                    <div style={{
                      backgroundColor: msg.sender === "user" ? "var(--primary)" : "var(--surface)",
                      color: msg.sender === "user" ? "white" : "var(--foreground)",
                      padding: "12px 14px",
                      borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      lineHeight: "1.5",
                      border: msg.sender === "user" ? "none" : "1px solid var(--border)",
                      boxShadow: "var(--shadow-sm)",
                      whiteSpace: "pre-line"
                    }}>
                      {msg.text}
                    </div>

                    {/* Optional interactive cards embeds within bot message */}
                    {msg.places && msg.places.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginTop: "6px"
                      }}>
                        {msg.places.map((place) => {
                          const crowdInfo = getCrowdLevelInfo(place.crowdLevel);
                          return (
                            <div 
                              key={place.id}
                              onClick={() => {
                                setCurrentPlaceId(place.id);
                                setCurrentScreen("detail");
                              }}
                              style={{
                                backgroundColor: "var(--surface)",
                                border: "1px dashed var(--primary)",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                boxShadow: "var(--shadow-sm)"
                              }}
                            >
                              <div>
                                <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--primary)" }}>
                                  🏢 {place.building}
                                </span>
                                <h4 style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--foreground)" }}>
                                  {place.name}
                                </h4>
                              </div>
                              <span style={{
                                fontSize: "10px",
                                fontWeight: "800",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                color: crowdInfo.color,
                                backgroundColor: crowdInfo.bg,
                                border: `1px solid ${crowdInfo.border}`
                              }}>
                                {crowdInfo.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Send Input Box */}
              <div style={{
                padding: "10px 14px 16px",
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0
              }}>
                <input 
                  type="text"
                  placeholder="챗봇에게 공간에 대해 직접 물어보세요..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    outline: "none"
                  }}
                />
                <button 
                  onClick={handleSendChatMessage}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <SendIcon size={14} />
                </button>
              </div>

            </div>
          )}

          {/* =================================================================================
              SCREEN 9: MY INFO & POINTS SCREEN ('myinfo') - Phase 4 Core
              ================================================================================= */}
          {currentScreen === "myinfo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <header style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 16px 0",
              }}>
                <button 
                  onClick={() => setCurrentScreen("home")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
                >
                  <ArrowLeftIcon />
                </button>
                <h2 style={{ fontSize: "16px", fontWeight: "850" }}>내 정보 및 포인트</h2>
              </header>

              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* Big point panel */}
                <div className="glass-panel" style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "24px 20px",
                  border: "1.5px solid var(--primary)",
                  textAlign: "center",
                  boxShadow: "var(--shadow-md)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)" }}>보유 적립 포인트</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "10px 0" }}>
                    <span style={{ fontSize: "32px" }}>🪙</span>
                    <span style={{ fontSize: "36px", fontWeight: "950", color: "var(--primary)" }}>{userPoints} P</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    포인트는 실시간 교내 제보에 참여하면 매회 10P씩 지급됩니다!
                  </p>
                </div>

                {/* Gamified Rank Badge */}
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
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "white", backgroundColor: "var(--foreground)", padding: "3px 8px", borderRadius: "12px" }}>
                    LV. 3
                  </span>
                </div>

                {/* Point exchange guide mockup */}
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
          )}

        </main>

        {/* =================================================================================
            ELEGANT FLOATING BOTTOM TAB BAR
            ================================================================================= */}
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
          {/* Home Tab */}
          <button 
            onClick={() => setCurrentScreen("home")}
            style={{
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: currentScreen === "home" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: currentScreen === "home" ? "800" : "500",
              fontSize: "10px"
            }}
          >
            <span style={{ fontSize: "20px" }}>🏠</span>
            <span>홈</span>
          </button>
          
          {/* Search Tab */}
          <button 
            onClick={() => {
              handleResetFilters();
              setCurrentScreen("search");
            }}
            style={{
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: currentScreen === "search" || currentScreen === "list" || currentScreen === "detail" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: currentScreen === "search" || currentScreen === "list" || currentScreen === "detail" ? "800" : "500",
              fontSize: "10px"
            }}
          >
            <span style={{ fontSize: "20px" }}>🔍</span>
            <span>장소 검색</span>
          </button>

          {/* Direct Report Tab */}
          <button 
            onClick={() => {
              setReportedBuilding(myGPSBuilding);
              setCurrentScreen("report_gps");
            }}
            style={{
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: currentScreen === "report_gps" || currentScreen === "report_input" || currentScreen === "report_complete" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: currentScreen === "report_gps" || currentScreen === "report_input" || currentScreen === "report_complete" ? "800" : "500",
              fontSize: "10px"
            }}
          >
            <span style={{ fontSize: "20px" }}>✍️</span>
            <span>제보하기</span>
          </button>

          {/* AI Chatbot Tab */}
          <button 
            onClick={() => setCurrentScreen("chatbot")}
            style={{
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: currentScreen === "chatbot" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: currentScreen === "chatbot" ? "800" : "500",
              fontSize: "10px"
            }}
          >
            <span style={{ fontSize: "20px" }}>💬</span>
            <span>AI 추천 챗봇</span>
          </button>

          {/* My Info Tab */}
          <button 
            onClick={() => setCurrentScreen("myinfo")}
            style={{
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: currentScreen === "myinfo" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: currentScreen === "myinfo" ? "800" : "500",
              fontSize: "10px"
            }}
          >
            <span style={{ fontSize: "20px" }}>👤</span>
            <span>내 정보</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
