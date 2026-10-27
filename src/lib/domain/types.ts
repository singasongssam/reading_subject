/**
 * 수업설계 시스템 공용 도메인 타입 (마스터 지침서 v2 기준)
 * - 교육과정 사실(영역·핵심 아이디어·내용 요소·가네 사태·독서기능/전략 명칭)은
 *   모두 data/compiled/*.json(원본 5종 TTL 컴파일 결과)에서만 가져온다.
 */

export type SubjectId = 'social' | 'science';
export type ReadingLevel = '쉬움' | '보통' | '도전';
export type GagnePhase = '도입' | '전개' | '정리';
export type ReadingStage = '읽기 전' | '읽기 중' | '읽기 후';
export type GenreId = 'argument' | 'exposition' | 'infographic' | 'report' | 'debate';
export type TimeProfileId = 'standard' | 'reading' | 'concept';

/** text.ttl 4개 분류 차원에 대응하는 선택값 (각 값은 text.ttl 속성 라벨) */
export interface TextTypeSelection {
  sourceMaterial: string; // 단일 텍스트 / 다중 텍스트
  structureNavigation: string; // 정적 / 동적
  format: string; // 연속적 / 비연속적 / 혼합적
  contentType: string; // 기술 / 서사 / 설명 / 논증 / 지시 / 교섭
}

export interface GlossaryItem {
  term: string;
  meaning: string;
  /** 초성 퀴즈 힌트 (예: ㅅㅇ ㄱㄱ) */
  hint: string;
}

export interface ComprehensionQuestion {
  level: '이해' | '추론' | '비평';
  /** 문항 유형 설명: 사실 확인 / 인과관계 / 가치 평가 */
  kind: string;
  question: string;
  answerHint: string;
}

export interface DataTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface MaterialVariant {
  level: ReadingLevel;
  title: string;
  paragraphs: string[];
  /** 통계·인포그래픽 복합문 등 비연속 요소 */
  table?: DataTable;
  glossary: GlossaryItem[];
  questions: ComprehensionQuestion[];
}

export interface MaterialSet {
  genreId: GenreId;
  textType: TextTypeSelection;
  variants: Record<ReadingLevel, MaterialVariant>;
  sourceNote: string;
  model: string;
  generatedAt: string;
}

/** 읽기자료 생성 요청 컨텍스트 (모두 TTL 원문 라벨/설명) */
export interface CurriculumContext {
  subjectId: SubjectId;
  subjectName: string;
  areaId: string;
  areaLabel: string;
  coreIdeaId: string;
  coreIdeaText: string;
  elements: Array<{ id: string; label: string; category?: string }>;
  grade: 1 | 2 | 3;
}

export interface PlanEvent {
  seq: number;
  label: string; // 가네.ttl 사태 명칭
  purpose: string;
  phase: GagnePhase;
  minutes: number;
  locked: boolean;
  /** 교수 전략 (가네.ttl defaultStrategies + 독서전략 배치) */
  strategy: string;
  /** 교사 발문 및 교수 전략 */
  teacherActivity: string;
  /** 학생 활동 및 예상 반응 */
  studentActivity: string;
  /** 수업 매체 및 유의점 */
  materialAndNotice: string;
  /** 해당 사태에 배치된 독서전략 id */
  readingStrategyIds: string[];
}

export interface Rubric {
  high: string; // 상 (Excellent)
  mid: string; // 중 (Good)
  low: string; // 하 (Needs Work)
}

export interface StrategyRecommendationItem {
  strategyId: string;
  label: string;
  score: number; // 0~100 (%)
  stage: ReadingStage;
  reasons: string[];
  matchedFunctionLabels: string[];
}

export interface QuizItem {
  id: string;
  type: 'choseong' | 'ox' | 'mcq';
  question: string;
  hint?: string;
  options?: string[];
  answer: string;
  explanation: string;
}
