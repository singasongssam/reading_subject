import type {
  CurriculumContext,
  MaterialVariant,
  PlanEvent,
  ReadingStage,
  Rubric,
  TimeProfileId,
} from '@/lib/domain/types';
import type { GagneEvent } from '@/lib/data/ontologyStore';
import { distributeMinutes, phaseOf } from '@/lib/time/distribute';
import { josa, stripPeriod } from '@/lib/text/korean';

/**
 * 가네 9사태 수업지도안 자동 슬롯팅 (Mock / 오프라인)
 * - 사태 명칭·목적·기본 교수 전략은 가네.ttl 원문 사용
 * - 독서전략은 관리자 규칙(사태 매핑) → 읽기 단계 기본 창 순으로 배치
 */

export interface PlanStrategyInput {
  id: string;
  label: string;
  procedure: string[];
  stage: ReadingStage;
  functionIds: string[];
  /** 해당 전략의 TTL 확장 권장 사태 */
  recommendedEvents: number[];
}

export interface PlanVisualInput {
  title: string;
  prompts: [string, string];
}

export interface PlanInput {
  ctx: CurriculumContext;
  material: MaterialVariant;
  genreLabel: string;
  strategies: PlanStrategyInput[];
  visual: PlanVisualInput | null;
  gagneEvents: GagneEvent[];
  totalMinutes: number;
  profileId: TimeProfileId;
  /** 관리자 독서전략-수업사태 규칙 (strategyId → 사태 번호 배열) */
  eventRules?: Record<string, number[]>;
}

export interface PlanOutput {
  lessonTitle: string;
  learningObjective: string;
  events: PlanEvent[];
  rubric: Rubric;
}

/** 읽기 단계별 기본 배치 창 */
export const STAGE_EVENT_WINDOW: Record<ReadingStage, number[]> = {
  '읽기 전': [3, 4],
  '읽기 중': [5, 6],
  '읽기 후': [6, 9],
};

export function effectiveEventsFor(s: PlanStrategyInput, rules?: Record<string, number[]>): number[] {
  const rule = rules?.[s.id];
  if (rule && rule.length > 0) return [...rule].sort((a, b) => a - b);
  const window = STAGE_EVENT_WINDOW[s.stage];
  const inter = s.recommendedEvents.filter((e) => window.includes(e));
  return inter.length > 0 ? inter : window;
}

const FUNCTION_VERB: Record<string, string> = {
  Func_Understanding: '설명할',
  Func_Exploration: '탐색할',
  Func_Inference: '추론할',
  Func_Prediction: '예측하며 읽을',
  Func_Comparison: '비교할',
  Func_Contrast: '구별할',
  Func_Classification: '분류할',
  Func_Relation: '관계를 설명할',
  Func_Analysis: '분석할',
  Func_Synthesis: '요약·종합할',
  Func_Evaluation: '평가할',
  Func_Application: '적용할',
  Func_Creation: '새롭게 표현할',
  Func_Expression: '표현할',
  Func_Regulation: '점검할',
};

function shortCoreIdea(ci: string): string {
  const s = stripPeriod(ci);
  return s.length > 42 ? `${s.slice(0, 40)}…` : s;
}

export function buildObjective(input: Pick<PlanInput, 'ctx' | 'genreLabel' | 'strategies'>): string {
  const { ctx, genreLabel, strategies } = input;
  const elements = ctx.elements.map((e) => e.label).slice(0, 3).join('·') || ctx.areaLabel;
  const main = strategies.find((s) => s.stage === '읽기 중') ?? strategies[0];
  const verb = main ? FUNCTION_VERB[main.functionIds[0]] ?? '설명할' : '설명할';
  const via = strategies.length > 0 ? `[${strategies.map((s) => s.label).join('·')}] 전략을 활용하여 ` : '';
  return `「${shortCoreIdea(ctx.coreIdeaText)}」라는 핵심 아이디어를 바탕으로, ${elements}에 관한 ${josa(genreLabel, '을/를')} ${via}읽고 그 내용을 ${verb} 수 있다.`;
}

export function buildRubric(input: Pick<PlanInput, 'ctx' | 'strategies'>): Rubric {
  const elements = input.ctx.elements.map((e) => e.label).slice(0, 3).join('·') || input.ctx.areaLabel;
  const strat = input.strategies.map((s) => s.label).join('·') || '독서전략';
  return {
    high: `핵심 아이디어와 ${elements}의 관계를 읽기자료의 근거를 들어 정확하게 설명하고, [${strat}] 그래픽 조직자를 완성하여 새로운 사례에 적용함`,
    mid: `핵심 아이디어와 내용 요소의 관계를 대체로 설명하며, 그래픽 조직자의 주요 항목을 작성함`,
    low: `교사의 안내를 받아 핵심 어휘의 뜻을 말하고, 그래픽 조직자의 일부 항목을 작성함`,
  };
}

export function generateGagnePlanMock(input: PlanInput): PlanOutput {
  const { ctx, material, genreLabel, visual, gagneEvents } = input;
  const objective = buildObjective(input);
  const E1 = ctx.elements[0]?.label ?? ctx.areaLabel;
  const terms = material.glossary.slice(0, 3).map((g) => g.term).join(', ');
  const placement = new Map<number, PlanStrategyInput[]>();
  input.strategies.forEach((s) => {
    effectiveEventsFor(s, input.eventRules).forEach((seq) => {
      placement.set(seq, [...(placement.get(seq) ?? []), s]);
    });
  });
  const stratAt = (seq: number) => placement.get(seq) ?? [];
  const stratLine = (seq: number, mode: 'teacher' | 'student') =>
    stratAt(seq)
      .map((s) =>
        mode === 'teacher'
          ? `○ [${s.label}] ${s.procedure.slice(0, 2).join(' → ')}`
          : `○ [${s.label}] ${s.procedure[s.procedure.length - 1] ?? '전략 양식에 맞추어 활동한다'}`
      )
      .join('\n');

  const content: Record<number, Pick<PlanEvent, 'teacherActivity' | 'studentActivity' | 'materialAndNotice'>> = {
    1: {
      teacherActivity: visual
        ? `○ 「${visual.title}」 구조도를 제시하며 발문한다.\n  T: "${visual.prompts[0]}"`
        : `○ ${ctx.areaLabel} 영역과 관련된 생활 장면을 제시하며 호기심을 유발한다.`,
      studentActivity: `○ 구조도를 관찰하고 생활 경험을 떠올려 자유롭게 답한다.\n  S: "${josa(E1, '과/와')} 관련된 장면을 본 적이 있어요."`,
      materialAndNotice: `개념 구조도(PPT), 발문 후 충분한 대기 시간 제공`,
    },
    2: {
      teacherActivity: `○ 학습 목표를 제시하고 활동 순서를 안내한다.\n  "${objective}"`,
      studentActivity: `○ 학습 목표를 함께 소리 내어 읽고 오늘의 활동 순서를 확인한다.`,
      materialAndNotice: `학습 목표 슬라이드, 목표를 칠판 상단에 계속 게시`,
    },
    3: {
      teacherActivity: [`○ ${ctx.areaLabel} 영역에서 이미 알고 있는 내용을 질문으로 확인한다.`, stratLine(3, 'teacher')]
        .filter(Boolean)
        .join('\n'),
      studentActivity: [`○ 알고 있는 개념과 경험을 발표하고 짝과 공유한다.`, stratLine(3, 'student')].filter(Boolean).join('\n'),
      materialAndNotice: `선수 학습 확인 질문, 오개념은 기록해 두었다가 7사태에서 교정`,
    },
    4: {
      teacherActivity: [
        `○ 읽기자료 「${material.title}」(${genreLabel})를 배부하고 읽기 방법을 안내한다.`,
        `○ 핵심 어휘(${terms})의 뜻을 확인한다.`,
        stratLine(4, 'teacher'),
      ]
        .filter(Boolean)
        .join('\n'),
      studentActivity: [`○ 제목과 문단 첫 문장을 훑어 읽은 뒤 본문을 자세히 읽는다.`, stratLine(4, 'student')]
        .filter(Boolean)
        .join('\n'),
      materialAndNotice: `읽기자료(수준별 3종: 쉬움·보통·도전), 학생 수준에 맞게 배부`,
    },
    5: {
      teacherActivity: [`○ 독서전략 적용 절차를 시범 보이고 그래픽 조직자 작성법을 안내한다.`, stratLine(5, 'teacher')]
        .filter(Boolean)
        .join('\n'),
      studentActivity: [`○ 교사의 시범을 보며 조직자 작성 방법을 익힌다.`, stratLine(5, 'student')].filter(Boolean).join('\n'),
      materialAndNotice: `그래픽 조직자 예시 화면, 정답을 직접 알려 주지 않고 힌트 제공`,
    },
    6: {
      teacherActivity: [`○ 모둠별 활동을 안내하고 순회하며 참여를 독려한다.`, stratLine(6, 'teacher')].filter(Boolean).join('\n'),
      studentActivity: [
        `○ 활동지에 그래픽 조직자를 작성하고 [이해]·[추론] 독해 문항을 해결한다.`,
        `○ 모둠 내에서 작성 결과를 비교하며 수정한다.`,
        stratLine(6, 'student'),
      ]
        .filter(Boolean)
        .join('\n'),
      materialAndNotice: `학생 활동지(A4), 수업 타이머 활용, 개별 책무성 확보`,
    },
    7: {
      teacherActivity: `○ 활동지를 확인하며 정확한 부분은 구체적으로 칭찬하고, 오류에는 이유와 수정 단서를 제시한다.`,
      studentActivity: `○ 피드백을 반영하여 조직자와 답안을 수정·보완한다.\n  S: "근거 문장을 다시 찾아 고쳐 볼게요."`,
      materialAndNotice: `즉각적·구체적 피드백, 대표 오개념은 전체 공유`,
    },
    8: {
      teacherActivity: [`○ 형성평가 퀴즈(초성·OX·4지선다)와 [비평] 문항으로 목표 도달을 확인한다.`, stratLine(8, 'teacher')]
        .filter(Boolean)
        .join('\n'),
      studentActivity: [`○ 퀴즈를 풀고 [비평] 문항에 자신의 판단과 근거를 서술한다.`, stratLine(8, 'student')]
        .filter(Boolean)
        .join('\n'),
      materialAndNotice: `형성평가 퀴즈 화면, 3수준 평가 기준(상·중·하) 적용`,
    },
    9: {
      teacherActivity: [
        visual ? `○ 구조도를 다시 보며 정리 발문을 한다.\n  T: "${visual.prompts[1]}"` : `○ 오늘 배운 내용을 정리한다.`,
        stratLine(9, 'teacher'),
        `○ 다음 차시 내용을 예고한다.`,
      ]
        .filter(Boolean)
        .join('\n'),
      studentActivity: [`○ 핵심 아이디어를 한 문장으로 정리하고 새로운 사례에 적용해 본다.`, stratLine(9, 'student')]
        .filter(Boolean)
        .join('\n'),
      materialAndNotice: `개념 구조도 재제시, 배움 공책 정리`,
    },
  };

  const base: PlanEvent[] = gagneEvents.map((ev) => {
    const strats = stratAt(ev.seq);
    return {
      seq: ev.seq,
      label: ev.label,
      purpose: ev.purpose,
      phase: ev.phase ?? phaseOf(ev.seq),
      minutes: 0,
      locked: false,
      strategy: [ev.defaultStrategies[0] ?? '', ...strats.map((s) => `독서전략: ${s.label}`)].filter(Boolean).join(' / '),
      ...content[ev.seq],
      readingStrategyIds: strats.map((s) => s.id),
    };
  });

  const minutes = distributeMinutes(input.totalMinutes, base, input.profileId);
  const events = base.map((e, i) => ({ ...e, minutes: minutes[i] }));

  return {
    lessonTitle: `${ctx.subjectName} ${ctx.grade}학년 · ${ctx.areaLabel} — ${material.title}`,
    learningObjective: objective,
    events,
    rubric: buildRubric(input),
  };
}
