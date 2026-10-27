import type { CurriculumContext, GenreId, MaterialSet, MaterialVariant, ReadingLevel } from '@/lib/domain/types';
import { MockProvider } from './mockProvider';
import { getGenre } from '@/lib/text/genres';
import { toChoseong } from '@/lib/text/korean';

/**
 * GeminiProvider
 * - VITE_GEMINI_API_KEY 가 설정된 경우 Gemini API로 읽기자료 본문을 생성한다.
 * - 교육과정 사실(핵심 아이디어·내용 요소)은 프롬프트에 TTL 원문으로 주입하고, 임의 수치·성취기준 생성을 금지한다.
 * - 네트워크 오류/파싱 실패 시 MockProvider 결과로 안전하게 폴백한다.
 * - 지도안 슬롯팅·시간 분배는 결정적 규칙 엔진(Mock 동일 로직)을 사용한다.
 */
export class GeminiProvider extends MockProvider {
  override readonly name: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gemini-2.0-flash'
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
      '출력: JSON 한 개. 형식 {"쉬움":{"title":"","paragraphs":[""]},"보통":{...},"도전":{...}}',
      '쉬움=기초 어휘 3문단, 보통=표준 4문단, 도전=심화·학술 어휘 5문단. 각 문단 2~4문장.',
    ].join('\n');

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = JSON.parse(text) as Record<ReadingLevel, { title: string; paragraphs: string[] }>;
      const variants = { ...fallback.variants };
      (['쉬움', '보통', '도전'] as ReadingLevel[]).forEach((lv) => {
        const p = parsed?.[lv];
        if (p && Array.isArray(p.paragraphs) && p.paragraphs.length > 0) {
          const v: MaterialVariant = {
            ...fallback.variants[lv],
            title: p.title || fallback.variants[lv].title,
            paragraphs: p.paragraphs.map(String),
            glossary: fallback.variants[lv].glossary.map((g) => ({ ...g, hint: g.hint || toChoseong(g.term) })),
          };
          variants[lv] = v;
        }
      });
      return { ...fallback, variants, model: this.name };
    } catch (err) {
      console.warn('[GeminiProvider] 생성 실패 — Mock 결과로 폴백합니다.', err);
      return { ...fallback, model: `${fallback.model} (Gemini 폴백)` };
    }
  }
}
