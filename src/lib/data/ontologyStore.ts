import subjectsData from '../../../data/compiled/subjects.json';
import curriculumNodesData from '../../../data/compiled/curriculum-nodes.json';
import gagneEventsData from '../../../data/compiled/gagne-events.json';
import readingFunctionsData from '../../../data/compiled/reading-functions.json';
import readingStrategiesData from '../../../data/compiled/reading-strategies.json';
import textTypesData from '../../../data/compiled/text-types.json';
import ontologyMetaData from '../../../data/compiled/ontology-meta.json';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  gradeBands: string[];
  competencies: Array<{ id: string; label: string }>;
  areaIds: string[];
}

export interface CurriculumNode {
  id: string;
  subjectId: string;
  type: 'area' | 'coreIdea' | 'element' | 'unit' | 'standard';
  label: string;
  description?: string;
  parentIds: string[];
  gradeBand?: string;
  elementCategory?: 'KnowledgeUnderstanding' | 'ProcessSkill' | 'ValueAttitude';
  standardCode?: string;
  standardText?: string;
  targetVerb?: string;
  targetFunctionIds: string[];
  status: 'registered' | 'unregistered';
}

export interface GagneEvent {
  seq: number;
  label: string;
  purpose: string;
  phase: '도입' | '전개' | '정리';
  defaultStrategies: string[];
  exampleDescription?: string;
}

export interface ReadingFunction {
  id: string;
  label: string;
  verbs: Array<{ id: string; label: string }>;
  strategyIds: string[];
}

export interface ReadingStrategy {
  id: string;
  label: string;
  functionIds: string[];
  procedure: string[];
  suitableTextTypes: string[];
  recommendedEvents: number[];
  minutes: number;
  worksheetHint?: string;
  reviewStatus: 'draft' | 'reviewed';
}

export interface TextTypeCategory {
  id: string;
  label: string;
  attributes: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

export interface SavedMaterial {
  id: string;
  ownerUid: string;
  ownerName: string;
  subjectId: string;
  subjectName: string;
  nodeIds: string[];
  nodeLabels: string[];
  standardCodes?: string[];
  title: string;
  body: string[];
  glossary: Array<{ term: string; meaning: string }>;
  comprehensionQuestions: Array<{ question: string; answerHint: string; level: '기초' | '이해' | '심화' }>;
  grade: number;
  durationMinutes: number;
  readingLevel: string;
  textType: {
    sourceMaterial: string;
    structureNavigation: string;
    format: string;
    contentType: string;
  };
  ontologyVersion: string;
  reviewedByTeacher: boolean;
  createdAt: string;
}

export interface SavedLessonPlan {
  id: string;
  ownerUid: string;
  ownerName: string;
  materialId: string;
  subjectName: string;
  grade: number;
  topic: string;
  title: string;
  unitOverview: string;
  learningObjective: string;
  totalMinutes: number;
  selectedStrategies: Array<{ id: string; name: string; procedure: string[] }>;
  events: Array<{
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
  }>;
  evaluationPlan: {
    criteriaHigh: string;
    criteriaMid: string;
    criteriaLow: string;
  };
  worksheetDraft: string;
  ontologyVersion: string;
  reviewedByTeacher: boolean;
  createdAt: string;
}

// 안전한 Storage 헬퍼 (브라우저 비활성화 환경 및 테스트/SSR 대응)
const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
};

// LocalStorage 키
const STORAGE_KEYS = {
  NODES: 'ttl_edu_curriculum_nodes_v1',
  STRATEGIES: 'ttl_edu_reading_strategies_v1',
  MATERIALS: 'ttl_edu_saved_materials_v1',
  LESSON_PLANS: 'ttl_edu_saved_lesson_plans_v1',
};

class OntologyStore {
  private subjects: Subject[] = subjectsData as Subject[];
  private curriculumNodes: CurriculumNode[] = [];
  private gagneEvents: GagneEvent[] = gagneEventsData as GagneEvent[];
  private readingFunctions: ReadingFunction[] = readingFunctionsData as ReadingFunction[];
  private readingStrategies: ReadingStrategy[] = [];
  private textTypes: TextTypeCategory[] = textTypesData as TextTypeCategory[];
  private savedMaterials: SavedMaterial[] = [];
  private savedLessonPlans: SavedLessonPlan[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // 1. 교육과정 노드 초기화 (LocalStorage에 추가/수정본이 있으면 병합)
    const storedNodes = safeStorage.getItem(STORAGE_KEYS.NODES);
    if (storedNodes) {
      try {
        this.curriculumNodes = JSON.parse(storedNodes);
      } catch {
        this.curriculumNodes = curriculumNodesData as CurriculumNode[];
      }
    } else {
      this.curriculumNodes = curriculumNodesData as CurriculumNode[];
    }

    // 2. 독서전략 초기화
    const storedStrats = safeStorage.getItem(STORAGE_KEYS.STRATEGIES);
    if (storedStrats) {
      try {
        this.readingStrategies = JSON.parse(storedStrats);
      } catch {
        this.readingStrategies = readingStrategiesData as ReadingStrategy[];
      }
    } else {
      this.readingStrategies = readingStrategiesData as ReadingStrategy[];
    }

    // 3. 교사 산출물 초기화
    const storedMats = safeStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (storedMats) {
      try {
        this.savedMaterials = JSON.parse(storedMats);
      } catch {
        this.savedMaterials = [];
      }
    }

    const storedPlans = safeStorage.getItem(STORAGE_KEYS.LESSON_PLANS);
    if (storedPlans) {
      try {
        this.savedLessonPlans = JSON.parse(storedPlans);
      } catch {
        this.savedLessonPlans = [];
      }
    }

    // 4. Firebase Cloud Firestore가 설정된 경우 백그라운드 클라우드 동기화 수행
    if (isFirebaseConfigured && typeof window !== 'undefined') {
      void this.syncFromFirestore();
    }
  }

  async syncFromFirestore(): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      const [matsSnap, plansSnap] = await Promise.all([
        getDocs(collection(db, 'materials')),
        getDocs(collection(db, 'lessonPlans')),
      ]);
      if (!matsSnap.empty) {
        const cloudMats = matsSnap.docs.map((d) => d.data() as SavedMaterial);
        cloudMats.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.savedMaterials = cloudMats;
        safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(this.savedMaterials));
      }
      if (!plansSnap.empty) {
        const cloudPlans = plansSnap.docs.map((d) => d.data() as SavedLessonPlan);
        cloudPlans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.savedLessonPlans = cloudPlans;
        safeStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(this.savedLessonPlans));
      }
    } catch (err) {
      console.warn('Firestore 클라우드 초기 로드 참고 (로컬 캐시 유지):', err);
    }
  }

  // --- 조회 메서드 ---
  getSubjects(): Subject[] {
    return this.subjects;
  }

  getSubject(subjectId: string): Subject | undefined {
    return this.subjects.find((s) => s.id === subjectId);
  }

  getCurriculumNodes(subjectId?: string): CurriculumNode[] {
    if (!subjectId) return this.curriculumNodes;
    return this.curriculumNodes.filter((n) => n.subjectId === subjectId);
  }

  getNode(nodeId: string): CurriculumNode | undefined {
    return this.curriculumNodes.find((n) => n.id === nodeId);
  }

  getChildNodes(parentId: string): CurriculumNode[] {
    return this.curriculumNodes.filter((n) => n.parentIds.includes(parentId));
  }

  getGagneEvents(): GagneEvent[] {
    return this.gagneEvents;
  }

  getReadingFunctions(): ReadingFunction[] {
    return this.readingFunctions;
  }

  getReadingStrategies(): ReadingStrategy[] {
    return this.readingStrategies;
  }

  getTextTypes(): TextTypeCategory[] {
    return this.textTypes;
  }

  getOntologyMeta() {
    return ontologyMetaData;
  }

  // --- 교사 산출물 보관함 관리 ---
  getSavedMaterials(ownerUid?: string): SavedMaterial[] {
    if (!ownerUid) return this.savedMaterials;
    return this.savedMaterials.filter((m) => m.ownerUid === ownerUid);
  }

  getSavedMaterial(id: string): SavedMaterial | undefined {
    return this.savedMaterials.find((m) => m.id === id);
  }

  saveMaterial(material: Omit<SavedMaterial, 'id' | 'createdAt'>): SavedMaterial {
    const newMaterial: SavedMaterial = {
      ...material,
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.savedMaterials.unshift(newMaterial);
    safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(this.savedMaterials));
    if (isFirebaseConfigured) {
      void setDoc(doc(db, 'materials', newMaterial.id), newMaterial).catch((e) =>
        console.warn('Firestore 읽기자료 저장 참고:', e)
      );
    }
    return newMaterial;
  }

  deleteMaterial(id: string): boolean {
    this.savedMaterials = this.savedMaterials.filter((m) => m.id !== id);
    safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(this.savedMaterials));
    if (isFirebaseConfigured) {
      void deleteDoc(doc(db, 'materials', id)).catch((e) =>
        console.warn('Firestore 읽기자료 삭제 참고:', e)
      );
    }
    return true;
  }

  getSavedLessonPlans(ownerUid?: string): SavedLessonPlan[] {
    if (!ownerUid) return this.savedLessonPlans;
    return this.savedLessonPlans.filter((p) => p.ownerUid === ownerUid);
  }

  getSavedLessonPlan(id: string): SavedLessonPlan | undefined {
    return this.savedLessonPlans.find((p) => p.id === id);
  }

  saveLessonPlan(plan: Omit<SavedLessonPlan, 'id' | 'createdAt'>): SavedLessonPlan {
    const newPlan: SavedLessonPlan = {
      ...plan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.savedLessonPlans.unshift(newPlan);
    safeStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(this.savedLessonPlans));
    if (isFirebaseConfigured) {
      void setDoc(doc(db, 'lessonPlans', newPlan.id), newPlan).catch((e) =>
        console.warn('Firestore 수업지도안 저장 참고:', e)
      );
    }
    return newPlan;
  }

  deleteLessonPlan(id: string): boolean {
    this.savedLessonPlans = this.savedLessonPlans.filter((p) => p.id !== id);
    safeStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(this.savedLessonPlans));
    if (isFirebaseConfigured) {
      void deleteDoc(doc(db, 'lessonPlans', id)).catch((e) =>
        console.warn('Firestore 수업지도안 삭제 참고:', e)
      );
    }
    return true;
  }

  // --- 관리자 온톨로지 편집 기능 ---
  addOrUpdateNode(node: CurriculumNode) {
    const index = this.curriculumNodes.findIndex((n) => n.id === node.id);
    if (index >= 0) {
      this.curriculumNodes[index] = node;
    } else {
      this.curriculumNodes.push(node);
    }
    safeStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(this.curriculumNodes));
    if (isFirebaseConfigured) {
      void setDoc(doc(db, 'curriculumNodes', encodeURIComponent(node.id)), node).catch(() => {});
    }
  }

  deleteNode(nodeId: string) {
    this.curriculumNodes = this.curriculumNodes.filter((n) => n.id !== nodeId);
    safeStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(this.curriculumNodes));
    if (isFirebaseConfigured) {
      void deleteDoc(doc(db, 'curriculumNodes', encodeURIComponent(nodeId))).catch(() => {});
    }
  }

  updateStrategy(strategy: ReadingStrategy) {
    const index = this.readingStrategies.findIndex((s) => s.id === strategy.id);
    if (index >= 0) {
      this.readingStrategies[index] = strategy;
      safeStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(this.readingStrategies));
      if (isFirebaseConfigured) {
        void setDoc(doc(db, 'readingStrategies', encodeURIComponent(strategy.id)), strategy).catch(() => {});
      }
    }
  }

  resetToDefault() {
    safeStorage.removeItem(STORAGE_KEYS.NODES);
    safeStorage.removeItem(STORAGE_KEYS.STRATEGIES);
    this.curriculumNodes = curriculumNodesData as CurriculumNode[];
    this.readingStrategies = readingStrategiesData as ReadingStrategy[];
  }
}

export const ontologyStore = new OntologyStore();
