import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 1: 온톨로지 컴파일 및 확장 스키마 검증', () => {
  const compiledDir = 'data/compiled';

  it('subjects.json이 존재하며 사회/과학 2개 과목이 정상 적재되어야 한다', () => {
    const filePath = path.join(compiledDir, 'subjects.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(data.length).toBe(2);

    const ids = data.map((s: any) => s.id);
    expect(ids).toContain('social');
    expect(ids).toContain('science');

    const social = data.find((s: any) => s.id === 'social');
    expect(social.competencies.length).toBe(5);
    expect(social.areaIds.length).toBe(11);

    const science = data.find((s: any) => s.id === 'science');
    expect(science.competencies.length).toBe(5);
    expect(science.areaIds.length).toBe(5);
  });

  it('curriculum-nodes.json이 계층 구조(영역, 아이디어, 요소)를 정확히 반영해야 한다', () => {
    const filePath = path.join(compiledDir, 'curriculum-nodes.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const nodes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(nodes.length).toBe(144);

    const areas = nodes.filter((n: any) => n.type === 'area');
    expect(areas.length).toBe(16); // 사회 11 + 과학 5

    const coreIdeas = nodes.filter((n: any) => n.type === 'coreIdea');
    expect(coreIdeas.length).toBe(46); // 사회 24 + 과학 22

    const elements = nodes.filter((n: any) => n.type === 'element');
    expect(elements.length).toBe(82); // 사회 42 + 과학 40

    // 모든 노드는 유효한 부모 ID를 가져야 함
    nodes.forEach((n: any) => {
      expect(n.parentIds.length).toBeGreaterThan(0);
      expect(n.label).toBeDefined();
      expect(n.label.length).toBeGreaterThan(0);
      expect(n.status).toBe('registered');
    });
  });

  it('gagne-events.json이 가네 9사태(1~9)와 도입/전개/정리 3단계를 갖추어야 한다', () => {
    const filePath = path.join(compiledDir, 'gagne-events.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const events = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(events.length).toBe(9);

    const seqs = events.map((e: any) => e.seq);
    expect(seqs).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(events[0].phase).toBe('도입');
    expect(events[0].label).toBe('주의집중');

    expect(events[3].phase).toBe('전개');
    expect(events[3].label).toBe('학습자료 제시');

    expect(events[8].phase).toBe('정리');
    expect(events[8].label).toBe('파지와 전이');
  });

  it('reading-functions.json에 15개 독서기능과 과정동사가 매핑되어야 한다', () => {
    const filePath = path.join(compiledDir, 'reading-functions.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const funcs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(funcs.length).toBe(15);

    const labels = funcs.map((f: any) => f.label);
    expect(labels).toContain('이해');
    expect(labels).toContain('탐색');
    expect(labels).toContain('추론');
    expect(labels).toContain('예측');
    expect(labels).toContain('비교');
    expect(labels).toContain('대조');
    expect(labels).toContain('조절(메타인지)');

    const totalVerbs = funcs.reduce((acc: number, f: any) => acc + f.verbs.length, 0);
    expect(totalVerbs).toBeGreaterThanOrEqual(70);
  });

  it('reading-strategies.json에 54개 전략과 실행 절차가 포함되어야 한다', () => {
    const filePath = path.join(compiledDir, 'reading-strategies.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const strats = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(strats.length).toBe(54);

    const kwl = strats.find((s: any) => s.id === 'Strat_KWL');
    expect(kwl).toBeDefined();
    expect(kwl.procedure.length).toBe(4);
    expect(kwl.reviewStatus).toBe('reviewed');
    expect(kwl.suitableTextTypes).toContain('설명');

    // 모든 전략에 절차(procedure)와 적합 텍스트 유형이 정의되어야 함
    strats.forEach((s: any) => {
      expect(s.procedure.length).toBeGreaterThanOrEqual(3);
      expect(s.suitableTextTypes.length).toBeGreaterThan(0);
      expect(s.minutes).toBeGreaterThan(0);
    });
  });

  it('text-types.json이 4개 분류 기준과 13개 세부 속성을 갖추어야 한다', () => {
    const filePath = path.join(compiledDir, 'text-types.json');
    expect(fs.existsSync(filePath)).toBe(true);
    const categories = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(categories.length).toBe(4);

    const catLabels = categories.map((c: any) => c.label);
    expect(catLabels).toContain('자료');
    expect(catLabels).toContain('조직과 탐색');
    expect(catLabels).toContain('체재');
    expect(catLabels).toContain('유형(내용)');

    const totalAttrs = categories.reduce((acc: number, c: any) => acc + c.attributes.length, 0);
    expect(totalAttrs).toBe(13);
  });
});
