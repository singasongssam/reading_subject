import type { CurriculumContext, MaterialVariant, QuizItem } from '@/lib/domain/types';
import { shuffleWithSeed, stripPeriod, toChoseong } from '@/lib/text/korean';

/**
 * 형성평가 퀴즈 생성기 — 초성 / OX / 4지선다
 * 문항 재료: 읽기자료 어휘 사전 + TTL 핵심 아이디어 + TTL 내용 요소 라벨 (임의 사실 생성 없음)
 */
export function generateQuiz(ctx: CurriculumContext, material: MaterialVariant): QuizItem[] {
  const items: QuizItem[] = [];
  const glossary = material.glossary;
  const seed = `${ctx.areaId}-${material.title}`;

  // 1) 초성 퀴즈
  glossary.slice(0, 3).forEach((g, i) => {
    items.push({
      id: `cs-${i}`,
      type: 'choseong',
      question: `다음 뜻에 알맞은 낱말을 초성을 보고 쓰시오.\n"${g.meaning}"`,
      hint: g.hint || toChoseong(g.term),
      answer: g.term,
      explanation: `'${g.term}'의 뜻: ${g.meaning}`,
    });
  });

  // 2) OX 퀴즈
  const ci = stripPeriod(ctx.coreIdeaText);
  items.push({
    id: 'ox-0',
    type: 'ox',
    question: `「${ctx.areaLabel}」 영역의 핵심 아이디어는 "${ci}."이다.`,
    answer: 'O',
    explanation: `교육과정(${ctx.subjectName}과.ttl)에 제시된 핵심 아이디어와 일치합니다.`,
  });
  if (glossary.length >= 2) {
    const [a, b] = shuffleWithSeed(glossary, seed).slice(0, 2);
    items.push({
      id: 'ox-1',
      type: 'ox',
      question: `'${a.term}'의 뜻은 "${b.meaning}"이다.`,
      answer: 'X',
      explanation: `제시된 뜻은 '${b.term}'의 뜻입니다. '${a.term}'의 뜻은 "${a.meaning}"입니다.`,
    });
  }
  if (ctx.elements.length > 0) {
    const e = ctx.elements[0];
    items.push({
      id: 'ox-2',
      type: 'ox',
      question: `'${e.label}'은(는) 「${ctx.areaLabel}」 영역에서 다루는 내용 요소이다.`,
      answer: 'O',
      explanation: `'${e.label}'은(는) 교육과정 온톨로지에서 「${ctx.areaLabel}」 영역의 내용 요소로 연결되어 있습니다.`,
    });
  }

  // 3) 4지선다
  const termPool = Array.from(new Set([...glossary.map((g) => g.term), ...ctx.elements.map((e) => e.label)]));
  glossary.slice(0, 2).forEach((g, i) => {
    const distractors = shuffleWithSeed(
      termPool.filter((t) => t !== g.term),
      `${seed}-${i}`
    ).slice(0, 3);
    const fillers = ['가설', '자료', '관점', '사례'].filter((f) => f !== g.term && !distractors.includes(f));
    while (distractors.length < 3 && fillers.length) distractors.push(fillers.shift()!);
    const options = shuffleWithSeed([g.term, ...distractors], `${seed}-opt-${i}`);
    items.push({
      id: `mcq-${i}`,
      type: 'mcq',
      question: `다음 설명에 해당하는 용어로 알맞은 것은?\n"${g.meaning}"`,
      options,
      answer: g.term,
      explanation: `정답은 '${g.term}'입니다. 읽기자료 어휘 사전을 다시 확인해 보세요.`,
    });
  });
  if (ctx.elements.length >= 1) {
    const correct = ctx.areaLabel;
    items.push({
      id: 'mcq-area',
      type: 'mcq',
      question: `오늘 읽은 자료의 내용 요소 '${ctx.elements.map((e) => e.label).slice(0, 2).join("', '")}'이(가) 속한 내용 영역은?`,
      options: shuffleWithSeed(
        [correct, ...(ctx.subjectId === 'science' ? ['운동과 에너지', '물질', '생명', '지구와 우주', '과학과 사회'] : ['정치', '법', '경제', '사회·문화', '지리 인식'])
          .filter((x) => x !== correct)
          .slice(0, 3)],
        `${seed}-area`
      ),
      answer: correct,
      explanation: `교육과정 온톨로지에서 해당 내용 요소는 「${correct}」 영역에 연결되어 있습니다.`,
    });
  }
  return items;
}
