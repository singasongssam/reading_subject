import React, { useMemo, useState } from 'react';
import {
  Compass,
  BookOpen,
  Lightbulb,
  Clock,
  FileCheck2,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Minus,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { SkillTreeExplorer } from '@/features/curriculum/SkillTreeExplorer';
import { GENRES, textTypeEvidence } from '@/lib/text/genres';
import { recommendTop3 } from '@/lib/strategy/recommend';
import {
  TIME_PRESETS,
  TIME_PROFILES,
  summarizePhases,
  sumMinutes,
  formatPhaseBanner,
} from '@/lib/time/distribute';
import { GraphicOrganizer, getOrganizerMeta } from '@/features/visuals/GraphicOrganizer';
import { Step5PreviewOutput } from '@/features/output/Step5PreviewOutput';
import type { ReadingLevel, TimeProfileId } from '@/lib/domain/types';

export const LessonWizard: React.FC = () => {
  const {
    wizardStep,
    setWizardStep,
    genreId,
    readingLevel,
    materialSet,
    isGeneratingMaterial,
    setGenreId,
    setReadingLevel,
    regenerateMaterialSet,
    updateVariantTitle,
    updateVariantParagraph,
    addVariantParagraph,
    removeVariantParagraph,
    updateGlossaryItem,
    addGlossaryItem,
    removeGlossaryItem,
    updateQuestionText,
    selectedStrategyIds,
    organizerModalStrategyId,
    toggleStrategy,
    applyRecommendedTop3,
    setOrganizerModalStrategyId,
    totalMinutes,
    timeProfileId,
    lessonTitle,
    learningObjective,
    events,
    rubric,
    isGeneratingPlan,
    setTotalMinutes,
    applyTimeProfile,
    toggleEventLock,
    setEventMinutes,
    stepEventMinutes,
    autoFitTime,
    updateEventField,
    setLessonTitle,
    setLearningObjective,
    setRubric,
    regenerateGagnePlan,
    getCurriculumContext,
    getCurrentVariant,
  } = useAppStore();

  const [strategyFilter, setStrategyFilter] = useState<'all' | '읽기 전' | '읽기 중' | '읽기 후'>('all');

  const ctx = getCurriculumContext();
  const variant = getCurrentVariant();
  const allStrategies = ontologyStore.getReadingStrategies();
  const allFunctions = ontologyStore.getReadingFunctions();

  const recommendation = useMemo(
    () =>
      recommendTop3(allStrategies, allFunctions, {
        coreIdeaText: ctx.coreIdeaText,
        elementLabels: ctx.elements.map((e) => e.label),
        elementCategories: ctx.elements.map((e) => e.category ?? ''),
        contentType: materialSet.textType.contentType,
        format: materialSet.textType.format,
        totalMinutes,
      }),
    [allStrategies, allFunctions, ctx, materialSet.textType, totalMinutes]
  );

  const steps = [
    { step: 1 as const, title: 'Step 1. 교육과정 스킬트리', sub: '영역(Radio)·개념 시각화', icon: Compass },
    { step: 2 as const, title: 'Step 2. 맞춤 읽기자료', sub: '3수준 분화·5대 장르', icon: BookOpen },
    { step: 3 as const, title: 'Step 3. KNU 독서전략 추천', sub: '다기준 매칭·조직자', icon: Lightbulb },
    { step: 4 as const, title: 'Step 4. 가네 9사태 & 시간 계산기', sub: '스마트 분배·사태 잠금', icon: Clock },
    { step: 5 as const, title: 'Step 5. 완성 지도안 & 4대 산출물', sub: '지도안·활동지·PPT·퀴즈', icon: FileCheck2 },
  ];

  // Step 4 시간 계산 요약
  const currentSum = sumMinutes(events);
  const timeDiff = totalMinutes - currentSum;
  const phaseSummary = summarizePhases(events);

  const stageBadgeCls: Record<string, string> = {
    '읽기 전': 'bg-sky-100 text-sky-800 border-sky-200',
    '읽기 중': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    '읽기 후': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const modalStrategy = organizerModalStrategyId
    ? allStrategies.find((s) => s.id === organizerModalStrategyId) ?? null
    : null;

  return (
    <div className="space-y-5">
      {/* 상단 5단계 마법사 네비게이션 바 (인쇄 시 숨김) */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs no-print">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {steps.map((s) => {
            const Icon = s.icon;
            const active = wizardStep === s.step;
            const done = wizardStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setWizardStep(s.step)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : done
                      ? 'border-indigo-200 bg-indigo-50/70 text-indigo-950 hover:bg-indigo-100/70'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? 'bg-white/20 text-white' : done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-extrabold">{s.title}</div>
                  <div className={`truncate text-[11px] ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {s.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 현재 교육과정 컨텍스트 요약 바 */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-900 px-2 py-0.5 font-bold text-white">
              {ctx.subjectName}과 · 중{ctx.grade}
            </span>
            <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
              영역: {ctx.areaLabel}
            </span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
              내용 요소: {ctx.elements.map((e) => e.label).join(' · ')}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            적용 전략: <strong className="text-slate-800">{selectedStrategyIds.length}종</strong> · 총 수업 시간:{' '}
            <strong className="text-indigo-700">{totalMinutes}분</strong>
          </div>
        </div>
      </div>

      {/* ==================== STEP 1: 교육과정 스킬트리 탐색기 ==================== */}
      {wizardStep === 1 && <SkillTreeExplorer onProceedNext={() => setWizardStep(2)} showProceedButton />}

      {/* ==================== STEP 2: 맞춤 교과 읽기자료 생성기 ==================== */}
      {wizardStep === 2 && (
        <div className="space-y-4">
          {/* 장르 5종 전환 & 3수준 탭 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  [Step 2] 맞춤 교과 읽기자료 생성기 (3수준 분화 × 5대 장르)
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  선택된 「{ctx.areaLabel}」 영역의 핵심 아이디어와 내용 요소를 바탕으로 수준별·장르별 읽기자료를 실시간 생성하고 직접 편집합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => regenerateMaterialSet()}
                disabled={isGeneratingMaterial}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isGeneratingMaterial ? '생성 중...' : '읽기자료 다시 생성'}</span>
              </button>
            </div>

            {/* 5대 장르 전환 버튼 */}
            <div className="mt-4">
              <div className="mb-1.5 text-xs font-bold text-slate-700">1) 텍스트 5대 장르 전환 (text.ttl 기반)</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                {GENRES.map((g) => {
                  const active = g.id === genreId;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGenreId(g.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{g.label}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{g.description}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                          {g.textType.format}
                        </span>
                        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          {g.textType.contentType}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* text.ttl 4차원 근거 표시 */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">text.ttl 분류 근거:</span>
                {textTypeEvidence(materialSet.textType).map((ev) => (
                  <span key={ev.dimension} className="rounded border border-slate-200 bg-white px-2 py-0.5">
                    <strong>{ev.dimension}</strong>: {ev.value}
                  </span>
                ))}
              </div>
            </div>

            {/* 3단계 수준별 분화 탭 */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">2) 학생 읽기 수준 분화:</span>
                {(
                  [
                    { lv: '쉬움' as ReadingLevel, desc: '쉬움 (기초 어휘)' },
                    { lv: '보통' as ReadingLevel, desc: '보통 (표준)' },
                    { lv: '도전' as ReadingLevel, desc: '도전 (심화·학술 어휘)' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.lv}
                    type="button"
                    onClick={() => setReadingLevel(t.lv)}
                    className={`rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                      readingLevel === t.lv
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.desc}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500">{materialSet.sourceNote}</span>
            </div>
          </div>

          {/* 본문 인라인 편집기 + 필수 어휘 사전 + 3수준 독해 문항 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* 좌측: 읽기 본문 인라인 편집 */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                  읽기 본문 인라인 편집기 ({readingLevel} 수준 · 문단별 들여쓰기)
                </span>
                <button
                  type="button"
                  onClick={addVariantParagraph}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" /> 문단 추가
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">읽기자료 제목</label>
                <input
                  type="text"
                  value={variant.title}
                  onChange={(e) => updateVariantTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-extrabold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2.5">
                {variant.paragraphs.map((para, idx) => (
                  <div key={idx} className="group relative rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{idx + 1}문단 (들여쓰기 적용)</span>
                      {variant.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantParagraph(idx)}
                          className="inline-flex items-center gap-0.5 text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> 삭제
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => updateVariantParagraph(idx, e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white p-2.5 indent-4 text-xs leading-relaxed text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              {variant.table && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-3">
                  <div className="mb-1.5 text-xs font-extrabold text-indigo-900">{variant.table.caption}</div>
                  <table className="plan-table bg-white">
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
                          {r.map((c, cIdx) => (
                            <td key={cIdx}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 우측: 필수 어휘 사전(초성 힌트) + 3수준 독해 문항 */}
            <div className="space-y-4 lg:col-span-5">
              {/* 필수 어휘 사전 */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="mb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">필수 어휘 사전 & 초성 퀴즈 힌트</h3>
                    <p className="text-[11px] text-slate-500">학생 활동지 초성 채우기 및 형성평가 퀴즈와 자동 연동</p>
                  </div>
                  <button
                    type="button"
                    onClick={addGlossaryItem}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> 어휘 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {variant.glossary.map((g, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={g.term}
                          onChange={(e) => updateGlossaryItem(idx, { ...g, term: e.target.value })}
                          className="w-1/3 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-extrabold text-slate-900"
                          placeholder="용어"
                        />
                        <input
                          type="text"
                          value={g.hint}
                          onChange={(e) => updateGlossaryItem(idx, { ...g, hint: e.target.value })}
                          className="w-1/3 rounded border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-xs font-bold text-amber-900"
                          placeholder="초성 힌트"
                        />
                        <button
                          type="button"
                          onClick={() => removeGlossaryItem(idx)}
                          className="ml-auto text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={g.meaning}
                        onChange={(e) => updateGlossaryItem(idx, { ...g, meaning: e.target.value })}
                        className="mt-1.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                        placeholder="뜻풀이"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3수준 독해 문항 ([이해] 사실 확인, [추론] 인과관계, [비평] 가치 평가) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  3수준 독해 문항 ([이해] 사실 확인 · [추론] 인과관계 · [비평] 가치 평가)
                </h3>
                <div className="mt-2.5 space-y-2.5">
                  {variant.questions.map((q, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className="inline-block rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        [{q.level}] {q.kind}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestionText(idx, e.target.value, q.answerHint)}
                        className="mt-1.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={q.answerHint}
                        onChange={(e) => updateQuestionText(idx, q.question, e.target.value)}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                        placeholder="예시 답안 / 채점 힌트"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Step 1 스킬트리로
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700"
            >
              <span>Step 3 KNU 독서전략 추천으로</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 3: 온톨로지 기반 KNU 독서전략 추천기 ==================== */}
      {wizardStep === 3 && (
        <div className="space-y-4">
          {/* 상단 AI 최적 전략 3종 추천 배너 */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-indigo-700">
                  readstrategy.ttl (15대 독서기능 · 54종 독서전략) 다기준 매칭 엔진
                </div>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                  [Step 3] 온톨로지 기반 KNU 독서전략 추천기 (읽기 전 · 중 · 후 최적 3종)
                </h2>
              </div>
              <button
                type="button"
                onClick={applyRecommendedTop3}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700"
              >
                <Wand2 className="h-4 w-4" /> 최적 추천 3종 일괄 적용
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {recommendation.top.map((rec) => {
                const st = allStrategies.find((s) => s.id === rec.strategyId);
                const selected = selectedStrategyIds.includes(rec.strategyId);
                return (
                  <div
                    key={rec.strategyId}
                    className={`rounded-xl border-2 p-4 transition ${
                      selected
                        ? 'border-indigo-600 bg-white shadow-sm'
                        : 'border-slate-200 bg-white/80 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${stageBadgeCls[rec.stage]}`}>
                        {rec.stage} 추천
                      </span>
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                        매칭 {rec.score}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-slate-950">{rec.label}</h3>
                      <span className="text-xs font-semibold text-slate-500">{st?.minutes ?? 10}분</span>
                    </div>

                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {rec.reasons.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>

                    {st && (
                      <ol className="mt-2.5 space-y-1 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700">
                        {st.procedure.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ol>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setOrganizerModalStrategyId(rec.strategyId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-600" /> 조직자 미리보기
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStrategy(rec.strategyId)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-indigo-600 text-indigo-700 hover:bg-indigo-50'
                        }`}
                      >
                        {selected ? '✓ 선택됨' : '전략 선택'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 전체 독서전략 카탈로그 & 단계별 필터 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">전체 독서전략 목록 ({recommendation.all.length}종)</span>
                {(['all', '읽기 전', '읽기 중', '읽기 후'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStrategyFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      strategyFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' ? '전체 단계' : st}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">
                선택된 전략: <strong className="text-indigo-700">{selectedStrategyIds.length}개</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendation.all
                .filter((r) => strategyFilter === 'all' || r.stage === strategyFilter)
                .map((rec) => {
                  const selected = selectedStrategyIds.includes(rec.strategyId);
                  const orgMeta = getOrganizerMeta(rec.strategyId);
                  return (
                    <div
                      key={rec.strategyId}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                        selected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${stageBadgeCls[rec.stage]}`}>
                            {rec.stage}
                          </span>
                          <span className="text-xs font-extrabold text-indigo-700">적합도 {rec.score}%</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-900">{rec.label}</span>
                          {orgMeta.hasTemplate && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              전용 조직자
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600">{rec.reasons[0]}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <button
                          type="button"
                          onClick={() => setOrganizerModalStrategyId(rec.strategyId)}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          조직자 템플릿 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStrategy(rec.strategyId)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {selected ? '선택됨' : '선택'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 그래픽 조직자 미리보기 모달 */}
          {modalStrategy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
                  <div>
                    <div className="text-xs font-bold text-indigo-300">KNU 독서전략 그래픽 조직자 템플릿 미리보기</div>
                    <h3 className="text-lg font-extrabold">{modalStrategy.label}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrganizerModalStrategyId(null)}
                    className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4 p-6">
                  <GraphicOrganizer
                    strategyId={modalStrategy.id}
                    strategyLabel={modalStrategy.label}
                    mode="preview"
                    topic={`${ctx.areaLabel} (${ctx.elements.map((e) => e.label).join(', ')})`}
                  />
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <div className="font-bold text-slate-900">3단계 적용 절차 (Procedure Steps)</div>
                    <ol className="mt-1 space-y-1">
                      {modalStrategy.procedure.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedStrategyIds.includes(modalStrategy.id)) {
                        toggleStrategy(modalStrategy.id);
                      }
                      setOrganizerModalStrategyId(null);
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-indigo-700"
                  >
                    이 전략을 수업에 적용하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrganizerModalStrategyId(null)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Step 2 읽기자료로
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700"
            >
              <span>Step 4 가네 9사태 & 시간 계산기로</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: 가네 9사태 슬롯팅 & 스마트 수업시간 자동 분배 계산기 ==================== */}
      {wizardStep === 4 && (
        <div className="space-y-4">
          {/* 스마트 시간 분배 계산기 (Smart Time Distribution Hub) */}
          <div className="rounded-xl border-2 border-indigo-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600">
                  <Clock className="h-4 w-4" />
                  <span>Smart Time Distribution Hub · 오차 제로(0) 보정 알고리즘</span>
                </div>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                  [Step 4] 가네 9사태 슬롯팅 & 스마트 수업시간 자동 분배 계산기
                </h2>
              </div>

              <button
                type="button"
                onClick={() => regenerateGagnePlan()}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-800 hover:bg-indigo-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isGeneratingPlan ? '재구성 중...' : '잠금 제외 9사태 재슬롯팅'}</span>
              </button>
            </div>

            {/* 1) 총 수업 시간 프리셋 (40/45/50/80/90분) 및 15~180분 직접 입력 */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-6">
                <div className="text-xs font-bold text-slate-700">
                  ① 총 수업 시간 프리셋 & 직접 입력 (15~180분)
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {TIME_PRESETS.map((p) => (
                    <button
                      key={p.minutes}
                      type="button"
                      onClick={() => setTotalMinutes(p.minutes)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                        totalMinutes === p.minutes
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1">
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={totalMinutes}
                      onChange={(e) => setTotalMinutes(Number(e.target.value))}
                      className="w-14 text-center text-xs font-extrabold text-slate-900 focus:outline-hidden"
                    />
                    <span className="text-xs font-bold text-slate-500">분</span>
                  </div>
                </div>
              </div>

              {/* 2) 3대 배분 프로파일 */}
              <div className="space-y-2 lg:col-span-6">
                <div className="text-xs font-bold text-slate-700">
                  ② 3대 배분 프로파일 (잠금 사태는 고정하고 미잠금 사태에만 비례 배분)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TIME_PROFILES) as TimeProfileId[]).map((pid) => {
                    const prof = TIME_PROFILES[pid];
                    const active = timeProfileId === pid;
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => applyTimeProfile(pid)}
                        className={`rounded-lg border p-2.5 text-left transition ${
                          active
                            ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{prof.label}</div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{prof.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3) 가로형 3색 세그먼트 타임라인 바 + 1클릭 오차 맞춤 */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  <span className="text-slate-900">{formatPhaseBanner(events)}</span>
                  {phaseSummary.items.map((item) => {
                    const dotCls =
                      item.phase === '도입'
                        ? 'bg-blue-600'
                        : item.phase === '전개'
                          ? 'bg-purple-600'
                          : 'bg-emerald-600';
                    return (
                      <span key={item.phase} className="inline-flex items-center gap-1 text-slate-700">
                        <span className={`h-2.5 w-2.5 rounded-full ${dotCls}`} />
                        {item.phase}: {item.minutes}분 ({item.percent}%)
                      </span>
                    );
                  })}
                </div>

                {/* 합계 일치 배지 및 1클릭 오차 맞춤 버튼 */}
                <div className="flex items-center gap-2">
                  {timeDiff === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" /> 목표 {totalMinutes}분 정확히 일치 (오차 0분)
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                        <AlertTriangle className="h-3.5 w-3.5" /> 현재 합계 {currentSum}분 (
                        {timeDiff > 0 ? `${timeDiff}분 부족` : `${Math.abs(timeDiff)}분 초과`})
                      </span>
                      <button
                        type="button"
                        onClick={autoFitTime}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-extrabold text-slate-950 shadow-2xs hover:bg-amber-400"
                      >
                        <Wand2 className="h-3.5 w-3.5" /> 1클릭 오차 맞춤 (Auto-Fit)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 3색 세그먼트 게이지 바 */}
              <div className="flex h-6 w-full overflow-hidden rounded-lg bg-slate-200">
                {phaseSummary.items.map((item) => {
                  const barCls =
                    item.phase === '도입'
                      ? 'bg-blue-600'
                      : item.phase === '전개'
                        ? 'bg-purple-600'
                        : 'bg-emerald-600';
                  return (
                    <div
                      key={item.phase}
                      style={{ width: `${Math.max(4, item.percent)}%` }}
                      className={`flex items-center justify-center text-[11px] font-extrabold text-white transition-all ${barCls}`}
                    >
                      {item.phase} {item.minutes}분 ({item.percent}%)
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 지도안 제목 및 학습 목표 편집 */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-600">교수·학습 과정안 제목</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-extrabold text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">본시 학습 목표</label>
              <input
                type="text"
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* 개별 가네 9사태 슬롯 카드 */}
          <div className="space-y-3">
            {events.map((ev) => {
              const sharePercent = currentSum > 0 ? Math.round((ev.minutes / currentSum) * 100) : 0;
              const phaseColor =
                ev.phase === '도입'
                  ? 'border-l-blue-600 bg-blue-50/20'
                  : ev.phase === '전개'
                    ? 'border-l-purple-600 bg-purple-50/20'
                    : 'border-l-emerald-600 bg-emerald-50/20';

              return (
                <div
                  key={ev.seq}
                  className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-xs ${phaseColor}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-extrabold text-white">
                        {ev.phase} · {ev.seq}사태
                      </span>
                      <span className="text-sm font-extrabold text-slate-950">{ev.label}</span>
                      <span className="text-xs text-slate-500">— {ev.purpose}</span>
                    </div>

                    {/* [-] 1분, [+] 1분 스테퍼 & 숫자 입력 & 점유율(%) & 잠금(Lock) */}
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        점유율 {sharePercent}%
                      </span>

                      <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                        <button
                          type="button"
                          onClick={() => stepEventMinutes(ev.seq, -1)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100"
                          title="-1분"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={ev.minutes}
                          onChange={(e) => setEventMinutes(ev.seq, Number(e.target.value))}
                          className="w-12 text-center text-xs font-extrabold text-indigo-900 focus:outline-hidden"
                        />
                        <span className="pr-1.5 text-xs font-bold text-slate-500">분</span>
                        <button
                          type="button"
                          onClick={() => stepEventMinutes(ev.seq, 1)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100"
                          title="+1분"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleEventLock(ev.seq)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          ev.locked
                            ? 'bg-amber-500 text-slate-950 shadow-2xs'
                            : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ev.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        <span>{ev.locked ? '잠금됨' : '잠금'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 교수 전략 / 교사 활동 / 학생 활동 / 자료 및 유의점 편집 */}
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">적용 교수 전략 / 독서전략</label>
                        <input
                          type="text"
                          value={ev.strategy}
                          onChange={(e) => updateEventField(ev.seq, 'strategy', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">수업 매체 및 유의점</label>
                        <input
                          type="text"
                          value={ev.materialAndNotice}
                          onChange={(e) => updateEventField(ev.seq, 'materialAndNotice', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[11px] font-bold text-indigo-800">교사 발문 및 교수 활동</label>
                      <textarea
                        rows={3}
                        value={ev.teacherActivity}
                        onChange={(e) => updateEventField(ev.seq, 'teacherActivity', e.target.value)}
                        className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[11px] font-bold text-emerald-800">학생 활동 및 예상 반응</label>
                      <textarea
                        rows={3}
                        value={ev.studentActivity}
                        onChange={(e) => updateEventField(ev.seq, 'studentActivity', e.target.value)}
                        className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3수준 평가 루브릭 (상/중/하) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900">
              3수준 성취 평가 루브릭 (상 Excellent · 중 Good · 하 Needs Work)
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-indigo-700">상 (Excellent)</label>
                <textarea
                  rows={2}
                  value={rubric.high}
                  onChange={(e) => setRubric({ ...rubric, high: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-700">중 (Good)</label>
                <textarea
                  rows={2}
                  value={rubric.mid}
                  onChange={(e) => setRubric({ ...rubric, mid: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-amber-700">하 (Needs Work)</label>
                <textarea
                  rows={2}
                  value={rubric.low}
                  onChange={(e) => setRubric({ ...rubric, low: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Step 3 독서전략으로
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(5)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700"
            >
              <span>Step 5 완성 지도안 & 4대 산출물 출력으로</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 5: 완성 지도안 & 멀티 산출물 출력 시스템 ==================== */}
      {wizardStep === 5 && <Step5PreviewOutput />}
    </div>
  );
};
