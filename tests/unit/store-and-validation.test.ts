import { describe, it, expect, beforeEach } from 'vitest';

// Node 환경에서 localStorage polyfill 보장
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage?.getItem) {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

import { ontologyStore } from '@/lib/data/ontologyStore';

describe('OntologyStore 및 수업 설계 유효성 검증', () => {
  beforeEach(() => {
    localStorage.clear();
    ontologyStore.resetToDefault();
  });

  describe('1. 온톨로지 기본 데이터 조회', () => {
    it('사회과와 과학과 교과 정보가 올바르게 로드되어야 한다', () => {
      const subjects = ontologyStore.getSubjects();
      expect(subjects).toHaveLength(2);
      expect(subjects.map((s) => s.id)).toEqual(expect.arrayContaining(['social', 'science']));
    });

    it('사회과와 과학과의 교육과정 노드가 100개 이상 등록되어 있어야 한다', () => {
      const socialNodes = ontologyStore.getCurriculumNodes('social');
      const scienceNodes = ontologyStore.getCurriculumNodes('science');
      expect(socialNodes.length).toBeGreaterThan(30);
      expect(scienceNodes.length).toBeGreaterThan(30);
      expect(ontologyStore.getCurriculumNodes().length).toBeGreaterThan(100);
    });

    it('가네 9사태가 9단계 순서대로 정렬되어 있어야 한다', () => {
      const events = ontologyStore.getGagneEvents();
      expect(events).toHaveLength(9);
      expect(events.map((e) => e.seq)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(events[0].label).toBe('주의집중');
      expect(events[8].label).toBe('파지와 전이');
    });

    it('독서기능 15개와 독서전략 50개 이상이 로드되어야 한다', () => {
      const funcs = ontologyStore.getReadingFunctions();
      const strats = ontologyStore.getReadingStrategies();
      expect(funcs.length).toBe(15);
      expect(strats.length).toBeGreaterThan(50);
    });

    it('텍스트 분류 4개 차원(재료, 구조, 형식, 유형)이 로드되어야 한다', () => {
      const types = ontologyStore.getTextTypes();
      expect(types).toHaveLength(4);
    });
  });

  describe('2. 읽기자료 및 지도안 아카이브 CRUD', () => {
    it('읽기자료를 저장하고 조회 및 삭제할 수 있어야 한다', () => {
      const sampleMaterial = {
        ownerUid: 'teacher01',
        ownerName: '김교사',
        subjectId: 'social',
        subjectName: '사회',
        nodeIds: ['soc_area_1'],
        nodeLabels: ['사회문화 현상'],
        title: '현대 사회의 문화 변용과 다양성',
        body: ['현대 사회에서는 다양한 문화가 융합되고 있습니다.'],
        glossary: [{ term: '문화 변용', meaning: '서로 다른 문화가 만나 변화하는 과정' }],
        comprehensionQuestions: [
          { question: '문화 변용의 사례를 찾아보세요.', answerHint: '다문화 음식 등', level: '이해' as const },
        ],
        grade: 2,
        durationMinutes: 45,
        readingLevel: '보통',
        textType: {
          sourceMaterial: '단일 텍스트',
          structureNavigation: '정적',
          format: '연속적',
          contentType: '설명',
        },
        ontologyVersion: 'v1.0.0',
        reviewedByTeacher: true,
      };

      const saved = ontologyStore.saveMaterial(sampleMaterial);
      expect(saved.id).toBeDefined();
      expect(saved.title).toBe('현대 사회의 문화 변용과 다양성');

      const retrieved = ontologyStore.getSavedMaterial(saved.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(saved.id);

      const teacherList = ontologyStore.getSavedMaterials('teacher01');
      expect(teacherList.some((m) => m.id === saved.id)).toBe(true);

      const deleted = ontologyStore.deleteMaterial(saved.id);
      expect(deleted).toBe(true);
      expect(ontologyStore.getSavedMaterial(saved.id)).toBeUndefined();
    });

    it('지도안을 저장하고 45분 시간 총합을 검증할 수 있어야 한다', () => {
      const samplePlan = {
        ownerUid: 'teacher01',
        ownerName: '김교사',
        materialId: 'mat_sample_1',
        subjectName: '과학',
        grade: 1,
        topic: '빛과 파동의 성질',
        title: '빛의 반사와 굴절을 활용한 수업지도안',
        unitOverview: '빛의 성질을 이해하고 굴절 현상을 관찰한다.',
        learningObjective: '빛의 굴절 법칙을 실험을 통해 설명할 수 있다.',
        totalMinutes: 45,
        selectedStrategies: [{ id: 'strat_predict', name: '예측하기', procedure: ['단서 찾기', '예측 서술'] }],
        events: [
          { seq: 1, label: '주의집중', purpose: '흥미 유발', phase: '도입' as const, teacherActivity: '영상 제시', studentActivity: '관찰', materialAndNotice: '', minutes: 5, assessment: '' },
          { seq: 2, label: '학습목표 제시', purpose: '목표 인지', phase: '도입' as const, teacherActivity: '목표 판서', studentActivity: '소리내어 읽기', materialAndNotice: '', minutes: 3, assessment: '' },
          { seq: 3, label: '선행학습 상기', purpose: '배경지식 활성화', phase: '도입' as const, teacherActivity: '질문', studentActivity: '답변', materialAndNotice: '', minutes: 4, assessment: '' },
          { seq: 4, label: '자극 제시', purpose: '읽기자료 제시', phase: '전개' as const, teacherActivity: '자료 배부', studentActivity: '정독', materialAndNotice: '읽기자료', minutes: 8, assessment: '' },
          { seq: 5, label: '학습안내 제공', purpose: '독서전략 안내', phase: '전개' as const, teacherActivity: '전략 시범', studentActivity: '활동지 작성', materialAndNotice: '활동지', minutes: 7, assessment: '' },
          { seq: 6, label: '수행 유도', purpose: '학생 탐구활동', phase: '전개' as const, teacherActivity: '순회 지도', studentActivity: '모둠 토의', materialAndNotice: '', minutes: 8, assessment: '' },
          { seq: 7, label: '피드백 제공', purpose: '오개념 교정', phase: '전개' as const, teacherActivity: '피드백', studentActivity: '수정', materialAndNotice: '', minutes: 4, assessment: '' },
          { seq: 8, label: '수행 평가', purpose: '형성평가', phase: '정리' as const, teacherActivity: '퀴즈 제시', studentActivity: '퀴즈 풀이', materialAndNotice: '', minutes: 4, assessment: '형성평가' },
          { seq: 9, label: '파지 및 전이 증진', purpose: '차시 예고 및 정리', phase: '정리' as const, teacherActivity: '정리 및 과제', studentActivity: '확인', materialAndNotice: '', minutes: 2, assessment: '' },
        ],
        evaluationPlan: {
          criteriaHigh: '빛의 굴절 현상을 정확하게 설명하고 일상 사례를 2가지 이상 제시함',
          criteriaMid: '빛의 굴절 현상을 기본적으로 설명함',
          criteriaLow: '도움이 필요함',
        },
        worksheetDraft: '빛의 진행 경로를 그려보세요.',
        ontologyVersion: 'v1.0.0',
        reviewedByTeacher: true,
      };

      // 총 시간 합계 검증
      const total = samplePlan.events.reduce((sum, e) => sum + e.minutes, 0);
      expect(total).toBe(45);

      const saved = ontologyStore.saveLessonPlan(samplePlan);
      expect(saved.id).toBeDefined();
      expect(saved.totalMinutes).toBe(45);

      const retrieved = ontologyStore.getSavedLessonPlan(saved.id);
      expect(retrieved?.title).toContain('빛의 반사와 굴절');

      ontologyStore.deleteLessonPlan(saved.id);
      expect(ontologyStore.getSavedLessonPlan(saved.id)).toBeUndefined();
    });
  });

  describe('3. 관리자 온톨로지 성취기준 추가 및 상태 갱신', () => {
    it('공식 성취기준을 신규 등록하면 등록 상태(registered)로 저장되어야 한다', () => {
      const newNode = {
        id: 'node_test_std_01',
        subjectId: 'social',
        type: 'standard' as const,
        label: '[10사01-01] 현대 사회의 특성을 분석한다',
        description: '현대 사회의 다양한 양상을 파악하고 특징을 설명한다.',
        parentIds: ['soc_area_1'],
        gradeBand: '고등학교(1~3학년)',
        standardCode: '10사01-01',
        standardText: '현대 사회의 다양한 양상을 파악하고 특징을 설명한다.',
        targetVerb: '설명한다',
        targetFunctionIds: ['func_explain'],
        status: 'registered' as const,
      };

      ontologyStore.addOrUpdateNode(newNode);
      const retrieved = ontologyStore.getNode('node_test_std_01');
      expect(retrieved).toBeDefined();
      expect(retrieved?.status).toBe('registered');
      expect(retrieved?.standardCode).toBe('10사01-01');

      ontologyStore.deleteNode('node_test_std_01');
      expect(ontologyStore.getNode('node_test_std_01')).toBeUndefined();
    });

    it('독서전략의 검토 상태(draft <-> reviewed)를 토글할 수 있어야 한다', () => {
      const strats = ontologyStore.getReadingStrategies();
      const firstStrat = strats[0];
      const originalStatus = firstStrat.reviewStatus;

      const updated = {
        ...firstStrat,
        reviewStatus: (originalStatus === 'reviewed' ? 'draft' : 'reviewed') as 'draft' | 'reviewed',
      };
      ontologyStore.updateStrategy(updated);

      const retrieved = ontologyStore.getReadingStrategies().find((s) => s.id === firstStrat.id);
      expect(retrieved?.reviewStatus).toBe(updated.reviewStatus);
    });
  });

  describe('4. 독서전략 다기준 추천 점수 산출 로직 검증', () => {
    it('성취기준 독서기능과 가네 사태가 일치하는 전략이 가장 높은 점수를 받아야 한다', () => {
      const strats = ontologyStore.getReadingStrategies();
      // 가네 4사태(자극 제시)와 5사태(학습안내 제공)에 부합하는 전략 필터링
      const targetEventSeqs = [4, 5];
      const targetFunctionId = strats[0]?.functionIds[0];

      // 점수 계산 함수 시뮬레이션
      const scored = strats.map((s) => {
        let score = 0;
        if (targetFunctionId && s.functionIds.includes(targetFunctionId)) {
          score += 40;
        }
        const eventMatchCount = s.recommendedEvents.filter((ev) => targetEventSeqs.includes(ev)).length;
        score += eventMatchCount * 15;
        if (s.reviewStatus === 'reviewed') {
          score += 5;
        }
        return { strategy: s, score };
      });

      scored.sort((a, b) => b.score - a.score);

      expect(scored.length).toBeGreaterThan(0);
      expect(scored[0].score).toBeGreaterThan(0);
      // 상위권 전략은 독서기능이나 사태가 매칭된 것
      expect(
        scored[0].strategy.functionIds.includes(targetFunctionId!) ||
          scored[0].strategy.recommendedEvents.some((ev) => targetEventSeqs.includes(ev))
      ).toBe(true);
    });
  });
});
