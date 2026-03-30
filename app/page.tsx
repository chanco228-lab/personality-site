'use client';

import Link from 'next/link';
import { useState } from 'react';
import { personalityTypes } from '@/data/types';
import { computeCompatibility } from '@/lib/compatibility';
import TypeCombobox from '@/components/TypeCombobox';

export default function Home() {
  const [typeA, setTypeA] = useState<string | null>(null);
  const [typeB, setTypeB] = useState<string | null>(null);

  const result =
    typeA && typeB ? computeCompatibility(typeA, typeB) : null;

  const typeAName = typeA ? personalityTypes.find((t) => t.id === typeA)?.name : null;
  const typeBName = typeB ? personalityTypes.find((t) => t.id === typeB)?.name : null;

  const scoreColor =
    result === null ? ''
    : result.score >= 81 ? 'text-teal-600'
    : result.score >= 61 ? 'text-blue-600'
    : result.score >= 41 ? 'text-amber-600'
    : 'text-slate-500';

  return (
    <main className="min-h-screen flex flex-col bg-white">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-5 pt-16 pb-12 bg-gradient-to-b from-slate-50 to-white">
        <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 border border-teal-200">
          性格診断 · 54 types
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
          あなたはどの<br />
          <span className="text-teal-600">パーソナリティ</span>タイプ？
        </h1>

        <p className="text-slate-500 text-base md:text-lg max-w-md leading-relaxed mb-8">
          21問に答えるだけ。クロニンジャーの気質モデルをもとに、
          7つの因子から54タイプを判定します。
        </p>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          無料で診断する
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <p className="mt-3 text-slate-400 text-xs">約3分 · 無料 · 登録不要</p>
      </section>

      {/* ── Divider ── */}
      <div className="w-full max-w-xl mx-auto px-5">
        <div className="border-t border-slate-100" />
      </div>

      {/* ── Quick Compatibility ── */}
      <section className="px-5 py-12 max-w-xl mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">相性をすぐ調べる</h2>
          <p className="text-slate-400 text-sm">
            2つのタイプを選ぶだけ。診断前でも使えます。
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                タイプ A
              </label>
              <TypeCombobox
                value={typeA}
                onChange={(id) => setTypeA(id)}
                showCatchphrase={false}
                inputClassName="w-full border border-slate-300 rounded-xl px-3 py-2.5 pr-8 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                タイプ B
              </label>
              <TypeCombobox
                value={typeB}
                onChange={(id) => setTypeB(id)}
                showCatchphrase={false}
                inputClassName="w-full border border-slate-300 rounded-xl px-3 py-2.5 pr-8 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {result ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">
                {typeAName} × {typeBName}
              </p>
              <p className={`text-4xl font-extrabold mb-1 ${scoreColor}`}>
                {result.score}%
              </p>
              <p className="text-sm font-semibold text-slate-700 mb-3">「{result.label}」</p>
              <div className="space-y-1.5 text-left">
                {result.comments.map((c, i) => (
                  <p key={i} className="text-xs text-slate-500 leading-relaxed flex gap-1.5">
                    <span className="text-teal-400 mt-0.5 shrink-0">●</span>
                    {c}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <p className="text-slate-300 text-sm">2つのタイプを選ぶと結果が表示されます</p>
            </div>
          )}
        </div>

        <p className="text-center mt-3 text-slate-400 text-xs">
          自分のタイプがわからない場合は
          <Link href="/quiz" className="text-teal-600 underline underline-offset-2 ml-1">まず診断</Link>
          してみましょう
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="w-full max-w-xl mx-auto px-5">
        <div className="border-t border-slate-100" />
      </div>

      {/* ── Features ── */}
      <section className="px-5 py-10 max-w-xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🧬', title: '7因子', desc: '気質を多角的に測定' },
            { icon: '⚡', title: '21問', desc: '約3分で完了' },
            { icon: '🔒', title: '完全匿名', desc: '登録・課金なし' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-1.5">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-sm font-bold text-slate-700">{f.title}</span>
              <span className="text-xs text-slate-400 leading-snug">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto py-6 text-center border-t border-slate-100">
        <p className="text-slate-400 text-xs max-w-md mx-auto px-4 leading-relaxed">
          ※ 本診断は娯楽・自己理解を目的としたものです。医療診断や専門的カウンセリングの代替ではありません。
        </p>
      </footer>
    </main>
  );
}
