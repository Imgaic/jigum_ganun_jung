// ==========================================
// Types & Interfaces
// ==========================================
import { VR_IMAGES_MAPPING } from "../constants/vrImages";
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
  imageUrl?: string; // 추가된 이미지 URL 필드
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
      imageUrl: "/images/310/310_daeshinhall_lounge.jpeg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11759/thumbnail.jpg",
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
      imageUrl: "/images/310/310_5f_rest_area.jpeg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11750/thumbnail.jpg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11633/thumbnail.jpg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11612/thumbnail.jpg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11612/thumbnail.jpg",
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
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11747/thumbnail.jpg",
    },
    {
      id: 9,
      building: "303관",
      floor: "2층",
      name: "303관 2층 법학관 라운지",
      detailLocation: "303관(법학관) 2층 중앙계단 옆 구역",
      purposes: ["공부", "휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11742/thumbnail.jpg",
    },
    {
      id: 10,
      building: "102관",
      floor: "3층",
      name: "102관 3층 약대 R&D 라운지",
      detailLocation: "102관(약학대학 및 R&D센터) 3층 통유리 구역",
      purposes: ["공부", "조용한 곳"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11597/thumbnail.jpg",
    },
    {
      id: 11,
      building: "201관",
      floor: "1층",
      name: "201관 1층 본관 로비 라운지",
      detailLocation: "201관(본관) 1층 학사팀 맞은편 휴식테이블",
      purposes: ["휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11609/thumbnail.jpg",
    },
    {
      id: 12,
      building: "310관",
      floor: "4층",
      name: "310관 4층 융합콘텐츠라운지",
      detailLocation: "310관 4층 중앙 에스컬레이터 옆 선큰광장 입구",
      purposes: ["공부", "휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "/images/310/310_4f_lounge_1.jpeg",
    },
    {
      id: 13,
      building: "310관",
      floor: "1층",
      name: "310관 1층 하나 CAU i-Creator 스퀘어",
      detailLocation: "310관 1층 정문 로비 옆 통유리 라운지",
      purposes: ["공부", "휴식"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "/images/310/310_1f_icreator_square.jpeg",
    },
    {
      id: 15,
      building: "310관",
      floor: "지하 4층",
      name: "310관 지하 4층 카우버거",
      detailLocation: "310관 지하 4층 푸드코트 내부",
      purposes: ["식사"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "/images/310/310_b4_cau_burger.jpeg",
    },
    {
      id: 16,
      building: "102관",
      floor: "11층",
      name: "102관 11층 크리에이티브 홀",
      detailLocation: "102관 11층 엘리베이터 앞 라운지",
      purposes: ["공부", "휴식", "대화"],
      crowdLevel: 0,
      updatedAt: 0,
      reportsCount: 0,
      history: [],
      imageUrl: "/images/102/102_11f_creative_lounge.png",
    }
  ];

  return places.map(place => {
    const mapping = VR_IMAGES_MAPPING.find(m => m.id === place.id);
    return {
      ...place,
      imageUrl: mapping ? mapping.imageUrl : place.imageUrl
    };
  });
};

// Emojis for purposes
export const PURPOSE_EMOJIS: { [key: string]: string } = {
  공부: "📚",
  식사: "🍔",
  휴식: "☕",
  대화: "💬",
  "조용한 곳": "🤫",
};

export const BUILDINGS = ["310관", "309관", "중앙도서관", "203관", "303관", "102관", "201관"];
