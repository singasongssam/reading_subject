import { describe, it, expect } from 'vitest';
import { idToVirtualEmail, virtualEmailToId, VIRTUAL_EMAIL_DOMAIN } from '@/lib/firebase/config';
import { MockProvider } from '@/lib/ai/mockProvider';

describe('Phase 0: 환경 및 기초 인프라 검증', () => {
  it('교사 ID -> 가상 이메일 변환 규칙이 올바르게 동작해야 한다', () => {
    const teacherId = 'kimtc01';
    const email = idToVirtualEmail(teacherId);
    expect(email).toBe(`kimtc01@${VIRTUAL_EMAIL_DOMAIN}`);
    expect(virtualEmailToId(email)).toBe('kimtc01');
  });

  it('대소문자 및 공백이 포함된 ID도 정규화되어야 한다', () => {
    const rawId = '  Teacher01  ';
    const email = idToVirtualEmail(rawId);
    expect(email).toBe(`teacher01@${VIRTUAL_EMAIL_DOMAIN}`);
    expect(virtualEmailToId(email)).toBe('teacher01');
  });

  it('오프라인 MockProvider가 정상적으로 읽기자료를 생성해야 한다', async () => {
    const provider = new MockProvider();
    const result = await provider.generateMaterial({
      subjectId: 'social',
      subjectName: '사회',
      nodeIds: ['node-1'],
      nodeLabels: ['민주주의'],
      grade: 2,
      charCount: 600,
      readingLevel: '보통',
      textType: {
        sourceMaterial: '단일 텍스트',
        structureNavigation: '정적',
        format: '연속적',
        contentType: '설명',
      },
      durationMinutes: 45,
    });

    expect(result.title).toContain('민주주의');
    expect(result.body.length).toBeGreaterThan(0);
    expect(result.glossary.length).toBeGreaterThan(0);
    expect(result.comprehensionQuestions.length).toBe(3);
    expect(result.model).toBe('Mock-Local-v1');
  });

  it('오프라인 MockProvider가 정상적으로 가네 9사태 지도안을 생성해야 한다', async () => {
    const provider = new MockProvider();
    const result = await provider.generateLessonPlan({
      subjectName: '과학',
      grade: 1,
      topic: '물질의 상태 변화',
      achievementStandards: [],
      learningObjective: '물질의 상태 변화를 이해한다.',
      materialTitle: '물질의 상태 변화',
      materialSummary: '고체, 액체, 기체의 성질',
      selectedStrategies: [
        { id: 'Strat_KWL', name: 'KWL', procedure: ['1단계: K', '2단계: W', '3단계: 정독', '4단계: L'] }
      ],
      durationMinutes: 45,
    });

    expect(result.events.length).toBe(9);
    expect(result.totalMinutes).toBe(45);
    expect(result.events[0].label).toBe('주의 획득');
    expect(result.events[8].label).toBe('파지와 전이 증진');
  });
});
