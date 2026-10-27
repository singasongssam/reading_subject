import React from 'react';

export const ORGANIZER_STRATEGY_IDS: string[] = [
  'Strat_KWL',
  'Strat_질문의_답은_어디에_QAR',
  'Strat_중심생각_수레바퀴',
  'Strat_RAFT',
  'Strat_벤다이어그램',
  'Strat_SQ3R',
  'Strat_대조표',
  'Strat_피라미드_다이어그램',
  'Strat_생각_그물',
  'Strat_요약하기',
  'Strat_복식_기재_일지',
  'Strat_글_구조_전략',
];

const META_MAP: Record<string, { title: string; description: string }> = {
  Strat_KWL: {
    title: 'KWL 표 (아는 것 · 알고 싶은 것 · 배운 것)',
    description: '읽기 전 배경지식(K)과 질문(W)을 적고, 읽은 후 새롭게 배운 내용(L)을 정리하는 3열 조직자입니다.',
  },
  Strat_질문의_답은_어디에_QAR: {
    title: 'QAR 4분면 질문·답변 조직자',
    description: '질문의 답이 있는 위치를 「바로 거기 / 생각하고 찾기 / 작가와 나 / 나 스스로」 4유형으로 나누어 작성합니다.',
  },
  Strat_중심생각_수레바퀴: {
    title: '중심생각 수레바퀴 구조도',
    description: '중앙 바퀴통에 글의 중심생각을 적고, 바퀴살 6칸에 뒷받침 세부 근거를 연결하는 방사형 구조도입니다.',
  },
  Strat_RAFT: {
    title: 'RAFT 역할 글쓰기 설계표',
    description: '역할(Role), 독자(Audience), 형식(Format), 주제(Topic)를 설정하여 창의적으로 재구성하는 표현 양식입니다.',
  },
  Strat_벤다이어그램: {
    title: '비교·대조 벤다이어그램',
    description: '두 개념이나 현상의 고유한 특징과 공통점을 교집합 원 안에 시각적으로 분류합니다.',
  },
  Strat_SQ3R: {
    title: 'SQ3R 5단계 정독 체크시트',
    description: '훑어보기(Survey) → 질문하기(Question) → 읽기(Read) → 암송하기(Recite) → 복습하기(Review) 단계별 기록표입니다.',
  },
  Strat_대조표: {
    title: '비교 기준별 대조 매트릭스 표',
    description: '비교 기준을 세운 뒤 두 대상(A·B)의 차이점과 특징을 표로 대조하여 분석합니다.',
  },
  Strat_피라미드_다이어그램: {
    title: '3단 위계 피라미드 다이어그램',
    description: '하단의 세부 사실로부터 중간 핵심 개념을 거쳐 상단의 주제·결론으로 추상화하는 피라미드 구조도입니다.',
  },
  Strat_생각_그물: {
    title: '생각 그물(마인드맵) 방사형 조직자',
    description: '중심 주제를 가운데 두고 연상되는 핵심 개념과 사례를 그물처럼 확장해 나가는 조직자입니다.',
  },
  Strat_요약하기: {
    title: '문단별 핵심어 → 전체 한 문장 요약표',
    description: '각 문단의 중심 문장과 핵심어를 추린 뒤 이를 통합하여 글 전체를 한 문단으로 요약합니다.',
  },
  Strat_복식_기재_일지: {
    title: '복식 기재 일지 (본문 인용 ↔ 나의 성찰)',
    description: '왼쪽에는 인상 깊은 본문 구절을 인용하고, 오른쪽에는 나의 생각·질문·비평을 대응시켜 기록합니다.',
  },
  Strat_글_구조_전략: {
    title: '글 구조(원인·결과 / 문제·해결) 분석도',
    description: '글의 전개 구조 유형을 판별하고, 구조에 맞게 핵심 내용을 도식화하여 정리합니다.',
  },
};

export function getOrganizerMeta(strategyId: string): { title: string; description: string; hasTemplate: boolean } {
  const m = META_MAP[strategyId];
  if (m) return { ...m, hasTemplate: true };
  return {
    title: '읽기 전·중·후 3단계 독서전략 활동표',
    description: '선택한 독서전략의 절차에 따라 읽기 전·읽기 중·읽기 후 활동을 체계적으로 기록하는 표준 양식입니다.',
    hasTemplate: false,
  };
}

export const GraphicOrganizer: React.FC<{
  strategyId: string;
  strategyLabel: string;
  mode?: 'preview' | 'worksheet';
  topic?: string;
}> = ({ strategyId, strategyLabel, mode = 'preview', topic = '오늘의 학습 주제' }) => {
  const isWorksheet = mode === 'worksheet';
  const boxCls = isWorksheet
    ? 'border-2 border-dashed border-slate-500 bg-white p-3 min-h-[86px] rounded-md'
    : 'border border-indigo-200 bg-indigo-50/40 p-3 min-h-[72px] rounded-lg';
  const labelCls = isWorksheet
    ? 'text-xs font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-300'
    : 'text-xs font-bold text-indigo-800 mb-1';
  const hintCls = isWorksheet ? 'text-[11px] text-slate-400 italic' : 'text-xs text-slate-600';

  const renderBody = () => {
    switch (strategyId) {
      case 'Strat_KWL':
        return (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { k: 'K (Know · 이미 아는 것)', h: `${topic}에 대해 알고 있는 배경지식을 적어 보세요.` },
              { k: 'W (Want · 알고 싶은 것)', h: '글을 읽으며 해결하고 싶은 질문을 만들어 보세요.' },
              { k: 'L (Learned · 새로 배운 것)', h: '글을 읽은 후 알게 된 핵심 내용을 정리해 보세요.' },
            ].map((c) => (
              <div key={c.k} className={boxCls}>
                <div className={labelCls}>{c.k}</div>
                <p className={hintCls}>{c.h}</p>
              </div>
            ))}
          </div>
        );

      case 'Strat_질문의_답은_어디에_QAR':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { k: '① 바로 거기 (Right There)', h: '글의 한 문장 안에서 답을 바로 찾을 수 있는 질문과 답' },
              { k: '② 생각하고 찾기 (Think & Search)', h: '여러 문단·문장을 연결해야 답할 수 있는 질문과 답' },
              { k: '③ 작가와 나 (Author & Me)', h: '글의 단서와 나의 배경지식을 합쳐 추론하는 질문과 답' },
              { k: '④ 나 스스로 (On My Own)', h: '글을 읽은 뒤 내 경험·가치관으로 답하는 비평 질문과 답' },
            ].map((c) => (
              <div key={c.k} className={boxCls}>
                <div className={labelCls}>{c.k}</div>
                <p className={hintCls}>{c.h}</p>
              </div>
            ))}
          </div>
        );

      case 'Strat_중심생각_수레바퀴':
        return (
          <div className="grid grid-cols-3 gap-2.5 items-center">
            <div className={boxCls}>
              <div className={labelCls}>세부 근거 ①</div>
              <p className={hintCls}>첫째 문단 핵심 근거</p>
            </div>
            <div className={`${boxCls} border-solid ${isWorksheet ? 'border-slate-800' : 'border-indigo-500 bg-indigo-100/60'}`}>
              <div className={labelCls}>★ 중심 생각 (바퀴통)</div>
              <p className={hintCls}>{topic}의 핵심 아이디어를 한 문장으로 적으세요.</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>세부 근거 ②</div>
              <p className={hintCls}>둘째 문단 핵심 근거</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>세부 근거 ③</div>
              <p className={hintCls}>셋째 문단 핵심 근거</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>종합 결론</div>
              <p className={hintCls}>근거가 뒷받침하는 결론</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>세부 근거 ④</div>
              <p className={hintCls}>사례·자료 근거</p>
            </div>
          </div>
        );

      case 'Strat_RAFT':
        return (
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2">
              {[
                { k: 'R · 역할(Role)', h: '나는 누구인가?' },
                { k: 'A · 독자(Audience)', h: '누구에게 쓰는가?' },
                { k: 'F · 형식(Format)', h: '편지·뉴스·성명서 등' },
                { k: 'T · 주제(Topic)', h: topic },
              ].map((c) => (
                <div key={c.k} className={boxCls}>
                  <div className={labelCls}>{c.k}</div>
                  <p className={hintCls}>{c.h}</p>
                </div>
              ))}
            </div>
            <div className={`${boxCls} min-h-[100px]`}>
              <div className={labelCls}>RAFT 글쓰기 작성란</div>
              <p className={hintCls}>위에서 정한 역할(R)이 되어 독자(A)에게 전달할 글을 작성해 보세요.</p>
            </div>
          </div>
        );

      case 'Strat_벤다이어그램':
        return (
          <div className="grid grid-cols-3 gap-2.5">
            <div className={boxCls}>
              <div className={labelCls}>대상 A만의 특징</div>
              <p className={hintCls}>첫 번째 개념·입장의 고유한 속성</p>
            </div>
            <div className={`${boxCls} ${isWorksheet ? 'border-slate-800' : 'bg-amber-50/60 border-amber-300'}`}>
              <div className={labelCls}>공통점 (A ∩ B)</div>
              <p className={hintCls}>두 대상이 공유하는 원리·공통 특징</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>대상 B만의 특징</div>
              <p className={hintCls}>두 번째 개념·입장의 고유한 속성</p>
            </div>
          </div>
        );

      case 'Strat_SQ3R':
        return (
          <div className="grid grid-cols-5 gap-2">
            {[
              { k: '1. Survey (훑어보기)', h: '제목·소제목·표 먼저 살피기' },
              { k: '2. Question (질문)', h: '제목을 질문으로 바꾸기' },
              { k: '3. Read (읽기)', h: '질문의 답을 찾으며 정독' },
              { k: '4. Recite (암송)', h: '책을 덮고 내 말로 정리' },
              { k: '5. Review (복습)', h: '전체 흐름과 핵심어 재점검' },
            ].map((c) => (
              <div key={c.k} className={boxCls}>
                <div className={labelCls}>{c.k}</div>
                <p className={hintCls}>{c.h}</p>
              </div>
            ))}
          </div>
        );

      case 'Strat_대조표':
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className={boxCls}>
              <div className={labelCls}>비교 기준</div>
              <p className={hintCls}>1) 개념 정의 / 2) 원인·조건 / 3) 영향·사례</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>대상 A</div>
              <p className={hintCls}>기준별 대상 A의 내용 정리</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>대상 B</div>
              <p className={hintCls}>기준별 대상 B의 내용 정리</p>
            </div>
          </div>
        );

      case 'Strat_피라미드_다이어그램':
        return (
          <div className="space-y-2">
            <div className={`${boxCls} mx-auto w-2/3 min-h-[60px]`}>
              <div className={labelCls}>▲ 3단 (최상위): 글의 핵심 주제·결론</div>
              <p className={hintCls}>{topic}을(를) 관통하는 핵심 아이디어 한 문장</p>
            </div>
            <div className={`${boxCls} mx-auto w-5/6 min-h-[64px]`}>
              <div className={labelCls}>▲ 2단 (중간): 주요 뒷받침 개념 2~3가지</div>
              <p className={hintCls}>핵심 아이디어를 구성하는 내용 요소 간 관계</p>
            </div>
            <div className={`${boxCls} w-full min-h-[68px]`}>
              <div className={labelCls}>▲ 1단 (기초): 본문 속 구체적 사실·용어·사례</div>
              <p className={hintCls}>글에서 확인한 중요한 사실과 어휘를 기록하세요.</p>
            </div>
          </div>
        );

      case 'Strat_생각_그물':
        return (
          <div className="grid grid-cols-3 gap-2.5">
            <div className={boxCls}>
              <div className={labelCls}>가지 ① 개념·정의</div>
              <p className={hintCls}>핵심 용어와 뜻</p>
            </div>
            <div className={`${boxCls} ${isWorksheet ? 'border-slate-900 border-solid' : 'bg-indigo-100/70 border-indigo-400'}`}>
              <div className={labelCls}>● 중심 주제: {topic}</div>
              <p className={hintCls}>중심에서 가지를 뻗어 생각을 연결하세요.</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>가지 ② 원인·배경</div>
              <p className={hintCls}>왜 일어나는가?</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>가지 ③ 생활 속 사례</div>
              <p className={hintCls}>우리 주변의 모습</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>가지 ④ 문제점·쟁점</div>
              <p className={hintCls}>함께 고민할 문제</p>
            </div>
            <div className={boxCls}>
              <div className={labelCls}>가지 ⑤ 해결·실천 방안</div>
              <p className={hintCls}>우리가 할 수 있는 일</p>
            </div>
          </div>
        );

      case 'Strat_요약하기':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {['1문단 핵심어·중심문장', '2~3문단 핵심어·중심문장', '마지막 문단 핵심어·중심문장'].map((t) => (
                <div key={t} className={boxCls}>
                  <div className={labelCls}>{t}</div>
                  <p className={hintCls}>불필요한 수식어를 빼고 핵심만 기록</p>
                </div>
              ))}
            </div>
            <div className={`${boxCls} min-h-[78px]`}>
              <div className={labelCls}>전체 글 한 문단 요약문</div>
              <p className={hintCls}>위 핵심 문장들을 자연스럽게 연결하여 2~3문장으로 요약해 보세요.</p>
            </div>
          </div>
        );

      case 'Strat_복식_기재_일지':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`${boxCls} min-h-[110px]`}>
              <div className={labelCls}>[왼쪽] 본문에서 뽑은 구절·문장</div>
              <p className={hintCls}>중요하거나 인상 깊은 문장을 그대로 옮겨 적으세요.</p>
            </div>
            <div className={`${boxCls} min-h-[110px]`}>
              <div className={labelCls}>[오른쪽] 나의 생각 · 질문 · 비평</div>
              <p className={hintCls}>그 문장을 선택한 이유와 나의 의견·질문을 적으세요.</p>
            </div>
          </div>
        );

      case 'Strat_글_구조_전략':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
              <span>글 구조 유형 선택:</span>
              {['□ 개념-설명', '□ 원인-결과', '□ 문제-해결', '□ 비교-대조', '□ 주장-근거'].map((t) => (
                <span key={t} className="rounded border border-slate-300 px-2 py-0.5">{t}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['도입 (핵심 화제·문제 제기)', '전개 (원인·근거·비교 분석)', '결론 (해결 방안·일반화 정리)'].map((t) => (
                <div key={t} className={boxCls}>
                  <div className={labelCls}>{t}</div>
                  <p className={hintCls}>글의 구조에 따라 내용을 도식화하세요.</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { k: `1단계 · 읽기 전 [${strategyLabel}]`, h: '제목과 핵심어를 살펴보고 예측·질문하기' },
              { k: `2단계 · 읽기 중 [${strategyLabel}]`, h: '본문을 읽으며 핵심 정보와 근거 기록하기' },
              { k: `3단계 · 읽기 후 [${strategyLabel}]`, h: '배운 내용을 종합하고 내 생각 정리하기' },
            ].map((c) => (
              <div key={c.k} className={boxCls}>
                <div className={labelCls}>{c.k}</div>
                <p className={hintCls}>{c.h}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  const meta = getOrganizerMeta(strategyId);

  return (
    <div className="print-break-inside-avoid">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          독서전략 그래픽 조직자: [{strategyLabel}] — {meta.title}
        </span>
        <span className="text-[11px] text-slate-500">{meta.description}</span>
      </div>
      {renderBody()}
    </div>
  );
};
