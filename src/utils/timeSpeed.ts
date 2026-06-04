// src/utils/timeSpeed.ts

let globalTimeSpeed = 1;
let lastRealUpdate = Date.now();
let accumulatedVirtualTime = Date.now();

export function getGlobalTimeSpeed(): number {
  return globalTimeSpeed;
}

export function setGlobalTimeSpeed(speed: number) {
  // 배속 변경 시점까지의 가상 누적 시간을 고정하고 기준 시간을 갱신하여 시간이 튀지 않게 보정
  accumulatedVirtualTime = getVirtualNow();
  lastRealUpdate = Date.now();
  globalTimeSpeed = speed;
}

/**
 * 전역 배속 가속이 반영된 현재의 가상 에포크 타임스탬프(밀리초)를 반환합니다.
 */
export function getVirtualNow(): number {
  const now = Date.now();
  const realElapsed = now - lastRealUpdate;
  return accumulatedVirtualTime + realElapsed * globalTimeSpeed;
}

/**
 * 가상 타임스탬프를 24시간제 HH:MM 형식의 문자열로 변환합니다.
 */
export function formatVirtualTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${hrs}:${mins}`;
}

/**
 * 가상 타임스탬프를 HH:MM:SS 형식의 초 단위까지 변환합니다. (디버그 로그용)
 */
export function formatVirtualTimeWithSec(timestamp: number): string {
  const date = new Date(timestamp);
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}
