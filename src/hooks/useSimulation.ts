import { useState, useEffect, useRef } from "react";
import type { SetStateAction } from "react";
import { Place } from "../types";
import { getCrowdLevelInfo } from "../utils/crowdAnalyzer";
import { getVirtualNow, formatVirtualTime, formatVirtualTimeWithSec } from "../utils/timeSpeed";
import seedData from "../data/seedStore.json";
import { useUserContext } from "../context/UserContext";

/**
 * 백그라운드 가상 학생 제보 시뮬레이션 엔진을 관리하는 커스텀 훅입니다.
 * @param places 현재 장소 데이터 목록
 * @param setPlaces 장소 데이터를 업데이트하는 React Dispatch 함수
 * @param targetCount 자동 생성할 제보 수 제한값
 */
export function useSimulation(
  places: Place[],
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
  targetCount: number,
  simBias: string = "random"
) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [generatedCount, setGeneratedCount] = useState<number>(0);
  const { syncVirtualReportWithUser } = useUserContext();

  // 최신 places 상태를 렌더러 리셋 없이 안전하게 참조하기 위한 Ref
  const placesRef = useRef(places);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  // 비동기 타이머 콜백 안에서 최신 시뮬레이션 상태를 참조하여 좀비 루프를 방지하기 위한 Ref
  const isSimulatingRef = useRef(isSimulating);
  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  // 가중치 상태 실시간 반영 가드 Ref
  const simBiasRef = useRef(simBias);
  useEffect(() => {
    simBiasRef.current = simBias;
  }, [simBias]);

  const startSimulation = (value: SetStateAction<boolean>) => {
    const nextValue = typeof value === "function" ? value(isSimulating) : value;
    if (nextValue) {
      setGeneratedCount(0);
    }
    setIsSimulating(nextValue);
  };

  // 백그라운드 제보 생성 타이머 루프
  useEffect(() => {
    if (!isSimulating || placesRef.current.length === 0) return;

    let activeTimer: NodeJS.Timeout;
    let currentGenerated = 0;

    const triggerSimulationReport = () => {
      // 좀비 타이머 방어 가드: 비동기 실행 시점에 시뮬레이션 스위치가 꺼져있다면 즉시 루프 탈출
      if (!isSimulatingRef.current) return;

      const currentPlaces = placesRef.current;

      // 1. 임의의 장소 선택
      const randomIdx = Math.floor(Math.random() * currentPlaces.length);
      const targetPlace = currentPlaces[randomIdx];

      // 2. 가중치 설정에 따른 혼잡도 선택
      const randomCrowd = getBiasedCrowd(simBiasRef.current);

      // 3. seedStore의 랜덤 유저 선택
      const users = seedData.users;
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const fakeReporter = randomUser.nickname;
      const trustScore = randomUser.trustScore;

      const vNow = getVirtualNow();
      const nowStr = formatVirtualTime(vNow);

      // 4. 장소 상태에 새 제보 추가 및 updatedAt 시간 갱신
      setPlaces((prev) =>
        prev.map((p) => {
          if (p.id === targetPlace.id) {
            return {
              ...p,
              updatedAt: vNow,
              reportsCount: p.reportsCount + 1,
              history: [
                {
                  crowdLevel: randomCrowd,
                  time: nowStr,
                  timestamp: vNow,
                  reporter: fakeReporter,
                  reporterTrustScore: trustScore,
                },
                ...p.history,
              ],
            };
          }
          return p;
        })
      );

      // 가상 유저의 실시간 포인트 및 제보 횟수 연동 갱신 (제보 보상: 10P)
      syncVirtualReportWithUser(fakeReporter, 10);

      // 5. 외부 HUD용 디버그 로그 추가
      const timeSecStr = formatVirtualTimeWithSec(vNow);
      const crowdLabel = getCrowdLevelInfo(randomCrowd).label;
      const logLine = `[${timeSecStr}] ${targetPlace.name} -> ${crowdLabel} 갱신됨`;

      setSimLogs((prev) => {
        const updatedLogs = [logLine, ...prev];
        return updatedLogs; // 제한 없이 누적 보존하여 스크롤 뷰 지원
      });

      // 생성된 개수 카운트 증가
      currentGenerated += 1;
      setGeneratedCount(currentGenerated);

      // 지정한 개수에 도달했는지 확인
      if (currentGenerated >= targetCount) {
        setIsSimulating(false);
        return; // 더 이상 다음 타이머를 스케줄링하지 않고 중단
      }

      // 6. 다음 제보 딜레이 랜덤 스케줄링 (200ms ~ 500ms로 대폭 단축하여 빠른 제보 축적 유도)
      const nextDelay = Math.floor(Math.random() * 300) + 200;
      activeTimer = setTimeout(triggerSimulationReport, nextDelay);
    };

    // 첫 시작 딜레이도 200ms로 즉시 개시
    const firstDelay = 200;
    activeTimer = setTimeout(triggerSimulationReport, firstDelay);

    return () => {
      clearTimeout(activeTimer);
    };
  }, [isSimulating, setPlaces, targetCount]);

  return {
    isSimulating,
    setIsSimulating: startSimulation,
    simLogs,
    setSimLogs,
    generatedCount,
  };
}

/**
 * 설정된 경향성(Bias)에 따라 가중치 난수를 적용하여 1~5단계 혼잡도를 반환합니다.
 */
function getBiasedCrowd(simBias: string): 1 | 2 | 3 | 4 | 5 {
  const rand = Math.random() * 100; // 0 ~ 100 난수

  switch (simBias) {
    case "low": // 한산함 위주: 1단계(40%), 2단계(30%), 3단계(15%), 4단계(10%), 5단계(5%)
      if (rand < 40) return 1;
      if (rand < 70) return 2;
      if (rand < 85) return 3;
      if (rand < 95) return 4;
      return 5;
    case "high": // 혼잡함 위주: 5단계(40%), 4단계(30%), 3단계(15%), 2단계(10%), 1단계(5%)
      if (rand < 40) return 5;
      if (rand < 70) return 4;
      if (rand < 85) return 3;
      if (rand < 95) return 2;
      return 1;
    case "fixed-1": // 매우 한산 고정
      return 1;
    case "fixed-5": // 매우 혼잡 고정
      return 5;
    case "random":
    default: // 균등 랜덤
      if (rand < 20) return 1;
      if (rand < 40) return 2;
      if (rand < 60) return 3;
      if (rand < 80) return 4;
      return 5;
  }
}
