import type {
  ComprehensionQuestion,
  CurriculumContext,
  DataTable,
  GenreId,
  GlossaryItem,
  MaterialSet,
  MaterialVariant,
  ReadingLevel,
} from '@/lib/domain/types';
import { getGenre, describeTextAttribute } from '@/lib/text/genres';
import { josa, stripPeriod, toChoseong } from '@/lib/text/korean';

/**
 * 오프라인 Mock 읽기자료 생성기
 * - 교육과정 사실은 TTL 원문(영역 라벨, 핵심 아이디어 설명, 내용 요소 라벨)만 사용한다.
 * - 임의의 통계 수치·성취기준 문구는 생성하지 않는다. (통계 자리는 교사 입력 안내)
 */

export const ELEMENT_CATEGORY_KO: Record<string, string> = {
  KnowledgeUnderstanding: '지식·이해',
  ProcessSkill: '과정·기능',
  ValueAttitude: '가치·태도',
};

const LEVELS: ReadingLevel[] = ['쉬움', '보통', '도전'];

interface Vars {
  S: string;
  A: string;
  CI: string;
  E: string[];
  E1: string;
  E2: string;
  Elist: string;
  citizen: string;
}

function vars(ctx: CurriculumContext): Vars {
  const E = ctx.elements.length > 0 ? ctx.elements.map((e) => e.label) : [ctx.areaLabel];
  return {
    S: ctx.subjectName,
    A: ctx.areaLabel,
    CI: stripPeriod(ctx.coreIdeaText || `${ctx.areaLabel} 영역의 핵심 아이디어`),
    E,
    E1: E[0],
    E2: E[1] ?? E[0],
    Elist: E.slice(0, 3).join('·'),
    citizen: ctx.subjectId === 'science' ? '과학적 소양을 갖춘 시민' : '책임 있는 민주 시민',
  };
}

const ORDINAL = ['먼저', '다음으로', '또한', '아울러'];

function elementParagraphs(v: Vars, level: ReadingLevel): string[] {
  return v.E.slice(0, level === '쉬움' ? 2 : 3).map((e, i) => {
    const lead = ORDINAL[i] ?? '그리고';
    if (level === '쉬움') {
      return `${lead} '${e}'에 대해 알아봅시다. ${josa(e, '은/는')} ${v.A} 영역에서 배우는 중요한 내용입니다. 우리 생활 속에서도 ${josa(e, '과/와')} 관련된 모습을 쉽게 찾을 수 있습니다.`;
    }
    if (level === '보통') {
      return `${lead} '${e}'에 대해 살펴보자. ${josa(e, '은/는')} ${v.A} 영역에서 다루는 중요한 내용 요소로, 앞의 핵심 아이디어를 구체적인 사례와 연결해 주는 역할을 한다. 뉴스나 일상 경험 속에서도 ${josa(e, '과/와')} 관련된 장면을 찾아볼 수 있으며, 그 장면을 핵심 아이디어에 비추어 해석하는 것이 이 글을 읽는 목적이다.`;
    }
    return `${lead} '${e}'의 개념적 의미를 검토해 보자. ${josa(e, '은/는')} ${v.A} 영역의 핵심 아이디어를 구체적 맥락 속에서 작동하게 만드는 내용 요소이다. 따라서 ${josa(e, '을/를')} 단편적 사실로 암기하기보다, 그것이 다른 요소와 어떤 구조적 관계를 맺고 어떤 조건에서 변화하는지를 분석할 때 비로소 깊이 있는 이해에 도달할 수 있다.`;
  });
}

function genExposition(v: Vars, level: ReadingLevel): Omit<MaterialVariant, 'glossary' | 'questions' | 'level'> {
  const intro =
    level === '쉬움'
      ? `${v.S} 시간에는 ${v.A} 영역을 배웁니다. 이 영역의 핵심 아이디어는 "${v.CI}."입니다. 오늘은 ${josa(v.Elist, '을/를')} 중심으로 이 생각을 함께 알아봅시다.`
      : level === '보통'
        ? `우리 주변에서 일어나는 많은 일은 ${v.A} 영역의 지식으로 설명할 수 있다. ${v.S} 교과는 이를 이해하기 위한 핵심 아이디어로 "${v.CI}."라는 생각을 제시한다. 이 글에서는 ${josa(v.Elist, '을/를')} 중심으로 이 아이디어가 무엇을 뜻하는지 살펴본다.`
        : `${v.S} 교과의 ${v.A} 영역은 "${v.CI}."라는 핵심 아이디어를 축으로 구성된다. 핵심 아이디어는 개별 사실들을 하나의 설명 틀로 묶어 주는 일반화된 진술이므로, 이를 이해한다는 것은 여러 현상에 공통으로 작동하는 원리를 파악한다는 뜻이다. 이 글은 ${josa(v.Elist, '을/를')} 분석 대상으로 삼아 그 원리를 구조적으로 설명한다.`;
  const outro =
    level === '쉬움'
      ? `정리하면, ${josa(v.Elist, '은/는')} 모두 "${v.CI}"라는 생각과 이어져 있습니다. 글을 다 읽은 뒤 각 내용을 내 말로 한 문장씩 정리해 봅시다.`
      : level === '보통'
        ? `이처럼 ${josa(v.Elist, '은/는')} 서로 떨어진 지식이 아니라 "${v.CI}"라는 하나의 큰 생각 아래에서 연결된다. 글을 읽은 뒤에는 각 요소가 핵심 아이디어와 어떻게 관련되는지 자신의 말로 정리해 보자.`
        : `결론적으로 ${josa(v.Elist, '은/는')} "${v.CI}"라는 일반화를 서로 다른 측면에서 뒷받침한다. 독자는 각 요소 사이의 인과·비교 관계를 도식화하고, 이 원리가 새로운 상황에도 적용될 수 있는지를 비판적으로 검토해 볼 필요가 있다.`;
  return {
    title: `${v.A}: ${v.Elist}${level === '도전' ? '의 구조적 이해' : ' 알아보기'}`,
    paragraphs: [intro, ...elementParagraphs(v, level), outro],
  };
}

function genArgument(v: Vars, level: ReadingLevel): Omit<MaterialVariant, 'glossary' | 'questions' | 'level'> {
  const claim = `${josa(v.E1, '을/를')} 깊이 이해하는 것은 ${v.citizen}에게 꼭 필요한 역량이다`;
  const p: string[] = [];
  p.push(
    level === '쉬움'
      ? `나는 ${claim.replace('이다', '라고 생각합니다')}. 그 이유를 두 가지로 말하겠습니다.`
      : `${v.A} 영역을 배우는 이유는 무엇일까? 필자는 ${claim}고 주장한다.`
  );
  p.push(
    level === '쉬움'
      ? `첫째, ${v.S} 교과의 핵심 아이디어는 "${v.CI}."입니다. ${josa(v.E1, '을/를')} 알면 이 생각을 더 잘 이해할 수 있습니다.`
      : `첫째 근거는 교과의 핵심 아이디어에 있다. ${v.S} 교과는 "${v.CI}."라고 설명한다. ${josa(v.E1, '은/는')} 이 아이디어를 구체적으로 보여 주는 내용 요소이므로, ${josa(v.E1, '을/를')} 이해하지 못하면 핵심 아이디어도 추상적인 문장에 머무르게 된다.`
  );
  p.push(
    level === '쉬움'
      ? `둘째, ${josa(v.E1, '은/는')} 우리 생활과 관련이 깊습니다. 생활 속 문제를 해결할 때 이 지식을 사용할 수 있습니다.`
      : `둘째, ${josa(v.E1, '은/는')} 생활 속 문제를 판단하는 기준이 된다. 우리가 뉴스를 읽거나 공동체의 결정에 참여할 때, ${josa(v.E2, '과/와')} 같은 관련 지식이 있어야 정보를 비판적으로 따져 보고 합리적으로 선택할 수 있다.`
  );
  if (level !== '쉬움') {
    p.push(
      `물론 ${josa(v.E1, '은/는')} 전문가가 다룰 문제이므로 학생이 깊이 알 필요는 없다는 반론도 있다. 그러나 전문가의 판단을 이해하고 평가하는 것 역시 시민의 몫이다. 기초 개념을 갖춘 사람만이 전문가의 설명이 타당한지 질문할 수 있다.`
    );
  }
  if (level === '도전') {
    p.push(
      `더 나아가 ${v.A} 영역의 지식은 개인의 판단을 넘어 공동체의 의사 결정 구조와 맞닿아 있다. 핵심 아이디어가 제시하는 원리를 근거로 삼을 때, 우리는 감정이나 다수의 의견이 아닌 논리적 정당성에 기초하여 토론할 수 있다.`
    );
  }
  p.push(
    level === '쉬움'
      ? `그러므로 우리는 ${josa(v.E1, '을/를')} 열심히 배워야 합니다.`
      : `따라서 ${josa(v.E1, '을/를')} 배우는 일은 시험을 위한 암기가 아니라, ${v.citizen}로 살아가기 위한 준비이다. 지금 배우는 개념 하나하나가 앞으로의 판단을 지탱하는 근거가 될 것이다.`
  );
  return { title: `왜 ${josa(v.E1, '을/를')} 배워야 하는가`, paragraphs: p };
}

function genInfographic(v: Vars, level: ReadingLevel, ctx: CurriculumContext): Omit<MaterialVariant, 'glossary' | 'questions' | 'level'> {
  const table: DataTable = {
    caption: `[표] ${v.A} 영역 핵심 개념 구조표`,
    headers: ['내용 요소', '요소 구분', '핵심 아이디어와의 관계', '생활 속 탐구 질문'],
    rows: ctx.elements.slice(0, 4).map((e) => [
      e.label,
      ELEMENT_CATEGORY_KO[e.category ?? ''] ?? '내용 요소',
      `핵심 아이디어를 구체화하는 요소`,
      `${josa(e.label, '은/는')} 내 생활과 어떻게 연결될까?`,
    ]),
  };
  if (table.rows.length === 0) table.rows.push([v.A, '내용 영역', '핵심 아이디어의 상위 범주', '이 영역은 왜 중요할까?']);
  const p = [
    level === '쉬움'
      ? `이 자료는 글과 표가 함께 있는 자료입니다. 먼저 글을 읽고, 아래 표에서 ${josa(v.A, '과/와')} 관련된 내용을 찾아봅시다.`
      : `이 자료는 문단으로 된 글과 표가 함께 제시된 혼합 텍스트이다. 혼합 텍스트는 ${describeTextAttribute('혼합적') || '연속적 요소와 비연속적 요소를 모두 포함한 텍스트'}이므로, 글과 표를 번갈아 읽으며 정보를 연결해야 한다.`,
    level === '도전'
      ? `${v.A} 영역의 핵심 아이디어는 "${v.CI}."이다. 아래 구조표는 이 일반화를 구성하는 내용 요소들을 범주별로 배열한 것으로, 각 요소가 지식·이해, 과정·기능, 가치·태도 중 어디에 속하는지에 따라 학습 방식이 달라진다는 점에 주목할 필요가 있다.`
      : `${v.A} 영역의 핵심 아이디어는 "${v.CI}."입니다. 표에는 이 생각과 관련된 내용 요소 ${table.rows.length}가지가 정리되어 있습니다.`,
    level === '쉬움'
      ? `표의 마지막 칸에 있는 질문에 답을 생각해 보세요.`
      : `표의 '생활 속 탐구 질문' 칸은 각 요소를 실제 사례와 연결하기 위한 출발점이다. 질문에 답하려면 통계·그래프와 같은 근거 자료가 필요하다.`,
    `※ 교사 안내: 통계 수치는 임의로 만들지 않았습니다. 수업 전 통계청(KOSIS) 등 공신력 있는 출처의 최신 자료를 표 아래에 덧붙여 활용하세요.`,
  ];
  return { title: `한눈에 보는 ${v.A}: ${v.Elist}`, paragraphs: p, table };
}

function genReport(v: Vars, level: ReadingLevel): Omit<MaterialVariant, 'glossary' | 'questions' | 'level'> {
  const p = [
    `1. 탐구 주제: ${josa(v.Elist, '을/를')} 통해 본 ${v.A}`,
    level === '쉬움'
      ? `2. 탐구 동기: ${v.S} 시간에 "${v.CI}."라는 내용을 배웠다. 이 말이 실제로 맞는지 알아보고 싶어서 탐구를 시작했다.`
      : `2. 탐구 동기: ${v.S} 수업에서 "${v.CI}."라는 핵심 아이디어를 배웠다. 우리 모둠은 이 아이디어가 실제 생활 속 사례에서도 확인되는지 궁금하여 탐구를 계획하였다.`,
    level === '쉬움'
      ? `3. 탐구 방법: 교과서와 도서관 책을 읽고, 인터넷에서 믿을 만한 자료를 찾았다.`
      : `3. 탐구 방법: 먼저 교과서와 학교도서관 자료로 개념을 정리하였다. 이어서 공공기관 누리집 등 신뢰할 수 있는 출처에서 관련 사례를 수집하고, 모둠 토의를 통해 핵심 아이디어와의 관계를 분석하였다.`,
    ...v.E.slice(0, level === '쉬움' ? 2 : 3).map(
      (e, i) =>
        `4-${i + 1}. 탐구 내용 — ${e}: ${
          level === '쉬움'
            ? `${josa(e, '은/는')} ${v.A} 영역에서 중요한 내용이었다. 생활 속 사례를 찾아 정리하였다.`
            : `${josa(e, '은/는')} 핵심 아이디어를 구체적으로 보여 주는 요소였다. 수집한 사례를 '원인–과정–결과' 순서로 정리하자 ${josa(e, '과/와')} 핵심 아이디어의 관계가 분명하게 드러났다.`
        }`
    ),
    level === '도전'
      ? `5. 결론 및 성찰: 탐구 결과 각 내용 요소는 핵심 아이디어를 서로 다른 측면에서 뒷받침하였다. 다만 사례 수가 제한적이었으므로, 후속 탐구에서는 출처를 다양화하고 반대 사례도 함께 검토하여 일반화의 타당성을 높일 필요가 있다.`
      : `5. 결론 및 느낀 점: 탐구를 통해 "${v.CI}"라는 말의 의미를 사례로 확인할 수 있었다. 앞으로 뉴스를 볼 때도 배운 개념과 연결해 생각해 보고 싶다.`,
  ];
  return {
    title: `[탐구 보고서] ${v.A} — ${v.E1}`,
    paragraphs: p,
    table: {
      caption: '[표] 탐구 진행 과정',
      headers: ['단계', '활동', '산출물'],
      rows: [
        ['계획', '탐구 주제와 질문 정하기', '탐구 계획서'],
        ['조사', '도서·공공기관 자료 수집', '자료 목록(출처 포함)'],
        ['분석', '핵심 아이디어와 사례 연결', '분석표'],
        ['정리', '결론 도출 및 성찰', '탐구 보고서'],
      ],
    },
  };
}

function genDebate(v: Vars, level: ReadingLevel, ctx: CurriculumContext): Omit<MaterialVariant, 'glossary' | 'questions' | 'level'> {
  const topic =
    ctx.subjectId === 'science'
      ? `${josa(v.E1, '과/와')} 관련된 과학기술은 사회적 합의보다 활용을 먼저 서둘러야 한다`
      : `${josa(v.E1, '과/와')} 관련된 문제는 개인의 선택보다 공동체의 제도로 해결해야 한다`;
  const p = [
    `[토론 주제] ${topic}.`,
    `[글 가] 찬성 측 — ${
      level === '쉬움'
        ? `저는 찬성합니다. ${v.S} 시간에 배운 것처럼 "${v.CI}." 그래서 빠르고 함께하는 해결이 필요합니다.`
        : `찬성 측은 핵심 아이디어 "${v.CI}."를 근거로 든다. ${josa(v.E1, '은/는')} 한 개인의 노력만으로 결과가 달라지기 어려운 문제이므로, 공동의 기준과 신속한 실행이 있어야 효과를 거둘 수 있다는 것이다.`
    }`,
    level === '도전'
      ? `찬성 측은 또한 결정을 미룰 때 발생하는 기회비용을 강조한다. 문제를 방치하는 동안 피해가 누적되고, 나중에 해결하려면 더 큰 사회적 비용이 든다는 논리이다.`
      : '',
    `[글 나] 반대 측 — ${
      level === '쉬움'
        ? `저는 반대합니다. 사람마다 생각이 다르기 때문에 충분히 이야기를 나눈 뒤에 결정해야 합니다.`
        : `반대 측은 ${josa(v.E2, '과/와')} 같은 관련 요소를 함께 고려해야 한다고 본다. 성급한 결정은 다양한 이해관계와 예상하지 못한 부작용을 놓칠 수 있으므로, 충분한 정보 공개와 숙의를 거쳐야 한다는 입장이다.`
    }`,
    level === '도전'
      ? `반대 측은 절차적 정당성이 결과의 수용성을 높인다고 주장한다. 합의 없이 추진된 정책은 단기적으로 효율적으로 보이더라도 장기적으로 갈등을 키울 수 있다는 것이다.`
      : '',
    level === '쉬움'
      ? `두 글을 읽고, 어느 쪽 의견이 더 설득력 있는지 생각해 봅시다.`
      : `두 글은 같은 핵심 아이디어를 다르게 해석하고 있다. 독자는 각 주장의 근거가 타당한지, 근거가 주장을 충분히 뒷받침하는지를 따져 보아야 한다.`,
  ].filter(Boolean);
  return { title: `[찬반 토론] ${topic}`, paragraphs: p };
}

function glossaryFor(v: Vars, ctx: CurriculumContext, level: ReadingLevel, genreId: GenreId): GlossaryItem[] {
  const items: GlossaryItem[] = [];
  ctx.elements.slice(0, level === '쉬움' ? 3 : 4).forEach((e) => {
    const cat = ELEMENT_CATEGORY_KO[e.category ?? ''] ?? '내용 요소';
    items.push({
      term: e.label,
      meaning:
        level === '쉬움'
          ? `${v.A} 영역에서 배우는 ${cat} 내용`
          : `${v.A} 영역의 ${cat} 내용 요소로, 핵심 아이디어를 구체적으로 이해하게 해 주는 개념`,
      hint: toChoseong(e.label),
    });
  });
  items.push({
    term: '핵심 아이디어',
    meaning: '교과에서 가장 중요하게 다루는 일반화된 큰 생각으로, 여러 내용 요소를 하나로 묶어 준다',
    hint: toChoseong('핵심 아이디어'),
  });
  const genreTerm: Record<GenreId, [string, string]> = {
    argument: ['근거', '주장이 옳다는 것을 뒷받침하는 이유나 자료'],
    exposition: ['개념', '여러 사례에서 공통된 특징을 뽑아 일반화한 생각'],
    infographic: ['비연속 텍스트', describeTextAttribute('비연속적') || '표·그래프·다이어그램 등으로 구성된 텍스트'],
    report: ['탐구', '질문을 세우고 자료를 모아 분석하여 결론을 내리는 과정'],
    debate: ['반론', '상대의 주장에 대하여 반대하는 의견과 그 근거'],
  };
  const [t, m] = genreTerm[genreId];
  items.push({ term: t, meaning: m, hint: toChoseong(t) });
  if (level === '도전') {
    items.push({ term: '일반화', meaning: '개별 사례에서 공통점을 찾아 보편적인 원리로 정리하는 사고 과정', hint: toChoseong('일반화') });
  }
  return items;
}

function questionsFor(v: Vars, genreId: GenreId, level: ReadingLevel): ComprehensionQuestion[] {
  const critique: Record<GenreId, string> = {
    argument: '글쓴이의 주장에 동의하는지 판단하고, 그 이유를 글의 근거와 함께 쓰시오.',
    exposition: `이 글의 설명 방식이 '${v.E1}'을(를) 이해하는 데 효과적이었는지 평가하고, 보완할 점을 제안하시오.`,
    infographic: '표에 제시된 정보만으로 핵심 아이디어를 설명하기에 충분한지 평가하고, 추가로 필요한 자료를 제안하시오.',
    report: '보고서의 탐구 방법과 결론이 타당한지 평가하고, 더 신뢰할 수 있는 탐구가 되기 위한 방법을 제안하시오.',
    debate: '두 글 중 더 설득력 있는 쪽을 고르고, 근거의 타당성을 기준으로 그 이유를 쓰시오.',
  };
  return [
    {
      level: '이해',
      kind: '사실 확인',
      question: `글에서 제시한 ${v.A} 영역의 핵심 아이디어를 찾아 쓰시오.`,
      answerHint: `"${v.CI}."`,
    },
    {
      level: '추론',
      kind: '인과관계',
      question:
        level === '쉬움'
          ? `'${v.E1}'이(가) 핵심 아이디어와 이어지는 까닭을 글에서 찾아 쓰시오.`
          : `'${v.E1}'이(가) 핵심 아이디어를 뒷받침하는 이유를 원인과 결과의 관계로 추론하여 설명하시오.`,
      answerHint: `${josa(v.E1, '이/가')} 핵심 아이디어의 원리를 구체적 사례로 보여 준다는 점을 근거로 서술`,
    },
    {
      level: '비평',
      kind: '가치 평가',
      question: critique[genreId],
      answerHint: '자신의 판단 + 글 속 근거 1개 이상 + 대안 또는 보완점 제시',
    },
  ];
}

export function generateMaterialSetMock(ctx: CurriculumContext, genreId: GenreId): MaterialSet {
  const v = vars(ctx);
  const genre = getGenre(genreId);
  const variants = {} as Record<ReadingLevel, MaterialVariant>;
  for (const level of LEVELS) {
    let base: Omit<MaterialVariant, 'glossary' | 'questions' | 'level'>;
    switch (genreId) {
      case 'argument':
        base = genArgument(v, level);
        break;
      case 'infographic':
        base = genInfographic(v, level, ctx);
        break;
      case 'report':
        base = genReport(v, level);
        break;
      case 'debate':
        base = genDebate(v, level, ctx);
        break;
      default:
        base = genExposition(v, level);
    }
    variants[level] = {
      level,
      ...base,
      glossary: glossaryFor(v, ctx, level, genreId),
      questions: questionsFor(v, genreId, level),
    };
  }
  return {
    genreId,
    textType: genre.textType,
    variants,
    sourceNote: `근거: ${ctx.subjectName}과.ttl — 영역 「${ctx.areaLabel}」, 핵심 아이디어, 내용 요소 ${ctx.elements.length}개 / text.ttl — ${genre.textType.format}·${genre.textType.contentType}`,
    model: 'Mock-Local-v2',
    generatedAt: new Date().toISOString(),
  };
}
