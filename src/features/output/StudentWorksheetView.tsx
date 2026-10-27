import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { ConceptVisual, getConceptVisual } from '@/features/visuals/conceptVisuals';
import { GraphicOrganizer } from '@/features/visuals/GraphicOrganizer';
import { getGenre } from '@/lib/text/genres';

export const StudentWorksheetView: React.FC = () => {
  const {
    genreId,
    readingLevel,
    selectedStrategyIds,
    learningObjective,
    getCurriculumContext,
    getCurrentVariant,
  } = useAppStore();

  const ctx = getCurriculumContext();
  const variant = getCurrentVariant();
  const visual = getConceptVisual(ctx.areaId);
  const genre = getGenre(genreId);
  const allStrategies = ontologyStore.getReadingStrategies();
  const selectedStrategies = selectedStrategyIds
    .map((id) => allStrategies.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const primaryStrategy = selectedStrategies[0] ?? {
    id: 'Strat_KWL',
    label: 'KWL',
  };

  return (
    <div className="mx-auto max-w-[210mm] space-y-5 rounded-xl border border-slate-300 bg-white p-8 text-slate-900 shadow-sm print:border-0 print:p-0 print:shadow-none">
      {/* 학생 활동지 상단 헤더 & 인적사항 기재란 */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
          <span>
            2022 개정 교육과정 · 중학교 {ctx.subjectName}과 ({ctx.areaLabel})
          </span>
          <span>
            읽기자료 수준: [{readingLevel}] · 장르: [{genre.label}]
          </span>
        </div>
        <h1 className="mt-1.5 text-center text-xl font-extrabold tracking-tight text-slate-950">
          【 학생 탐구 활동지 】 {variant.title}
        </h1>

        <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg border border-slate-400 bg-slate-50 px-4 py-2 text-xs font-semibold">
          <div>중학교 ( &nbsp;&nbsp;&nbsp; )학년</div>
          <div>( &nbsp;&nbsp;&nbsp; )반</div>
          <div>( &nbsp;&nbsp;&nbsp; )번</div>
          <div>성명: ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
        </div>

        <div className="mt-2 rounded bg-slate-100 px-3 py-1.5 text-xs text-slate-800">
          <span className="font-bold">학습 목표: </span>
          {learningObjective}
        </div>
      </div>

      {/* 1. 탐구 읽기자료 */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center justify-between border-l-4 border-slate-900 pl-2.5 text-sm font-extrabold">
          <span>1. 탐구 읽기자료 — 「{variant.title}」</span>
          <span className="text-[11px] font-medium text-slate-500">
            핵심 어휘에 밑줄을 그으며 읽어 봅시다.
          </span>
        </h2>

        <div className="space-y-2.5 rounded-lg border border-slate-300 bg-white p-4 text-[13px] leading-relaxed text-slate-900">
          {variant.paragraphs.map((p, idx) => (
            <p key={idx} className="indent-4">
              {p}
            </p>
          ))}

          {variant.table && (
            <div className="mt-3 overflow-x-auto">
              <div className="mb-1 text-xs font-bold text-slate-700">{variant.table.caption}</div>
              <table className="plan-table">
                <thead>
                  <tr>
                    {variant.table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variant.table.rows.map((r, rIdx) => (
                    <tr key={rIdx}>
                      {r.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* 2. [개념 시각화 구조도] 탐구 (다이어그램 및 탐구 발문 필기 라인) */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center justify-between border-l-4 border-slate-900 pl-2.5 text-sm font-extrabold">
          <span>2. [개념 시각화 구조도] 탐구 — {visual?.title ?? ctx.areaLabel}</span>
          <span className="text-[11px] font-medium text-slate-500">1:1 개념 다이어그램</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="rounded-lg border border-slate-300 p-2 md:col-span-6">
            <ConceptVisual areaId={ctx.areaId} theme="light" />
          </div>
          <div className="flex flex-col justify-between space-y-2.5 md:col-span-6">
            {(visual?.prompts ?? ['구조도의 핵심 요소를 찾아 설명해 보세요.', '실생활 사례와 연결해 보세요.']).map(
              (prompt, idx) => (
                <div key={idx} className="rounded-lg border border-slate-300 p-3">
                  <div className="text-xs font-bold text-slate-900">
                    탐구 발문 {idx + 1}. {prompt}
                  </div>
                  <div className="handwriting-lines mt-2 h-16 w-full rounded border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-400">
                    나의 생각:
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 3. 필수 핵심 어휘 초성 채우기 */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center justify-between border-l-4 border-slate-900 pl-2.5 text-sm font-extrabold">
          <span>3. 필수 핵심 어휘 초성 채우기</span>
          <span className="text-[11px] font-medium text-slate-500">
            뜻풀이와 초성 힌트를 보고 빈칸에 알맞은 핵심 어휘를 써넣으세요.
          </span>
        </h2>

        <table className="plan-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>번호</th>
              <th style={{ width: '20%' }}>초성 힌트</th>
              <th style={{ width: '48%' }}>뜻풀이</th>
              <th style={{ width: '20%' }}>정답 어휘 쓰기</th>
            </tr>
          </thead>
          <tbody>
            {variant.glossary.map((g, idx) => (
              <tr key={idx}>
                <td className="text-center font-bold">{idx + 1}</td>
                <td className="text-center font-mono text-sm font-bold tracking-widest text-indigo-900">
                  [ {g.hint} ]
                </td>
                <td>{g.meaning}</td>
                <td className="text-center text-slate-300">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 4. 독서전략 그래픽 조직자 (손글씨 필기용 점선 박스) */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center justify-between border-l-4 border-slate-900 pl-2.5 text-sm font-extrabold">
          <span>4. 독서전략 그래픽 조직자 활동</span>
          <span className="text-[11px] font-medium text-slate-500">
            적용 전략: {selectedStrategies.map((s) => s.label).join(' · ')}
          </span>
        </h2>

        <div className="rounded-lg border border-slate-300 p-3">
          <GraphicOrganizer
            strategyId={primaryStrategy.id}
            strategyLabel={primaryStrategy.label}
            mode="worksheet"
            topic={`${ctx.areaLabel} (${ctx.elements.map((e) => e.label).join(', ')})`}
          />
        </div>
      </section>

      {/* 5. 생각 확장 서술형 질문 (이해 / 추론 / 비평) */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center justify-between border-l-4 border-slate-900 pl-2.5 text-sm font-extrabold">
          <span>5. 생각 확장 3수준 서술형 질문 ([이해] · [추론] · [비평])</span>
          <span className="text-[11px] font-medium text-slate-500">글의 근거를 들어 완결된 문장으로 서술하세요.</span>
        </h2>

        <div className="space-y-2.5">
          {variant.questions.map((q, idx) => (
            <div key={idx} className="rounded-lg border border-slate-300 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-white">
                  [{q.level}] {q.kind}
                </span>
                <span>
                  문항 {idx + 1}. {q.question}
                </span>
              </div>
              <div className="handwriting-lines mt-2 h-16 w-full rounded border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-400">
                서술 답안:
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
