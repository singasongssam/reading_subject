import fs from 'fs';
import path from 'path';
import n3 from 'n3';
import { z } from 'zod';

const { Parser } = n3;

// 1. Zod 스키마 정의 (§7 데이터 모델 준수)
const SubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  gradeBands: z.array(z.string()),
  competencies: z.array(z.object({ id: z.string(), label: z.string() })),
  areaIds: z.array(z.string()),
});

const CurriculumNodeSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  type: z.enum(['area', 'coreIdea', 'element', 'unit', 'standard']),
  label: z.string(),
  description: z.string().optional(),
  parentIds: z.array(z.string()),
  gradeBand: z.string().optional(),
  elementCategory: z.enum(['KnowledgeUnderstanding', 'ProcessSkill', 'ValueAttitude']).optional(),
  standardCode: z.string().optional(),
  standardText: z.string().optional(),
  targetVerb: z.string().optional(),
  targetFunctionIds: z.array(z.string()).default([]),
  status: z.enum(['registered', 'unregistered']).default('registered'),
});

const ReadingFunctionSchema = z.object({
  id: z.string(),
  label: z.string(),
  verbs: z.array(z.object({ id: z.string(), label: z.string() })),
  strategyIds: z.array(z.string()),
});

const ReadingStrategySchema = z.object({
  id: z.string(),
  label: z.string(),
  functionIds: z.array(z.string()),
  procedure: z.array(z.string()),
  suitableTextTypes: z.array(z.string()),
  recommendedEvents: z.array(z.number()),
  minutes: z.number(),
  worksheetHint: z.string().optional(),
  reviewStatus: z.enum(['draft', 'reviewed']),
});

const TextTypeCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  attributes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })),
});

const GagneEventSchema = z.object({
  seq: z.number().min(1).max(9),
  label: z.string(),
  purpose: z.string(),
  phase: z.enum(['도입', '전개', '정리']),
  defaultStrategies: z.array(z.string()),
  exampleDescription: z.string().optional(),
});

// TTL 파싱 유틸리티
async function parseTTLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new Parser();
  const quads = [];
  const prefixes = {};

  return new Promise((resolve, reject) => {
    parser.parse(content, (error, quad, parsedPrefixes) => {
      if (error) return reject(error);
      if (quad) quads.push(quad);
      else {
        if (parsedPrefixes) Object.assign(prefixes, parsedPrefixes);
        resolve({ quads, prefixes });
      }
    });
  });
}

// 로컬 이름 추출 (예: http://example.org/reading#Func_Understanding -> Func_Understanding)
function getLocalName(uri) {
  if (uri.includes('#')) return uri.split('#')[1];
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

async function compileAll() {
  console.log('Starting TTL to normalized JSON compilation...');

  // 1. 교육과정 (사회과 & 과학과) 컴파일
  const socialData = await parseTTLFile('data/ttl/original/사회과.ttl');
  const scienceData = await parseTTLFile('data/ttl/original/과학과.ttl');

  const subjects = [];
  const curriculumNodes = [];

  function processCurriculum(subjectId, subjectName, data, prefix) {
    const quads = data.quads;
    const labels = {};
    const descriptions = {};
    const gradeBands = {};
    const types = {};
    const hasArea = [];
    const hasCoreIdea = {};
    const hasContentElement = {};
    const developsCompetency = [];

    quads.forEach((q) => {
      const s = q.subject.value;
      const p = q.predicate.value;
      const o = q.object.value;

      if (p.endsWith('label')) labels[s] = o;
      if (p.endsWith('description')) descriptions[s] = o;
      if (p.endsWith('gradeBand')) gradeBands[s] = o;
      if (p.endsWith('type')) {
        const localType = getLocalName(o);
        if (!types[s]) types[s] = [];
        types[s].push(localType);
      }
      if (p.endsWith('hasArea')) hasArea.push(o);
      if (p.endsWith('hasCoreIdea')) {
        if (!hasCoreIdea[s]) hasCoreIdea[s] = [];
        hasCoreIdea[s].push(o);
      }
      if (p.endsWith('hasContentElement')) {
        if (!hasContentElement[s]) hasContentElement[s] = [];
        hasContentElement[s].push(o);
      }
      if (p.endsWith('developsCompetency')) developsCompetency.push(o);
    });

    const uniqueCompUris = Array.from(new Set(developsCompetency));
    const competencies = uniqueCompUris.map((uri) => ({
      id: getLocalName(uri),
      label: labels[uri] || getLocalName(uri),
    }));

    const uniqueAreaUris = Array.from(new Set(hasArea));

    subjects.push({
      id: subjectId,
      name: subjectName,
      description: descriptions[prefix + (subjectId === 'social' ? 'SocialStudies' : 'Science')],
      gradeBands: ['중학교 1~3학년'],
      competencies,
      areaIds: uniqueAreaUris.map((uri) => getLocalName(uri)),
    });

    // 영역 (LearningArea)
    uniqueAreaUris.forEach((areaUri) => {
      const areaId = getLocalName(areaUri);
      curriculumNodes.push({
        id: areaId,
        subjectId,
        type: 'area',
        label: labels[areaUri] || areaId,
        description: descriptions[areaUri] || '',
        parentIds: [subjectId],
        gradeBand: '중학교 1~3학년',
        targetFunctionIds: [],
        status: 'registered',
      });

      // 핵심 아이디어 (CoreIdea)
      const coreIdeas = Array.from(new Set(hasCoreIdea[areaUri] || []));
      coreIdeas.forEach((coreUri) => {
        const coreId = getLocalName(coreUri);
        const desc = descriptions[coreUri] || '';
        // 라벨 누락 보정: desc의 앞부분 요약 또는 파스칼 케이스 변환
        let label = labels[coreUri];
        if (!label) {
          label = desc.length > 25 ? desc.slice(0, 25) + '...' : desc || coreId;
        }

        curriculumNodes.push({
          id: coreId,
          subjectId,
          type: 'coreIdea',
          label,
          description: desc,
          parentIds: [areaId],
          gradeBand: '중학교 1~3학년',
          targetFunctionIds: [],
          status: 'registered',
        });
      });

      // 내용 요소 (ContentElement)
      const elements = Array.from(new Set(hasContentElement[areaUri] || []));
      elements.forEach((elemUri) => {
        const elemId = getLocalName(elemUri);
        const elemTypes = types[elemUri] || [];
        let elementCategory = 'KnowledgeUnderstanding';
        if (elemTypes.includes('ProcessSkill')) elementCategory = 'ProcessSkill';
        else if (elemTypes.includes('ValueAttitude')) elementCategory = 'ValueAttitude';

        curriculumNodes.push({
          id: elemId,
          subjectId,
          type: 'element',
          label: labels[elemUri] || elemId,
          description: descriptions[elemUri] || '',
          parentIds: [areaId],
          gradeBand: gradeBands[elemUri] || '중학교 1~3학년',
          elementCategory,
          targetFunctionIds: [],
          status: 'registered',
        });
      });
    });
  }

  processCurriculum('social', '사회', socialData, 'https://example.org/curriculum/social-studies#');
  processCurriculum('science', '과학', scienceData, 'https://example.org/curriculum/science#');

  // 2. 가네 9사태 컴파일
  const gagneData = await parseTTLFile('data/ttl/original/가네.ttl');
  const gagneEvents = [];
  const gagneQuads = gagneData.quads;
  const gagneLabels = {};
  const gagneSeqs = {};
  const gagneExamples = {};
  const gagneStrategies = {};

  gagneQuads.forEach((q) => {
    const s = q.subject.value;
    const p = q.predicate.value;
    const o = q.object.value;
    if (p.endsWith('label')) gagneLabels[s] = o;
    if (p.endsWith('sequenceNumber')) gagneSeqs[s] = parseInt(o, 10);
    if (p.endsWith('exampleDescription')) gagneExamples[s] = o;
    if (p.endsWith('hasStrategy')) {
      if (!gagneStrategies[s]) gagneStrategies[s] = [];
      gagneStrategies[s].push(o);
    }
  });

  const phaseBySeq = {
    1: '도입', 2: '도입', 3: '도입',
    4: '전개', 5: '전개', 6: '전개', 7: '전개', 8: '전개',
    9: '정리',
  };

  const purposeBySeq = {
    1: '학습자의 주의를 집중시키고 학습 동기를 유발한다.',
    2: '수업 후 도달해야 할 학습목표를 명시적으로 안내한다.',
    3: '새로운 학습에 필요한 선수 학습 능력을 재생·상기한다.',
    4: '목표와 관련된 학습자료(읽기자료)를 체계적으로 제시한다.',
    5: '독서전략 및 활동 절차에 대한 명확한 학습 지침을 제공한다.',
    6: '학생이 능동적으로 텍스트를 읽고 전략을 적용하도록 수행을 요구한다.',
    7: '학생의 수행 과정과 활동 결과에 대해 교정적 피드백을 제공한다.',
    8: '성취기준 도달 여부를 확인하기 위해 성취 행동을 평가한다.',
    9: '학습 내용을 요약하고 새로운 상황에 적용하도록 파지와 전이를 촉진한다.',
  };

  for (let seq = 1; seq <= 9; seq++) {
    const eventUri = `http://example.org/il-lesson/event${seq}`;
    const stratUris = gagneStrategies[eventUri] || [];
    const defaultStrats = stratUris.map((u) => gagneLabels[u] || getLocalName(u));

    gagneEvents.push({
      seq,
      label: gagneLabels[eventUri] || `사태 ${seq}`,
      purpose: purposeBySeq[seq],
      phase: phaseBySeq[seq],
      defaultStrategies: defaultStrats,
      exampleDescription: gagneExamples[eventUri] || '',
    });
  }

  // 3. 독서기능 & 전략 컴파일
  const readData = await parseTTLFile('data/ttl/original/readstrategy.ttl');
  const readQuads = readData.quads;
  const readLabels = {};
  const funcVerbs = {};
  const funcStrategies = {};
  const strategyFunctions = {};

  readQuads.forEach((q) => {
    const s = q.subject.value;
    const p = q.predicate.value;
    const o = q.object.value;
    if (p.endsWith('label')) readLabels[s] = o;
    if (p.endsWith('hasVerb')) {
      if (!funcVerbs[s]) funcVerbs[s] = [];
      funcVerbs[s].push(o);
    }
    if (p.endsWith('hasStrategy')) {
      if (!funcStrategies[s]) funcStrategies[s] = [];
      funcStrategies[s].push(o);
      if (!strategyFunctions[o]) strategyFunctions[o] = [];
      strategyFunctions[o].push(s);
    }
  });

  const readingFunctions = Object.keys(funcVerbs).map((funcUri) => {
    const funcId = getLocalName(funcUri);
    const verbs = (funcVerbs[funcUri] || []).map((vUri) => ({
      id: getLocalName(vUri),
      label: readLabels[vUri] || getLocalName(vUri).replace('Verb_', ''),
    }));
    const stratIds = (funcStrategies[funcUri] || []).map((sUri) => getLocalName(sUri));

    return {
      id: funcId,
      label: readLabels[funcUri] || funcId,
      verbs,
      strategyIds: Array.from(new Set(stratIds)),
    };
  });

  // 독서전략 표준 절차 및 확장 속성 매핑 (§5.3)
  const readingStrategies = Object.keys(strategyFunctions).map((stratUri) => {
    const stratId = getLocalName(stratUri);
    const stratLabel = readLabels[stratUri] || stratId.replace('Strat_', '');
    const parentFuncIds = Array.from(new Set((strategyFunctions[stratUri] || []).map((u) => getLocalName(u))));

    // 대표 전략별 표준 절차 및 기본 속성 구성
    let procedure = [
      `1단계: [${stratLabel}] 활동의 목적과 학습할 텍스트 범위 확인하기`,
      `2단계: 텍스트를 읽으며 핵심 단어 및 정보를 전략 양식에 맞추어 기록하기`,
      `3단계: 작성한 내용을 점검하고 주요 결론을 종합하여 정리하기`,
    ];
    let suitableTextTypes = ['설명', '기술'];
    let recommendedEvents = [5, 6];
    let minutes = 10;
    let worksheetHint = '활동지 기본 양식';

    if (stratId.includes('KWL')) {
      procedure = [
        '1단계: K(이미 알고 있는 지식) 떠올려 활동지 1열에 적기',
        '2단계: W(더 알고 싶은 내용 및 질문) 생성하여 2열에 적기',
        '3단계: 질문에 대한 답을 능동적으로 찾으며 텍스트 정독하기',
        '4단계: L(새롭게 배운 내용)을 3열에 정리하고 질문 해결 여부 확인하기',
      ];
      suitableTextTypes = ['설명', '기술', '논증'];
      recommendedEvents = [4, 5, 6];
      minutes = 15;
      worksheetHint = 'K-W-L 3칸 표 양식';
    } else if (stratId.includes('벤다이어그램')) {
      procedure = [
        '1단계: 비교·대조할 두 개념 또는 관점 선정하기',
        '2단계: 겹쳐진 가운데 영역에 공통된 특성 기록하기',
        '3단계: 양쪽 고유 영역에 서로 다른 차이점 기록하기',
        '4단계: 공통점과 차이점을 종합하여 비교 결론 작성하기',
      ];
      suitableTextTypes = ['설명', '논증', '혼합적'];
      recommendedEvents = [5, 6];
      minutes = 10;
      worksheetHint = '2원 벤다이어그램 다이어그램';
    } else if (stratId.includes('글_구조_전략')) {
      procedure = [
        '1단계: 문단별 핵심 어휘 및 화제어 찾기',
        '2단계: 문단의 중심 생각(요지)에 밑줄 긋기',
        '3단계: 접속어와 논리적 전개(원인-결과, 문제-해결) 파악하기',
        '4단계: 상하위 위계 구조도로 글 전체 구조 시각화하기',
      ];
      suitableTextTypes = ['설명', '논증'];
      recommendedEvents = [5, 6];
      minutes = 15;
      worksheetHint = '문단별 핵심 키워드 구조도';
    } else if (stratId.includes('SQ3R')) {
      procedure = [
        '1단계: Survey(훑어보기) - 제목, 사진, 요약문 훑어보기',
        '2단계: Question(질문하기) - 제목을 의문문으로 바꾸어 질문 만들기',
        '3단계: Read(자세히 읽기) - 질문의 답을 찾으며 정독하기',
        '4단계: Recite(되새기기) - 중요한 내용을 소리 내거나 요약해 말하기',
        '5단계: Review(다시보기) - 전체 내용을 종합 점검하고 복습하기',
      ];
      suitableTextTypes = ['설명', '기술'];
      recommendedEvents = [4, 5, 6];
      minutes = 20;
      worksheetHint = 'SQ3R 5단계 활동지';
    }

    return {
      id: stratId,
      label: stratLabel,
      functionIds: parentFuncIds,
      procedure,
      suitableTextTypes,
      recommendedEvents,
      minutes,
      worksheetHint,
      reviewStatus: stratId.includes('KWL') || stratId.includes('벤다이어그램') || stratId.includes('글_구조_전략') ? 'reviewed' : 'draft',
    };
  });

  // 4. 텍스트 유형 컴파일
  const textData = await parseTTLFile('data/ttl/original/text.ttl');
  const textQuads = textData.quads;
  const textLabels = {};
  const textDescriptions = {};
  const categoryAttrs = {};

  textQuads.forEach((q) => {
    const s = q.subject.value;
    const p = q.predicate.value;
    const o = q.object.value;
    if (p.endsWith('label')) textLabels[s] = o;
    if (p.endsWith('contentDescription')) textDescriptions[s] = o;
    if (p.endsWith('hasCategory')) {
      if (!categoryAttrs[o]) categoryAttrs[o] = [];
      categoryAttrs[o].push(s);
    }
  });

  const textTypes = Object.keys(categoryAttrs).map((catUri) => {
    const catId = getLocalName(catUri);
    const attrs = categoryAttrs[catUri].map((attrUri) => ({
      id: getLocalName(attrUri),
      label: textLabels[attrUri] || getLocalName(attrUri),
      description: textDescriptions[attrUri] || '',
    }));

    return {
      id: catId,
      label: textLabels[catUri] || catId,
      attributes: attrs,
    };
  });

  // 5. 스키마 검증 (Zod)
  console.log('Validating compiled datasets with Zod schemas...');
  z.array(SubjectSchema).parse(subjects);
  z.array(CurriculumNodeSchema).parse(curriculumNodes);
  z.array(ReadingFunctionSchema).parse(readingFunctions);
  z.array(ReadingStrategySchema).parse(readingStrategies);
  z.array(TextTypeCategorySchema).parse(textTypes);
  z.array(GagneEventSchema).parse(gagneEvents);

  // 6. JSON 파일 저장
  const compiledDir = 'data/compiled';
  if (!fs.existsSync(compiledDir)) fs.mkdirSync(compiledDir, { recursive: true });

  fs.writeFileSync(path.join(compiledDir, 'subjects.json'), JSON.stringify(subjects, null, 2), 'utf-8');
  fs.writeFileSync(path.join(compiledDir, 'curriculum-nodes.json'), JSON.stringify(curriculumNodes, null, 2), 'utf-8');
  fs.writeFileSync(path.join(compiledDir, 'gagne-events.json'), JSON.stringify(gagneEvents, null, 2), 'utf-8');
  fs.writeFileSync(path.join(compiledDir, 'reading-functions.json'), JSON.stringify(readingFunctions, null, 2), 'utf-8');
  fs.writeFileSync(path.join(compiledDir, 'reading-strategies.json'), JSON.stringify(readingStrategies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(compiledDir, 'text-types.json'), JSON.stringify(textTypes, null, 2), 'utf-8');

  // 온톨로지 버전 메타데이터
  const ontologyMeta = {
    versionId: 'v1.0.0-20261017',
    compiledAt: new Date().toISOString(),
    sourceFiles: [
      { name: '사회과.ttl', triples: socialData.quads.length },
      { name: '과학과.ttl', triples: scienceData.quads.length },
      { name: '가네.ttl', triples: gagneData.quads.length },
      { name: 'readstrategy.ttl', triples: readData.quads.length },
      { name: 'text.ttl', triples: textData.quads.length },
    ],
    counts: {
      subjects: subjects.length,
      curriculumNodes: curriculumNodes.length,
      gagneEvents: gagneEvents.length,
      readingFunctions: readingFunctions.length,
      readingStrategies: readingStrategies.length,
      textCategories: textTypes.length,
    },
  };
  fs.writeFileSync(path.join(compiledDir, 'ontology-meta.json'), JSON.stringify(ontologyMeta, null, 2), 'utf-8');

  console.log('✅ Compilation and validation successful!');
  console.log(`- Subjects: ${subjects.length}`);
  console.log(`- Curriculum Nodes: ${curriculumNodes.length}`);
  console.log(`- Gagne Events: ${gagneEvents.length}`);
  console.log(`- Reading Functions: ${readingFunctions.length}`);
  console.log(`- Reading Strategies: ${readingStrategies.length}`);
  console.log(`- Text Categories: ${textTypes.length}`);
}

compileAll().catch((err) => {
  console.error('Compilation failed:', err);
  process.exit(1);
});
