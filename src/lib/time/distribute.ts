import type { GagnePhase, TimeProfileId } from '@/lib/domain/types';

/**
 * 스마트 수업시간 자동 분배 계산기 (Step 4)
 * - 3대 배분 프로파일 / 사태 잠금 / 오차 제로 보정 / 1클릭 오차 맞춤
 * - 순수 함수로 작성하여 단위 테스트로 검증한다.
 */

export const TIME_PRESETS: Array<{ minutes: number; label: string }> = [
  { minutes: 40, label: '40분 (초·중 단축)' },
  { minutes: 45, label: '45분 (중학 표준)' },
  { minutes: 50, label: '50분 (고교)' },
  { minutes: 80, label: '80분 (블록)' },
  { minutes: 90, label: '90분 (블록)' },
];

export const MIN_TOTAL_MINUTES = 15;
export const MAX_TOTAL_MINUTES = 180;

/** 주 수행 사태(6사태: 학생 수행 요구) — 반올림 오차 흡수 대상 */
export const ABSORBER_SEQ = 6;

export interface TimeProfile {
  id: TimeProfileId;
  label: string;
  description: string;
  /** 1~9사태 가중치 (합계 100) */
  weights: number[];
}

export const TIME_PROFILES: Record<TimeProfileId, TimeProfile> = {
  standard: {
    id: 'standard',
    label: '표준 가네 균형형',
    description: '도입 15% · 전개 75% · 정리 10%',
    weights: [5, 4, 6, 15, 13, 22, 12, 13, 10],
  },
  reading: {
    id: 'reading',
    label: '독서·활동 집중형',
    description: '전개 80% 중 6사태(수행·활동지)와 7사태(피드백) 집중',
    weights: [4, 3, 4, 9, 8, 40, 15, 8, 9],
  },
  concept: {
    id: 'concept',
    label: '개념 탐구형',
    description: '4사태(자료 제시·본문 분석)와 8사태(형성평가) 비중 확대',
    weights: [5, 4, 6, 26, 12, 16, 7, 15, 9],
  },
};

export interface TimedSlot {
  seq: number;
  minutes: number;
  locked?: boolean;
}

export function phaseOf(seq: number): GagnePhase {
  if (seq <= 3) return '도입';
  if (seq <= 8) return '전개';
  return '정리';
}

export function clampTotal(total: number): number {
  if (!Number.isFinite(total)) return 45;
  return Math.min(MAX_TOTAL_MINUTES, Math.max(MIN_TOTAL_MINUTES, Math.round(total)));
}

export function sumMinutes(slots: TimedSlot[]): number {
  return slots.reduce((acc, s) => acc + (s.minutes || 0), 0);
}

/** 오차(diff)를 미잠금 사태에 흡수시킨다. 6사태 우선, 감소 시 최소 1분 보장 */
function absorb(minutes: number[], slots: TimedSlot[], unlocked: number[], diff: number, weights: number[]): number[] {
  const result = [...minutes];
  if (unlocked.length === 0 || diff === 0) return result;

  const absorberIdx = unlocked.find((i) => slots[i].seq === ABSORBER_SEQ);
  if (diff > 0) {
    const target =
      absorberIdx ?? unlocked.reduce((best, i) => (weights[i] > weights[best] ? i : best), unlocked[0]);
    result[target] += diff;
    return result;
  }

  // diff < 0 : 6사태부터, 그다음 큰 사태부터 1분씩 감소 (최소 1분)
  let remaining = -diff;
  const order = [...unlocked].sort((a, b) => {
    if (a === absorberIdx) return -1;
    if (b === absorberIdx) return 1;
    return result[b] - result[a];
  });
  let guard = 0;
  while (remaining > 0 && guard < 10000) {
    guard++;
    let progressed = false;
    for (const i of order) {
      if (remaining === 0) break;
      if (result[i] > 1) {
        result[i] -= 1;
        remaining -= 1;
        progressed = true;
      }
    }
    if (!progressed) {
      // 모두 1분인 경우 0분까지 허용
      for (const i of order) {
        if (remaining === 0) break;
        if (result[i] > 0) {
          result[i] -= 1;
          remaining -= 1;
          progressed = true;
        }
      }
      if (!progressed) break;
    }
  }
  return result;
}

/**
 * 프로파일 가중치에 따라 총 수업 시간을 분배한다.
 * - 잠금 사태의 시간은 그대로 유지
 * - (총 시간 − 잠금 합계)를 미잠금 사태에 가중치 비례 분배
 * - 정수 내림 후 남는 오차는 6사태에 흡수 (오차 0 보장)
 */
export function distributeMinutes(total: number, slots: TimedSlot[], profileId: TimeProfileId): number[] {
  const profile = TIME_PROFILES[profileId] ?? TIME_PROFILES.standard;
  const weights = slots.map((s) => profile.weights[s.seq - 1] ?? 1);
  const lockedSum = slots.reduce((acc, s) => acc + (s.locked ? s.minutes : 0), 0);
  const unlocked = slots.map((s, i) => (s.locked ? -1 : i)).filter((i) => i >= 0);

  if (unlocked.length === 0) return slots.map((s) => s.minutes);

  const remaining = Math.max(0, total - lockedSum);
  const weightSum = unlocked.reduce((acc, i) => acc + weights[i], 0) || 1;
  const allowMinOne = remaining >= unlocked.length;

  const minutes = slots.map((s, i) => {
    if (s.locked) return s.minutes;
    const raw = (remaining * weights[i]) / weightSum;
    const floored = Math.floor(raw);
    return allowMinOne ? Math.max(1, floored) : floored;
  });

  const unlockedSum = unlocked.reduce((acc, i) => acc + minutes[i], 0);
  return absorb(minutes, slots, unlocked, remaining - unlockedSum, weights);
}

/** 1클릭 오차 맞춤: 수동 편집으로 생긴 ±N분 오차를 미잠금 사태(6사태 우선)로 흡수 */
export function autoFitRemainder(total: number, slots: TimedSlot[]): number[] {
  const minutes = slots.map((s) => s.minutes);
  const unlocked = slots.map((s, i) => (s.locked ? -1 : i)).filter((i) => i >= 0);
  const diff = total - sumMinutes(slots);
  return absorb(minutes, slots, unlocked, diff, minutes);
}

export interface PhaseSummaryItem {
  phase: GagnePhase;
  minutes: number;
  percent: number;
}

export function summarizePhases(slots: TimedSlot[]): { items: PhaseSummaryItem[]; total: number } {
  const total = sumMinutes(slots);
  const phases: GagnePhase[] = ['도입', '전개', '정리'];
  const items = phases.map((phase) => {
    const m = slots.filter((s) => phaseOf(s.seq) === phase).reduce((a, s) => a + s.minutes, 0);
    return { phase, minutes: m, percent: total > 0 ? Math.round((m / total) * 100) : 0 };
  });
  return { items, total };
}

/** 예) "총 시간: 45분 (도입 7분 · 전개 34분 · 정리 4분)" */
export function formatPhaseBanner(slots: TimedSlot[]): string {
  const { items, total } = summarizePhases(slots);
  return `총 시간: ${total}분 (${items.map((i) => `${i.phase} ${i.minutes}분`).join(' · ')})`;
}
