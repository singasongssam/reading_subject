import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { SkillTreeExplorer } from './SkillTreeExplorer';
import { useAppStore } from '@/lib/store/useAppStore';

export const CurriculumExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { setWizardStep, getCurriculumContext } = useAppStore();
  const ctx = getCurriculumContext();

  const handleGoToWizard = () => {
    setWizardStep(2);
    navigate('/wizard');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 px-6 py-5 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <BookOpen className="h-4 w-4" />
            <span>2022 개정 교육과정 온톨로지 (5종 원본 TTL 지식 베이스)</span>
          </div>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight">
            교과 교육과정 3-Tier 스킬트리 & 1:1 동적 개념 시각화 탐색기
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            영역(Single Radio) → 핵심 아이디어 → 내용 요소(Multi Checkbox)를 선택하면 16종 SVG 개념 구조도와 4대 수업 산출물이 즉시 동기화됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToWizard}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-400"
        >
          <Sparkles className="h-4 w-4" />
          <span>「{ctx.areaLabel}」 5단계 수업설계 마법사 시작</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <SkillTreeExplorer onProceedNext={handleGoToWizard} showProceedButton />
    </div>
  );
};
