export interface TextTypeSelection {
  sourceMaterial: string;        // 단일 / 다중
  structureNavigation: string;   // 정적 / 동적
  format: string;                // 연속적 / 비연속적 / 혼합적
  contentType: string;           // 기술 / 서사 / 설명 / 논증 / 지시 / 교섭
}

export interface MaterialRequest {
  subjectId: string;
  subjectName: string;
  nodeIds: string[];
  nodeLabels: string[];
  standardCodes?: string[];
  standardTexts?: string[];
  grade: 1 | 2 | 3;
  charCount: number;             // 예: 400, 600, 800자
  readingLevel: '쉬움' | '보통' | '도전';
  textType: TextTypeSelection;
  durationMinutes: number;
  additionalPrompt?: string;
}

export interface MaterialResult {
  title: string;
  body: string[];                // 문단 배열
  blocks?: Array<{
    type: 'paragraph' | 'table';
    headers?: string[];
    rows?: string[][];
    text?: string;
  }>;
  glossary: Array<{
    term: string;
    meaning: string;
  }>;
  comprehensionQuestions: Array<{
    question: string;
    answerHint: string;
    level: '기초' | '이해' | '심화';
  }>;
  sourceNote: string;
  alignment: {
    nodeIds: string[];
    standardCodes: string[];
  };
  model: string;
  promptVersion: string;
}

export interface StrategyRequest {
  targetFunctionId?: string;
  targetFunctionName?: string;
  textType: TextTypeSelection;
  durationMinutes: number;
}

export interface StrategyRecommendation {
  strategyId: string;
  name: string;
  functionName: string;
  score: number;
  reason: string;
  procedure: string[];
  phase: '읽기 전' | '읽기 중' | '읽기 후';
  minutes: number;
  suitableTextTypes: string[];
  worksheetHint?: string;
}

export interface StrategyResult {
  recommended: StrategyRecommendation[];
}

export interface LessonPlanEvent {
  seq: number;
  label: string;
  purpose: string;
  phase: '도입' | '전개' | '정리';
  teacherActivity: string;
  studentActivity: string;
  materialAndNotice: string;
  minutes: number;
  assessment: string;
  locked?: boolean;
}

export interface LessonPlanRequest {
  subjectName: string;
  grade: number;
  topic: string;
  unitName?: string;
  achievementStandards: string[];
  learningObjective: string;
  materialTitle: string;
  materialSummary: string;
  selectedStrategies: Array<{
    id: string;
    name: string;
    procedure: string[];
  }>;
  durationMinutes: number;
}

export interface LessonPlanResult {
  title: string;
  unitOverview: string;
  learningObjective: string;
  totalMinutes: number;
  events: LessonPlanEvent[];
  evaluationPlan: {
    criteriaHigh: string;
    criteriaMid: string;
    criteriaLow: string;
  };
  worksheetDraft: string;
}

export interface AiProvider {
  /** 공급자 식별명 (UI 배지 표기) */
  readonly name: string;
  /** v2: 5대 장르 × 3수준 읽기자료 세트 */
  generateMaterialSet(
    ctx: import('@/lib/domain/types').CurriculumContext,
    genreId: import('@/lib/domain/types').GenreId
  ): Promise<import('@/lib/domain/types').MaterialSet>;
  /** v2: 가네 9사태 슬롯팅 지도안 */
  composeGagnePlan(
    input: import('@/lib/generators/gagnePlan').PlanInput
  ): Promise<import('@/lib/generators/gagnePlan').PlanOutput>;
  generateMaterial(input: MaterialRequest): Promise<MaterialResult>;
  recommendStrategies(input: StrategyRequest): Promise<StrategyResult>;
  generateLessonPlan(input: LessonPlanRequest): Promise<LessonPlanResult>;
}
