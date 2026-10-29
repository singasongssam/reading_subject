import type { CurriculumContext, GenreId, MaterialSet, MaterialVariant, ReadingLevel } from '@/lib/domain/types';
import { MockProvider } from './mockProvider';
import { getGenre } from '@/lib/text/genres';
import { toChoseong } from '@/lib/text/korean';
import type { PlanInput, PlanOutput } from '@/lib/generators/gagnePlan';
import { getGenerationPreferences, reportGeneration } from './generationContext';
import { callGeminiJson } from './geminiTransport';

/**
 * GeminiProvider
 * - 사용자의 개인 Gemini API 키가 입력된 경우 Gemini API로 읽기자료 본문을 생성한다.
 * - 교육과정 사실(핵심 아이디어·내용 요소)은 프롬프트에 TTL 원문으로 주입하고, 임의 수치·성취기준 생성을 금지한다.
 * - 네트워크 오류/파싱 실패 시 MockProvider 결과로 안전하게 폴백한다.
 * - 지도안 슬롯팅·시간 분배는 결정적 규칙 엔진(Mock 동일 로직)을 사용한다.
 */
export class GeminiProvider extends MockProvider {
  override readonly name: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gemini-2.5-flash'
  ) {
    super();
    this.name = `Gemini (${model})`;
  }

  override async generateMaterialSet(ctx: CurriculumContext, genreId: GenreId): Promise<MaterialSet> {
    const fallback = await super.generateMaterialSet(ctx, genreId);
    if (!this.apiKey) return fallback;
    const genre = getGenre(genreId);
    const prompt = [
      '당신은 대한민국 중학교 교사를 돕는 교육 자료 집필자입니다. 아래 교육과정 정보(원문)만을 근거로 읽기자료를 작성하십시오.',
      '규칙: 성취기준 문구·통계 수치·인명·연도를 지어내지 마십시오. 수치가 필요하면 "[교사 입력: 통계 자료]"로 표시하십시오.',
      `교과: ${ctx.subjectName} / 학년: 중학교 ${ctx.grade}학년 / 내용 영역: ${ctx.areaLabel}`,
      `핵심 아이디어(원문): ${ctx.coreIdeaText}`,
      `내용 요소(원문): ${ctx.elements.map((e) => e.label).join(', ')}`,
      `장르: ${genre.label} (text.ttl: ${genre.textType.sourceMaterial}/${genre.textType.format}/${genre.textType.contentType})`,
      'JSON 형식: {"쉬움":{"title":"","paragraphs":[""],"glossary":[{"term":"","meaning":""}],"questions":[{"level":"이해","kind":"사실 확인","question":"","answerHint":""}]},"보통":{...},"도전":{...}}',
      '각 수준별로 주요 용어 3개와 글의 내용에 근거한 이해·추론·비평 질문 3개도 생성하십시오.',
      '쉬움=기초 어휘 3문단, 보통=표준 4문단, 도전=심화·학술 어휘 5문단. 각 문단 2~4문장.',
      `학급별 맞춤 조건(JSON): ${JSON.stringify(getGenerationPreferences())}`,
      '맞춤 조건을 활용하되 교육과정 원문 사실과 충돌하면 원문이 우선입니다.',
    ].join('\n');

    try {
      const parsed = await callGeminiJson<Record<ReadingLevel, { title: string; paragraphs: string[]; glossary?: Array<{term: string; meaning: string}>; questions?: Array<{level: string; kind: string; question: string; answerHint: string}> }>>(this.apiKey, this.model, prompt, 0.6);
      const variants = { ...fallback.variants };
      (['쉬움', '보통', '도전'] as ReadingLevel[]).forEach((lv) => {
        const p = parsed?.[lv];
        if (p && Array.isArray(p.paragraphs) && p.paragraphs.length > 0) {
          const v: MaterialVariant = {
            ...fallback.variants[lv],
            title: p.title || fallback.variants[lv].title,
            paragraphs: p.paragraphs.map(String),
            glossary: p.glossary?.length ? p.glossary.slice(0, 8).filter(g => g.term && g.meaning).map(g => ({term: String(g.term), meaning: String(g.meaning), hint: toChoseong(String(g.term))})) : fallback.variants[lv].glossary,
            questions: p.questions?.length ? p.questions.slice(0, 6).filter(q => q.question && q.answerHint).map((q, i) => ({ level: (['이해', '추론', '비평'].includes(q.level) ? q.level : ['이해','추론','비평'][i % 3]) as '이해'|'추론'|'비평', kind: String(q.kind || '본문 이해'), question: String(q.question), answerHint: String(q.answerHint) })) : fallback.variants[lv].questions,
          };
          variants[lv] = v;
        }
      });
      if (!(['쉬움', '보통', '도전'] as ReadingLevel[]).some(level => variants[level] !== fallback.variants[level])) throw new Error('AI 응답에 유효한 읽기자료가 없습니다.');
      reportGeneration('ai', 'Gemini가 읽기자료·핵심 어휘·문항을 생성했습니다. 지도안도 재생성해야 새 본문이 활동에 반영됩니다.');
      return { ...fallback, variants, model: this.name };
    } catch (err) {
      reportGeneration('fallback', `Gemini 읽기자료 생성 실패: ${err instanceof Error ? err.message : String(err)}. 규칙 기반 결과를 표시합니다.`);
      console.warn('[GeminiProvider] 생성 실패 — Mock 결과로 폴백합니다.', err);
      return { ...fallback, model: `${fallback.model} (Gemini 폴백)` };
    }
  }

  override async composeGagnePlan(input: PlanInput): Promise<PlanOutput> {
    const base = await super.composeGagnePlan(input);
    if (!this.apiKey) return base;
    const prompt = [
      '당신은 중학교 독서전략 수업 설계 전문가입니다. 아래 자료에 근거해 교사 발문, 학생 활동, 평가 기준을 구체화하세요.',
      '가네 9사태 번호와 명칭, 학습 목표, 시간 배분, 교육과정 정보는 변경할 수 없습니다. 존재하지 않는 성취기준/통계/출처는 만들지 마세요.',
      '오직 JSON: {"events":[{"seq":1,"teacherActivity":"","studentActivity":"","materialAndNotice":""}],"rubric":{"high":"","mid":"","low":""}}',
      `교과: ${input.ctx.subjectName} / 중${input.ctx.grade} / 영역: ${input.ctx.areaLabel}`,
      `핵심 아이디어: ${input.ctx.coreIdeaText}`,
      `내용 요소: ${input.ctx.elements.map(e => e.label).join(', ')}`,
      `읽기자료: ${input.material.title} / ${input.material.paragraphs.join(' ')}`,
      `선택된 전략: ${input.strategies.map(x => x.label + ': ' + x.procedure.join(' → ')).join('; ')}`,
      `기본 지도안: ${JSON.stringify(base.events.map(e => ({seq:e.seq,label:e.label,purpose:e.purpose,minutes:e.minutes,teacherActivity:e.teacherActivity,studentActivity:e.studentActivity})))}`,
      `학급별 맞춤 조건(JSON): ${JSON.stringify(getGenerationPreferences())}`,
      '각 사태의 교사 발문은 읽기자료에서 실제 나타난 개념이나 문장을 특정해야 합니다. 단순히 핵심어를 기록하라는 일반적 활동을 반복하지 마세요.',
      '특히 4~8사태에서 본문에 있는 구체적 주장/근거/사례를 활용한 질문과, 학생이 작성할 근거표·비교표·문항을 제시하세요.',
      '읽기자료에 존재하지 않는 근거, 숫자, 공약 내용이나 사건은 만들지 마세요. 학생에게 본문에서 찾아 표시할 부분을 명시하세요.',
      '학생 활동이 무엇을 비교하고 어떤 근거를 남기며 무엇을 평가받는지 관찰 가능하게 쓰세요.',
      '평가 기준에는 본문 근거의 정확성·주장/근거 구별·독서전략 활용을 수준별로 구체화하세요.',
      '각 활동의 시간·단계·순서는 수정하지 말고 JSON의 정해진 필드만 출력하세요.',
    ].join('\n');
    try {
      const parsed = await callGeminiJson<{ events?: Array<{seq:number;teacherActivity?:string;studentActivity?:string;materialAndNotice?:string}>;rubric?:{high?:string;mid?:string;low?:string} }>(this.apiKey, this.model, prompt, 0.45);
      if (!Array.isArray(parsed.events) || !parsed.events.some(e => typeof e.teacherActivity === 'string' && e.teacherActivity.trim() && typeof e.studentActivity === 'string' && e.studentActivity.trim())) {
        throw new Error('AI 응답에 유효한 수업 활동이 없습니다.');
      }
      const suggestions = new Map((parsed.events || []).map(x => [Number(x.seq),x]));
      reportGeneration('ai', 'Gemini가 현재 읽기자료를 근거로 발문·학생 활동·평가 기준을 개선했습니다.');
      return {
        ...base,
        // Preserve order, minutes, purpose, strategy assignment and curriculum-derived fields.
        events: base.events.map(e => {
          const a = suggestions.get(e.seq);
          return { ...e, teacherActivity: a?.teacherActivity?.trim() || e.teacherActivity,
            studentActivity: a?.studentActivity?.trim() || e.studentActivity,
            materialAndNotice: a?.materialAndNotice?.trim() || e.materialAndNotice };
        }),
        rubric: { high: parsed.rubric?.high?.trim() || base.rubric.high,
          mid: parsed.rubric?.mid?.trim() || base.rubric.mid,
          low: parsed.rubric?.low?.trim() || base.rubric.low },
      };
    } catch (e) {
      reportGeneration('fallback', `Gemini 수업활동 생성 실패: ${e instanceof Error ? e.message : String(e)}. 규칙 기반 결과로 대체합니다.`);
      console.warn('Gemini 수업활동 생성 실패, 규칙 기반으로 대체:', e);
      return base;
    }
  }

}
