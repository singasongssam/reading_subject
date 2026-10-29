import React, { useState } from 'react';
import {
  FileText,
  ClipboardList,
  Presentation,
  Award,
  Eye,
  Download,
  Printer,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ontologyStore, SavedLessonPlan, SavedMaterial } from '@/lib/data/ontologyStore';
import { useAuth } from '@/features/auth/AuthContext';
import { ConceptVisual, getConceptVisual } from '@/features/visuals/conceptVisuals';
import { formatPhaseBanner } from '@/lib/time/distribute';
import { getGenre } from '@/lib/text/genres';
import { exportLessonPlanToDocx, triggerDocxDownload } from '@/features/export/docxExport';
import { StudentWorksheetView } from './StudentWorksheetView';
import { PresentationView } from './PresentationView';
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export const Step5PreviewOutput: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    genreId,
    readingLevel,
    selectedStrategyIds,
    totalMinutes,
    lessonTitle,
    learningObjective,
    events,
    rubric,
    outputViewMode,
    setOutputViewMode,
    setPreviewModalOpen,
    setQuizModalOpen,
    getCurriculumContext,
    getCurrentVariant,
    saveToVault,
  } = useAppStore();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [lessonDetail, setLessonDetail] = useState<'standard' | 'detailed'>('standard');
  // Keep original AI content in state; compact only the printed standard plan.
  const compact = (value: string, max = 190): string => {
    const lines = value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const unique = lines.filter((line, index) => lines.findIndex((other) => other === line) === index);
    const result = unique.join(' ').replace(/\s+/g, ' ').trim();
    if (result.length <= max) return result;
    const cut = result.slice(0, max);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다.'));
    return `${end > max * 0.55 ? cut.slice(0, end + 1) : cut.trimEnd()}…`;
  };

  const ctx = getCurriculumContext();
  const variant = getCurrentVariant();
  const visual = getConceptVisual(ctx.areaId);
  const genre = getGenre(genreId);
  const allStrategies = ontologyStore.getReadingStrategies();
  const selectedStrategies = selectedStrategyIds
    .map((id) => allStrategies.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const phaseBanner = formatPhaseBanner(events);
  const teacherName = currentUser?.displayName || '지도교사';

  const handleDownloadDocx = async () => {
    setExportingDocx(true);
    try {
      const tempMaterial: SavedMaterial = {
        id: 'temp_mat',
        ownerUid: currentUser?.uid || 'teacher01',
        ownerName: teacherName,
        subjectId: ctx.subjectId,
        subjectName: ctx.subjectName,
        nodeIds: [ctx.areaId, ctx.coreIdeaId, ...ctx.elements.map((e) => e.id)],
        nodeLabels: [ctx.areaLabel, ...ctx.elements.map((e) => e.label)],
        title: variant.title,
        body: variant.paragraphs,
        glossary: variant.glossary.map((g) => ({ term: g.term, meaning: g.meaning })),
        comprehensionQuestions: variant.questions.map((q) => ({
          question: q.question,
          answerHint: q.answerHint,
          level: q.level === '이해' ? '기초' : q.level === '추론' ? '이해' : '심화',
        })),
        grade: ctx.grade,
        durationMinutes: totalMinutes,
        readingLevel,
        textType: getGenre(genreId).textType,
        ontologyVersion: ontologyStore.getOntologyMeta().versionId,
        reviewedByTeacher: true,
        createdAt: new Date().toISOString(),
      };

      const tempPlan: SavedLessonPlan = {
        id: 'temp_plan',
        ownerUid: currentUser?.uid || 'teacher01',
        ownerName: teacherName,
        materialId: tempMaterial.id,
        subjectName: ctx.subjectName,
        grade: ctx.grade,
        topic: `${ctx.areaLabel} (${ctx.elements.map((e) => e.label).join(', ')})`,
        title: lessonTitle,
        unitOverview: ctx.coreIdeaText,
        learningObjective,
        totalMinutes,
        selectedStrategies: selectedStrategies.map((s) => ({
          id: s.id,
          name: s.label,
          procedure: s.procedure,
        })),
        events: events.map((ev) => ({
          seq: ev.seq,
          label: ev.label,
          purpose: ev.purpose,
          phase: ev.phase,
          teacherActivity: ev.teacherActivity,
          studentActivity: ev.studentActivity,
          materialAndNotice: ev.materialAndNotice,
          minutes: ev.minutes,
          assessment: ev.strategy,
          locked: ev.locked,
        })),
        evaluationPlan: {
          criteriaHigh: rubric.high,
          criteriaMid: rubric.mid,
          criteriaLow: rubric.low,
        },
        worksheetDraft: visual?.title ?? ctx.areaLabel,
        ontologyVersion: ontologyStore.getOntologyMeta().versionId,
        reviewedByTeacher: true,
        createdAt: new Date().toISOString(),
      };

      const blob = await exportLessonPlanToDocx(tempPlan, tempMaterial, {
        areaLabel: `${ctx.areaLabel} (${ctx.elements.map((e) => e.label).join('·')})`,
        teacherName,
        visualTitle: visual?.title,
        visualPrompts: visual?.prompts,
      });
      triggerDocxDownload(blob, `${ctx.subjectName}_${ctx.areaLabel}_수업지도안.docx`);
    } finally {
      setExportingDocx(false);
    }
  };

  const handleSaveToVault = () => {
    const res = saveToVault(currentUser?.uid || 'uid_teacher01', teacherName);
    setSavedNotice(`수업자료 보관함에 영구 저장되었습니다! (지도안 ID: ${res.planId.slice(0, 12)})`);
    window.setTimeout(() => setSavedNotice(null), 4500);
  };

  const renderTeacherLessonPlanDocument = () => (
    <div className="lesson-print-root mx-auto max-w-[210mm] space-y-6 rounded-xl border border-slate-300 bg-white p-8 text-slate-900 shadow-sm print:border-0 print:p-0 print:shadow-none">
      {/* 공식 공문서 타이틀 */}
      <div className="border-b-2 border-slate-900 pb-4 text-center">
        <div className="text-xs font-bold tracking-widest text-slate-500">
          2022 개정 교육과정 온톨로지 기반 교수·학습 과정안
        </div>
        <h1 className="mt-1 text-xl font-extrabold text-slate-950">{lessonTitle}</h1>
      </div>

      {/* 1) 교육청 표준 공문서 메타 표 */}
      <table className="plan-table">
        <tbody>
          <tr>
            <th style={{ width: '15%' }}>교과</th>
            <td style={{ width: '35%' }} className="font-bold">
              {ctx.subjectName}과
            </td>
            <th style={{ width: '15%' }}>내용 영역</th>
            <td style={{ width: '35%' }} className="font-bold">
              {ctx.areaLabel} ({ctx.elements.map((e) => e.label).join(' · ')})
            </td>
          </tr>
          <tr>
            <th>대상 / 시간</th>
            <td>
              중학교 {ctx.grade}학년 / {totalMinutes}분 (1차시)
            </td>
            <th>지도교사</th>
            <td>{teacherName}</td>
          </tr>
          <tr>
            <th>핵심 아이디어</th>
            <td colSpan={3} className="font-medium">
              "{ctx.coreIdeaText}"
            </td>
          </tr>
          <tr>
            <th>독서전략 / 장르</th>
            <td colSpan={3}>
              <span className="font-bold text-indigo-900">
                [{selectedStrategies.map((s) => s.label).join(' · ')}]
              </span>{' '}
              / 읽기자료 장르: {genre.label} ({readingLevel} 수준)
            </td>
          </tr>
          <tr>
            <th>학습 목표</th>
            <td colSpan={3} className="font-bold text-slate-950">
              {learningObjective}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2) 【 수업 지도안 총괄 요약 브리프 (Executive Lesson Summary) 】 */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="flex items-center gap-2 border-l-4 border-indigo-700 pl-2.5 text-sm font-extrabold text-slate-950">
          <span>【 수업 지도안 총괄 요약 브리프 (Executive Lesson Summary) 】</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3">
            <div className="text-xs font-extrabold text-indigo-800">① 단원 목표 및 교육과정 성취 초점</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-800">{learningObjective}</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3">
            <div className="text-xs font-extrabold text-emerald-800">② 읽기자료 줄거리 요약 ({genre.label})</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-800">
              「{variant.title}」 — {variant.paragraphs[0]?.slice(0, 120)}…
            </p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3">
            <div className="text-xs font-extrabold text-purple-800">③ KNU 독서전략 기대효과</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-800">
              [{selectedStrategies.map((s) => s.label).join(' · ')}] 전략을 가네 수업사태에 슬롯팅하여 학생의 능동적 텍스트 구조화 및 비판적 독해력을 신장함.
            </p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3">
            <div className="text-xs font-extrabold text-amber-800">④ 1:1 시각 모델 연계</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-800">
              「{visual?.title ?? ctx.areaLabel}」 다이어그램과 핵심 탐구 발문 2종이 지도안·학생 활동지·교실 PPT에 1:1 동기화됨.
            </p>
          </div>
        </div>
      </section>

      {/* 3) 【 본시 수업 활용 핵심 시각 모델 및 구조도 】 */}
      <section className="space-y-2.5 print-break-inside-avoid">
        <h2 className="border-l-4 border-indigo-700 pl-2.5 text-sm font-extrabold text-slate-950">
          【 본시 수업 활용 핵심 시각 모델 및 구조도 】 — {visual?.title ?? ctx.areaLabel}
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="rounded-lg border border-slate-300 p-2 md:col-span-6">
            <ConceptVisual areaId={ctx.areaId} theme="light" />
          </div>
          <div className="flex flex-col justify-between space-y-2 rounded-lg border border-amber-300 bg-amber-50/50 p-3.5 md:col-span-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
                <span>교사용 핵심 탐구 발문 리스트 (1사태 도입 · 9사태 정리 연계)</span>
              </div>
              <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs leading-relaxed font-semibold text-slate-900">
                <li>{visual?.prompts[0]}</li>
                <li>{visual?.prompts[1]}</li>
              </ol>
            </div>
            <div className="border-t border-amber-200 pt-2 text-[11px] text-slate-600">
              핵심 키워드: {(visual?.keywords ?? []).join(' · ')}
            </div>
          </div>
        </div>
      </section>

      {/* 4) [수업 활용 읽기자료 본문] */}
      <section className="space-y-2 print-break-inside-avoid">
        <h2 className="border-l-4 border-indigo-700 pl-2.5 text-sm font-extrabold text-slate-950">
          [수업 활용 읽기자료 본문] — 「{variant.title}」 ({readingLevel} 수준 · {genre.label})
        </h2>
        <div className="space-y-2 rounded-lg border border-slate-300 bg-slate-50/40 p-4 text-xs leading-relaxed text-slate-900">
          {variant.paragraphs.map((p, idx) => (
            <p key={idx} className="indent-3">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* 5) 【 가네 9사태 교수·학습 과정 매트릭스 표 】 */}
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="border-l-4 border-indigo-700 pl-2.5 text-sm font-extrabold text-slate-950">
            【 가네 9사태 교수·학습 과정 매트릭스 표 】
          </h2>
          {/* 단계별 합계 시간 배너 */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-950">
            <Clock className="h-3.5 w-3.5 text-indigo-700" />
            <span>{phaseBanner}</span>
          </div>
        </div>

        <table className="plan-table">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>단계</th>
              <th style={{ width: '14%' }}>수업사태</th>
              <th style={{ width: '9%' }}>시간(분)</th>
              <th style={{ width: '17%' }}>교수 전략</th>
              <th style={{ width: '36%' }}>교수·학습 활동 내용(교사/학생)</th>
              <th style={{ width: '16%' }}>자료 및 유의점</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.seq} className="print-break-inside-avoid">
                <td className="text-center font-bold">{ev.phase}</td>
                <td className="font-bold">
                  {ev.seq}. {ev.label}
                </td>
                <td className="text-center font-extrabold text-indigo-900">{ev.minutes}분</td>
                <td className="text-[11px] font-semibold text-slate-800">{ev.strategy}</td>
                <td className="space-y-1.5 whitespace-pre-line">
                  <div>
                    <span className="font-bold text-indigo-900">[교사] </span>
                    {lessonDetail === 'standard' ? compact(ev.teacherActivity, 180) : ev.teacherActivity}
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900">[학생] </span>
                    {lessonDetail === 'standard' ? compact(ev.studentActivity, 155) : ev.studentActivity}
                  </div>
                </td>
                <td className="text-[11px] text-slate-700">{lessonDetail === 'standard' ? compact(ev.materialAndNotice, 90) : ev.materialAndNotice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6) 3수준 성취 평가 기준 루브릭 */}
      <section className="space-y-2 print-break-inside-avoid">
        <h2 className="border-l-4 border-indigo-700 pl-2.5 text-sm font-extrabold text-slate-950">
          【 3수준 평가 루브릭 (상 · 중 · 하) 】
        </h2>
        <table className="plan-table">
          <thead>
            <tr>
              <th style={{ width: '16%' }}>성취 수준</th>
              <th>평가 준거</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center font-bold text-indigo-900">상 (Excellent)</td>
              <td>{lessonDetail === 'standard' ? compact(rubric.high, 170) : rubric.high}</td>
            </tr>
            <tr>
              <td className="text-center font-bold text-emerald-900">중 (Good)</td>
              <td>{lessonDetail === 'standard' ? compact(rubric.mid, 170) : rubric.mid}</td>
            </tr>
            <tr>
              <td className="text-center font-bold text-amber-900">하 (Needs Work)</td>
              <td>{lessonDetail === 'standard' ? compact(rubric.low, 170) : rubric.low}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 상단 뷰 모드 전환 및 멀티 산출물 원클릭 액션 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs no-print">
        {/* 상단 뷰 모드 전환: [교사용 완성 지도안] / [학생용 활동지 (A4)] / [수업용 PPT & 타이머] */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {[
            { id: 'lessonPlan' as const, label: '교사용 완성 지도안', icon: FileText },
            { id: 'worksheet' as const, label: '학생용 활동지 (A4)', icon: ClipboardList },
            { id: 'ppt' as const, label: '수업용 PPT & 타이머', icon: Presentation },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = outputViewMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOutputViewMode(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {outputViewMode === 'lessonPlan' && (
          <div className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 p-1" aria-label="지도안 상세 수준">
            <button type="button" aria-pressed={lessonDetail === 'standard'} onClick={() => setLessonDetail('standard')}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${lessonDetail === 'standard' ? 'bg-indigo-600 text-white' : 'text-indigo-800'}`}>
              표준 지도안 (요약)
            </button>
            <button type="button" aria-pressed={lessonDetail === 'detailed'} onClick={() => setLessonDetail('detailed')}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${lessonDetail === 'detailed' ? 'bg-indigo-600 text-white' : 'text-indigo-800'}`}>
              AI 상세 지도안 (전체)
            </button>
          </div>
        )}

        {/* 부가 도구 모달 & 내보내기 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuizModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-100"
          >
            <Award className="h-4 w-4 text-amber-600" />
            <span>형성평가 퀴즈 모달</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4 text-indigo-600" />
            <span>A4 줌 미리보기</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={exportingDocx}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{exportingDocx ? 'Word 생성 중...' : 'Word(.docx) 내보내기'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            <span>인쇄 / PDF 저장</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToVault}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>보관함(Vault) 저장</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 no-print">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 선택된 뷰 모드 렌더링 */}
      {outputViewMode === 'lessonPlan' && renderTeacherLessonPlanDocument()}
      {outputViewMode === 'worksheet' && <StudentWorksheetView />}
      {outputViewMode === 'ppt' && <PresentationView />}

      {/* 형성평가 퀴즈 모달 */}
      <QuizGeneratorModal />

      {/* A4 실물 줌 미리보기 모달 */}
      <DocumentPreviewModal
        title={
          outputViewMode === 'worksheet'
            ? `A4 학생 탐구 활동지 — ${variant.title}`
            : `A4 교사용 교수·학습 과정안 — ${lessonTitle}`
        }
      >
        {outputViewMode === 'worksheet' ? <StudentWorksheetView /> : renderTeacherLessonPlanDocument()}
      </DocumentPreviewModal>
    </div>
  );
};
