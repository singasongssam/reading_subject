import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  FileText,
  BookOpen,
  Calendar,
  Download,
  Trash2,
  Printer,
  X,
  Wand2,
} from 'lucide-react';
import { ontologyStore, SavedLessonPlan, SavedMaterial } from '@/lib/data/ontologyStore';
import { useAuth } from '@/features/auth/AuthContext';
import { exportLessonPlanToDocx } from '@/features/export/docxExport';

export const MyArchive: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'materials'>('plans');

  const [selectedPlanModal, setSelectedPlanModal] = useState<SavedLessonPlan | null>(null);
  const [selectedMatModal, setSelectedMatModal] = useState<SavedMaterial | null>(null);

  // 현재 사용자 산출물 목록 가져오기
  const [plans, setPlans] = useState<SavedLessonPlan[]>(() =>
    ontologyStore.getSavedLessonPlans(currentUser?.uid)
  );
  const [materials, setMaterials] = useState<SavedMaterial[]>(() =>
    ontologyStore.getSavedMaterials(currentUser?.uid)
  );

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 수업지도안을 삭제하시겠습니까?')) {
      ontologyStore.deleteLessonPlan(id);
      setPlans(ontologyStore.getSavedLessonPlans(currentUser?.uid));
      if (selectedPlanModal?.id === id) setSelectedPlanModal(null);
    }
  };

  const handleDeleteMaterial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 읽기자료를 삭제하시겠습니까?')) {
      ontologyStore.deleteMaterial(id);
      setMaterials(ontologyStore.getSavedMaterials(currentUser?.uid));
      if (selectedMatModal?.id === id) setSelectedMatModal(null);
    }
  };

  const handleDownloadDocx = async (plan: SavedLessonPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const associatedMat = ontologyStore.getSavedMaterial(plan.materialId);
      const blob = await exportLessonPlanToDocx(plan, associatedMat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.title.replace(/[^\w\s가-힣-]/g, '')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`DOCX 다운로드 오류: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-600" />
            내 보관함
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            작성하고 검토한 수업지도안과 읽기자료를 열람하고 문서(DOCX / PDF)로 내보낼 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/curriculum')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition"
        >
          <Wand2 className="w-4 h-4" />새 수업 만들기
        </button>
      </div>

      {/* 탭 전환 */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'plans'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          가네 9사태 수업지도안 ({plans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'materials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          교과 연계 읽기자료 ({materials.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 탭 1: 수업지도안 목록 */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div>
          {plans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium">아직 저장된 수업지도안이 없습니다.</p>
              <button
                type="button"
                onClick={() => navigate('/curriculum')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                교육과정 탐색기에서 새 지도안을 설계해 보세요 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanModal(p)}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {p.subjectName} · 중{p.grade}
                      </span>
                      <span>{p.totalMinutes}분 차시</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base line-clamp-2">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.learningObjective}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.selectedStrategies.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadDocx(p, e)}
                        title="DOCX 다운로드"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePlan(p.id, e)}
                        title="삭제"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 탭 2: 읽기자료 목록 */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div>
          {materials.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium">아직 저장된 읽기자료가 없습니다.</p>
              <button
                type="button"
                onClick={() => navigate('/curriculum')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                새로운 교과 읽기자료를 생성해 보세요 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatModal(m)}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {m.subjectName} · {m.readingLevel}
                      </span>
                      <span>{m.textType.contentType}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base line-clamp-2">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.body[0]}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteMaterial(m.id, e)}
                      title="삭제"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 모달: 지도안 상세 보기 */}
      {/* ========================================================================= */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedPlanModal.subjectName} · 중{selectedPlanModal.grade}학년 ({selectedPlanModal.totalMinutes}분)
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedPlanModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700 block mb-0.5">학습 목표</span>
                <p className="text-slate-800">{selectedPlanModal.learningObjective}</p>
              </div>

              {/* 9사태 테이블 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5 w-14 text-center">단계</th>
                      <th className="p-2.5 w-28">수업사태</th>
                      <th className="p-2.5 w-16 text-center">시간(분)</th>
                      <th className="p-2.5 w-32">교수 전략</th>
                      <th className="p-2.5">교수·학습 활동 내용(교사/학생)</th>
                      <th className="p-2.5 w-32">자료 및 유의점</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedPlanModal.events.map((ev) => (
                      <tr key={ev.seq}>
                        <td className="p-2.5 text-center font-bold text-slate-500">{ev.phase}</td>
                        <td className="p-2.5 font-bold text-slate-800">{ev.seq}. {ev.label}</td>
                        <td className="p-2.5 text-center font-extrabold text-indigo-800">{ev.minutes}분</td>
                        <td className="p-2.5 text-[11px] font-semibold text-slate-700">{ev.assessment || ev.purpose}</td>
                        <td className="p-2.5 space-y-1 whitespace-pre-line">
                          <p><span className="text-indigo-700 font-bold">[교사]</span> {ev.teacherActivity}</p>
                          <p><span className="text-emerald-700 font-bold">[학생]</span> {ev.studentActivity}</p>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600">{ev.materialAndNotice || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={(e) => handleDownloadDocx(selectedPlanModal, e)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" /> DOCX 다운로드
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" /> 인쇄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 모달: 읽기자료 상세 보기 */}
      {/* ========================================================================= */}
      {selectedMatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedMatModal.subjectName} · {selectedMatModal.textType.contentType}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedMatModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-800">
              {selectedMatModal.body.map((p, idx) => (
                <p key={idx} className="p-3 bg-slate-50/70 rounded-lg text-sm">{p}</p>
              ))}

              <div className="p-3 bg-slate-100 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">어휘 풀이</span>
                {selectedMatModal.glossary.map((g, idx) => (
                  <p key={idx}><strong className="text-indigo-700">{g.term}:</strong> {g.meaning}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedMatModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
