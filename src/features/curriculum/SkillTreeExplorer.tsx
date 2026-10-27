import React from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  HelpCircle,
  FileText,
  Presentation,
  ClipboardList,
  ArrowRight,
  Radio,
  Compass,
} from 'lucide-react';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { ConceptVisual, getConceptVisual } from '@/features/visuals/conceptVisuals';
import { ELEMENT_CATEGORY_KO } from '@/lib/generators/material';

export const SkillTreeExplorer: React.FC<{
  onProceedNext?: () => void;
  showProceedButton?: boolean;
}> = ({ onProceedNext, showProceedButton = true }) => {
  const {
    subjectId,
    grade,
    areaId,
    coreIdeaId,
    elementIds,
    setSubjectId,
    setGrade,
    selectArea,
    selectCoreIdea,
    toggleElement,
  } = useAppStore();

  const subjects = ontologyStore.getSubjects();
  const currentSubject = ontologyStore.getSubject(subjectId) ?? subjects[0];
  const nodes = ontologyStore.getCurriculumNodes(subjectId);

  const areas = nodes.filter((n) => n.type === 'area');
  const coreIdeas = nodes.filter((n) => n.type === 'coreIdea' && n.parentIds.includes(areaId));
  const elements = nodes.filter((n) => n.type === 'element' && n.parentIds.includes(areaId));
  const visualMeta = getConceptVisual(areaId);

  const categoryBadgeColor: Record<string, string> = {
    KnowledgeUnderstanding: 'bg-blue-50 text-blue-700 border-blue-200',
    ProcessSkill: 'bg-purple-50 text-purple-700 border-purple-200',
    ValueAttitude: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-4">
      {/* 상단 교과 / 학년 / 역량 헤더 */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">교과 선택</span>
            {subjects.map((subj) => {
              const active = subj.id === subjectId;
              const areaCount = ontologyStore.getCurriculumNodes(subj.id).filter((n) => n.type === 'area').length;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSubjectId(subj.id as 'social' | 'science')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{subj.name}과</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {areaCount}영역
                  </span>
                </button>
              );
            })}

            <div className="mx-2 h-6 w-px bg-slate-200" />

            <span className="text-xs font-bold text-slate-500">대상 학년</span>
            {([1, 2, 3] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  grade === g
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                중학교 {g}학년
              </button>
            ))}
          </div>

          {/* 2022 개정 교과 핵심 역량 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">함양 역량:</span>
            {currentSubject?.competencies.map((comp) => (
              <span
                key={comp.id}
                className="rounded-full border border-indigo-100 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700"
              >
                {comp.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 가로 4열 인터랙티브 스킬트리 캔버스 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 1열: 내용 영역 (Root) - 단일 선택(Radio) 강제 */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <Radio className="h-3.5 w-3.5" />
                <span>1열 · 내용 영역 (Root)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">단일 선택(Radio) · 1차시 수업 응집도 보장</p>
            </div>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
              {areas.length}종
            </span>
          </div>

          <div className="max-h-[520px] flex-1 space-y-1.5 overflow-y-auto p-3">
            {areas.map((area) => {
              const selected = area.id === areaId;
              const elCount = nodes.filter((n) => n.type === 'element' && n.parentIds.includes(area.id)).length;
              return (
                <label
                  key={area.id}
                  onClick={() => selectArea(area.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 transition ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="curriculum-area-radio"
                      checked={selected}
                      onChange={() => selectArea(area.id)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-bold">{area.label}</div>
                      <div className="text-[11px] text-slate-400">{area.id}</div>
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    요소 {elCount}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2열: 핵심 아이디어 (Branch) - 단일 선택 */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
                <Compass className="h-3.5 w-3.5" />
                <span>2열 · 핵심 아이디어 (Branch)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">선택 영역에 직결된 일반화 핵심 명제</p>
            </div>
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
              {coreIdeas.length}건
            </span>
          </div>

          <div className="max-h-[520px] flex-1 space-y-2.5 overflow-y-auto p-3">
            {coreIdeas.map((ci, idx) => {
              const selected = ci.id === coreIdeaId;
              return (
                <div
                  key={ci.id}
                  onClick={() => selectCoreIdea(ci.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition ${
                    selected
                      ? 'border-purple-600 bg-purple-50/80 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800">
                      <input
                        type="radio"
                        name="curriculum-coreidea-radio"
                        checked={selected}
                        onChange={() => selectCoreIdea(ci.id)}
                        className="h-3.5 w-3.5 accent-purple-600"
                      />
                      핵심 아이디어 #{idx + 1}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">TTL 원문</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-slate-800">
                    "{ci.description || ci.label}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3열: 세부 내용 요소 (Leaves) - 다중 선택(Checkbox) */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>3열 · 내용 요소 (Leaves)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">다중 선택(Checkbox) 가능</p>
            </div>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {elementIds.length}/{elements.length}
            </span>
          </div>

          <div className="max-h-[520px] flex-1 space-y-2 overflow-y-auto p-3">
            {elements.map((el) => {
              const checked = elementIds.includes(el.id);
              const catLabel = ELEMENT_CATEGORY_KO[el.elementCategory ?? ''] ?? '내용 요소';
              const badgeCls = categoryBadgeColor[el.elementCategory ?? ''] ?? 'bg-slate-100 text-slate-700 border-slate-200';
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => toggleElement(el.id)}
                  className={`flex w-full items-start justify-between gap-2 rounded-lg border p-2.5 text-left transition ${
                    checked
                      ? 'border-emerald-600 bg-emerald-50/70 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {checked ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold">{el.label}</div>
                      <span className={`mt-1 inline-block rounded border px-1.5 py-0.2 text-[10px] font-semibold ${badgeCls}`}>
                        {catLabel}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4열: 1:1 매칭 동적 개념 시각화 패널 (DynamicCurriculumVisual) */}
        <div className="flex flex-col rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/70 px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>4열 · 1:1 동적 개념 시각화 패널</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600">
                {visualMeta?.title ?? '영역 선택 시 개념 구조도가 실시간 연동됩니다'}
              </p>
            </div>
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
              1:1 SVG 동기화
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
            {/* 고화질 벡터 SVG 다이어그램 */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-2xs">
              <ConceptVisual areaId={areaId} theme="light" />
            </div>

            {visualMeta && (
              <>
                <p className="text-xs leading-relaxed text-slate-600">{visualMeta.caption}</p>

                {/* 핵심 키워드 */}
                <div className="flex flex-wrap gap-1">
                  {visualMeta.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* 교사용 핵심 탐구 발문 2종 실시간 노출 */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>교사용 핵심 탐구 발문 (Key Inquiry Prompts)</span>
                  </div>
                  <ol className="list-decimal space-y-1 pl-4 text-xs text-slate-800">
                    <li>{visualMeta.prompts[0]}</li>
                    <li>{visualMeta.prompts[1]}</li>
                  </ol>
                </div>

                {/* 4대 산출물 1:1 연계 배지 */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                      <FileText className="h-3 w-3" /> 지도안 연동
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      <ClipboardList className="h-3 w-3" /> 학생 활동지(A4) 연동
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">
                      <Presentation className="h-3 w-3" /> 교실 PPT 슬라이드 연동
                    </span>
                  </div>

                  {showProceedButton && onProceedNext && (
                    <button
                      type="button"
                      onClick={onProceedNext}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                    >
                      <span>Step 2 읽기자료 생성으로</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
