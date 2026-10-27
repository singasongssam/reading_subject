import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';

export const DocumentPreviewModal: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title = 'A4 인쇄 실물 레이아웃 미리보기' }) => {
  const { isPreviewModalOpen, setPreviewModalOpen } = useAppStore();
  const [zoom, setZoom] = useState<number>(100); // 75% ~ 130%

  if (!isPreviewModalOpen) return null;

  const zoomPresets = [75, 90, 100, 115, 130];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/75 backdrop-blur-xs print-reset">
      {/* 상단 컨트롤 바 (인쇄 시 숨김) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-6 py-3 text-white no-print">
        <div className="flex items-center gap-3">
          <span className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-bold">A4 줌 미리보기</span>
          <span className="text-sm font-bold">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(75, z - 10))}
            className="rounded-lg bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700"
            title="축소"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {zoomPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setZoom(preset)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                zoom === preset ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset}%
            </button>
          ))}

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(130, z + 10))}
            className="rounded-lg bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700"
            title="확대"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="mx-2 h-5 w-px bg-slate-700" />

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
          >
            <Printer className="h-4 w-4" /> A4 인쇄 / PDF 저장
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(false)}
            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* A4 용지 뷰포트 */}
      <div className="flex-1 overflow-auto p-8 print-reset">
        <div
          className="a4-page mx-auto origin-top transition-transform"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
