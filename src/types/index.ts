// ==========================================
// Types & Interfaces
// ==========================================
export interface PlaceHistory {
  crowdLevel: number;
  time: string;
  timestamp: number; // millisecond timestamp
  reporter?: string; // masked student ID
}

export interface Place {
  id: number;
  building: string;
  floor: string;
  name: string;
  detailLocation: string;
  purposes: string[];
  crowdLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0: 알 수 없음, 1: 매우 적음, 2: 적음, 3: 보통, 4: 많음, 5: 매우 많음
  updatedAt: number; // timestamp in ms
  reportsCount: number;
  history: PlaceHistory[];
}

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  places?: Place[]; // recommendations
}

// ==========================================
// Core Database: CAU Places Mock Data
// ==========================================
export const INITIAL_PLACES = (): Place[] => {
  return [
    {
      id: 1,
      building: "310관",
      floor: "3층",
      name: "310관 3층 학생라운지",
      detailLocation: "310관 3층 엘리베이터 홀 옆 창가 구역",
      purposes: ["공부", "휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 2,
      building: "310관",
      floor: "지하 4층",
      name: "310관 지하 참슬기식당",
      detailLocation: "310관 지하 4층 중앙 에스컬레이터 옆",
      purposes: ["식사"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 3,
      building: "310관",
      floor: "5층",
      name: "310관 5층 휴게공간",
      detailLocation: "310관 5층 연구동 방향 구름다리 입구 앞",
      purposes: ["휴식", "조용한 곳"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 4,
      building: "중앙도서관",
      floor: "2층",
      name: "중앙도서관 2층 제1열람실",
      detailLocation: "중앙도서관 2층 좌측 게이트 안쪽 전체 구역",
      purposes: ["공부", "조용한 곳"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 5,
      building: "중앙도서관",
      floor: "1층",
      name: "중앙도서관 1층 북카페 라운지",
      detailLocation: "중앙도서관 1층 통합라운지 입구 옆",
      purposes: ["공부", "휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 6,
      building: "309관",
      floor: "2층",
      name: "309관 2층 학생식당",
      detailLocation: "309관(제2공학관) 2층 매점 뒤편 식음료 코너",
      purposes: ["식사"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 7,
      building: "309관",
      floor: "1층",
      name: "309관 1층 오픈라운지",
      detailLocation: "309관 로비 중앙 원형 테이블 배치 구역",
      purposes: ["공부", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
    {
      id: 8,
      building: "203관",
      floor: "3층",
      name: "203관 3층 서라벌 라운지",
      detailLocation: "203관(서라벌홀) 3층 교수연구동 통로 코너",
      purposes: ["공부", "휴식"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
    },
  ];
};

// Emojis for purposes
export const PURPOSE_EMOJIS: { [key: string]: string } = {
  공부: "📚",
  식사: "🍔",
  휴식: "☕",
  대화: "💬",
  "조용한 곳": "🤫",
};

export const BUILDINGS = ["310관", "309관", "중앙도서관", "203관"];
