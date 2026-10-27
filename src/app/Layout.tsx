import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, Wand2, Archive, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 글로벌 상단 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* 좌측 로고 */}
          <div className="flex items-center gap-6">
            <NavLink to="/curriculum" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight">독서전략 수업설계</span>
                <span className="text-[10px] text-slate-500 font-medium">가네 9사태 · 교육과정 연계</span>
              </div>
            </NavLink>

            {/* 메인 네비게이션 */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              <NavLink to="/curriculum" className={navItemClass}>
                <Compass className="w-4 h-4 text-indigo-500" />
                교육과정 탐색
              </NavLink>
              <NavLink to="/wizard" className={navItemClass}>
                <Wand2 className="w-4 h-4 text-indigo-500" />
                수업 설계 마법사
              </NavLink>
              <NavLink to="/archive" className={navItemClass}>
                <Archive className="w-4 h-4 text-indigo-500" />
                내 보관함
              </NavLink>
              {currentUser.role === 'admin' && (
                <NavLink to="/admin" className={navItemClass}>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  관리자 대시보드
                </NavLink>
              )}
            </nav>
          </div>

          {/* 우측 유저 프로필 및 상태 배지 */}
          <div className="flex items-center gap-3">
            {/* 오프라인 AI 모드 배지 */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Mock AI (오프라인)
            </span>

            {/* 사용자 정보 */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800">{currentUser.displayName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {currentUser.role === 'admin' ? '관리자' : '교사'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">@{currentUser.loginId}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="로그아웃"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 하단 탭 */}
        <div className="md:hidden flex border-t border-slate-200 bg-white px-2 py-1 justify-around text-xs">
          <NavLink to="/curriculum" className={navItemClass}>
            <Compass className="w-4 h-4" />
            탐색
          </NavLink>
          <NavLink to="/wizard" className={navItemClass}>
            <Wand2 className="w-4 h-4" />
            마법사
          </NavLink>
          <NavLink to="/archive" className={navItemClass}>
            <Archive className="w-4 h-4" />
            보관함
          </NavLink>
          {currentUser.role === 'admin' && (
            <NavLink to="/admin" className={navItemClass}>
              <ShieldCheck className="w-4 h-4" />
              관리자
            </NavLink>
          )}
        </div>
      </header>

      {/* 메인 뷰 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
