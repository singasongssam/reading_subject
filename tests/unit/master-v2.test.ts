import { describe, it, expect } from 'vitest';
import {
  distributeMinutes,
  autoFitRemainder,
  summarizePhases,
  formatPhaseBanner,
  TIME_PROFILES,
} from '@/lib/time/distribute';
import { generateMaterialSetMock } from '@/lib/generators/material';
import { recommendTop3 } from '@/lib/strategy/recommend';
import { generateGagnePlanMock } from '@/lib/generators/gagnePlan';
import { generateQuiz } from '@/lib/generators/quiz';
import { CONCEPT_VISUALS, getConceptVisual } from '@/features/visuals/conceptVisuals';
import { ORGANIZER_STRATEGY_IDS, getOrganizerMeta } from '@/features/visuals/GraphicOrganizer';
import { ontologyStore } from '@/lib/data/ontologyStore';

describe('마스터 지침서 v2 핵심 엔진 검증', () => {
  describe('1. 16종 1:1 동적 개념 시각화 & 12대 그래픽 조직자', () => {
    it('사회 11개 영역 + 과학 5개 영역 총 16개 개념 시각화가 모두 등록되어 있어야 한다', () => {
      const keys = Object.keys(CONCEPT_VISUALS);
      expect(keys).toHaveLength(16);
      expect(getConceptVisual('Politics')?.prompts).toHaveLength(2);
      expect(getConceptVisual('Economics')?.title).toContain('수요·공급');
      expect(getConceptVisual('MotionEnergy')?.subjectId).toBe('science');
    });

    it('12대 KNU 독서전략 그래픽 조직자 메타데이터가 정상 조회되어야 한다', () => {
      expect(ORGANIZER_STRATEGY_IDS).toHaveLength(12);
      for (const id of ORGANIZER_STRATEGY_IDS) {
        expect(getOrganizerMeta(id).hasTemplate).toBe(true);
      }
    });
  });

  describe('2. 스마트 수업시간 자동 분배 계산기 (Step 4)', () => {
    const baseSlots = Array.from({ length: 9 }, (_, i) => ({
      seq: i + 1,
      minutes: 5,
      locked: false,
    }));

    it('3대 배분 프로파일(standard, reading, concept) 모두 총합 오차가 0이어야 한다', () => {
      for (const total of [40, 45, 50, 80, 90]) {
        for (const profileId of Object.keys(TIME_PROFILES) as Array<'standard' | 'reading' | 'concept'>) {
          const result = distributeMinutes(total, baseSlots, profileId);
          const sum = result.reduce((a, b) => a + b, 0);
          expect(sum).toBe(total);
        }
      }
    });

    it('특정 사태를 잠금(Lock)했을 때 잠금된 시간은 유지되고 나머지 사태에만 비례 배분되어야 한다', () => {
      const slotsWithLock = baseSlots.map((s) =>
        s.seq === 1 ? { ...s, minutes: 8, locked: true } : s.seq === 9 ? { ...s, minutes: 7, locked: true } : s
      );
      const dist = distributeMinutes(45, slotsWithLock, 'standard');
      expect(dist[0]).toBe(8);
      expect(dist[8]).toBe(7);
      expect(dist.reduce((a, b) => a + b, 0)).toBe(45);
    });

    it('수동 수정으로 발생한 오차를 autoFitRemainder가 0으로 즉시 보정해야 한다', () => {
      const manual = baseSlots.map((s) => ({ ...s, minutes: 4 })); // 합 36분 (9분 부족)
      const fitted = autoFitRemainder(45, manual);
      expect(fitted.reduce((a, b) => a + b, 0)).toBe(45);
      // 6사태에 흡수됨
      expect(fitted[5]).toBe(13);
    });

    it('단계별 시간 배너 포맷이 정확히 생성되어야 한다', () => {
      const slots = distributeMinutes(45, baseSlots, 'standard').map((m, i) => ({
        seq: i + 1,
        minutes: m,
      }));
      const summary = summarizePhases(slots);
      expect(summary.total).toBe(45);
      expect(formatPhaseBanner(slots)).toContain('총 시간: 45분');
    });
  });

  describe('3. 3수준 × 5장르 읽기자료 생성, 독서전략 추천, 가네 9사태 및 퀴즈', () => {
    const sampleCtx = {
      subjectId: 'social' as const,
      subjectName: '사회',
      areaId: 'Politics',
      areaLabel: '정치',
      coreIdeaId: 'DemocracyInstitutionsCoreIdea',
      coreIdeaText: '민주주의 이념을 실현하려면 민주적 의식과 제도가 필요하다.',
      elements: [
        { id: 'Democracy', label: '민주주의', category: 'KnowledgeUnderstanding' },
        { id: 'Elections', label: '선거', category: 'ProcessSkill' },
      ],
      grade: 2 as const,
    };

    it('3단계 수준(쉬움·보통·도전) 읽기자료와 초성 힌트 어휘, 3수준 문항이 생성되어야 한다', () => {
      const set = generateMaterialSetMock(sampleCtx, 'argument');
      expect(set.variants['쉬움'].paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(set.variants['보통'].glossary.length).toBeGreaterThanOrEqual(3);
      expect(set.variants['도전'].questions.map((q) => q.level)).toEqual(['이해', '추론', '비평']);
    });

    it('읽기 전·중·후 최적 전략 3종 추천과 가네 9사태 슬롯팅, 형성평가 퀴즈가 정상 생성되어야 한다', () => {
      const set = generateMaterialSetMock(sampleCtx, 'exposition');
      const rec = recommendTop3(
        ontologyStore.getReadingStrategies(),
        ontologyStore.getReadingFunctions(),
        {
          coreIdeaText: sampleCtx.coreIdeaText,
          elementLabels: sampleCtx.elements.map((e) => e.label),
          elementCategories: sampleCtx.elements.map((e) => e.category ?? ''),
          contentType: set.textType.contentType,
          format: set.textType.format,
          totalMinutes: 45,
        }
      );
      expect(rec.top).toHaveLength(3);

      const plan = generateGagnePlanMock({
        ctx: sampleCtx,
        material: set.variants['보통'],
        genreLabel: '설명문',
        strategies: [],
        visual: getConceptVisual('Politics'),
        gagneEvents: ontologyStore.getGagneEvents(),
        totalMinutes: 45,
        profileId: 'standard',
      });
      expect(plan.events).toHaveLength(9);
      expect(plan.events.reduce((a, e) => a + e.minutes, 0)).toBe(45);

      const quiz = generateQuiz(sampleCtx, set.variants['보통']);
      expect(quiz.length).toBeGreaterThanOrEqual(5);
    });
  });
});
