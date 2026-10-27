import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, XCircle, Eye, RotateCcw, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { generateQuiz } from '@/lib/generators/quiz';

export const QuizGeneratorModal: React.FC = () => {
  const { isQuizModalOpen, setQuizModalOpen, getCurriculumContext, getCurrentVariant } = useAppStore();
  const ctx = getCurriculumContext();
  const variant = getCurrentVariant();

  const quizItems = useMemo(() => generateQuiz(ctx, variant), [ctx, variant]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isQuizModalOpen) return null;

  const typeLabel: Record<string, { label: string; cls: string }> = {
    choseong: { label: '초성 퀴즈', cls: 'bg-amber-100 text-amber-800' },
    ox: { label: 'OX 진위형', cls: 'bg-emerald-100 text-emerald-800' },
    mcq: { label: '4지선다형', cls: 'bg-indigo-100 text-indigo-800' },
  };

  const correctCount = quizItems.filter(
    (q) => (answers[q.id] ?? '').trim() === q.answer.trim()
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs no-print">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Award className="h-4 w-4" />
              <span>가네 8사태(성취 행동 평가) 연계 실시간 형성평가</span>
            </div>
            <h2 className="mt-0.5 text-lg font-extrabold">
              형성평가 퀴즈 ({ctx.subjectName}과 · {ctx.areaLabel} · 총 {quizItems.length}문항)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setQuizModalOpen(false)}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 문항 리스트 */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {submitted && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3">
              <div className="text-sm font-extrabold text-indigo-950">
                채점 결과: {quizItems.length}문항 중 <span className="text-indigo-600">{correctCount}문항</span> 정답 (
                {Math.round((correctCount / Math.max(1, quizItems.length)) * 100)}점)
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> 다시 풀기
              </button>
            </div>
          )}

          {quizItems.map((item, idx) => {
            const userAns = (answers[item.id] ?? '').trim();
            const isCorrect = userAns === item.answer.trim();
            const meta = typeLabel[item.type];

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition ${
                  submitted
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-rose-300 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">문항 {idx + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  {submitted && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> 정답
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> 오답 (정답: {item.answer})
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-semibold whitespace-pre-line text-slate-900">{item.question}</p>

                {item.type === 'choseong' && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-mono text-sm font-extrabold text-amber-900">
                      초성 힌트: {item.hint}
                    </span>
                    <input
                      type="text"
                      value={answers[item.id] ?? ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="정답 용어를 입력하세요"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                )}

                {item.type === 'ox' && (
                  <div className="mt-3 flex gap-3">
                    {['O', 'X'].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: choice }))}
                        className={`h-10 w-20 rounded-lg border text-sm font-extrabold transition ${
                          answers[item.id] === choice
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {item.type === 'mcq' && item.options && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {item.options.map((opt, oIdx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: opt }))}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                          answers[item.id] === opt
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[11px]">
                          {oIdx + 1}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}

                {submitted && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">해설: </span>
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              const allAnswers: Record<string, string> = {};
              quizItems.forEach((q) => {
                allAnswers[q.id] = q.answer;
              });
              setAnswers(allAnswers);
              setSubmitted(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" /> 정답 및 해설 전체 보기
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700"
            >
              채점하기
            </button>
            <button
              type="button"
              onClick={() => setQuizModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
