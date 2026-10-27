import type { ReadingStage, StrategyRecommendationItem } from '@/lib/domain/types';
import type { ReadingFunction, ReadingStrategy } from '@/lib/data/ontologyStore';

/**
 * 온톨로지 기반 KNU 독서전략 추천기 (Step 3)
 *
 * 근거 데이터
 *  - readstrategy.ttl : 독서기능(15) ↔ 과정-기능 동사 ↔ 독서전략(54) 관계
 *  - 사회과/과학과.ttl : 핵심 아이디어 설명문, 내용 요소 범주(지식·이해/과정·기능/가치·태도)
 *  - text.ttl         : 텍스트 유형(내용)·체재 라벨
 *
 * 점수(100점 만점)
 *  - 인지 요구 일치(최대 50): 핵심 아이디어·내용 요소에 등장하는 TTL 동사 어간 ↔ 전략의 독서기능
 *  - 내용 요소 범주 일치(최대 20): 범주별 권장 독서기능 ↔ 전략의 독서기능
 *  - 텍스트 유형 적합(최대 20): 장르의 text.ttl 유형/체재 ↔ 전략 적합 텍스트 유형
 *  - 시간 적합(최대 10): 전략 소요 시간이 총 수업 시간의 40% 이내
 */

/** 독서기능 → 읽기 단계 (KNU 독서과정 모형의 전/중/후 구분) */
export const FUNCTION_STAGE: Record<string, ReadingStage> = {
  Func_Exploration: '읽기 전',
  Func_Prediction: '읽기 전',
  Func_Understanding: '읽기 중',
  Func_Inference: '읽기 중',
  Func_Comparison: '읽기 중',
  Func_Contrast: '읽기 중',
  Func_Classification: '읽기 중',
  Func_Relation: '읽기 중',
  Func_Analysis: '읽기 중',
  Func_Synthesis: '읽기 후',
  Func_Evaluation: '읽기 후',
  Func_Application: '읽기 후',
  Func_Creation: '읽기 후',
  Func_Expression: '읽기 후',
  Func_Regulation: '읽기 후',
};

/** 내용 요소 범주 → 권장 독서기능 (시스템 규칙, 관리자 화면에 공개) */
export const CATEGORY_FUNCTIONS: Record<string, string[]> = {
  KnowledgeUnderstanding: ['Func_Understanding', 'Func_Relation', 'Func_Synthesis', 'Func_Classification'],
  ProcessSkill: ['Func_Analysis', 'Func_Exploration', 'Func_Inference', 'Func_Comparison', 'Func_Contrast'],
  ValueAttitude: ['Func_Evaluation', 'Func_Application', 'Func_Regulation', 'Func_Expression'],
};

export interface RecommendContext {
  coreIdeaText: string;
  elementLabels: string[];
  elementCategories: string[];
  contentType: string; // text.ttl 유형 라벨 (설명/논증/서사…)
  format: string; // text.ttl 체재 라벨 (연속적/혼합적…)
  totalMinutes: number;
}

function verbStem(verb: string): string {
  return verb.replace(/(하다|다)$/u, '').trim();
}

/** 텍스트에서 TTL 동사 어간을 찾아 대상 독서기능을 도출 */
export function deriveTargetFunctions(
  functions: ReadingFunction[],
  ctx: Pick<RecommendContext, 'coreIdeaText' | 'elementLabels' | 'elementCategories'>
): { verbMatched: Map<string, string[]>; categoryMatched: Set<string> } {
  const haystack = [ctx.coreIdeaText, ...ctx.elementLabels].join(' ');
  const verbMatched = new Map<string, string[]>();
  for (const f of functions) {
    for (const v of f.verbs) {
      const stem = verbStem(v.label);
      if (stem.length >= 2 && haystack.includes(stem)) {
        verbMatched.set(f.id, [...(verbMatched.get(f.id) ?? []), stem]);
      }
    }
  }
  const categoryMatched = new Set<string>();
  ctx.elementCategories.forEach((c) => (CATEGORY_FUNCTIONS[c] ?? []).forEach((fid) => categoryMatched.add(fid)));
  return { verbMatched, categoryMatched };
}

export function strategyStage(strategy: ReadingStrategy, preferredFunctionIds: string[] = []): ReadingStage {
  const pref = strategy.functionIds.find((f) => preferredFunctionIds.includes(f));
  if (pref && FUNCTION_STAGE[pref]) return FUNCTION_STAGE[pref];
  const counts: Record<ReadingStage, number> = { '읽기 전': 0, '읽기 중': 0, '읽기 후': 0 };
  strategy.functionIds.forEach((f) => {
    const s = FUNCTION_STAGE[f];
    if (s) counts[s]++;
  });
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ReadingStage) ?? '읽기 중';
}

export function scoreStrategies(
  strategies: ReadingStrategy[],
  functions: ReadingFunction[],
  ctx: RecommendContext
): StrategyRecommendationItem[] {
  const fnLabel = (id: string) => functions.find((f) => f.id === id)?.label ?? id;
  const { verbMatched, categoryMatched } = deriveTargetFunctions(functions, ctx);
  const targetIds = [...verbMatched.keys(), ...categoryMatched];

  return strategies.map((s) => {
    const reasons: string[] = [];
    let score = 0;
    const matched = new Set<string>();

    const verbHits = s.functionIds.filter((f) => verbMatched.has(f));
    if (verbHits.length > 0) {
      score += Math.min(50, 35 + verbHits.length * 15);
      verbHits.forEach((f) => matched.add(f));
      const stems = verbHits.flatMap((f) => verbMatched.get(f) ?? []);
      reasons.push(
        `핵심 아이디어의 '${Array.from(new Set(stems)).slice(0, 3).join("', '")}' 표현이 [${verbHits.map(fnLabel).join('·')}] 기능의 인지 요구와 일치`
      );
    }

    const catHits = s.functionIds.filter((f) => categoryMatched.has(f));
    if (catHits.length > 0) {
      score += Math.min(20, 12 + catHits.length * 4);
      catHits.forEach((f) => matched.add(f));
      reasons.push(`선택한 내용 요소 범주에 권장되는 [${catHits.map(fnLabel).join('·')}] 기능 수행`);
    }

    if (s.suitableTextTypes.includes(ctx.contentType)) {
      score += 20;
      reasons.push(`'${ctx.contentType}' 유형 텍스트에 적합 (text.ttl)`);
    } else if (s.suitableTextTypes.includes(ctx.format)) {
      score += 14;
      reasons.push(`'${ctx.format}' 체재 텍스트에 적합 (text.ttl)`);
    } else if (ctx.contentType === '서사' || ctx.contentType === '논증') {
      score += 6;
    }

    if (s.minutes <= Math.max(5, Math.round(ctx.totalMinutes * 0.4))) {
      score += 10;
    } else {
      reasons.push(`소요 시간(${s.minutes}분)이 길어 시간 조정 필요`);
    }

    const stage = strategyStage(s, targetIds);
    return {
      strategyId: s.id,
      label: s.label,
      score: Math.min(100, score),
      stage,
      reasons: reasons.length ? reasons : ['일반 적용 가능 전략'],
      matchedFunctionLabels: Array.from(matched).map(fnLabel),
    };
  });
}

/**
 * 최적 전략 3종 추천: 읽기 전·중·후 단계별 최고점 1종씩 우선 선정 후 부족분은 전체 최고점으로 보충
 */
export function recommendTop3(
  strategies: ReadingStrategy[],
  functions: ReadingFunction[],
  ctx: RecommendContext
): { top: StrategyRecommendationItem[]; all: StrategyRecommendationItem[] } {
  const all = scoreStrategies(strategies, functions, ctx).sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label, 'ko')
  );
  const top: StrategyRecommendationItem[] = [];
  (['읽기 전', '읽기 중', '읽기 후'] as ReadingStage[]).forEach((stage) => {
    const best = all.find((r) => r.stage === stage && r.score > 0 && !top.includes(r));
    if (best) top.push(best);
  });
  for (const r of all) {
    if (top.length >= 3) break;
    if (!top.includes(r)) top.push(r);
  }
  const order: Record<ReadingStage, number> = { '읽기 전': 0, '읽기 중': 1, '읽기 후': 2 };
  top.sort((a, b) => order[a.stage] - order[b.stage]);
  return { top, all };
}
