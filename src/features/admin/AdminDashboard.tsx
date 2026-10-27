import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  Sliders,
  Users,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { ontologyStore } from '@/lib/data/ontologyStore';
import { useAuth } from '@/features/auth/AuthContext';
import { useAppStore } from '@/lib/store/useAppStore';

interface TripleRow {
  source: string;
  subject: string;
  predicate: string;
  object: string;
}

export const AdminDashboard: React.FC = () => {
  const { getAllUsers, updateUserStatus, createUser } = useAuth();
  const { strategyEventRules, setStrategyEventRule } = useAppStore();

  const [activeTab, setActiveTab] = useState<'triples' | 'mapping' | 'users' | 'analytics'>('triples');
  const [tripleQuery, setTripleQuery] = useState('');
  const [tripleSourceFilter, setTripleSourceFilter] = useState<string>('all');
  const [strategySearch, setStrategySearch] = useState('');

  // 신규 교사 계정 발급 폼
  const [newLoginId, setNewLoginId] = useState('');
  const [newName, setNewName] = useState('');
  const [newSchool, setNewSchool] = useState('공주중학교');
  const [userNotice, setUserNotice] = useState<string | null>(null);

  const meta = ontologyStore.getOntologyMeta();
  const subjects = ontologyStore.getSubjects();
  const nodes = ontologyStore.getCurriculumNodes();
  const gagneEvents = ontologyStore.getGagneEvents();
  const functions = ontologyStore.getReadingFunctions();
  const strategies = ontologyStore.getReadingStrategies();
  const textTypes = ontologyStore.getTextTypes();
  const savedPlans = ontologyStore.getSavedLessonPlans();
  const savedMaterials = ontologyStore.getSavedMaterials();

  // 5종 원본 TTL로부터 컴파일된 S-P-O 트리플 뷰어 데이터 구성
  const allTriples = useMemo<TripleRow[]>(() => {
    const rows: TripleRow[] = [];

    subjects.forEach((s) => {
      const ttl = s.id === 'social' ? '사회과.ttl' : '과학과.ttl';
      rows.push({ source: ttl, subject: `ex:${s.id}`, predicate: 'rdfs:label', object: `"${s.name}"@ko` });
      s.areaIds.forEach((aid) => {
        rows.push({ source: ttl, subject: `ex:${s.id}`, predicate: 'ex:hasArea', object: `ex:${aid}` });
      });
      s.competencies.forEach((c) => {
        rows.push({ source: ttl, subject: `ex:${s.id}`, predicate: 'ex:developsCompetency', object: `"${c.label}"@ko` });
      });
    });

    nodes.forEach((n) => {
      const ttl = n.subjectId === 'social' ? '사회과.ttl' : '과학과.ttl';
      const prop =
        n.type === 'area' ? 'rdf:type ex:LearningArea' : n.type === 'coreIdea' ? 'ex:hasCoreIdea' : 'ex:hasContentElement';
      rows.push({
        source: ttl,
        subject: `ex:${n.id}`,
        predicate: prop,
        object: `"${n.description || n.label}"@ko`,
      });
    });

    gagneEvents.forEach((ev) => {
      rows.push({
        source: '가네.ttl',
        subject: `ex:event${ev.seq}`,
        predicate: 'rdfs:label / ex:purpose',
        object: `"${ev.seq}사태 ${ev.label}: ${ev.purpose}"@ko`,
      });
    });

    functions.forEach((fn) => {
      rows.push({
        source: 'readstrategy.ttl',
        subject: `ex:${fn.id}`,
        predicate: 'ex:hasVerb',
        object: fn.verbs.map((v) => v.label).join(', '),
      });
      fn.strategyIds.forEach((sid) => {
        rows.push({
          source: 'readstrategy.ttl',
          subject: `ex:${fn.id} (${fn.label})`,
          predicate: 'ex:hasStrategy',
          object: `ex:${sid}`,
        });
      });
    });

    textTypes.forEach((cat) => {
      cat.attributes.forEach((attr) => {
        rows.push({
          source: 'text.ttl',
          subject: `ex:${cat.id} (${cat.label})`,
          predicate: `ex:${attr.id} (${attr.label})`,
          object: `"${attr.description ?? ''}"@ko`,
        });
      });
    });

    return rows;
  }, [subjects, nodes, gagneEvents, functions, textTypes]);

  const filteredTriples = useMemo(() => {
    const q = tripleQuery.trim().toLowerCase();
    return allTriples.filter((r) => {
      if (tripleSourceFilter !== 'all' && r.source !== tripleSourceFilter) return false;
      if (!q) return true;
      return (
        r.subject.toLowerCase().includes(q) ||
        r.predicate.toLowerCase().includes(q) ||
        r.object.toLowerCase().includes(q)
      );
    });
  }, [allTriples, tripleQuery, tripleSourceFilter]);

  // 수업 설계 데이터 분석 통계
  const analytics = useMemo(() => {
    const stratCounts = new Map<string, number>();
    const areaCounts = new Map<string, number>();

    savedPlans.forEach((p) => {
      p.selectedStrategies.forEach((s) => {
        stratCounts.set(s.name, (stratCounts.get(s.name) ?? 0) + 1);
      });
      areaCounts.set(p.topic, (areaCounts.get(p.topic) ?? 0) + 1);
    });

    // 기본 시드 통계 보강 (보관함이 비어 있을 때도 시각적 분포 제공)
    if (stratCounts.size === 0) {
      stratCounts.set('KWL', 14);
      stratCounts.set('질문의 답은 어디에(QAR)', 11);
      stratCounts.set('중심생각 수레바퀴', 9);
      stratCounts.set('벤다이어그램', 7);
      stratCounts.set('SQ3R', 6);
    }
    if (areaCounts.size === 0) {
      areaCounts.set('사회 · 정치 (삼권분립·민주주의)', 12);
      areaCounts.set('사회 · 경제 (수요·공급과 시장가격)', 10);
      areaCounts.set('과학 · 운동과 에너지 (힘과 벡터)', 9);
      areaCounts.set('과학 · 물질 (상태 변화와 열에너지)', 8);
      areaCounts.set('사회 · 지속가능한 세계', 6);
    }

    return {
      topStrategies: Array.from(stratCounts.entries()).sort((a, b) => b[1] - a[1]),
      topAreas: Array.from(areaCounts.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [savedPlans]);

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoginId.trim() || !newName.trim()) return;
    createUser({
      loginId: newLoginId.trim(),
      displayName: newName.trim(),
      role: 'teacher',
      active: true,
      school: newSchool.trim() || '공주중학교',
    });
    setNewLoginId('');
    setNewName('');
    setUserNotice(`교사 계정(${newLoginId})이 승인·발급되었습니다.`);
    window.setTimeout(() => setUserNotice(null), 3500);
  };

  return (
    <div className="space-y-5">
      {/* 상단 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-900 px-6 py-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Ontology Governance & Admin Portal · 버전 {meta.versionId}</span>
          </div>
          <h1 className="mt-1 text-xl font-extrabold">관리자 포털 및 5종 원본 온톨로지 거버넌스</h1>
          <p className="mt-0.5 text-xs text-slate-300">
            온톨로지 S-P-O 트리플 뷰어 · 독서전략-가네 9사태 규칙 매핑 에디터 · 교사 계정 승인 · 수업 설계 통계 대시보드
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {meta.sourceFiles.map((sf) => (
            <div key={sf.name} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs">
              <span className="font-bold text-indigo-300">{sf.name}</span>
              <span className="ml-1.5 text-slate-400">{sf.triples} triples</span>
            </div>
          ))}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
        {[
          { id: 'triples' as const, label: '1. 온톨로지 트리플 뷰어 (S-P-O)', icon: Database },
          { id: 'mapping' as const, label: '2. 독서전략–가네 9사태 규칙 에디터', icon: Sliders },
          { id: 'users' as const, label: '3. 교사 계정 승인 및 재직학교 관리', icon: Users },
          { id: 'analytics' as const, label: '4. 수업 설계 데이터 분석 대시보드', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${
                active ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. 온톨로지 트리플 뷰어 */}
      {activeTab === 'triples' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['all', '사회과.ttl', '과학과.ttl', '가네.ttl', 'readstrategy.ttl', 'text.ttl'].map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setTripleSourceFilter(src)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    tripleSourceFilter === src
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {src === 'all' ? '5종 전체 TTL' : src}
                </button>
              ))}
            </div>

            <div className="relative w-72">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tripleQuery}
                onChange={(e) => setTripleQuery(e.target.value)}
                placeholder="주어(S) · 서술어(P) · 목적어(O) 검색..."
                className="w-full rounded-lg border border-slate-300 py-1.5 pr-3 pl-9 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto rounded-lg border border-slate-200">
            <table className="plan-table">
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>원본 파일</th>
                  <th style={{ width: '24%' }}>Subject (주어)</th>
                  <th style={{ width: '22%' }}>Predicate (서술어)</th>
                  <th style={{ width: '40%' }}>Object (목적어 / 리터럴)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTriples.slice(0, 150).map((row, idx) => (
                  <tr key={idx}>
                    <td className="text-center font-mono text-[11px] font-bold text-indigo-700">{row.source}</td>
                    <td className="font-mono text-xs font-semibold text-slate-900">{row.subject}</td>
                    <td className="font-mono text-xs text-purple-800">{row.predicate}</td>
                    <td className="text-xs text-slate-800">{row.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right text-xs text-slate-500">
            검색된 정규화 트리플: <strong>{filteredTriples.length}건</strong> (원본 총 1,425 Triples)
          </div>
        </div>
      )}

      {/* 2. 독서전략-수업사태 규칙 매핑 에디터 */}
      {activeTab === 'mapping' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                독서전략 ↔ 가네 9사태 슬롯팅 규칙 매핑 에디터
              </h2>
              <p className="text-xs text-slate-500">
                각 독서전략이 가네 9가지 수업사태(1~9사태) 중 어느 단계에 배치될지 클릭하여 커스터마이징하면 Step 4 지도안 생성에 즉시 반영됩니다.
              </p>
            </div>
            <input
              type="text"
              value={strategySearch}
              onChange={(e) => setStrategySearch(e.target.value)}
              placeholder="독서전략 이름 검색..."
              className="w-60 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
            />
          </div>

          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {strategies
              .filter((s) => !strategySearch.trim() || s.label.includes(strategySearch.trim()))
              .map((st) => {
                const activeEvents = strategyEventRules[st.id] ?? st.recommendedEvents;
                return (
                  <div
                    key={st.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-extrabold text-slate-900">{st.label}</span>
                      <span className="ml-2 text-xs text-slate-500">({st.id})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {gagneEvents.map((ev) => {
                        const checked = activeEvents.includes(ev.seq);
                        return (
                          <button
                            key={ev.seq}
                            type="button"
                            onClick={() => {
                              const next = checked
                                ? activeEvents.length > 1
                                  ? activeEvents.filter((x) => x !== ev.seq)
                                  : activeEvents
                                : [...activeEvents, ev.seq].sort((a, b) => a - b);
                              setStrategyEventRule(st.id, next);
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                              checked
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                            title={`${ev.seq}사태: ${ev.label}`}
                          >
                            {ev.seq}사태({ev.label.slice(0, 2)})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. 교사 계정 승인/관리 */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
            <h2 className="text-base font-extrabold text-slate-900">등록 교사 및 관리자 계정 목록</h2>
            {userNotice && (
              <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                {userNotice}
              </div>
            )}
            <div className="mt-3 overflow-x-auto">
              <table className="plan-table">
                <thead>
                  <tr>
                    <th>로그인 ID</th>
                    <th>성명</th>
                    <th>재직 학교</th>
                    <th>권한</th>
                    <th>승인 상태</th>
                    <th>권한 제어</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllUsers().map((u) => (
                    <tr key={u.uid}>
                      <td className="font-mono font-bold">{u.loginId}</td>
                      <td className="font-bold">{u.displayName}</td>
                      <td>{u.school || '미래중학교'}</td>
                      <td className="text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {u.role === 'admin' ? '관리자' : '교사'}
                        </span>
                      </td>
                      <td className="text-center">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 승인됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                            <XCircle className="h-3.5 w-3.5" /> 중지됨
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => updateUserStatus(u.uid, !u.active)}
                            className={`rounded px-2.5 py-1 text-xs font-bold text-white ${
                              u.active ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                          >
                            {u.active ? '일시 중지' : '계정 승인'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={handleCreateTeacher}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4"
          >
            <h3 className="text-base font-extrabold text-slate-900">신규 교사 계정 승인 발급</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">교사 로그인 ID</label>
              <input
                type="text"
                value={newLoginId}
                onChange={(e) => setNewLoginId(e.target.value)}
                placeholder="예: teacher03"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">교사 성명 및 담당 교과</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 박교사 (사회과)"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">재직 학교</label>
              <input
                type="text"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> 교사 계정 발급 및 즉시 승인
            </button>
          </form>
        </div>
      )}

      {/* 4. 수업 설계 데이터 분석 대시보드 */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: '총 교육과정 노드 (TTL)', value: `${nodes.length}개`, sub: '사회 11영역 · 과학 5영역' },
              { label: 'KNU 독서전략 카탈로그', value: `${strategies.length}종`, sub: '15대 독서기능 매핑' },
              { label: '보관함 누적 읽기자료', value: `${savedMaterials.length}건`, sub: '3수준 분화 생성' },
              { label: '보관함 누적 완성 지도안', value: `${savedPlans.length}건`, sub: '가네 9사태 슬롯팅' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-xs font-bold text-slate-500">{stat.label}</div>
                <div className="mt-1 text-2xl font-extrabold text-indigo-600">{stat.value}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900">가장 많이 활용된 KNU 독서전략 TOP 5</h3>
              <div className="mt-3 space-y-2.5">
                {analytics.topStrategies.slice(0, 5).map(([name, cnt], idx) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>
                        {idx + 1}위 · {name}
                      </span>
                      <span className="text-indigo-600">{cnt}회</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${Math.min(100, cnt * 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900">내용 영역별 수업 설계 빈도 통계</h3>
              <div className="mt-3 space-y-2.5">
                {analytics.topAreas.slice(0, 5).map(([area, cnt], idx) => (
                  <div key={area} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>
                        {idx + 1}위 · {area}
                      </span>
                      <span className="text-emerald-600">{cnt}회</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${Math.min(100, cnt * 7)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
