import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, GraduationCap, Info, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import { idToVirtualEmail } from '@/lib/firebase/config';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await login(loginId, password, role);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/curriculum');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (id: string, pass: string, targetRole: 'teacher' | 'admin') => {
    setRole(targetRole);
    setLoginId(id);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-12">
      {/* 상단 브랜딩 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          교과 연계 독서전략 수업설계 시스템
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          2022 개정 교육과정 기반 읽기자료 · 독서전략 · 가네 9사태 수업지도안 생성기
        </p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        {/* 역할 선택 탭 */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setRole('teacher'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              role === 'teacher'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            교사 모드
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              role === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            관리자 모드
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {role === 'teacher' ? '교사 아이디 (ID)' : '관리자 아이디'}
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder={role === 'teacher' ? '예: teacher01' : '예: admin01'}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              />
            </div>
            {loginId && (
              <p className="mt-1 text-xs text-slate-500">
                가상 인증 계정: <span className="font-mono text-indigo-600">{idToVirtualEmail(loginId)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              비밀번호
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 처리 중...' : `${role === 'teacher' ? '교사 모드' : '관리자 모드'} 시작하기`}
          </button>
        </form>

        {/* 로컬 테스트 계정 빠른 채우기 */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            로컬 오프라인 테스트 계정 바로 로그인:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('teacher01', 'teacher1234!', 'teacher')}
              className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs text-indigo-800 font-medium transition"
            >
              교사 (teacher01)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin01', 'admin1234!', 'admin')}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs text-slate-800 font-medium transition"
            >
              관리자 (admin01)
            </button>
          </div>
        </div>

        {/* 시스템 안내 */}
        <div className="mt-4 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            일반 교사는 별도 이메일 없이 <strong>ID와 비밀번호만으로 간편하게 접속</strong>할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 하단 배지 */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          오프라인 Mock AI 모드 활성
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          온톨로지 데이터(1,425 트리플) 탑재 완료
        </span>
      </div>
    </div>
  );
};
