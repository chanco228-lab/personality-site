'use client';

import { useState, useEffect } from 'react';
import { personalityTypes, FACTOR_LABELS, FactorType } from '@/data/types';
import rawQuestions from '@/data/questions';

type Stats = {
  starts: number;
  completes: number;
  emails: number;
  emailFormViewed: number;
  xShared: number;
  lineShared: number;
  step1Count: number;
  stepCounts: Record<string, number>;
  stepAvgScores: Record<string, number>;
  feedbackCount: number;
  feedbackAvg: number;
  feedbackDist: Record<string, number>;
  topTypes: { typeId: string; count: number }[];
  factorAvgScores: Record<string, number>;
  introvertAvg: number;
  dailyStarts: { date: string; count: number }[];
  // v3-only
  neutralRate?: number;
  noteClicked?: number;
  impulsivityAvg?: number;
};

// getShuffledQuestionsと同じ決定的順序でstep→questionのマッピングを構築
const STEP_QUESTIONS = (() => {
  const factors = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];
  const byFactor: Record<string, typeof rawQuestions> = {};
  for (const f of factors) byFactor[f] = rawQuestions.filter((q) => q.factor === f);
  const result: typeof rawQuestions = [];
  const maxLen = Math.max(...factors.map((f) => byFactor[f].length));
  for (let i = 0; i < maxLen; i++) {
    for (const f of factors) {
      if (byFactor[f][i]) result.push(byFactor[f][i]);
    }
  }
  return result; // index 0 = step 1
})();

type QualityRow = { type_id: string; section: string; up: number; down: number; total: number; upRate: number | null };
type QualityData = {
  rows: QualityRow[];
  sectionScores: { section: string; up: number; down: number; total: number; upRate: number | null }[];
  lowRanking: QualityRow[];
};

const SECTION_LABELS: Record<string, string> = { insights: '図星リスト', about: 'あなたについて', loss: '損ポイント' };

const PASS_KEY = 'admin_password';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [days, setDays] = useState<7 | 30>(7);
  const version = 'v3';
  const [tab, setTab] = useState<'stats' | 'quality'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [qualityData, setQualityData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuality = async (pw: string) => {
    try {
      const res = await fetch('/api/admin/section-ratings', {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.ok) setQualityData(await res.json());
    } catch { /* ignore */ }
  };

  const fetchStats = async (pw: string, d: number, ver: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?days=${d}&version=${ver}`, {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (!res.ok) return false;
      setStats(await res.json());
      return true;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(PASS_KEY);
    if (!saved) return;
    fetchStats(saved, 7, version).then((ok) => { if (ok) setAuthed(true); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authed) return;
    const saved = sessionStorage.getItem(PASS_KEY);
    if (!saved) return;
    if (tab === 'quality') fetchQuality(saved);
    else fetchStats(saved, days, version);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, version, authed, tab]);

  const handleLogin = async () => {
    setAuthError(false);
    const ok = await fetchStats(password, days, version);
    if (ok) {
      sessionStorage.setItem(PASS_KEY, password);
      setAuthed(true);
      setPassword('');
    } else {
      setAuthError(true);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-800 mb-6 text-center">管理画面</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="パスワード"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 transition-colors ${
              authError
                ? 'border-red-400 focus:ring-red-300 bg-red-50'
                : 'border-slate-300 focus:ring-teal-400'
            }`}
          />
          {authError && (
            <p className="text-red-500 text-sm mb-3">パスワードが正しくありません</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </div>
    );
  }

  const completionRate =
    stats && stats.starts > 0 ? Math.round((stats.completes / stats.starts) * 100) : 0;
  const xShareRate =
    stats && stats.completes > 0 ? Math.round((stats.xShared / stats.completes) * 100) : 0;
  const lineShareRate =
    stats && stats.completes > 0 ? Math.round((stats.lineShared / stats.completes) * 100) : 0;
  const q1PassRate =
    stats && stats.starts > 0 ? Math.round((stats.step1Count / stats.starts) * 100) : 0;
  const formConvRate =
    stats && stats.emailFormViewed > 0 ? Math.round((stats.emails / stats.emailFormViewed) * 100) : 0;
  const emailConvRate =
    stats && stats.completes > 0 ? Math.round((stats.emails / stats.completes) * 100) : 0;
  const noteConvRate =
    stats && version === 'v3' && stats.completes > 0 && stats.noteClicked != null
      ? Math.round((stats.noteClicked / stats.completes) * 100)
      : 0;

  const stepEntries = Array.from({ length: 21 }, (_, i) => ({
    step: i + 1,
    count: stats ? (stats.stepCounts[String(i + 1)] ?? 0) : 0,
  }));
  const maxCount = Math.max(...stepEntries.map((s) => s.count), 1);

  const totalTypeCount = stats ? stats.topTypes.reduce((s, t) => s + t.count, 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-800">管理画面</h1>
          {/* タブ */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(['stats', 'quality'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1 rounded-md text-sm font-bold transition-colors ${
                  tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'stats' ? '統計' : '品質'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const saved = sessionStorage.getItem(PASS_KEY);
              if (saved) fetchStats(saved, days, version);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 disabled:opacity-40 transition-colors"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? '更新中...' : '更新'}
          </button>
          <div className="flex gap-1.5">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  days === d
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d}日間
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem(PASS_KEY);
              setAuthed(false);
              setStats(null);
            }}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* 品質タブ */}
        {tab === 'quality' && (
          <>
            {!qualityData ? (
              <p className="text-slate-500 text-sm">読み込み中...</p>
            ) : (
              <>
                {/* セクション全体スコア */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-slate-800 mb-4">セクション全体スコア</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {qualityData.sectionScores.map((s) => {
                      const color = s.upRate == null ? 'slate' : s.upRate >= 80 ? 'teal' : s.upRate >= 60 ? 'amber' : 'red';
                      const colorMap = { teal: 'text-teal-600', amber: 'text-amber-600', red: 'text-red-600', slate: 'text-slate-400' };
                      return (
                        <div key={s.section} className="bg-slate-50 rounded-xl p-4 text-center">
                          <p className="text-sm font-bold text-slate-600 mb-1">{SECTION_LABELS[s.section]}</p>
                          <p className={`text-3xl font-extrabold ${colorMap[color]}`}>
                            {s.upRate != null ? `${s.upRate}%` : '—'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">👍{s.up} / 👎{s.down}（計{s.total}）</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 低評価ランキング */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-slate-800 mb-4">👎 低評価ランキング TOP20</h2>
                  {qualityData.lowRanking.length === 0 ? (
                    <p className="text-slate-400 text-sm">データなし</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs font-bold text-slate-500 border-b border-slate-200">
                            <th className="pb-2 pr-4">タイプ</th>
                            <th className="pb-2 pr-4">セクション</th>
                            <th className="pb-2 pr-4 text-right">👍率</th>
                            <th className="pb-2 pr-4 text-right">👍</th>
                            <th className="pb-2 text-right">👎</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {qualityData.lowRanking.map((r, i) => {
                            const color = r.upRate == null ? '' : r.upRate >= 80 ? 'text-teal-600' : r.upRate >= 60 ? 'text-amber-600' : 'text-red-600';
                            return (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="py-2 pr-4 font-mono text-xs font-bold">{r.type_id}</td>
                                <td className="py-2 pr-4">{SECTION_LABELS[r.section] ?? r.section}</td>
                                <td className={`py-2 pr-4 text-right font-bold ${color}`}>{r.upRate != null ? `${r.upRate}%` : '—'}</td>
                                <td className="py-2 pr-4 text-right text-slate-600">{r.up}</td>
                                <td className="py-2 text-right text-slate-600">{r.down}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'stats' && (<>

        {/* KPIカード */}
        {stats && (
          <>
            {/* 診断ファネル */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="診断開始" value={stats.starts} unit="人" />
              <KpiCard
                label="診断完了"
                value={stats.completes}
                unit="人"
                sub={`完了率 ${completionRate}%`}
                color={completionRate >= 70 ? 'teal' : completionRate >= 50 ? 'amber' : 'red'}
              />
              {version === 'v3' ? (
                <NoteConvCard
                  noteClicked={stats.noteClicked ?? 0}
                  emails={stats.emails}
                  completes={stats.completes}
                  noteConvRate={noteConvRate}
                  emailConvRate={emailConvRate}
                />
              ) : (
                <EmailConvCard
                  emails={stats.emails}
                  emailFormViewed={stats.emailFormViewed}
                  completes={stats.completes}
                  formConvRate={formConvRate}
                  emailConvRate={emailConvRate}
                />
              )}
              <KpiCard
                label="満足度スコア"
                value={stats.feedbackAvg}
                unit="/ 5"
                sub={stats.feedbackCount > 0 ? `${stats.feedbackCount}件の回答` : 'まだ回答なし'}
                color={stats.feedbackAvg >= 4 ? 'teal' : stats.feedbackAvg >= 3 ? 'amber' : stats.feedbackCount > 0 ? 'red' : 'slate'}
                decimal
              />
            </div>

            {/* 診断頻度チャート */}
            {stats.dailyStarts && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-700">診断頻度（新規開始）</p>
                  <p className="text-xs text-slate-400">過去{days}日間</p>
                </div>
                <DailyChart data={stats.dailyStarts} />
              </div>
            )}

            {/* シェア＆追加指標 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                label="Xシェア数"
                value={stats.xShared}
                unit="回"
                sub={`完了者比 ${xShareRate}%`}
              />
              <KpiCard
                label="LINEシェア数"
                value={stats.lineShared}
                unit="回"
                sub={`完了者比 ${lineShareRate}%`}
              />
              <KpiCard
                label="Q1通過率"
                value={q1PassRate}
                unit="%"
                sub={`${stats.step1Count}人 / ${stats.starts}人`}
                color={q1PassRate >= 80 ? 'teal' : q1PassRate >= 60 ? 'amber' : 'red'}
              />
              {version === 'v3' ? (
                <KpiCard
                  label="中立選択率"
                  value={stats.neutralRate ?? 0}
                  unit="%"
                  sub="0を選んだ割合"
                  decimal
                />
              ) : (
                <KpiCard
                  label="陰キャ度平均"
                  value={stats.introvertAvg}
                  unit="/ 100"
                  sub={`${stats.topTypes.reduce((s, t) => s + t.count, 0)}人の平均`}
                />
              )}
            </div>

            {/* v3専用: 陽キャ度・衝動性 */}
            {version === 'v3' && (
              <div className="grid grid-cols-2 gap-4">
                <KpiCard
                  label="陽キャ度平均"
                  value={stats.introvertAvg}
                  unit="/ 100"
                  sub={`${totalTypeCount}人の平均`}
                />
                <KpiCard
                  label="衝動性平均"
                  value={stats.impulsivityAvg ?? 0}
                  unit="/ 100"
                  sub={`${totalTypeCount}人の平均`}
                />
              </div>
            )}
          </>
        )}

        {/* 人気タイプ TOP5 */}
        {stats && stats.topTypes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">診断結果 上位5タイプ</h2>
            <div className="space-y-3">
              {stats.topTypes.map(({ typeId, count }, i) => {
                const pt = personalityTypes.find((t) => t.id === typeId);
                const pct = totalTypeCount > 0 ? Math.round((count / totalTypeCount) * 100) : 0;
                const medals = ['🥇', '🥈', '🥉', '4', '5'];
                return (
                  <div key={typeId} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center flex-shrink-0">
                      {i < 3 ? medals[i] : <span className="text-sm font-bold text-slate-500">{medals[i]}</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-800">
                          {pt ? pt.name : typeId}
                        </span>
                        <span className="text-xs text-slate-500">{typeId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-teal-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-20 flex-shrink-0">
                          {count}人 ({pct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* フィードバック速報 */}
        {stats && stats.feedbackCount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">フィードバック速報</h2>
            <div className="flex items-center gap-8 mb-5">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">件数</p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {stats.feedbackCount}
                  <span className="text-base font-semibold ml-1">件</span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">平均スコア</p>
                <p className="text-3xl font-extrabold text-teal-600">
                  {stats.feedbackAvg}
                  <span className="text-base font-semibold text-slate-600 ml-1">/ 5</span>
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((score) => {
                const count = stats.feedbackDist[String(score)] ?? 0;
                const pct = stats.feedbackCount > 0 ? Math.round((count / stats.feedbackCount) * 100) : 0;
                return (
                  <div key={score} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 w-4 text-right">{score}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-20">{count}件 ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 設問ごとのグラフ */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1">設問ごとの回答者数</h2>
            <p className="text-sm text-slate-600 mb-6">
              最多比70%未満の設問（赤）で離脱が多い可能性があります
            </p>

            <div className="flex items-end gap-1" style={{ height: '200px' }}>
              {stepEntries.map(({ step, count }) => {
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isLow = pct < 70 && count > 0;
                return (
                  <div
                    key={step}
                    className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full"
                  >
                    <span className="text-slate-600 leading-none" style={{ fontSize: '10px' }}>
                      {count > 0 ? count : ''}
                    </span>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        isLow ? 'bg-red-400' : 'bg-teal-400'
                      }`}
                      style={{ height: `${pct}%`, minHeight: count > 0 ? '4px' : '0' }}
                      title={`Q${step}: ${count}人`}
                    />
                    <span className="text-slate-600 leading-none font-medium" style={{ fontSize: '10px' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-400 inline-block" /> 通常
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> 最多比70%未満
              </span>
            </div>
          </div>
        )}

        {/* スコア分析 */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
            <h2 className="text-base font-bold text-slate-800">スコア分析</h2>

            {/* 因子別平均スコア */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">因子別平均スコア（-9〜+9）</h3>
              <div className="space-y-3">
                {(['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'] as FactorType[]).map((f) => {
                  const avg = stats.factorAvgScores[f] ?? null;
                  const pct = avg != null ? ((avg + 9) / 18) * 100 : 50;
                  return (
                    <div key={f} className="flex items-center gap-3">
                      <span className="w-24 flex-shrink-0 text-sm font-semibold text-slate-700 text-right">
                        {FACTOR_LABELS[f]}
                        <span className="ml-1 text-xs font-normal text-slate-500">({f})</span>
                      </span>
                      <div className="relative flex-1 h-5 flex items-center">
                        <div className="absolute inset-x-0 h-2 bg-slate-100 rounded-full" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-px w-px"
                          style={{ left: '50%', borderLeft: '1.5px dashed #94a3b8', height: '100%' }}
                        />
                        {avg != null && (
                          <div
                            className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 shadow"
                            style={{
                              left: `${pct}%`,
                              background: avg > 0 ? '#0d9488' : avg < 0 ? '#f97316' : '#94a3b8',
                            }}
                          />
                        )}
                      </div>
                      <span className="w-12 flex-shrink-0 text-sm font-bold text-slate-700 text-right">
                        {avg != null ? (avg > 0 ? `+${avg}` : `${avg}`) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 設問別平均スコア */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">設問別平均スコア（-3〜+3）</h3>
              <p className="text-sm text-slate-500 mb-4">※ valueカラムが記録された回答のみ集計</p>
              <div className="space-y-2.5">
                {STEP_QUESTIONS.map((q, i) => {
                  const step = i + 1;
                  const avg = stats.stepAvgScores[String(step)] ?? null;
                  const pct = avg != null ? ((avg + 3) / 6) * 100 : 50;
                  const FACTOR_COLORS: Record<FactorType, string> = {
                    NS: 'bg-violet-100 text-violet-700',
                    HA: 'bg-blue-100 text-blue-700',
                    RD: 'bg-pink-100 text-pink-700',
                    P:  'bg-amber-100 text-amber-700',
                    SD: 'bg-green-100 text-green-700',
                    CO: 'bg-teal-100 text-teal-700',
                    ST: 'bg-orange-100 text-orange-700',
                  };
                  return (
                    <div key={q.id} className="flex items-center gap-3">
                      <span className="w-5 flex-shrink-0 text-xs font-semibold text-slate-500 text-right">
                        {step}
                      </span>
                      <span className={`flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${FACTOR_COLORS[q.factor as FactorType]}`}>
                        {q.factor}
                      </span>
                      <span className="flex-1 text-sm text-slate-700 truncate min-w-0" title={q.text}>
                        {q.text}
                      </span>
                      <div className="relative w-32 flex-shrink-0 h-5 flex items-center">
                        <div className="absolute inset-x-0 h-2 bg-slate-100 rounded-full" />
                        <div
                          className="absolute top-0 h-full"
                          style={{ left: '50%', borderLeft: '1.5px dashed #94a3b8' }}
                        />
                        {avg != null && (
                          <div
                            className="absolute w-3 h-3 rounded-full -translate-x-1/2 shadow"
                            style={{
                              left: `${pct}%`,
                              background: avg > 0 ? '#0d9488' : avg < 0 ? '#f97316' : '#94a3b8',
                            }}
                          />
                        )}
                      </div>
                      <span className="w-10 flex-shrink-0 text-sm font-bold text-slate-700 text-right">
                        {avg != null ? (avg > 0 ? `+${avg}` : `${avg}`) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#0d9488' }} /> 肯定寄り
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#f97316' }} /> 否定寄り
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block bg-slate-400" /> 中立
                </span>
              </div>
            </div>
          </div>
        )}

        </>)} {/* end tab === 'stats' */}

      </main>
    </div>
  );
}

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  const avg = data.length > 0 ? (total / data.length).toFixed(1) : '0';

  return (
    <div>
      <div className="flex items-end gap-[3px] h-24">
        {data.map(({ date, count }) => {
          const heightPct = (count / maxCount) * 100;
          const mmdd = date.slice(5).replace('-', '/');
          const isToday = date === new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {mmdd}: {count}件
              </div>
              <div className="w-full flex flex-col justify-end" style={{ height: 80 }}>
                <div
                  className={`w-full rounded-sm transition-all duration-300 ${isToday ? 'bg-teal-500' : 'bg-teal-200'}`}
                  style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px] mt-1">
        {data.map(({ date }, i) => {
          const mmdd = date.slice(5).replace('-', '/');
          const show = data.length <= 7 || i % 7 === 0 || i === data.length - 1;
          return (
            <div key={date} className="flex-1 text-center">
              <span className="text-[9px] text-slate-400">{show ? mmdd : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span>合計 <strong className="text-slate-700">{total}件</strong></span>
        <span>平均 <strong className="text-slate-700">{avg}件/日</strong></span>
        <span>最大 <strong className="text-slate-700">{maxCount}件</strong></span>
      </div>
    </div>
  );
}

function NoteConvCard({
  noteClicked,
  emails,
  completes,
  noteConvRate,
  emailConvRate,
}: {
  noteClicked: number;
  emails: number;
  completes: number;
  noteConvRate: number;
  emailConvRate: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-slate-600 mb-2">note/メール転換率</p>
      <div className="flex items-end gap-3 mb-1.5">
        <div>
          <p className="text-2xl font-extrabold text-teal-600">
            {noteConvRate}<span className="text-sm font-semibold ml-0.5">%</span>
          </p>
          <p className="text-[10px] text-slate-400">note</p>
        </div>
        <div className="text-slate-300 text-lg font-light pb-4">/</div>
        <div>
          <p className="text-2xl font-extrabold text-slate-700">
            {emailConvRate}<span className="text-sm font-semibold ml-0.5">%</span>
          </p>
          <p className="text-[10px] text-slate-400">メール</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        note {noteClicked}人 / mail {emails}人 / 完 {completes}人
      </p>
    </div>
  );
}

function EmailConvCard({
  emails,
  emailFormViewed,
  completes,
  formConvRate,
  emailConvRate,
}: {
  emails: number;
  emailFormViewed: number;
  completes: number;
  formConvRate: number;
  emailConvRate: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-slate-600 mb-2">完了者メール登録率</p>
      <div className="flex items-end gap-3 mb-1.5">
        <div>
          <p className="text-2xl font-extrabold text-teal-600">
            {formConvRate}<span className="text-sm font-semibold ml-0.5">%</span>
          </p>
        </div>
        <div className="text-slate-300 text-lg font-light pb-0.5">/</div>
        <div>
          <p className="text-2xl font-extrabold text-slate-700">
            {emailConvRate}<span className="text-sm font-semibold ml-0.5">%</span>
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        登 {emails}人 / 到 {emailFormViewed}人 / 完 {completes}人
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  color = 'slate',
  decimal = false,
}: {
  label: string;
  value: number;
  unit: string;
  sub?: string;
  color?: 'teal' | 'amber' | 'red' | 'slate';
  decimal?: boolean;
}) {
  const colorMap = {
    teal: 'text-teal-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    slate: 'text-slate-800',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${colorMap[color]}`}>
        {decimal ? value.toFixed(1) : value.toLocaleString()}
        <span className="text-base font-semibold ml-0.5">{unit}</span>
      </p>
      {sub && <p className="text-sm text-slate-600 mt-1.5">{sub}</p>}
    </div>
  );
}
