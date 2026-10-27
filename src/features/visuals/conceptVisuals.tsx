import React, { useId } from 'react';

export interface ConceptVisualMeta {
  areaId: string;
  subjectId: 'social' | 'science';
  areaLabel: string;
  title: string;
  caption: string;
  prompts: [string, string];
  keywords: string[];
}

export const CONCEPT_VISUALS: Record<string, ConceptVisualMeta> = {
  GeographicAwareness: {
    areaId: 'GeographicAwareness',
    subjectId: 'social',
    areaLabel: '지리 인식',
    title: '위치(위도·경도 격자)와 영역(영토·영해·영공) 구조도',
    caption: '경위도 좌표계를 통한 절대적·상대적 위치 파악과 국가 영역의 3요소(영토·영해·영공) 단면을 시각화한 모델입니다.',
    prompts: [
      '위도와 경도가 달라지면 그 지역의 기후와 시차, 주민 생활은 어떻게 달라질까요?',
      '국가의 영역(영토·영해·영공)이 명확히 설정되어야 하는 이유는 무엇일까요?',
    ],
    keywords: ['위도·경도', '영토', '영해(기선 12해리)', '영공', '공간 정보'],
  },
  NaturalEnvironmentHumanLife: {
    areaId: 'NaturalEnvironmentHumanLife',
    subjectId: 'social',
    areaLabel: '자연환경과 인간생활',
    title: '기후·지형과 인간 생활의 상호작용 순환도',
    caption: '기후와 지형 등 자연환경이 의식주 및 산업에 미치는 영향과 인간의 환경 적응·극복 과정을 나타낸 순환 다이어그램입니다.',
    prompts: [
      '열대·온대·한대 기후 지역의 가옥 구조가 서로 다른 까닭은 자연환경과 어떤 관계가 있을까요?',
      '인간이 자연환경을 이용하는 과정에서 자연재해와 환경 문제를 줄이려면 어떤 태도가 필요할까요?',
    ],
    keywords: ['기후 환경', '지형 환경', '생활양식(의식주)', '자연재해', '적응과 조화'],
  },
  HumanEnvironmentHumanLife: {
    areaId: 'HumanEnvironmentHumanLife',
    subjectId: 'social',
    areaLabel: '인문환경과 인간생활',
    title: '인구 이동(배출·흡인 요인)과 도시 공간 구조 변화',
    caption: '촌락에서 도시로의 인구 이동 요인(Push/Pull)과 도시화에 따른 공간 분화 및 교통·통신 발달 과정을 보여 줍니다.',
    prompts: [
      '사람들이 일자리와 교육·의료 시설을 찾아 도시로 이동할 때 촌락과 도시에는 각각 어떤 문제가 생길까요?',
      '교통과 정보통신의 발달은 우리의 일상 공간과 문화 교류 방식을 어떻게 바꾸어 놓았나요?',
    ],
    keywords: ['인구 이동', '흡인·배출 요인', '도시화', '문화 다양성', '교통·통신망'],
  },
  SustainableWorld: {
    areaId: 'SustainableWorld',
    subjectId: 'social',
    areaLabel: '지속가능한 세계',
    title: '지속가능발전 3대 축(환경·경제·사회) 통합 벤다이어그램',
    caption: '환경 보전, 경제 성장, 사회 정의의 세 축이 균형을 이룰 때 미래 세대와 공존하는 지속가능발전이 달성됨을 나타냅니다.',
    prompts: [
      '경제 성장만을 우선하거나 환경 보호만을 강조할 때 발생할 수 있는 지역·국가 간 갈등은 무엇인가요?',
      '기후위기와 지역 불균형을 해결하기 위해 지구촌 시민으로서 실천할 수 있는 행동은 무엇일까요?',
    ],
    keywords: ['환경 보전', '경제 성장', '사회 통합', '기후위기 대응', '세계 시민 협력'],
  },
  Politics: {
    areaId: 'Politics',
    subjectId: 'social',
    areaLabel: '정치',
    title: '삼권분립(입법·행정·사법) 견제와 균형 및 국민 주권 모델',
    caption: '국가 권력을 국회(입법), 정부(행정), 법원(사법)으로 나누어 상호 견제·균형하게 함으로써 국민의 자유와 권리를 보장하는 원리입니다.',
    prompts: [
      '국가 권력을 한 기관에 집중시키지 않고 입법·행정·사법으로 나누어 서로 견제하게 하는 까닭은 무엇인가요?',
      '민주 국가에서 시민이 선거 이외에 정치 과정에 참여할 수 있는 방법에는 무엇이 있을까요?',
    ],
    keywords: ['입법부(국회)', '행정부(정부)', '사법부(법원)', '견제와 균형', '국민 주권'],
  },
  Law: {
    areaId: 'Law',
    subjectId: 'social',
    areaLabel: '법',
    title: '법의 위계 피라미드(헌법·법률·명령·자치법규)와 기본권 보장',
    caption: '최상위 규범인 헌법을 정점으로 법률, 명령, 조례·규칙이 단계적 체계를 이루며 국민의 기본권을 보장하는 구조입니다.',
    prompts: [
      '하위 법규인 법률이나 명령이 최고법인 헌법에 어긋날 수 없도록 한 이유는 무엇일까요?',
      '일상생활에서 법이 우리의 권리를 지켜 주거나 갈등을 공정하게 해결해 주는 사례에는 무엇이 있나요?',
    ],
    keywords: ['헌법(최고법)', '법률', '명령(대통령령·부령)', '조례·규칙', '기본권과 공정한 재판'],
  },
  Economics: {
    areaId: 'Economics',
    subjectId: 'social',
    areaLabel: '경제',
    title: '시장 수요·공급 곡선과 균형 가격(E) 결정 그래프',
    caption: '우하향하는 수요곡선(D)과 우상향하는 공급곡선(S)이 만나는 균형점(E)에서 시장 균형 가격과 균형 거래량이 결정되는 원리입니다.',
    prompts: [
      '시장 가격이 균형 가격보다 높거나 낮게 형성되면 초과 공급·초과 수요가 어떻게 나타나고 가격은 어떻게 움직일까요?',
      '소비자의 소득 증가나 생산 기술 혁신이 일어나면 수요·공급 곡선은 어느 방향으로 이동할까요?',
    ],
    keywords: ['수요곡선(D)', '공급곡선(S)', '균형 가격(P*)', '균형 거래량(Q*)', '합리적 선택'],
  },
  SocietyCulture: {
    areaId: 'SocietyCulture',
    subjectId: 'social',
    areaLabel: '사회·문화',
    title: '개인–집단–사회 관계 동심원과 사회화 기관 네트워크',
    caption: '개인이 가족·학교·또래집단·대중매체 등 사회화 기관과 상호작용하며 사회적 관계를 맺고 문화를 형성하는 구조입니다.',
    prompts: [
      '개인의 행동과 가치관은 가족, 학교, 대중매체 등 주변 사회집단으로부터 어떤 영향을 주고받나요?',
      '서로 다른 문화적 배경을 가진 사람들이 더불어 살아가기 위해 왜 문화 상대주의 태도가 필요할까요?',
    ],
    keywords: ['개인', '사회집단', '사회화 기관', '문화 다양성', '사회문제 해결'],
  },
  GeneralHistory: {
    areaId: 'GeneralHistory',
    subjectId: 'social',
    areaLabel: '역사 일반',
    title: '역사 탐구 과정(사료 수집 → 사료 비판 → 맥락 해석 → 현재와의 대화)',
    caption: '유물·문헌 등 사료를 수집·비판하고 당시의 역사적 맥락 속에서 해석하여 오늘날의 교훈으로 연결하는 역사학의 탐구 흐름입니다.',
    prompts: [
      '같은 역사적 사건이라도 기록한 사람이나 시대에 따라 해석이 달라질 수 있는 까닭은 무엇일까요?',
      '과거의 역사적 사건을 탐구하는 일이 오늘날 우리가 겪는 문제를 이해하는 데 어떤 도움을 줄까요?',
    ],
    keywords: ['사료 수집', '외적·내적 비판', '역사적 맥락', '역사 해석', '과거와 현재의 대화'],
  },
  RegionalHistory: {
    areaId: 'RegionalHistory',
    subjectId: 'social',
    areaLabel: '지역사',
    title: '지역사 자료(문화유산·문헌·구술)와 삶의 공간 연결 구조도',
    caption: '우리 지역의 지명, 유적, 고문서, 어르신 구술 기록을 종합하여 지역의 역사적 변화와 정체성을 재구성하는 모델입니다.',
    prompts: [
      '우리가 살고 있는 지역의 지명이나 오래된 건축물에는 어떤 역사적 이야기가 담겨 있을까요?',
      '국가 전체의 역사와 함께 우리 지역의 역사를 따로 조사하고 기록해야 하는 이유는 무엇인가요?',
    ],
    keywords: ['지역 문화유산', '향토 기록', '구술 사료', '지역 정체성', '공간과 기억'],
  },
  KoreanHistory: {
    areaId: 'KoreanHistory',
    subjectId: 'social',
    areaLabel: '한국사',
    title: '한국사 시대 흐름과 정치·사회 변화 연표 구조도',
    caption: '고조선부터 삼국·남북국·고려·조선·근현대사로 이어지는 한국사의 통시적 흐름과 시대별 핵심 변화를 나타낸 연표입니다.',
    prompts: [
      '한국사에서 새로운 국가나 시대로 전환될 때 정치 제도와 신분·사회 구조는 어떻게 변화하였나요?',
      '선조들이 대외적 위기나 사회적 모순을 극복해 온 과정이 오늘날 우리에게 주는 시사점은 무엇일까요?',
    ],
    keywords: ['고조선·삼국', '남북국', '고려', '조선', '근현대사 변화'],
  },
  MotionEnergy: {
    areaId: 'MotionEnergy',
    subjectId: 'science',
    areaLabel: '운동과 에너지',
    title: '힘의 합성(평행사변형법)과 알짜힘·운동 변화 벡터 다이어그램',
    caption: '물체에 동시에 작용하는 두 힘 F₁, F₂의 크기와 방향을 화살표(벡터)로 나타내고 알짜힘(합력 F)에 의해 운동 상태가 변하는 원리입니다.',
    prompts: [
      '물체에 작용하는 여러 힘의 합력(알짜힘)이 0일 때와 0이 아닐 때 물체의 운동 상태는 각각 어떻게 달라지나요?',
      '역학적 에너지나 전기·열에너지가 다른 형태의 에너지로 전환될 때 전체 에너지의 총량은 어떻게 될까요?',
    ],
    keywords: ['힘의 3요소', '벡터 합성', '알짜힘(합력)', '운동 상태 변화', '에너지 보존·전환'],
  },
  Matter: {
    areaId: 'Matter',
    subjectId: 'science',
    areaLabel: '물질',
    title: '물질의 세 가지 상태(고체·액체·기체) 변화와 입자 배열·열에너지 순환도',
    caption: '융해·기화·승화(열 흡수)와 응고·액화·승화(열 방출) 과정에서 입자 사이의 거리와 운동이 달라지는 상태 변화 삼각 모델입니다.',
    prompts: [
      '고체가 액체, 기체로 상태가 변할 때 물질을 이루는 입자의 종류와 개수, 배열은 어떻게 달라질까요?',
      '상태 변화가 일어나는 동안 온도가 일정하게 유지되는 구간에서 흡수하거나 방출한 열에너지는 어디에 쓰일까요?',
    ],
    keywords: ['고체·액체·기체', '융해·응고', '기화·액화', '승화', '입자 운동과 열에너지'],
  },
  Life: {
    areaId: 'Life',
    subjectId: 'science',
    areaLabel: '생명',
    title: '다세포 생물의 유기적 구성 단계(세포 → 조직 → 기관 → 기관계 → 개체)',
    caption: '생명체의 기본 단위인 세포가 모여 조직·기관·기관계를 이루고 상호 협력하여 하나의 독립된 개체로 생명 활동을 수행하는 위계입니다.',
    prompts: [
      '소화·순환·호흡·배설 기관계 중 어느 하나라도 제 기능을 하지 못하면 우리 몸 전체에는 어떤 일이 일어날까요?',
      '식물의 구성 단계(조직계 포함)와 동물의 구성 단계(기관계 포함)는 어떤 공통점과 차이점이 있나요?',
    ],
    keywords: ['세포', '조직', '기관', '기관계(동물)/조직계(식물)', '개체와 항상성'],
  },
  EarthSpace: {
    areaId: 'EarthSpace',
    subjectId: 'science',
    areaLabel: '지구와 우주',
    title: '지구계 5대 권역(지권·수권·기권·생물권·외권) 상호작용 네트워크',
    caption: '지구를 둘러싼 지권, 수권, 기권, 생물권, 외권이 물질과 에너지를 끊임없이 주고받으며 역동적 균형을 이루는 지구계 모델입니다.',
    prompts: [
      '화산 폭발이나 태풍 발생은 지권·수권·기권·생물권 사이에 어떤 연쇄적인 영향을 미칠까요?',
      '태양 복사 에너지와 지구 내부 에너지는 지구계의 물질 순환(물의 순환, 암석의 순환)을 어떻게 일으키나요?',
    ],
    keywords: ['지권', '수권', '기권', '생물권', '외권과 물질·에너지 순환'],
  },
  ScienceSociety: {
    areaId: 'ScienceSociety',
    subjectId: 'science',
    areaLabel: '과학과 사회',
    title: '과학–기술–사회(STS) 상호작용과 과학적 의사결정 트라이앵글',
    caption: '과학적 발견이 기술 혁신을 이끌고 사회를 변화시키며, 사회적 요구와 윤리적 성찰이 다시 과학 연구 방향을 조율하는 STS 모델입니다.',
    prompts: [
      '인공지능·생명공학·신재생에너지 같은 과학기술 발달이 우리 사회에 주는 편익과 함께 새롭게 제기하는 윤리적 쟁점은 무엇인가요?',
      '과학기술과 관련된 사회 문제를 해결할 때 과학적 근거와 시민의 가치 판단이 함께 필요한 까닭은 무엇일까요?',
    ],
    keywords: ['과학 탐구', '기술 혁신', '사회 변화', '과학 윤리·안전', '민주적 의사결정'],
  },
};

export function getConceptVisual(areaId?: string | null): ConceptVisualMeta | null {
  if (!areaId) return null;
  return CONCEPT_VISUALS[areaId] ?? null;
}

interface Palette {
  bg: string;
  card: string;
  cardAlt: string;
  stroke: string;
  muted: string;
  text: string;
  subText: string;
  primary: string;
  secondary: string;
  accent: string;
  emerald: string;
  amber: string;
  rose: string;
}

function getPalette(theme: 'light' | 'dark'): Palette {
  if (theme === 'dark') {
    return {
      bg: '#0f172a',
      card: '#1e293b',
      cardAlt: '#334155',
      stroke: '#64748b',
      muted: '#94a3b8',
      text: '#f8fafc',
      subText: '#cbd5e1',
      primary: '#818cf8',
      secondary: '#38bdf8',
      accent: '#c084fc',
      emerald: '#34d399',
      amber: '#fbbf24',
      rose: '#fb7185',
    };
  }
  return {
    bg: '#f8fafc',
    card: '#ffffff',
    cardAlt: '#eef2ff',
    stroke: '#475569',
    muted: '#64748b',
    text: '#0f172a',
    subText: '#334155',
    primary: '#4f46e5',
    secondary: '#0284c7',
    accent: '#7c3aed',
    emerald: '#059669',
    amber: '#d97706',
    rose: '#e11d48',
  };
}

export const ConceptVisual: React.FC<{
  areaId: string;
  theme?: 'light' | 'dark';
  className?: string;
  showTitle?: boolean;
}> = ({ areaId, theme = 'light', className = '', showTitle = false }) => {
  const uid = useId().replace(/:/g, '');
  const meta = getConceptVisual(areaId);
  const p = getPalette(theme);
  const arrowId = `arrow-${uid}`;
  const arrowRedId = `arrow-red-${uid}`;
  const arrowBlueId = `arrow-blue-${uid}`;

  const renderDiagram = () => {
    switch (areaId) {
      case 'GeographicAwareness':
        return (
          <g>
            {/* 좌측: 경위도 지구 격자 */}
            <circle cx="125" cy="150" r="82" fill={p.card} stroke={p.primary} strokeWidth="2.5" />
            <ellipse cx="125" cy="150" rx="82" ry="30" fill="none" stroke={p.secondary} strokeWidth="1.5" strokeDasharray="4 3" />
            <ellipse cx="125" cy="150" rx="38" ry="82" fill="none" stroke={p.secondary} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="43" y1="150" x2="207" y2="150" stroke={p.rose} strokeWidth="2" />
            <line x1="125" y1="68" x2="125" y2="232" stroke={p.emerald} strokeWidth="2" />
            <circle cx="155" cy="118" r="6" fill={p.rose} />
            <text x="125" y="52" textAnchor="middle" fill={p.text} fontSize="13" fontWeight="700">경·위도 좌표계</text>
            <text x="125" y="166" textAnchor="middle" fill={p.rose} fontSize="11" fontWeight="600">적도 (위도 0°)</text>
            <text x="125" y="252" textAnchor="middle" fill={p.emerald} fontSize="11" fontWeight="600">본초 자오선 (경도 0°)</text>

            {/* 우측: 영토·영해·영공 단면 */}
            <rect x="245" y="48" width="210" height="205" rx="10" fill={p.card} stroke={p.stroke} strokeWidth="1.8" />
            <rect x="255" y="58" width="190" height="68" rx="6" fill={p.cardAlt} stroke={p.secondary} strokeDasharray="4 2" />
            <text x="350" y="96" textAnchor="middle" fill={p.primary} fontSize="13" fontWeight="700">영공 (영토·영해 상공)</text>
            <polygon points="255,195 335,135 370,195" fill={p.emerald} opacity="0.28" stroke={p.emerald} strokeWidth="2" />
            <rect x="335" y="165" width="110" height="30" fill={p.secondary} opacity="0.28" stroke={p.secondary} strokeWidth="1.8" />
            <text x="302" y="182" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">영토</text>
            <text x="390" y="184" textAnchor="middle" fill={p.text} fontSize="11" fontWeight="700">영해 (12해리)</text>
            <text x="350" y="232" textAnchor="middle" fill={p.subText} fontSize="11">기선으로부터 12해리 · 배타적 주권</text>
          </g>
        );

      case 'NaturalEnvironmentHumanLife':
        return (
          <g>
            <rect x="36" y="88" width="145" height="120" rx="14" fill={p.card} stroke={p.emerald} strokeWidth="2.5" />
            <text x="108" y="122" textAnchor="middle" fill={p.emerald} fontSize="14" fontWeight="700">자연환경</text>
            <text x="108" y="148" textAnchor="middle" fill={p.text} fontSize="12">• 기후 (기온·강수)</text>
            <text x="108" y="168" textAnchor="middle" fill={p.text} fontSize="12">• 지형 (산지·평야·해안)</text>
            <text x="108" y="188" textAnchor="middle" fill={p.text} fontSize="12">• 자연재해·생태계</text>

            <rect x="299" y="88" width="145" height="120" rx="14" fill={p.card} stroke={p.primary} strokeWidth="2.5" />
            <text x="371" y="122" textAnchor="middle" fill={p.primary} fontSize="14" fontWeight="700">인간 생활</text>
            <text x="371" y="148" textAnchor="middle" fill={p.text} fontSize="12">• 의·식·주 문화</text>
            <text x="371" y="168" textAnchor="middle" fill={p.text} fontSize="12">• 농업·산업 입지</text>
            <text x="371" y="188" textAnchor="middle" fill={p.text} fontSize="12">• 방재·환경 보전</text>

            <path d="M 185 115 Q 240 65 295 115" fill="none" stroke={p.emerald} strokeWidth="2.5" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="75" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">영향·제약 제공</text>
            <path d="M 295 182 Q 240 232 185 182" fill="none" stroke={p.primary} strokeWidth="2.5" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="238" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">적응 · 이용 · 조화</text>
          </g>
        );

      case 'HumanEnvironmentHumanLife':
        return (
          <g>
            <rect x="30" y="75" width="135" height="145" rx="12" fill={p.card} stroke={p.amber} strokeWidth="2.2" />
            <text x="97" y="105" textAnchor="middle" fill={p.amber} fontSize="14" fontWeight="700">촌락 (배출 요인)</text>
            <text x="97" y="132" textAnchor="middle" fill={p.text} fontSize="11.5">• 일자리 부족</text>
            <text x="97" y="154" textAnchor="middle" fill={p.text} fontSize="11.5">• 교육·문화 시설 부족</text>
            <text x="97" y="176" textAnchor="middle" fill={p.text} fontSize="11.5">• 인구 고령화</text>

            <rect x="315" y="75" width="135" height="145" rx="12" fill={p.card} stroke={p.primary} strokeWidth="2.2" />
            <text x="382" y="105" textAnchor="middle" fill={p.primary} fontSize="14" fontWeight="700">도시 (흡인 요인)</text>
            <text x="382" y="132" textAnchor="middle" fill={p.text} fontSize="11.5">• 다양한 직업·산업</text>
            <text x="382" y="154" textAnchor="middle" fill={p.text} fontSize="11.5">• 교육·의료 인프라</text>
            <text x="382" y="176" textAnchor="middle" fill={p.text} fontSize="11.5">• 교통·통신 중심지</text>

            <line x1="170" y1="132" x2="308" y2="132" stroke={p.primary} strokeWidth="3" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="120" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">인구 이동 · 도시화</text>
            <line x1="308" y1="172" x2="170" y2="172" stroke={p.emerald} strokeWidth="2" strokeDasharray="5 3" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="194" textAnchor="middle" fill={p.subText} fontSize="11">귀농·귀촌 / 도농 교류</text>
          </g>
        );

      case 'SustainableWorld':
        return (
          <g>
            <circle cx="200" cy="122" r="68" fill={p.emerald} fillOpacity="0.2" stroke={p.emerald} strokeWidth="2.4" />
            <circle cx="280" cy="122" r="68" fill={p.secondary} fillOpacity="0.2" stroke={p.secondary} strokeWidth="2.4" />
            <circle cx="240" cy="188" r="68" fill={p.amber} fillOpacity="0.2" stroke={p.amber} strokeWidth="2.4" />
            <text x="165" y="98" textAnchor="middle" fill={p.emerald} fontSize="13" fontWeight="700">환경 보전</text>
            <text x="165" y="116" textAnchor="middle" fill={p.subText} fontSize="11">기후·생태계</text>
            <text x="315" y="98" textAnchor="middle" fill={p.secondary} fontSize="13" fontWeight="700">경제 발전</text>
            <text x="315" y="116" textAnchor="middle" fill={p.subText} fontSize="11">친환경 성장</text>
            <text x="240" y="226" textAnchor="middle" fill={p.amber} fontSize="13" fontWeight="700">사회 정의</text>
            <text x="240" y="244" textAnchor="middle" fill={p.subText} fontSize="11">인권·공정·평화</text>
            <circle cx="240" cy="145" r="28" fill={p.card} stroke={p.primary} strokeWidth="2.2" />
            <text x="240" y="142" textAnchor="middle" fill={p.primary} fontSize="11" fontWeight="800">지속가능</text>
            <text x="240" y="156" textAnchor="middle" fill={p.primary} fontSize="11" fontWeight="800">발전</text>
          </g>
        );

      case 'Politics':
        return (
          <g>
            {/* 상단: 입법부 */}
            <rect x="175" y="26" width="130" height="58" rx="10" fill={p.card} stroke={p.primary} strokeWidth="2.4" />
            <text x="240" y="50" textAnchor="middle" fill={p.primary} fontSize="13" fontWeight="700">입법부 (국회)</text>
            <text x="240" y="70" textAnchor="middle" fill={p.subText} fontSize="11">법률 제정 · 국정감사</text>

            {/* 좌하: 행정부 */}
            <rect x="34" y="192" width="140" height="62" rx="10" fill={p.card} stroke={p.emerald} strokeWidth="2.4" />
            <text x="104" y="218" textAnchor="middle" fill={p.emerald} fontSize="13" fontWeight="700">행정부 (정부)</text>
            <text x="104" y="238" textAnchor="middle" fill={p.subText} fontSize="11">법률 집행 · 정책 수행</text>

            {/* 우하: 사법부 */}
            <rect x="306" y="192" width="140" height="62" rx="10" fill={p.card} stroke={p.amber} strokeWidth="2.4" />
            <text x="376" y="218" textAnchor="middle" fill={p.amber} fontSize="13" fontWeight="700">사법부 (법원)</text>
            <text x="376" y="238" textAnchor="middle" fill={p.subText} fontSize="11">법 적용 · 공정한 재판</text>

            {/* 중앙: 국민 주권 */}
            <circle cx="240" cy="148" r="34" fill={p.cardAlt} stroke={p.rose} strokeWidth="2.2" />
            <text x="240" y="144" textAnchor="middle" fill={p.rose} fontSize="12" fontWeight="800">국민 주권</text>
            <text x="240" y="160" textAnchor="middle" fill={p.text} fontSize="10.5">자유·권리 보장</text>

            {/* 상호 견제 화살표 */}
            <line x1="185" y1="84" x2="115" y2="188" stroke={p.stroke} strokeWidth="2" markerEnd={`url(#${arrowId})`} />
            <line x1="295" y1="84" x2="365" y2="188" stroke={p.stroke} strokeWidth="2" markerEnd={`url(#${arrowId})`} />
            <line x1="176" y1="224" x2="302" y2="224" stroke={p.stroke} strokeWidth="2" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="214" textAnchor="middle" fill={p.subText} fontSize="11" fontWeight="600">견제와 균형</text>
          </g>
        );

      case 'Law':
        return (
          <g>
            {/* 4단 피라미드 */}
            <polygon points="240,28 190,82 290,82" fill={p.rose} fillOpacity="0.25" stroke={p.rose} strokeWidth="2.2" />
            <polygon points="190,86 145,140 335,140 290,86" fill={p.primary} fillOpacity="0.22" stroke={p.primary} strokeWidth="2.2" />
            <polygon points="145,144 100,198 380,198 335,144" fill={p.secondary} fillOpacity="0.2" stroke={p.secondary} strokeWidth="2.2" />
            <polygon points="100,202 55,256 425,256 380,202" fill={p.emerald} fillOpacity="0.2" stroke={p.emerald} strokeWidth="2.2" />

            <text x="240" y="68" textAnchor="middle" fill={p.text} fontSize="13" fontWeight="800">헌법 (최고 규범)</text>
            <text x="240" y="118" textAnchor="middle" fill={p.text} fontSize="13" fontWeight="700">법률 (국회 제정)</text>
            <text x="240" y="175" textAnchor="middle" fill={p.text} fontSize="12.5" fontWeight="700">명령 (대통령령 · 총리령 · 부령)</text>
            <text x="240" y="234" textAnchor="middle" fill={p.text} fontSize="12.5" fontWeight="700">자치법규 (조례 · 규칙)</text>
          </g>
        );

      case 'Economics':
        return (
          <g>
            {/* 축 */}
            <line x1="80" y1="245" x2="415" y2="245" stroke={p.text} strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            <line x1="80" y1="245" x2="80" y2="35" stroke={p.text} strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            <text x="45" y="48" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">가격(P)</text>
            <text x="415" y="268" textAnchor="end" fill={p.text} fontSize="12" fontWeight="700">거래량(Q)</text>

            {/* 수요곡선 D, 공급곡선 S */}
            <path d="M 115 62 L 375 222" stroke={p.secondary} strokeWidth="3" fill="none" />
            <path d="M 115 222 L 375 62" stroke={p.rose} strokeWidth="3" fill="none" />
            <text x="388" y="226" fill={p.secondary} fontSize="13" fontWeight="800">D (수요)</text>
            <text x="388" y="66" fill={p.rose} fontSize="13" fontWeight="800">S (공급)</text>

            {/* 균형점 E (245, 142) */}
            <line x1="80" y1="142" x2="245" y2="142" stroke={p.muted} strokeWidth="1.6" strokeDasharray="4 4" />
            <line x1="245" y1="142" x2="245" y2="245" stroke={p.muted} strokeWidth="1.6" strokeDasharray="4 4" />
            <circle cx="245" cy="142" r="7" fill={p.amber} stroke={p.text} strokeWidth="2" />
            <text x="245" y="122" textAnchor="middle" fill={p.text} fontSize="12.5" fontWeight="800">균형점 E</text>
            <text x="58" y="146" textAnchor="end" fill={p.amber} fontSize="11.5" fontWeight="700">균형가격 P*</text>
            <text x="245" y="266" textAnchor="middle" fill={p.amber} fontSize="11.5" fontWeight="700">균형거래량 Q*</text>
          </g>
        );

      case 'SocietyCulture':
        return (
          <g>
            <circle cx="240" cy="150" r="108" fill={p.card} stroke={p.secondary} strokeWidth="2" strokeDasharray="5 3" />
            <circle cx="240" cy="150" r="72" fill={p.cardAlt} stroke={p.primary} strokeWidth="2" />
            <circle cx="240" cy="150" r="36" fill={p.primary} fillOpacity="0.22" stroke={p.primary} strokeWidth="2.4" />
            <text x="240" y="154" textAnchor="middle" fill={p.text} fontSize="13" fontWeight="800">개인(자아)</text>
            <text x="240" y="96" textAnchor="middle" fill={p.primary} fontSize="11.5" fontWeight="700">사회집단 · 제도</text>
            <text x="240" y="58" textAnchor="middle" fill={p.secondary} fontSize="11.5" fontWeight="700">문화와 사회 구조</text>

            {/* 4대 사회화 기관 */}
            {[
              { x: 64, y: 68, t: '가족' },
              { x: 416, y: 68, t: '학교' },
              { x: 64, y: 232, t: '또래집단' },
              { x: 416, y: 232, t: '대중매체' },
            ].map((n) => (
              <g key={n.t}>
                <rect x={n.x - 42} y={n.y - 18} width="84" height="36" rx="8" fill={p.card} stroke={p.emerald} strokeWidth="2" />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">{n.t}</text>
              </g>
            ))}
          </g>
        );

      case 'GeneralHistory':
        return (
          <g>
            {[
              { x: 58, t: '1. 사료 수집', s: '유물·문헌·구술' },
              { x: 150, t: '2. 사료 비판', s: '진위·신뢰성 검토' },
              { x: 242, t: '3. 맥락 파악', s: '시대 배경 분석' },
              { x: 334, t: '4. 역사 해석', s: '인과·의미 재구성' },
              { x: 424, t: '5. 현재와 연결', s: '성찰과 교훈' },
            ].map((step, idx) => (
              <g key={step.t}>
                <rect x={step.x - 42} y="102" width="84" height="86" rx="10" fill={p.card} stroke={p.primary} strokeWidth="2.2" />
                <text x={step.x} y="138" textAnchor="middle" fill={p.primary} fontSize="11.5" fontWeight="800">{step.t}</text>
                <text x={step.x} y="162" textAnchor="middle" fill={p.subText} fontSize="10.5">{step.s}</text>
                {idx < 4 && (
                  <line x1={step.x + 42} y1="145" x2={step.x + 50} y2="145" stroke={p.amber} strokeWidth="2.5" markerEnd={`url(#${arrowId})`} />
                )}
              </g>
            ))}
            <text x="240" y="64" textAnchor="middle" fill={p.text} fontSize="13.5" fontWeight="700">역사가의 사료 탐구 및 역사 해석 과정</text>
          </g>
        );

      case 'RegionalHistory':
        return (
          <g>
            <circle cx="240" cy="150" r="52" fill={p.cardAlt} stroke={p.primary} strokeWidth="2.5" />
            <text x="240" y="145" textAnchor="middle" fill={p.primary} fontSize="13" fontWeight="800">우리 지역의</text>
            <text x="240" y="164" textAnchor="middle" fill={p.primary} fontSize="13" fontWeight="800">역사와 정체성</text>

            {[
              { x: 85, y: 72, t: '유적 · 문화유산', d: '향교·산성·기념물' },
              { x: 395, y: 72, t: '고문서 · 읍지', d: '지방지·고지도' },
              { x: 85, y: 228, t: '지명 유래', d: '자연·역사 흔적' },
              { x: 395, y: 228, t: '구술 · 생활사', d: '주민 증언·장터' },
            ].map((b) => (
              <g key={b.t}>
                <line x1={b.x} y1={b.y} x2="240" y2="150" stroke={p.stroke} strokeWidth="1.8" strokeDasharray="4 3" />
                <rect x={b.x - 62} y={b.y - 26} width="124" height="52" rx="10" fill={p.card} stroke={p.emerald} strokeWidth="2" />
                <text x={b.x} y={b.y - 4} textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">{b.t}</text>
                <text x={b.x} y={b.y + 15} textAnchor="middle" fill={p.subText} fontSize="10.5">{b.d}</text>
              </g>
            ))}
          </g>
        );

      case 'KoreanHistory':
        return (
          <g>
            <line x1="36" y1="150" x2="444" y2="150" stroke={p.primary} strokeWidth="3.5" markerEnd={`url(#${arrowId})`} />
            {[
              { x: 60, era: '고조선', sub: '청동기·8조법', up: true },
              { x: 120, era: '삼국', sub: '고구려·백제·신라', up: false },
              { x: 180, era: '남북국', sub: '통일신라·발해', up: true },
              { x: 240, era: '고려', sub: '귀족·무신·다원성', up: false },
              { x: 300, era: '조선', sub: '유교·성리학 질서', up: true },
              { x: 360, era: '근대', sub: '개항·독립운동', up: false },
              { x: 420, era: '현대', sub: '민주화·산업화', up: true },
            ].map((item) => (
              <g key={item.era}>
                <circle cx={item.x} cy="150" r="7" fill={p.amber} stroke={p.card} strokeWidth="2" />
                <rect
                  x={item.x - 42}
                  y={item.up ? 68 : 176}
                  width="84"
                  height="52"
                  rx="8"
                  fill={p.card}
                  stroke={p.secondary}
                  strokeWidth="1.8"
                />
                <text x={item.x} y={item.up ? 90 : 198} textAnchor="middle" fill={p.text} fontSize="12" fontWeight="800">
                  {item.era}
                </text>
                <text x={item.x} y={item.up ? 108 : 216} textAnchor="middle" fill={p.subText} fontSize="10">
                  {item.sub}
                </text>
              </g>
            ))}
          </g>
        );

      case 'MotionEnergy':
        return (
          <g>
            {/* 작용점 물체 */}
            <rect x="82" y="168" width="52" height="52" rx="10" fill={p.cardAlt} stroke={p.primary} strokeWidth="2.5" />
            <circle cx="108" cy="194" r="5" fill={p.text} />
            <text x="108" y="242" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="700">물체 (작용점)</text>

            {/* 평행사변형 보조선 */}
            <line x1="250" y1="88" x2="368" y2="124" stroke={p.muted} strokeWidth="1.6" strokeDasharray="5 4" />
            <line x1="226" y1="230" x2="368" y2="124" stroke={p.muted} strokeWidth="1.6" strokeDasharray="5 4" />

            {/* F1, F2, 합력 F */}
            <line x1="108" y1="194" x2="246" y2="90" stroke={p.secondary} strokeWidth="3" markerEnd={`url(#${arrowBlueId})`} />
            <line x1="108" y1="194" x2="222" y2="230" stroke={p.emerald} strokeWidth="3" markerEnd={`url(#${arrowId})`} />
            <line x1="108" y1="194" x2="362" y2="126" stroke={p.rose} strokeWidth="3.8" markerEnd={`url(#${arrowRedId})`} />

            <text x="172" y="116" fill={p.secondary} fontSize="13" fontWeight="800">힘 F₁</text>
            <text x="176" y="246" fill={p.emerald} fontSize="13" fontWeight="800">힘 F₂</text>
            <text x="298" y="110" fill={p.rose} fontSize="14" fontWeight="800">알짜힘(합력) F = F₁ + F₂</text>
          </g>
        );

      case 'Matter':
        return (
          <g>
            {/* 기체 (상), 고체 (좌하), 액체 (우하) */}
            <circle cx="240" cy="64" r="42" fill={p.card} stroke={p.secondary} strokeWidth="2.4" />
            <text x="240" y="60" textAnchor="middle" fill={p.secondary} fontSize="14" fontWeight="800">기체</text>
            <text x="240" y="78" textAnchor="middle" fill={p.subText} fontSize="10.5">입자 간격 매우 멂</text>

            <circle cx="105" cy="224" r="42" fill={p.card} stroke={p.primary} strokeWidth="2.4" />
            <text x="105" y="220" textAnchor="middle" fill={p.primary} fontSize="14" fontWeight="800">고체</text>
            <text x="105" y="238" textAnchor="middle" fill={p.subText} fontSize="10.5">규칙적 배열</text>

            <circle cx="375" cy="224" r="42" fill={p.card} stroke={p.emerald} strokeWidth="2.4" />
            <text x="375" y="220" textAnchor="middle" fill={p.emerald} fontSize="14" fontWeight="800">액체</text>
            <text x="375" y="238" textAnchor="middle" fill={p.subText} fontSize="10.5">비교적 자유 운동</text>

            {/* 고체 <-> 액체 */}
            <line x1="152" y1="214" x2="324" y2="214" stroke={p.rose} strokeWidth="2.2" markerEnd={`url(#${arrowRedId})`} />
            <text x="240" y="206" textAnchor="middle" fill={p.rose} fontSize="11.5" fontWeight="700">융해 (열 흡수)</text>
            <line x1="324" y1="236" x2="152" y2="236" stroke={p.secondary} strokeWidth="2.2" markerEnd={`url(#${arrowBlueId})`} />
            <text x="240" y="254" textAnchor="middle" fill={p.secondary} fontSize="11.5" fontWeight="700">응고 (열 방출)</text>

            {/* 액체 <-> 기체 */}
            <line x1="348" y1="186" x2="274" y2="98" stroke={p.rose} strokeWidth="2.2" markerEnd={`url(#${arrowRedId})`} />
            <text x="348" y="132" fill={p.rose} fontSize="11.5" fontWeight="700">기화(흡열)</text>
            <line x1="262" y1="108" x2="334" y2="194" stroke={p.secondary} strokeWidth="2.2" markerEnd={`url(#${arrowBlueId})`} />
            <text x="275" y="162" fill={p.secondary} fontSize="11" fontWeight="700">액화(발열)</text>

            {/* 고체 <-> 기체 */}
            <line x1="132" y1="186" x2="206" y2="98" stroke={p.rose} strokeWidth="2.2" markerEnd={`url(#${arrowRedId})`} />
            <text x="128" y="132" textAnchor="end" fill={p.rose} fontSize="11.5" fontWeight="700">승화(흡열)</text>
            <line x1="218" y1="108" x2="146" y2="194" stroke={p.secondary} strokeWidth="2.2" markerEnd={`url(#${arrowBlueId})`} />
          </g>
        );

      case 'Life':
        return (
          <g>
            {[
              { x: 56, t: '세포', s: '생명체 기본 단위', r: 28 },
              { x: 148, t: '조직', s: '모양·기능 같은 세포', r: 31 },
              { x: 240, t: '기관', s: '여러 조직 결합(위·심장)', r: 34 },
              { x: 332, t: '기관계', s: '소화·순환·호흡·배설계', r: 37 },
              { x: 424, t: '개체', s: '독립된 생명체', r: 40 },
            ].map((st, idx) => (
              <g key={st.t}>
                <circle cx={st.x} cy="138" r={st.r} fill={p.card} stroke={p.emerald} strokeWidth="2.4" />
                <text x={st.x} y="143" textAnchor="middle" fill={p.emerald} fontSize="13.5" fontWeight="800">{st.t}</text>
                <text x={st.x} y="205" textAnchor="middle" fill={p.text} fontSize="10.5" fontWeight="600">{st.s}</text>
                {idx < 4 && (
                  <line x1={st.x + st.r + 3} y1="138" x2={st.x + 88 - st.r} y2="138" stroke={p.primary} strokeWidth="2.4" markerEnd={`url(#${arrowId})`} />
                )}
              </g>
            ))}
            <text x="240" y="54" textAnchor="middle" fill={p.text} fontSize="13.5" fontWeight="700">생물의 유기적 구성 단계 (식물은 조직계 포함)</text>
          </g>
        );

      case 'EarthSpace':
        return (
          <g>
            <circle cx="240" cy="150" r="118" fill="none" stroke={p.accent} strokeWidth="1.8" strokeDasharray="6 4" />
            <text x="240" y="24" textAnchor="middle" fill={p.accent} fontSize="12" fontWeight="700">외권 (태양 복사 에너지 · 우주 공간)</text>
            {[
              { x: 150, y: 92, t: '기권', d: '대기·기상 현상', c: p.secondary },
              { x: 330, y: 92, t: '수권', d: '해수·빙하·담수', c: p.primary },
              { x: 150, y: 208, t: '지권', d: '지각·맨틀·핵', c: p.amber },
              { x: 330, y: 208, t: '생물권', d: '모든 생명체', c: p.emerald },
            ].map((sp) => (
              <g key={sp.t}>
                <rect x={sp.x - 54} y={sp.y - 26} width="108" height="52" rx="12" fill={p.card} stroke={sp.c} strokeWidth="2.4" />
                <text x={sp.x} y={sp.y - 3} textAnchor="middle" fill={sp.c} fontSize="13.5" fontWeight="800">{sp.t}</text>
                <text x={sp.x} y={sp.y + 15} textAnchor="middle" fill={p.subText} fontSize="10.5">{sp.d}</text>
              </g>
            ))}
            <line x1="204" y1="92" x2="276" y2="92" stroke={p.stroke} strokeWidth="2" />
            <line x1="204" y1="208" x2="276" y2="208" stroke={p.stroke} strokeWidth="2" />
            <line x1="150" y1="118" x2="150" y2="182" stroke={p.stroke} strokeWidth="2" />
            <line x1="330" y1="118" x2="330" y2="182" stroke={p.stroke} strokeWidth="2" />
            <line x1="196" y1="118" x2="284" y2="182" stroke={p.stroke} strokeWidth="1.6" strokeDasharray="4 3" />
            <line x1="284" y1="118" x2="196" y2="182" stroke={p.stroke} strokeWidth="1.6" strokeDasharray="4 3" />
          </g>
        );

      case 'ScienceSociety':
        return (
          <g>
            <rect x="175" y="28" width="130" height="56" rx="12" fill={p.card} stroke={p.primary} strokeWidth="2.4" />
            <text x="240" y="52" textAnchor="middle" fill={p.primary} fontSize="13.5" fontWeight="800">과학 (Science)</text>
            <text x="240" y="71" textAnchor="middle" fill={p.subText} fontSize="11">자연 원리 탐구·발견</text>

            <rect x="38" y="194" width="140" height="58" rx="12" fill={p.card} stroke={p.emerald} strokeWidth="2.4" />
            <text x="108" y="220" textAnchor="middle" fill={p.emerald} fontSize="13.5" fontWeight="800">기술 (Tech)</text>
            <text x="108" y="239" textAnchor="middle" fill={p.subText} fontSize="11">도구·시스템 발명</text>

            <rect x="302" y="194" width="140" height="58" rx="12" fill={p.card} stroke={p.amber} strokeWidth="2.4" />
            <text x="372" y="220" textAnchor="middle" fill={p.amber} fontSize="13.5" fontWeight="800">사회 (Society)</text>
            <text x="372" y="239" textAnchor="middle" fill={p.subText} fontSize="11">윤리·제도·시민 합의</text>

            <line x1="190" y1="84" x2="122" y2="190" stroke={p.primary} strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            <line x1="290" y1="84" x2="358" y2="190" stroke={p.amber} strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            <line x1="182" y1="224" x2="298" y2="224" stroke={p.emerald} strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            <text x="240" y="152" textAnchor="middle" fill={p.text} fontSize="12" fontWeight="800">STS 상호작용</text>
          </g>
        );

      default:
        return (
          <g>
            <rect x="60" y="80" width="360" height="140" rx="14" fill={p.card} stroke={p.stroke} strokeDasharray="6 4" strokeWidth="2" />
            <text x="240" y="154" textAnchor="middle" fill={p.subText} fontSize="13" fontWeight="600">
              내용 영역을 선택하면 1:1 개념 구조도가 표시됩니다.
            </text>
          </g>
        );
    }
  };

  return (
    <div className={className}>
      {showTitle && meta && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>{meta.title}</span>
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">{meta.areaLabel}</span>
        </div>
      )}
      <svg
        viewBox="0 0 480 280"
        width="100%"
        role="img"
        aria-label={meta?.title ?? '교육과정 개념 시각화 다이어그램'}
        className="block h-auto w-full select-none rounded-lg"
        style={{ background: p.bg }}
      >
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill={p.stroke} />
          </marker>
          <marker id={arrowRedId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill={p.rose} />
          </marker>
          <marker id={arrowBlueId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill={p.secondary} />
          </marker>
        </defs>
        {renderDiagram()}
      </svg>
    </div>
  );
};
