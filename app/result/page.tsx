'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { personalityTypes, FactorType } from '@/data/types';
import { QuizResults } from '@/data/types';
import { getScoreLevel } from '@/lib/scoring';
import ScoreBar from '@/components/ScoreBar';
import { aboutTexts } from '@/data/about';
import { relationshipTexts } from '@/data/relationships';
import CompatibilitySection from '@/components/CompatibilitySection';

const RESULTS_KEY = 'personality_quiz_results';
const STORAGE_KEY = 'personality_quiz_state';

const FACTOR_ORDER: FactorType[] = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];

export default function ResultPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(RESULTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizResults;
        setResults(parsed);
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, []);

  const handleRestart = () => {
    localStorage.removeItem(RESULTS_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-slate-700 text-lg mb-6">診断結果が見つかりませんでした。</p>
          <Link
            href="/quiz"
            className="inline-block bg-teal-600 text-white font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-colors"
          >
            診断を受ける
          </Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="text-white text-lg">結果を読み込み中...</div>
      </div>
    );
  }

  const personality = personalityTypes.find((t) => t.id === results.typeId) ?? personalityTypes[7];
  const scores = results.scores;

  const sdLevel = getScoreLevel(scores.SD);
  const coLevel = getScoreLevel(scores.CO);

  const aboutEntry = aboutTexts.find(
    (a) => a.typeId === personality.id && a.sdLevel === sdLevel
  );

  const relationshipEntry = relationshipTexts.find(
    (r) => r.typeId === personality.id && r.coLevel === coLevel
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)' }}>

      {/* ① タイトルセクション */}
      <div className="py-12 px-4 text-center" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-teal-200 text-sm font-semibold uppercase tracking-widest mb-3">診断結果</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            {personality.name}
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {personality.catchphrase}
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">

        {/* ② あなたについてセクション */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-bold">i</span>
            あなたについて
          </h2>
          <p className="text-slate-700 leading-relaxed">
            {aboutEntry ? aboutEntry.text : '準備中です。'}
          </p>
        </section>

        {/* ③ 因子別スコアバーセクション */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">因子別スコア</h2>
          <div className="space-y-5">
            {FACTOR_ORDER.map((factor) => (
              <ScoreBar key={factor} factor={factor} score={scores[factor]} />
            ))}
          </div>
        </section>

        {/* ④ あなたが損しやすいことセクション */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-slate-400 text-lg">💡</span>
            あなたが損しやすいこと
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm">{personality.loss}</p>
        </section>

        {/* ⑤ 人間関係の傾向セクション */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-5">人間関係の傾向</h2>
          {relationshipEntry ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">あなたが人に与える印象</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{relationshipEntry.impression}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">相性がいい人・悪い人</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{relationshipEntry.compatibility}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">人間関係でやりがちな失敗</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{relationshipEntry.failurePattern}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">準備中です。</p>
          )}
        </section>

        {/* ⑥ 相性セクション */}
        <CompatibilitySection userTypeId={personality.id} userTypeName={personality.name} />

        {/* CTA */}
        <div className="text-center pb-4">
          <Link
            href="/quiz"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            もう一度診断する
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white/50">
        <p className="text-slate-400 text-xs leading-relaxed max-w-xl mx-auto px-4">
          ※ 本診断はクロニンジャーの気質・性格モデルを参考にした自己理解ツールです。医療診断・精神科的診断を行うものではありません。結果に関する不安がある場合は、専門家（医師・カウンセラー）にご相談ください。
        </p>
      </footer>
    </div>
  );
}
