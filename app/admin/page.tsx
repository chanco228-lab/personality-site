'use client';

import { useState, useEffect } from 'react';

type Stats = {
  starts: number;
  completes: number;
  emails: number;
  emailFormViewed: number;
  xShared: number;
  lineShared: number;
  stepCounts: Record<string, number>;
};

const PASS_KEY = 'admin_password';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [days, setDays] = useState<7 | 30>(7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (pw: string, d: number): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?days=${d}`, {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (!res.ok) return false;
      setStats(await res.json());
      return true;
    } finally {
      setLoading(false);
    }
  };

  // セッションから自動ログイン
  useEffect(() => {
    const saved = sessionStorage.getItem(PASS_KEY);
    if (!saved) return;
    fetchStats(saved, 7).then((ok) => { if (ok) setAuthed(true); });
  }, []);

  // 期間切り替え時に再取得
  useEffect(() => {
    if (!authed) return;
    const saved = sessionStorage.getItem(PASS_KEY);
    if (saved) fetchStats(saved, days);
  }, [days, authed]);

  const handleLogin = async () => {
    setAuthError(false);
    const ok = await fetchStats(password, days);
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
            <p className="text-red-500 text-xs mb-3">パスワードが正しくありません</p>
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
  const emailRate =
    stats && stats.emailFormViewed > 0 ? Math.round((stats.emails / stats.emailFormViewed) * 100) : 0;

  const stepEntries = Array.from({ length: 21 }, (_, i) => ({
    step: i + 1,
    count: stats ? (stats.stepCounts[String(i + 1)] ?? 0) : 0,
  }));
  const maxCount = Math.max(...stepEntries.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">管理画面</h1>
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-slate-400">更新中...</span>}
          <div className="flex gap-1.5">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  days === d
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

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
              <KpiCard
                label="フォーム表示"
                value={stats.emailFormViewed}
                unit="人"
              />
              <KpiCard
                label="Gmail登録"
                value={stats.emails}
                unit="人"
                sub={`表示→登録率 ${emailRate}%`}
              />
            </div>

            {/* シェア */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Xシェア数" value={stats.xShared} unit="回" />
              <KpiCard label="LINEシェア数" value={stats.lineShared} unit="回" />
              <KpiCard
                label="完了率"
                value={completionRate}
                unit="%"
                color={completionRate >= 70 ? 'teal' : completionRate >= 50 ? 'amber' : 'red'}
              />
            </div>
          </>
        )}

        {/* 設問ごとのグラフ */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-700 mb-1">設問ごとの回答者数</h2>
            <p className="text-xs text-slate-400 mb-6">
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
                    <span className="text-xs text-slate-500 leading-none" style={{ fontSize: '10px' }}>
                      {count > 0 ? count : ''}
                    </span>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        isLow ? 'bg-red-400' : 'bg-teal-400'
                      }`}
                      style={{ height: `${pct}%`, minHeight: count > 0 ? '4px' : '0' }}
                      title={`Q${step}: ${count}人`}
                    />
                    <span className="text-slate-400 leading-none" style={{ fontSize: '9px' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-400 inline-block" /> 通常
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> 最多比70%未満
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  color = 'slate',
}: {
  label: string;
  value: number;
  unit: string;
  sub?: string;
  color?: 'teal' | 'amber' | 'red' | 'slate';
}) {
  const colorMap = {
    teal: 'text-teal-600',
    amber: 'text-amber-500',
    red: 'text-red-500',
    slate: 'text-slate-800',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${colorMap[color]}`}>
        {value.toLocaleString()}
        <span className="text-sm font-semibold ml-0.5">{unit}</span>
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
