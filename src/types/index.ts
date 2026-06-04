// ==========================================
// Types & Interfaces
// ==========================================
import { VR_IMAGES_MAPPING } from "../constants/vrImages";

export interface PlaceHistory {
  crowdLevel: number;
  time: string;
  timestamp: number; // millisecond timestamp
  reporter?: string; // masked student ID
  reporterTrustScore?: number;
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
  imageUrl?: string; // 추가된 이미지 URL 필드
}

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  places?: Place[]; // recommendations
  time?: string; // "14:30" format of virtual time
}

// ==========================================
// Core Database: CAU Places Mock Data
// ==========================================

// 각 장소별 이용 목적 및 세부 위치를 매핑하는 경량 데이터 객체
// 기본 정보(ID, 건물, 층, 이름, 이미지)는 vr_images_mapping.json 마스터 데이터를 따릅니다.
const PLACE_METADATA: Record<number, { purposes: string[]; detailLocation: string }> = {
  1: { purposes: ["공부", "휴식", "대화"], detailLocation: "310관 3층 엘리베이터 홀 옆 창가 구역" },
  2: { purposes: ["식사"], detailLocation: "310관 지하 4층 중앙 에스컬레이터 옆" },
  3: { purposes: ["휴식", "조용한 곳"], detailLocation: "310관 5층 연구동 방향 구름다리 입구 앞" },
  4: { purposes: ["공부", "조용한 곳"], detailLocation: "중앙도서관 2층 좌측 게이트 안쪽 전체 구역" },
  5: { purposes: ["공부", "휴식", "대화"], detailLocation: "중앙도서관 1층 통합라운지 입구 옆" },
  6: { purposes: ["식사"], detailLocation: "309관(제2공학관) 2층 매점 뒤편 식음료 코너" },
  7: { purposes: ["공부", "대화"], detailLocation: "309관 로비 중앙 원형 테이블 배치 구역" },
  8: { purposes: ["공부", "휴식"], detailLocation: "203관(서라벌홀) 3층 교수연구동 통로 코너" },
  9: { purposes: ["공부", "휴식", "대화"], detailLocation: "303관(법학관) 2층 중앙계단 옆 구역" },
  10: { purposes: ["공부", "조용한 곳"], detailLocation: "102관(약학대학 및 R&D센터) 3층 통유리 구역" },
  11: { purposes: ["휴식", "대화"], detailLocation: "201관(본관) 1층 학사팀 맞은편 휴식테이블" },
  12: { purposes: ["공부", "휴식", "대화"], detailLocation: "310관 4층 중앙 에스컬레이터 옆 선큰광장 입구" },
  13: { purposes: ["공부", "휴식"], detailLocation: "310관 1층 정문 로비 옆 통유리 라운지" },
  14: { purposes: ["공부", "휴식", "대화"], detailLocation: "308관 1층 메인 로비 입구 옆 휴식 공간" },
  15: { purposes: ["식사"], detailLocation: "310관 지하 4층 푸드코트 내부" },
  16: { purposes: ["공부", "휴식", "대화"], detailLocation: "102관 11층 엘리베이터 앞 라운지" }
};

export const INITIAL_PLACES = (): Place[] => {
  return VR_IMAGES_MAPPING.map((m) => {
    const meta = PLACE_METADATA[m.id] || { purposes: ["휴식"], detailLocation: "캠퍼스 내부 구역" };
    return {
      id: m.id,
      building: m.building,
      floor: m.floor,
      name: m.name,
      detailLocation: meta.detailLocation,
      purposes: meta.purposes,
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: m.imageUrl
    };
  });
};

// Emojis for purposes
export const PURPOSE_EMOJIS: { [key: string]: string } = {
  공부: "📚",
  식사: "🍔",
  휴식: "☕",
  대화: "💬",
  "조용한 곳": "🤫"
};

export const BUILDINGS = ["310관", "309관", "중앙도서관", "203관", "303관", "102관", "201관", "308관"];
