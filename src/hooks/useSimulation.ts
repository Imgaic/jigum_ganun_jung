import { useState, useEffect } from "react";
import type { SetStateAction } from "react";
import { Place } from "../types";
import { getCrowdLevelInfo } from "../utils/crowdAnalyzer";
import { getVirtualNow, formatVirtualTime, formatVirtualTimeWithSec } from "../utils/timeSpeed";
import seedData from "../data/seedStore.json";

/**
 * 백그라운드 가상 학생 제보 시뮬레이션 엔진을 관리하는 커스텀 훅입니다.
 * @param places 현재 장소 데이터 목록
 * @param setPlaces 장소 데이터를 업데이트하는 React Dispatch 함수
 * @param targetCount 자동 생성할 제보 수 제한값
 */
export function useSimulation(
  places: Place[],
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
  targetCount: number
) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [generatedCount, setGeneratedCount] = useState<number>(0);

  const startSimulation = (value: SetStateAction<boolean>) => {
    const nextValue = typeof value === "function" ? value(isSimulating) : value;
    if (nextValue) {
      setGeneratedCount(0);
    }
    setIsSimulating(nextValue);
  };

  // 백그라운드 제보 생성 타이머 루프
  useEffect(() => {
    if (!isSimulating || places.length === 0) return;

    let activeTimer: NodeJS.Timeout;
    let currentGenerated = 0;

    const triggerSimulationReport = () => {
      // 1. 임의의 장소 선택
      const randomIdx = Math.floor(Math.random() * places.length);
      const targetPlace = places[randomIdx];

      // 2. 1~5 단계 중 무작위 혼잡도 선택
      const randomCrowd = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;

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

    return () => clearTimeout(activeTimer);
  }, [isSimulating, places, setPlaces, targetCount]);

  return {
    isSimulating,
    setIsSimulating: startSimulation,
    simLogs,
    setSimLogs,
    generatedCount,
  };
}
