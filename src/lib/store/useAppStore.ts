import { create } from 'zustand';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { aiProvider } from '@/lib/ai';
import { getUserKey } from '@/lib/ai/userKey';
import { getGenerationResult, reportGeneration } from '@/lib/ai/generationContext';
import type {
  CurriculumContext,
  GenreId,
  GlossaryItem,
  MaterialSet,
  MaterialVariant,
  PlanEvent,
  ReadingLevel,
  Rubric,
  SubjectId,
  TimeProfileId,
} from '@/lib/domain/types';
import { getGenre } from '@/lib/text/genres';
import { generateMaterialSetMock } from '@/lib/generators/material';
import { recommendTop3, strategyStage } from '@/lib/strategy/recommend';
import { generateGagnePlanMock, type PlanStrategyInput } from '@/lib/generators/gagnePlan';
import { getConceptVisual } from '@/features/visuals/conceptVisuals';
import {
  autoFitRemainder,
  clampTotal,
  distributeMinutes,
} from '@/lib/time/distribute';

const RULES_STORAGE_KEY = 'ttl_edu_strategy_event_rules_v2';

function loadEventRules(): Record<string, number[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(RULES_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

function saveEventRules(rules: Record<string, number[]>) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    }
  } catch {
    // ignore
  }
}

export type OutputViewMode = 'lessonPlan' | 'worksheet' | 'ppt';

export interface AppState {
  // 마법사 단계 (1~5)
  wizardStep: 1 | 2 | 3 | 4 | 5;
  setWizardStep: (step: 1 | 2 | 3 | 4 | 5) => void;

  // Step 1: 3-Tier 교육과정 스킬트리 (영역 단일 Radio / 핵심아이디어 단일 Radio / 내용요소 다중 Checkbox)
  subjectId: SubjectId;
  grade: 1 | 2 | 3;
  areaId: string;
  coreIdeaId: string;
  elementIds: string[];

  setSubjectId: (subjectId: SubjectId) => void;
  setGrade: (grade: 1 | 2 | 3) => void;
  selectArea: (areaId: string) => void;
  selectCoreIdea: (coreIdeaId: string) => void;
  toggleElement: (elementId: string) => void;
  setElements: (elementIds: string[]) => void;

  // Step 2: 맞춤 교과 읽기자료 (3수준 × 5장르)
  genreId: GenreId;
  readingLevel: ReadingLevel;
  materialSet: MaterialSet;
  isGeneratingMaterial: boolean;
  aiGenerationStatus: 'idle' | 'rule' | 'ai' | 'fallback';
  aiGenerationMessage: string;

  setGenreId: (genreId: GenreId) => Promise<void>;
  setReadingLevel: (level: ReadingLevel) => void;
  regenerateMaterialSet: () => Promise<void>;
  updateVariantTitle: (title: string) => void;
  updateVariantParagraph: (index: number, text: string) => void;
  addVariantParagraph: () => void;
  removeVariantParagraph: (index: number) => void;
  updateGlossaryItem: (index: number, item: GlossaryItem) => void;
  addGlossaryItem: () => void;
  removeGlossaryItem: (index: number) => void;
  updateQuestionText: (index: number, question: string, answerHint: string) => void;

  // Step 3: 온톨로지 기반 KNU 독서전략 추천기
  selectedStrategyIds: string[];
  organizerModalStrategyId: string | null;
  strategyEventRules: Record<string, number[]>;

  toggleStrategy: (strategyId: string) => void;
  applyRecommendedTop3: () => void;
  setOrganizerModalStrategyId: (id: string | null) => void;
  setStrategyEventRule: (strategyId: string, events: number[]) => void;

  // Step 4: 가네 9사태 슬롯팅 & 스마트 수업시간 자동 분배 계산기
  totalMinutes: number;
  timeProfileId: TimeProfileId;
  lessonTitle: string;
  learningObjective: string;
  events: PlanEvent[];
  rubric: Rubric;
  isGeneratingPlan: boolean;

  setTotalMinutes: (minutes: number) => void;
  applyTimeProfile: (profileId: TimeProfileId) => void;
  toggleEventLock: (seq: number) => void;
  setEventMinutes: (seq: number, minutes: number) => void;
  stepEventMinutes: (seq: number, delta: number) => void;
  autoFitTime: () => void;
  updateEventField: (
    seq: number,
    field: 'strategy' | 'teacherActivity' | 'studentActivity' | 'materialAndNotice',
    value: string
  ) => void;
  setLessonTitle: (title: string) => void;
  setLearningObjective: (obj: string) => void;
  setRubric: (rubric: Rubric) => void;
  regenerateGagnePlan: () => Promise<void>;

  // Step 5: 완성 지도안 & 4대 산출물 뷰어 / 모달
  outputViewMode: OutputViewMode;
  isPreviewModalOpen: boolean;
  isQuizModalOpen: boolean;

  setOutputViewMode: (mode: OutputViewMode) => void;
  setPreviewModalOpen: (open: boolean) => void;
  setQuizModalOpen: (open: boolean) => void;

  // 헬퍼: 현재 교육과정 컨텍스트 및 선택된 수준 읽기자료 조회
  getCurriculumContext: () => CurriculumContext;
  getCurrentVariant: () => MaterialVariant;
  saveToVault: (ownerUid: string, ownerName: string) => { materialId: string; planId: string };
}

function buildContext(
  subjectId: SubjectId,
  grade: 1 | 2 | 3,
  areaId: string,
  coreIdeaId: string,
  elementIds: string[]
): CurriculumContext {
  const subject = ontologyStore.getSubject(subjectId);
  const nodes = ontologyStore.getCurriculumNodes(subjectId);
  const areaNode = nodes.find((n) => n.id === areaId && n.type === 'area') ?? nodes.find((n) => n.type === 'area')!;
  const coreIdeaNode =
    nodes.find((n) => n.id === coreIdeaId && n.type === 'coreIdea') ??
    nodes.find((n) => n.type === 'coreIdea' && n.parentIds.includes(areaNode.id)) ??
    nodes.find((n) => n.type === 'coreIdea')!;
  const elementNodes = nodes.filter((n) => elementIds.includes(n.id) && n.type === 'element');
  const fallbackElements =
    elementNodes.length > 0
      ? elementNodes
      : nodes.filter((n) => n.type === 'element' && n.parentIds.includes(areaNode.id)).slice(0, 2);

  return {
    subjectId,
    subjectName: subject?.name ?? (subjectId === 'science' ? '과학' : '사회'),
    areaId: areaNode.id,
    areaLabel: areaNode.label,
    coreIdeaId: coreIdeaNode.id,
    coreIdeaText: coreIdeaNode.description || coreIdeaNode.label,
    elements: fallbackElements.map((e) => ({
      id: e.id,
      label: e.label,
      category: e.elementCategory,
    })),
    grade,
  };
}

function resolveDefaultsForSubject(subjectId: SubjectId, preferredAreaId?: string) {
  const nodes = ontologyStore.getCurriculumNodes(subjectId);
  const areas = nodes.filter((n) => n.type === 'area');
  const defaultArea =
    areas.find((a) => a.id === preferredAreaId) ??
    areas.find((a) => a.id === (subjectId === 'social' ? 'Politics' : 'MotionEnergy')) ??
    areas[0];
  const coreIdeas = nodes.filter((n) => n.type === 'coreIdea' && n.parentIds.includes(defaultArea.id));
  const defaultCoreIdea = coreIdeas[0];
  const elements = nodes.filter((n) => n.type === 'element' && n.parentIds.includes(defaultArea.id));
  const defaultElementIds = elements.slice(0, 2).map((e) => e.id);
  return {
    areaId: defaultArea.id,
    coreIdeaId: defaultCoreIdea?.id ?? '',
    elementIds: defaultElementIds,
  };
}

function buildPlanStrategies(selectedIds: string[]): PlanStrategyInput[] {
  const all = ontologyStore.getReadingStrategies();
  return selectedIds
    .map((id) => all.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      id: s.id,
      label: s.label,
      procedure: s.procedure,
      stage: strategyStage(s),
      functionIds: s.functionIds,
      recommendedEvents: s.recommendedEvents,
    }));
}

// 초기 상태 계산
const initDefaults = resolveDefaultsForSubject('social', 'Politics');
const initCtx = buildContext('social', 2, initDefaults.areaId, initDefaults.coreIdeaId, initDefaults.elementIds);
const initGenre: GenreId = 'exposition';
const initMaterialSet = generateMaterialSetMock(initCtx, initGenre);
const initRec = recommendTop3(
  ontologyStore.getReadingStrategies(),
  ontologyStore.getReadingFunctions(),
  {
    coreIdeaText: initCtx.coreIdeaText,
    elementLabels: initCtx.elements.map((e) => e.label),
    elementCategories: initCtx.elements.map((e) => e.category ?? ''),
    contentType: initMaterialSet.textType.contentType,
    format: initMaterialSet.textType.format,
    totalMinutes: 45,
  }
);
const initStrategyIds = initRec.top.map((r) => r.strategyId);
const initRules = loadEventRules();
const initPlan = generateGagnePlanMock({
  ctx: initCtx,
  material: initMaterialSet.variants['보통'],
  genreLabel: getGenre(initGenre).label,
  strategies: buildPlanStrategies(initStrategyIds),
  visual: getConceptVisual(initCtx.areaId),
  gagneEvents: ontologyStore.getGagneEvents(),
  totalMinutes: 45,
  profileId: 'standard',
  eventRules: initRules,
});

export const useAppStore = create<AppState>((set, get) => ({
  wizardStep: 1,
  setWizardStep: (step) => set({ wizardStep: step }),

  subjectId: 'social',
  grade: 2,
  areaId: initDefaults.areaId,
  coreIdeaId: initDefaults.coreIdeaId,
  elementIds: initDefaults.elementIds,

  genreId: initGenre,
  readingLevel: '보통',
  materialSet: initMaterialSet,
  isGeneratingMaterial: false,
  aiGenerationStatus: 'idle',
  aiGenerationMessage: '',

  selectedStrategyIds: initStrategyIds,
  organizerModalStrategyId: null,
  strategyEventRules: initRules,

  totalMinutes: 45,
  timeProfileId: 'standard',
  lessonTitle: initPlan.lessonTitle,
  learningObjective: initPlan.learningObjective,
  events: initPlan.events,
  rubric: initPlan.rubric,
  isGeneratingPlan: false,

  outputViewMode: 'lessonPlan',
  isPreviewModalOpen: false,
  isQuizModalOpen: false,

  getCurriculumContext: () => {
    const s = get();
    return buildContext(s.subjectId, s.grade, s.areaId, s.coreIdeaId, s.elementIds);
  },

  getCurrentVariant: () => {
    const s = get();
    return s.materialSet.variants[s.readingLevel] ?? s.materialSet.variants['보통'];
  },

  setSubjectId: (subjectId) => {
    const defs = resolveDefaultsForSubject(subjectId);
    const s = get();
    const ctx = buildContext(subjectId, s.grade, defs.areaId, defs.coreIdeaId, defs.elementIds);
    const mat = generateMaterialSetMock(ctx, s.genreId);
    const rec = recommendTop3(ontologyStore.getReadingStrategies(), ontologyStore.getReadingFunctions(), {
      coreIdeaText: ctx.coreIdeaText,
      elementLabels: ctx.elements.map((e) => e.label),
      elementCategories: ctx.elements.map((e) => e.category ?? ''),
      contentType: mat.textType.contentType,
      format: mat.textType.format,
      totalMinutes: s.totalMinutes,
    });
    const stratIds = rec.top.map((r) => r.strategyId);
    const plan = generateGagnePlanMock({
      ctx,
      material: mat.variants[s.readingLevel],
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(stratIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      subjectId,
      areaId: defs.areaId,
      coreIdeaId: defs.coreIdeaId,
      elementIds: defs.elementIds,
      materialSet: mat,
      selectedStrategyIds: stratIds,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  setGrade: (grade) => {
    set({ grade });
    const s = get();
    const ctx = s.getCurriculumContext();
    const plan = generateGagnePlanMock({
      ctx,
      material: s.getCurrentVariant(),
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(s.selectedStrategyIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  selectArea: (areaId) => {
    const s = get();
    const defs = resolveDefaultsForSubject(s.subjectId, areaId);
    const ctx = buildContext(s.subjectId, s.grade, defs.areaId, defs.coreIdeaId, defs.elementIds);
    const mat = generateMaterialSetMock(ctx, s.genreId);
    const rec = recommendTop3(ontologyStore.getReadingStrategies(), ontologyStore.getReadingFunctions(), {
      coreIdeaText: ctx.coreIdeaText,
      elementLabels: ctx.elements.map((e) => e.label),
      elementCategories: ctx.elements.map((e) => e.category ?? ''),
      contentType: mat.textType.contentType,
      format: mat.textType.format,
      totalMinutes: s.totalMinutes,
    });
    const stratIds = rec.top.map((r) => r.strategyId);
    const plan = generateGagnePlanMock({
      ctx,
      material: mat.variants[s.readingLevel],
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(stratIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      areaId: defs.areaId,
      coreIdeaId: defs.coreIdeaId,
      elementIds: defs.elementIds,
      materialSet: mat,
      selectedStrategyIds: stratIds,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  selectCoreIdea: (coreIdeaId) => {
    const s = get();
    const ctx = buildContext(s.subjectId, s.grade, s.areaId, coreIdeaId, s.elementIds);
    const mat = generateMaterialSetMock(ctx, s.genreId);
    const plan = generateGagnePlanMock({
      ctx,
      material: mat.variants[s.readingLevel],
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(s.selectedStrategyIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      coreIdeaId,
      materialSet: mat,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  toggleElement: (elementId) => {
    const s = get();
    const exists = s.elementIds.includes(elementId);
    const nextIds = exists
      ? s.elementIds.length > 1
        ? s.elementIds.filter((id) => id !== elementId)
        : s.elementIds
      : [...s.elementIds, elementId];
    get().setElements(nextIds);
  },

  setElements: (elementIds) => {
    const s = get();
    const ctx = buildContext(s.subjectId, s.grade, s.areaId, s.coreIdeaId, elementIds);
    const mat = generateMaterialSetMock(ctx, s.genreId);
    const plan = generateGagnePlanMock({
      ctx,
      material: mat.variants[s.readingLevel],
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(s.selectedStrategyIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      elementIds,
      materialSet: mat,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  setGenreId: async (genreId) => {
    set({ genreId, isGeneratingMaterial: true });
    const s = get();
    const ctx = s.getCurriculumContext();
    if (!getUserKey()) reportGeneration('rule', '개인 API 키가 없어 규칙 기반 읽기자료를 생성했습니다.');
    let mat: MaterialSet;
    try { mat = await aiProvider.generateMaterialSet(ctx, genreId); }
    catch (error) { reportGeneration('fallback', `생성 오류: ${String(error)}`); mat = generateMaterialSetMock(ctx, genreId); }
    const generation = getGenerationResult();
    // 새 읽기자료가 기존 지도안에 자동 반영되지는 않으므로 기본 지도안을 동기화합니다.
    const plan = generateGagnePlanMock({
      ctx,
      material: mat.variants[s.readingLevel],
      genreLabel: getGenre(genreId).label,
      strategies: buildPlanStrategies(s.selectedStrategyIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      materialSet: mat,
      isGeneratingMaterial: false,
      aiGenerationStatus: generation.status,
      aiGenerationMessage: generation.detail,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  setReadingLevel: (readingLevel) => set({ readingLevel }),

  regenerateMaterialSet: async () => {
    const s = get();
    await s.setGenreId(s.genreId);
  },

  updateVariantTitle: (title) => {
    const s = get();
    const cur = s.getCurrentVariant();
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, title },
        },
      },
    });
  },

  updateVariantParagraph: (index, text) => {
    const s = get();
    const cur = s.getCurrentVariant();
    const next = [...cur.paragraphs];
    next[index] = text;
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, paragraphs: next },
        },
      },
    });
  },

  addVariantParagraph: () => {
    const s = get();
    const cur = s.getCurrentVariant();
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, paragraphs: [...cur.paragraphs, '새로운 문단 내용을 입력하세요.'] },
        },
      },
    });
  },

  removeVariantParagraph: (index) => {
    const s = get();
    const cur = s.getCurrentVariant();
    if (cur.paragraphs.length <= 1) return;
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, paragraphs: cur.paragraphs.filter((_, i) => i !== index) },
        },
      },
    });
  },

  updateGlossaryItem: (index, item) => {
    const s = get();
    const cur = s.getCurrentVariant();
    const next = [...cur.glossary];
    next[index] = item;
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, glossary: next },
        },
      },
    });
  },

  addGlossaryItem: () => {
    const s = get();
    const cur = s.getCurrentVariant();
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: {
            ...cur,
            glossary: [...cur.glossary, { term: '새 용어', meaning: '용어의 뜻풀이를 입력하세요.', hint: 'ㅅ ㅇㅇ' }],
          },
        },
      },
    });
  },

  removeGlossaryItem: (index) => {
    const s = get();
    const cur = s.getCurrentVariant();
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, glossary: cur.glossary.filter((_, i) => i !== index) },
        },
      },
    });
  },

  updateQuestionText: (index, question, answerHint) => {
    const s = get();
    const cur = s.getCurrentVariant();
    const next = [...cur.questions];
    if (next[index]) {
      next[index] = { ...next[index], question, answerHint };
    }
    set({
      materialSet: {
        ...s.materialSet,
        variants: {
          ...s.materialSet.variants,
          [s.readingLevel]: { ...cur, questions: next },
        },
      },
    });
  },

  toggleStrategy: (strategyId) => {
    const s = get();
    const exists = s.selectedStrategyIds.includes(strategyId);
    const next = exists
      ? s.selectedStrategyIds.length > 1
        ? s.selectedStrategyIds.filter((id) => id !== strategyId)
        : s.selectedStrategyIds
      : [...s.selectedStrategyIds, strategyId];
    const ctx = s.getCurriculumContext();
    const plan = generateGagnePlanMock({
      ctx,
      material: s.getCurrentVariant(),
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(next),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      selectedStrategyIds: next,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  applyRecommendedTop3: () => {
    const s = get();
    const ctx = s.getCurriculumContext();
    const rec = recommendTop3(ontologyStore.getReadingStrategies(), ontologyStore.getReadingFunctions(), {
      coreIdeaText: ctx.coreIdeaText,
      elementLabels: ctx.elements.map((e) => e.label),
      elementCategories: ctx.elements.map((e) => e.category ?? ''),
      contentType: s.materialSet.textType.contentType,
      format: s.materialSet.textType.format,
      totalMinutes: s.totalMinutes,
    });
    const next = rec.top.map((r) => r.strategyId);
    const plan = generateGagnePlanMock({
      ctx,
      material: s.getCurrentVariant(),
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(next),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    });
    set({
      selectedStrategyIds: next,
      lessonTitle: plan.lessonTitle,
      learningObjective: plan.learningObjective,
      events: plan.events,
      rubric: plan.rubric,
    });
  },

  setOrganizerModalStrategyId: (organizerModalStrategyId) => set({ organizerModalStrategyId }),

  setStrategyEventRule: (strategyId, events) => {
    const s = get();
    const nextRules = { ...s.strategyEventRules, [strategyId]: events };
    saveEventRules(nextRules);
    set({ strategyEventRules: nextRules });
  },

  setTotalMinutes: (raw) => {
    const totalMinutes = clampTotal(raw);
    const s = get();
    const distributed = distributeMinutes(totalMinutes, s.events, s.timeProfileId);
    set({
      totalMinutes,
      events: s.events.map((ev, i) => ({ ...ev, minutes: distributed[i] })),
    });
  },

  applyTimeProfile: (profileId) => {
    const s = get();
    const distributed = distributeMinutes(s.totalMinutes, s.events, profileId);
    set({
      timeProfileId: profileId,
      events: s.events.map((ev, i) => ({ ...ev, minutes: distributed[i] })),
    });
  },

  toggleEventLock: (seq) => {
    const s = get();
    set({
      events: s.events.map((ev) => (ev.seq === seq ? { ...ev, locked: !ev.locked } : ev)),
    });
  },

  setEventMinutes: (seq, minutes) => {
    const s = get();
    const clean = Math.max(0, Math.min(180, Math.round(Number(minutes) || 0)));
    set({
      events: s.events.map((ev) => (ev.seq === seq ? { ...ev, minutes: clean } : ev)),
    });
  },

  stepEventMinutes: (seq, delta) => {
    const s = get();
    set({
      events: s.events.map((ev) =>
        ev.seq === seq ? { ...ev, minutes: Math.max(0, Math.min(180, ev.minutes + delta)) } : ev
      ),
    });
  },

  autoFitTime: () => {
    const s = get();
    const fitted = autoFitRemainder(s.totalMinutes, s.events);
    set({
      events: s.events.map((ev, i) => ({ ...ev, minutes: fitted[i] })),
    });
  },

  updateEventField: (seq, field, value) => {
    const s = get();
    set({
      events: s.events.map((ev) => (ev.seq === seq ? { ...ev, [field]: value } : ev)),
    });
  },

  setLessonTitle: (lessonTitle) => set({ lessonTitle }),
  setLearningObjective: (learningObjective) => set({ learningObjective }),
  setRubric: (rubric) => set({ rubric }),

  regenerateGagnePlan: async () => {
    const s = get();
    set({ isGeneratingPlan: true });
    const ctx = s.getCurriculumContext();
    const prevBySeq = new Map(s.events.map((e) => [e.seq, e]));
    if (!getUserKey()) reportGeneration('rule', '개인 API 키가 없어 규칙 기반 수업 지도안을 구성했습니다.');
    let out;
    try { out = await aiProvider.composeGagnePlan({
      ctx,
      material: s.getCurrentVariant(),
      genreLabel: getGenre(s.genreId).label,
      strategies: buildPlanStrategies(s.selectedStrategyIds),
      visual: getConceptVisual(ctx.areaId),
      gagneEvents: ontologyStore.getGagneEvents(),
      totalMinutes: s.totalMinutes,
      profileId: s.timeProfileId,
      eventRules: s.strategyEventRules,
    }); } catch (error) {
      reportGeneration('fallback', `지도안 생성 오류: ${String(error)}`);
      set({ isGeneratingPlan: false, aiGenerationStatus: 'fallback', aiGenerationMessage: getGenerationResult().detail });
      return;
    }
    const generation = getGenerationResult();
    // 잠금(Locked) 사태의 활동 내용 및 시간 보존 후 미잠금 사태 비례 재분배
    const mergedSlots = out.events.map((ev) => {
      const prev = prevBySeq.get(ev.seq);
      if (prev?.locked) return { ...prev };
      return ev;
    });
    const redistributed = distributeMinutes(s.totalMinutes, mergedSlots, s.timeProfileId);
    set({
      isGeneratingPlan: false,
      aiGenerationStatus: generation.status,
      aiGenerationMessage: generation.detail,
      lessonTitle: out.lessonTitle,
      learningObjective: out.learningObjective,
      events: mergedSlots.map((ev, i) => ({ ...ev, minutes: redistributed[i] })),
      rubric: out.rubric,
    });
  },

  setOutputViewMode: (outputViewMode) => set({ outputViewMode }),
  setPreviewModalOpen: (isPreviewModalOpen) => set({ isPreviewModalOpen }),
  setQuizModalOpen: (isQuizModalOpen) => set({ isQuizModalOpen }),

  saveToVault: (ownerUid, ownerName) => {
    const s = get();
    const ctx = s.getCurriculumContext();
    const curMat = s.getCurrentVariant();
    const allStrats = ontologyStore.getReadingStrategies();
    const savedMat = ontologyStore.saveMaterial({
      ownerUid,
      ownerName,
      subjectId: ctx.subjectId,
      subjectName: ctx.subjectName,
      nodeIds: [ctx.areaId, ctx.coreIdeaId, ...ctx.elements.map((e) => e.id)],
      nodeLabels: [ctx.areaLabel, ...ctx.elements.map((e) => e.label)],
      title: curMat.title,
      body: curMat.paragraphs,
      glossary: curMat.glossary.map((g) => ({ term: g.term, meaning: g.meaning })),
      comprehensionQuestions: curMat.questions.map((q) => ({
        question: q.question,
        answerHint: q.answerHint,
        level: q.level === '이해' ? '기초' : q.level === '추론' ? '이해' : '심화',
      })),
      grade: ctx.grade,
      durationMinutes: s.totalMinutes,
      readingLevel: s.readingLevel,
      textType: s.materialSet.textType,
      ontologyVersion: ontologyStore.getOntologyMeta().versionId,
      reviewedByTeacher: true,
    });

    const savedPlan = ontologyStore.saveLessonPlan({
      ownerUid,
      ownerName,
      materialId: savedMat.id,
      subjectName: ctx.subjectName,
      grade: ctx.grade,
      topic: `${ctx.areaLabel} (${ctx.elements.map((e) => e.label).join(', ')})`,
      title: s.lessonTitle,
      unitOverview: ctx.coreIdeaText,
      learningObjective: s.learningObjective,
      totalMinutes: s.totalMinutes,
      selectedStrategies: s.selectedStrategyIds.map((id) => {
        const st = allStrats.find((x) => x.id === id);
        return {
          id,
          name: st?.label ?? id,
          procedure: st?.procedure ?? [],
        };
      }),
      events: s.events.map((ev) => ({
        seq: ev.seq,
        label: ev.label,
        purpose: ev.purpose,
        phase: ev.phase,
        teacherActivity: ev.teacherActivity,
        studentActivity: ev.studentActivity,
        materialAndNotice: ev.materialAndNotice,
        minutes: ev.minutes,
        assessment: ev.strategy,
        locked: ev.locked,
      })),
      evaluationPlan: {
        criteriaHigh: s.rubric.high,
        criteriaMid: s.rubric.mid,
        criteriaLow: s.rubric.low,
      },
      worksheetDraft: `[1:1 개념 구조도: ${getConceptVisual(ctx.areaId)?.title ?? ctx.areaLabel}] + 독서전략 그래픽 조직자`,
      ontologyVersion: ontologyStore.getOntologyMeta().versionId,
      reviewedByTeacher: true,
    });

    return { materialId: savedMat.id, planId: savedPlan.id };
  },
}));
