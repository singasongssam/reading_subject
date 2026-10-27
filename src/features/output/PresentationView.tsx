import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Timer,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { ConceptVisual, getConceptVisual } from '@/features/visuals/conceptVisuals';
import { formatPhaseBanner } from '@/lib/time/distribute';

export const PresentationView: React.FC = () => {
  const {
    selectedStrategyIds,
    learningObjective,
    events,
    getCurriculumContext,
    getCurrentVariant,
  } = useAppStore();

  const ctx = getCurriculumContext();
  const variant = getCurrentVariant();
  const visual = getConceptVisual(ctx.areaId);
  const allStrategies = ontologyStore.getReadingStrategies();
  const selectedStrategies = selectedStrategyIds
    .map((id) => allStrategies.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const [slideIdx, setSlideIdx] = useState(0);
  const [showPromptPopup, setShowPromptPopup] = useState(true);
  const [showTeacherNote, setShowTeacherNote] = useState(true);

  // 디지털 수업 타이머 (3분, 5분, 10분 프리셋 및 일시정지/리셋)
  const [presetSeconds, setPresetSeconds] = useState(300); // 기본 5분
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const applyTimerPreset = (minutes: number) => {
    const secs = minutes * 60;
    setTimerRunning(false);
    setPresetSeconds(secs);
    setRemainingSeconds(secs);
  };

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');

  const slides = [
    {
      title: `Slide 1 · 도입 및 학습 목표`,
      subtitle: `${ctx.subjectName}과 · ${ctx.areaLabel} (중학교 ${ctx.grade}학년)`,
      teacherNote: `${events[0]?.teacherActivity ?? ''}\n${events[1]?.teacherActivity ?? ''}`,
    },
    {
      title: `Slide 2 · 1:1 핵심 개념 구조도 & 탐구 발문`,
      subtitle: visual?.title ?? ctx.areaLabel,
      teacherNote: `개념 구조도를 칠판/TV 화면에 띄우고 탐구 발문 1·2를 순차적으로 질문합니다.\n발문 1: ${visual?.prompts[0] ?? ''}\n발문 2: ${visual?.prompts[1] ?? ''}`,
    },
    {
      title: `Slide 3 · 본시 읽기자료 & 필수 어휘`,
      subtitle: variant.title,
      teacherNote: `${events[3]?.teacherActivity ?? ''}`,
    },
    {
      title: `Slide 4 · KNU 독서전략 활동 절차`,
      subtitle: selectedStrategies.map((s) => s.label).join(' · ') || '독서전략',
      teacherNote: `${events[4]?.teacherActivity ?? ''}\n${events[5]?.teacherActivity ?? ''}`,
    },
    {
      title: `Slide 5 · 가네 9사태 흐름 & 정리 성찰`,
      subtitle: formatPhaseBanner(events),
      teacherNote: `${events[7]?.teacherActivity ?? ''}\n${events[8]?.teacherActivity ?? ''}`,
    },
  ];

  const curSlide = slides[slideIdx];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl">
      {/* 상단 디지털 수업 타이머 & 슬라이드 네비게이션 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-extrabold text-white">
            교실 투사용 PPT 모드
          </span>
          <span className="text-sm font-bold text-slate-200">{curSlide.title}</span>
          <span className="text-xs text-slate-400">
            ({slideIdx + 1} / {slides.length})
          </span>
        </div>

        {/* 디지털 수업 타이머 (3분, 5분, 10분 프리셋 및 일시정지/리셋) */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5">
          <Timer className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-lg font-extrabold tracking-wider text-amber-300">
            {mm}:{ss}
          </span>
          {[3, 5, 10].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => applyTimerPreset(m)}
              className={`rounded px-2 py-0.5 text-xs font-bold transition ${
                presetSeconds === m * 60
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {m}분
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTimerRunning((r) => !r)}
            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500"
          >
            {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{timerRunning ? '일시정지' : '시작'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setRemainingSeconds(presetSeconds);
            }}
            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>리셋</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
            disabled={slideIdx === 0}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlideIdx(idx)}
              className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                idx === slideIdx ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
            disabled={slideIdx === slides.length - 1}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 메인 슬라이드 캔버스 (고대비 다크 테마) */}
      <div className="min-h-[440px] p-8">
        {slideIdx === 0 && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {ctx.subjectName}과 · {ctx.areaLabel} · 내용 요소: {ctx.elements.map((e) => e.label).join(', ')}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white">{variant.title}</h2>

            <div className="rounded-xl border border-indigo-500/40 bg-slate-900/90 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                영역 핵심 아이디어 (TTL 원문)
              </div>
              <p className="mt-2 text-lg font-bold text-slate-100">"{ctx.coreIdeaText}"</p>
            </div>

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                오늘의 학습 목표 (가네 2사태)
              </div>
              <p className="mt-2 text-base font-semibold leading-relaxed text-emerald-100">
                {learningObjective}
              </p>
            </div>
          </div>
        )}

        {slideIdx === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-7">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-300">{visual?.title ?? ctx.areaLabel}</span>
                <button
                  type="button"
                  onClick={() => setShowPromptPopup((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-extrabold text-slate-950"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showPromptPopup ? '탐구 발문 팝업 숨기기' : '탐구 발문 팝업 열기'}</span>
                </button>
              </div>
              <ConceptVisual areaId={ctx.areaId} theme="dark" />
            </div>

            <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
              {showPromptPopup && visual && (
                <div className="space-y-3 rounded-xl border-2 border-amber-400/70 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-amber-300">
                    <HelpCircle className="h-4 w-4" />
                    <span>실시간 핵심 탐구 발문 (Key Inquiry Prompts)</span>
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-3.5 text-sm leading-relaxed text-white">
                    <span className="font-bold text-amber-400">발문 1. </span>
                    {visual.prompts[0]}
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-3.5 text-sm leading-relaxed text-white">
                    <span className="font-bold text-amber-400">발문 2. </span>
                    {visual.prompts[1]}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-xs font-bold text-slate-400">핵심 개념 키워드</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(visual?.keywords ?? []).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-1 text-xs font-bold text-indigo-200"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {slideIdx === 2 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <BookOpen className="h-4 w-4" />
                <span>수업 활용 읽기자료 본문 (가네 4사태: 학습자료 제시)</span>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-slate-100">
                {variant.paragraphs.map((p, idx) => (
                  <p key={idx} className="indent-3">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-5">
              <div className="text-xs font-bold text-amber-400">필수 핵심 어휘 & 초성 퀴즈</div>
              <div className="space-y-2.5">
                {variant.glossary.map((g, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">{g.term}</span>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-300">
                        초성: {g.hint}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{g.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {slideIdx === 3 && (
          <div className="space-y-5">
            <div className="text-lg font-extrabold text-indigo-300">
              가네 5·6사태 · KNU 독서전략 활동 안내 ({selectedStrategies.map((s) => s.label).join(' · ')})
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {selectedStrategies.map((st) => (
                <div key={st.id} className="rounded-xl border border-indigo-500/40 bg-slate-900 p-4">
                  <div className="text-base font-extrabold text-white">{st.label}</div>
                  <div className="mt-1 text-xs text-indigo-300">권장 소요 시간: {st.minutes}분</div>
                  <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-200">
                    {st.procedure.map((step, i) => (
                      <li key={i} className="rounded bg-slate-950 p-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {slideIdx === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">가네 9사태 수업 진행 타임라인</h3>
              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                {formatPhaseBanner(events)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {events.map((ev) => (
                <div key={ev.seq} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-300">
                      {ev.seq}사태 · {ev.label}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-amber-300">
                      {ev.minutes}분
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-300">{ev.teacherActivity}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 접이식 교사 수업 진행 가이드 (Teacher Note) */}
      <div className="border-t border-slate-800 bg-slate-900">
        <button
          type="button"
          onClick={() => setShowTeacherNote((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-2.5 text-left text-xs font-bold text-slate-300 hover:bg-slate-800/60"
        >
          <span>교사 수업 진행 가이드 (Teacher Note)</span>
          {showTeacherNote ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        {showTeacherNote && (
          <div className="border-t border-slate-800 bg-slate-950/80 px-5 py-3 text-xs whitespace-pre-line leading-relaxed text-slate-300">
            {curSlide.teacherNote}
          </div>
        )}
      </div>
    </div>
  );
};
