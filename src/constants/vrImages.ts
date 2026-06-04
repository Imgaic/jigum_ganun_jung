export interface VRPlaceImage {
  id: number;
  building: string;
  floor: string;
  name: string;
  sceneId: string;
  sceneName: string;
  imageUrl: string;
  isPlaceholder: boolean;
  placeholderReason?: string;
}

export const VR_IMAGES_MAPPING: VRPlaceImage[] = [
  {
    id: 1,
    building: "310관",
    floor: "3층",
    name: "310관 3층 학생라운지",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (3층 대신홀 앞 라운지)",
    imageUrl: "/images/310/310_daeshinhall_lounge.jpeg",
    isPlaceholder: false
  },
  {
    id: 2,
    building: "310관",
    floor: "지하 4층",
    name: "310관 지하 참슬기식당",
    sceneId: "pano11759",
    sceneName: "309관 학생식당 (대체)",
    imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11759/thumbnail.jpg",
    isPlaceholder: true,
    placeholderReason: "VR 투어 내에 B4 참슬기식당 실내 씬이 없어 309관 식당 전경으로 대체"
  },
  {
    id: 3,
    building: "310관",
    floor: "5층",
    name: "310관 5층 휴게공간",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (5층 야외 휴게공간)",
    imageUrl: "/images/310/310_5f_rest_area.jpeg",
    isPlaceholder: false
  },
  {
    id: 4,
    building: "중앙도서관",
    floor: "2층",
    name: "중앙도서관 2층 제1열람실",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (중앙도서관 2층 제1열람실)",
    imageUrl: "/images/204/204_reading_room_1.jpg",
    isPlaceholder: false
  },
  {
    id: 5,
    building: "중앙도서관",
    floor: "1층",
    name: "중앙도서관 1층 북카페 라운지",
    sceneId: "pano11633",
    sceneName: "208관 제2공학관 (대용)",
    imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11633/thumbnail.jpg",
    isPlaceholder: true,
    placeholderReason: "기존 소스코드의 임시 매핑 유지"
  },
  {
    id: 6,
    building: "309관",
    floor: "2층",
    name: "309관 2층 학생식당",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (309관 블루미르식당)",
    imageUrl: "/images/309/309_cafeteria.png",
    isPlaceholder: false
  },
  {
    id: 7,
    building: "309관",
    floor: "1층",
    name: "309관 1층 오픈라운지",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (308관 1층 로비라운지 대용)",
    imageUrl: "/images/308/308_1f_lobby_lounge.png",
    isPlaceholder: false
  },
  {
    id: 8,
    building: "203관",
    floor: "3층",
    name: "203관 3층 서라벌 라운지",
    sceneId: "pano11747",
    sceneName: "305관 교수연구동 및 체육관 (대용)",
    imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11747/thumbnail.jpg",
    isPlaceholder: true,
    placeholderReason: "서라벌홀 내부 라운지 씬이 없어 305관 외경으로 매핑된 기존 데이터 유지"
  },
  {
    id: 9,
    building: "303관",
    floor: "2층",
    name: "303관 2층 법학관 라운지",
    sceneId: "pano11742",
    sceneName: "303관 법학관 외경",
    imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11742/thumbnail.jpg",
    isPlaceholder: true,
    placeholderReason: "법학관 2층 전용 라운지 씬이 없어 법학관 외경으로 매핑된 기존 데이터 유지"
  },
  {
    id: 10,
    building: "102관",
    floor: "11층",
    name: "102관 11층 크리에이티브 라운지",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (102관 11층 크리에이티브 라운지)",
    imageUrl: "/images/102/102_11f_creative_lounge.png",
    isPlaceholder: false
  },
  {
    id: 11,
    building: "201관",
    floor: "1층",
    name: "201관 1층 본관 로비 라운지",
    sceneId: "pano11609",
    sceneName: "105관 제1의학관 (대용)",
    imageUrl: "https://www.cau.ac.kr/vr2020/seoul/indexdata/pano_11609/thumbnail.jpg",
    isPlaceholder: true,
    placeholderReason: "기존 소스코드의 임시 매핑 유지"
  },
  {
    id: 12,
    building: "310관",
    floor: "4층",
    name: "310관 4층 융합콘텐츠라운지",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (4층 융합콘텐츠라운지)",
    imageUrl: "/images/310/310_4f_lounge_1.jpeg",
    isPlaceholder: false
  },
  {
    id: 13,
    building: "310관",
    floor: "1층",
    name: "310관 1층 하나 CAU i-Creator 스퀘어",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (1층 하나 i-Creator 스퀘어)",
    imageUrl: "/images/310/310_1f_icreator_square.jpeg",
    isPlaceholder: false
  },
  {
    id: 14,
    building: "308관",
    floor: "1층",
    name: "308관 1층 로비라운지",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (308관 1층 로비라운지)",
    imageUrl: "/images/308/308_1f_lobby_lounge.png",
    isPlaceholder: false
  },
  {
    id: 15,
    building: "310관",
    floor: "지하 4층",
    name: "310관 지하 4층 카우버거",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (310관 B4 카우버거)",
    imageUrl: "/images/310/310_b4_cau_burger.jpeg",
    isPlaceholder: false
  },
  {
    id: 16,
    building: "102관",
    floor: "11층",
    name: "102관 11층 크리에이티브 홀",
    sceneId: "N/A",
    sceneName: "실제 현장 사진 (102관 11층 크리에이티브 홀)",
    imageUrl: "/images/102/102_11f_creative_lounge.png",
    isPlaceholder: false
  }
];
