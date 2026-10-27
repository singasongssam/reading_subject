import {
  AiProvider,
  MaterialRequest,
  MaterialResult,
  StrategyRequest,
  StrategyResult,
  LessonPlanRequest,
  LessonPlanResult,
  StrategyRecommendation,
  LessonPlanEvent,
} from './types';
import type { CurriculumContext, GenreId, MaterialSet } from '@/lib/domain/types';
import { generateMaterialSetMock } from '@/lib/generators/material';
import { generateGagnePlanMock, type PlanInput, type PlanOutput } from '@/lib/generators/gagnePlan';

export class MockProvider implements AiProvider {
  readonly name: string = 'Mock-Local-v2';

  /** v2: 5대 장르 × 3수준 읽기자료 세트 생성 (TTL 원문 기반 템플릿) */
  async generateMaterialSet(ctx: CurriculumContext, genreId: GenreId): Promise<MaterialSet> {
    await new Promise((r) => setTimeout(r, 250));
    return generateMaterialSetMock(ctx, genreId);
  }

  /** v2: 가네 9사태 슬롯팅 + 시간 분배 + 루브릭 */
  async composeGagnePlan(input: PlanInput): Promise<PlanOutput> {
    await new Promise((r) => setTimeout(r, 200));
    return generateGagnePlanMock(input);
  }

  async generateMaterial(input: MaterialRequest): Promise<MaterialResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const topic = input.nodeLabels.join(', ') || '교과 핵심 개념';
    const isScience = input.subjectId.includes('science') || input.subjectName.includes('과학');

    const title = isScience
      ? `[과학 탐구] 일상 속에서 발견하는 ${topic}의 원리`
      : `[사회 탐구] 우리 삶과 밀접한 ${topic} 이야기`;

    const bodyParagraphs = isScience
      ? [
          `${topic}은(는) 우리가 살아가는 자연 환경과 일상생활의 여러 현상을 설명하는 매우 중요한 과학적 개념입니다. 주변을 유심히 관찰해 보면 이러한 원리가 작동하는 다양한 사례를 쉽게 발견할 수 있습니다.`,
          `과학자들은 다양한 실험과 관찰을 통해 ${topic}의 규칙성을 발견하고 이를 체계적인 법칙으로 정리하였습니다. 예를 들어, 온도나 압력, 또는 힘과 에너지가 상호작용하는 과정에서 이 개념은 핵심적인 역할을 담당합니다.`,
          `이러한 과학적 지식은 단순히 교과서 속에 머무르지 않고, 오늘날 친환경 에너지 기술, 첨단 산업, 그리고 인류의 안전을 지키는 다양한 기술적 혁신으로 이어지고 있습니다.`,
        ]
      : [
          `우리가 살아가는 현대 사회는 다양한 사회적 관계와 제도를 바탕으로 유지됩니다. 특히 ${topic}은(는) 시민들이 공동체 속에서 합리적인 의사결정을 내리고 서로 협력하는 데 필수적인 기초 지식을 제공합니다.`,
          `역사적으로도 ${topic}에 대한 사회적 논의와 제도의 발전은 사회 구성원들의 권리를 신장하고 갈등을 평화적으로 해결하는 밑거름이 되어 왔습니다. 지역 사회와 국가, 나아가 지구촌 공동체는 이를 통해 상호작용합니다.`,
          `오늘날 우리는 변화하는 세계 속에서 ${topic}의 가치를 새롭게 인식하고, 정의롭고 지속가능한 사회를 만들기 위해 능동적인 시민으로서 참여하고 실천하는 태도를 갖추어야 합니다.`,
        ];

    const glossary = isScience
      ? [
          { term: '상태 변화', meaning: '물질이 온도나 압력에 따라 고체, 액체, 기체로 형태가 변하는 현상' },
          { term: '에너지 보존', meaning: '에너지는 형태가 바뀔 뿐 전체 양은 일정하게 보존된다는 법칙' },
          { term: '상호작용', meaning: '둘 이상의 물체나 계가 서로에게 힘이나 영향을 주고받는 작용' },
        ]
      : [
          { term: '공동체', meaning: '공통의 가치나 목표를 공유하며 유대감을 가지고 살아가는 사람들의 집단' },
          { term: '시민성', meaning: '민주 사회의 주권자로서 권리를 행사하고 의무를 다하는 자질과 태도' },
          { term: '지속가능성', meaning: '현재 세대의 필요를 충족하면서 미래 세대의 가능성을 해치지 않는 발전 방향' },
        ];

    const comprehensionQuestions = [
      {
        question: `본문에서 설명하는 '${topic}'의 핵심적인 특징은 무엇인가요?`,
        answerHint: '본문 1~2문단의 핵심 서술을 바탕으로 주요 개념을 파악하여 설명합니다.',
        level: '기초' as const,
      },
      {
        question: `글쓴이가 제시한 ${topic}의 구체적인 일상적 사례나 적용 분야를 찾아 요약해 보세요.`,
        answerHint: '본문 2~3문단에 제시된 기술적 또는 사회적 적용 사례를 연결하여 정리합니다.',
        level: '이해' as const,
      },
      {
        question: `이 글을 바탕으로, 우리 학교나 일상생활에서 '${topic}'을(를) 긍정적으로 활용하거나 실천할 수 있는 방안을 제안해 보세요.`,
        answerHint: '학생 자신의 경험과 지식을 결합하여 창의적이고 실천적인 대안을 제시합니다.',
        level: '심화' as const,
      },
    ];

    return {
      title,
      body: bodyParagraphs,
      glossary,
      comprehensionQuestions,
      sourceNote: 'AI 생성 읽기자료(Mock) — 수업 활용 전 교사 검토 필요',
      alignment: {
        nodeIds: input.nodeIds,
        standardCodes: input.standardCodes || [],
      },
      model: 'Mock-Local-v1',
      promptVersion: 'material-v1.0',
    };
  }

  async recommendStrategies(input: StrategyRequest): Promise<StrategyResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const recommendations: StrategyRecommendation[] = [
      {
        strategyId: 'Strat_KWL',
        name: 'KWL',
        functionName: '탐색 / 예측 / 조절',
        score: input.targetFunctionName?.includes('탐색') ? 8 : 6,
        reason: '학습 전 알고 있는 것(K)과 알고 싶은 것(W)을 정리하고, 읽기 후 배운 것(L)을 점검하는 데 최적화되어 있습니다.',
        procedure: [
          '1단계: K(이미 알고 있는 지식) 떠올려 활동지 1열에 적기',
          '2단계: W(더 알고 싶은 내용 및 질문) 생성하여 2열에 적기',
          '3단계: 질문에 대한 답을 능동적으로 찾으며 텍스트 정독하기',
          '4단계: L(새롭게 배운 내용)을 3열에 정리하고 질문 해결 여부 확인하기',
        ],
        phase: '읽기 전',
        minutes: 10,
        suitableTextTypes: ['설명', '기술', '논증'],
        worksheetHint: 'K-W-L 3칸 표 양식',
      },
      {
        strategyId: 'Strat_글_구조_전략',
        name: '글 구조 전략',
        functionName: '분석 / 관계화',
        score: input.textType.contentType === '설명' ? 7 : 5,
        reason: '설명문 및 논증 텍스트의 중심 문장과 뒷받침 문장의 위계적 구조를 분석하는 데 매우 효과적입니다.',
        procedure: [
          '1단계: 문단별 핵심 어휘 및 화제어 찾기',
          '2단계: 문단의 중심 생각(요지)에 밑줄 긋기',
          '3단계: 접속어와 논리적 전개(원인-결과, 문제-해결) 파악하기',
          '4단계: 상하위 위계 구조도로 글 전체 구조 시각화하기',
        ],
        phase: '읽기 중',
        minutes: 15,
        suitableTextTypes: ['설명', '논증'],
        worksheetHint: '문단별 핵심 키워드 구조도',
      },
      {
        strategyId: 'Strat_중심생각_수레바퀴',
        name: '중심생각 수레바퀴',
        functionName: '이해 / 종합',
        score: 4,
        reason: '핵심 개념을 바퀴 중심에 두고, 이를 수식하는 세부 요소를 살(Spoke)로 연결하여 종합적으로 요약합니다.',
        procedure: [
          '1단계: 수레바퀴 중앙 원에 핵심 단어 또는 주제 기록하기',
          '2단계: 4~6개의 바퀴 살(Spoke)에 본문의 세부 내용과 예시 적기',
          '3단계: 바퀴 살의 내용을 바탕으로 중심 생각을 완결된 문장으로 종합하기',
        ],
        phase: '읽기 후',
        minutes: 10,
        suitableTextTypes: ['연속적', '설명'],
        worksheetHint: '수레바퀴형 마인드맵 양식',
      },
      {
        strategyId: 'Strat_벤다이어그램',
        name: '벤다이어그램',
        functionName: '비교 / 대조',
        score: input.targetFunctionName?.includes('비교') ? 8 : 4,
        reason: '두 가지 상반된 개념이나 관점의 공통점과 차이점을 직관적으로 시각화하는 데 적합합니다.',
        procedure: [
          '1단계: 비교·대조할 두 개념 또는 관점 선정하기',
          '2단계: 겹쳐진 가운데 영역에 공통된 특성 기록하기',
          '3단계: 양쪽 고유 영역에 서로 다른 차이점 기록하기',
          '4단계: 공통점과 차이점을 종합하여 비교 결론 작성하기',
        ],
        phase: '읽기 중',
        minutes: 10,
        suitableTextTypes: ['설명', '논증', '혼합적'],
        worksheetHint: '2원 또는 3원 벤다이어그램',
      },
    ];

    return { recommended: recommendations };
  }

  async generateLessonPlan(input: LessonPlanRequest): Promise<LessonPlanResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const stratNames = input.selectedStrategies.map((s) => s.name).join(', ') || '주요 독서전략';

    const events: LessonPlanEvent[] = [
      {
        seq: 1,
        label: '주의 획득',
        purpose: '학습자의 주의를 집중시키고 학습 동기 유발',
        phase: '도입',
        teacherActivity: `${input.topic}과 관련된 실생활 흥미 유발 질문 및 짧은 시각 자료를 제시한다.`,
        studentActivity: '제시된 질문에 자신의 경험을 떠올리며 자유롭게 반응한다.',
        materialAndNotice: '시각 자료 또는 일상 사례 질문 카드',
        minutes: 3,
        assessment: '참여도 관찰',
      },
      {
        seq: 2,
        label: '학습목표 제시',
        purpose: '수업 후 도달해야 할 성취 목표를 명확히 인식',
        phase: '도입',
        teacherActivity: `판서 또는 화면을 통해 오늘의 학습목표("${input.learningObjective || `${input.topic}을(를) 이해하고 독서전략으로 분석할 수 있다`}")를 명시적으로 안내한다.`,
        studentActivity: '학습목표를 함께 소리 내어 읽고 이번 차시 학습 방향을 확인한다.',
        materialAndNotice: 'PPT 또는 판서',
        minutes: 2,
        assessment: '목표 인지 여부 확인',
      },
      {
        seq: 3,
        label: '선수학습 재생',
        purpose: '새로운 학습과 연결할 이전 지식 회상',
        phase: '도입',
        teacherActivity: '이전 차시에서 학습한 관련 기초 개념을 구두 질문을 통해 상기시킨다.',
        studentActivity: '지난 시간에 배운 주요 용어와 원리를 떠올려 답변한다.',
        materialAndNotice: '단답형 확인 질문',
        minutes: 3,
        assessment: '선수 지식 진단',
      },
      {
        seq: 4,
        label: '학습자료 제시',
        purpose: '목표 도달에 필요한 읽기자료 및 텍스트 제공',
        phase: '전개',
        teacherActivity: `읽기자료 [${input.materialTitle || input.topic}]를 배부하고 전체적인 개관을 안내한다.`,
        studentActivity: '읽기자료를 받아 제목, 소제목, 어휘 풀이를 훑어보며 읽을 준비를 한다.',
        materialAndNotice: '인쇄된 읽기자료 텍스트 및 용어 사전',
        minutes: 7,
        assessment: '자료 검토 태도 관찰',
      },
      {
        seq: 5,
        label: '학습 지침 제공',
        purpose: '선택된 독서전략의 구체적 실행 절차 안내',
        phase: '전개',
        teacherActivity: `[${stratNames}] 전략의 구체적인 수행 절차를 단계별로 시범(Modeling) 보이며 안내한다.`,
        studentActivity: '교사의 안내에 따라 독서전략 활동지의 작성 방법을 숙지한다.',
        materialAndNotice: '독서전략 안내 활동지',
        minutes: 5,
        assessment: '전략 절차 이해도 질의응답',
      },
      {
        seq: 6,
        label: '수행 유도',
        purpose: '학생 주도의 텍스트 정독 및 독서전략 적용 실습',
        phase: '전개',
        teacherActivity: '학생들이 자료를 정독하며 활동지를 채우도록 유도하고 순회 지도한다.',
        studentActivity: `읽기자료를 읽으며 [${stratNames}] 양식에 핵심 정보와 자신의 생각을 체계적으로 기록한다.`,
        materialAndNotice: '독서전략 개별 활동지',
        minutes: 15,
        assessment: '활동지 작성 과정 순회 관찰평가',
      },
      {
        seq: 7,
        label: '피드백 제공',
        purpose: '수행 결과 점검 및 오류 수정 단서 제공',
        phase: '전개',
        teacherActivity: '모둠별 또는 짝 활동을 통해 작성을 공유하게 하고, 핵심 오개념에 대해 교정적 피드백을 제공한다.',
        studentActivity: '짝과 활동지를 바꾸어 읽고 긍정적인 피드백과 보완할 점을 나눈다.',
        materialAndNotice: '상호 피드백 체크리스트',
        minutes: 4,
        assessment: '동료 평가 및 수정 내용 점검',
      },
      {
        seq: 8,
        label: '수행 평가',
        purpose: '성취기준 및 학습목표 도달도 개별 평가',
        phase: '정리',
        teacherActivity: '성취기준에 부합하는 형성평가 질문 2~3문항을 제시하여 학습 결과를 확인한다.',
        studentActivity: '형성평가 질문에 개별적으로 답안을 작성하여 제출한다.',
        materialAndNotice: '형성평가지',
        minutes: 4,
        assessment: '형성평가 3단계 준거 평가',
      },
      {
        seq: 9,
        label: '파지와 전이 증진',
        purpose: '학습 내용 요약 및 새로운 맥락에 적용',
        phase: '정리',
        teacherActivity: `오늘 배운 ${input.topic}의 핵심 내용을 총정리하고, 실생활 및 다음 차시 학습과의 연결고리를 제시한다.`,
        studentActivity: '핵심 정리를 확인하고, 다음 시간 예습 과제 및 실생활 적용 과제를 확인한다.',
        materialAndNotice: '차시 예고 및 성찰 일지',
        minutes: 2,
        assessment: '학습 성찰 일지 확인',
      },
    ];

    const totalMinutes = events.reduce((sum, e) => sum + e.minutes, 0);

    return {
      title: `[수업지도안] ${input.subjectName} - ${input.topic}`,
      unitOverview: `${input.subjectName} 교과 연계 읽기자료와 [${stratNames}] 독서전략을 결합하여, 가네의 9가지 수업사태에 기반한 체계적인 교수·학습 과정을 구현한 지도안입니다.`,
      learningObjective: input.learningObjective || `${input.topic}에 대한 읽기자료를 분석하고 독서전략을 활용하여 핵심 개념을 구조화할 수 있다.`,
      totalMinutes,
      events,
      evaluationPlan: {
        criteriaHigh: `${input.topic}의 핵심 원리를 완벽히 이해하고, 독서전략을 능숙하게 활용하여 심화 문제 해결 방안까지 창의적으로 제시할 수 있다.`,
        criteriaMid: `${input.topic}의 주요 개념을 바르게 파악하고, 안내된 독서전략 절차에 따라 활동지를 충실하게 완성할 수 있다.`,
        criteriaLow: `교사의 도움을 받아 ${input.topic}의 기초 어휘를 확인하고, 독서전략의 기본 칸을 부분적으로 작성할 수 있다.`,
      },
      worksheetDraft: `[학생 활동지]\n1. K(이미 알고 있는 것): ____________________\n2. W(알고 싶은 것): ____________________\n3. L(새롭게 배운 것): ____________________`,
    };
  }
}
