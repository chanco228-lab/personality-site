'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { personalityTypes, FactorType } from '@/data/types';
import { QuizResults } from '@/data/types';
import { getScoreLevel, calculateIntrovertScore, calculateImpulsivityScore } from '@/lib/scoring';
import ScoreBar from '@/components/ScoreBar';
import { aboutTexts } from '@/data/about';
import { relationshipTexts } from '@/data/relationships';
import { lossTexts } from '@/data/losses';
import CompatibilitySection from '@/components/CompatibilitySection';
import GradientScoreBar from '@/components/GradientScoreBar';
import { encodePass } from '@/lib/pass';
import { supabase } from '@/lib/supabase';

const RESULT_ID_KEY = 'personality_quiz_result_id';

const INTROVERT_DETAILS = [
  { max: 10,  label: '真の陽キャ', desc: '人といる時間がエネルギーの源。どんな場でも自然と中心にいる。' },
  { max: 20,  label: '陽キャ',     desc: '初対面でも壁を感じない。場の空気を明るくする力がある。' },
  { max: 30,  label: 'やや陽キャ', desc: '人と関わるのが得意で、広い人間関係を持ちやすい。' },
  { max: 40,  label: '社交派',     desc: '基本的には人と関わることを楽しめるが、一人の時間も大切にする。' },
  { max: 50,  label: '無キャ(陽)', desc: '状況に応じて社交的にも内向的にもなれる柔軟なタイプ。' },
  { max: 60,  label: '無キャ(陰)', desc: '深い関係を少数と築くことを好む。広さより深さ重視。' },
  { max: 70,  label: '内向的',     desc: '一人の時間で充電するタイプ。人との関わりは選ぶ。' },
  { max: 80,  label: 'やや陰キャ', desc: '一人の時間で充電するタイプ。人との関わりは選ぶ。' },
  { max: 90,  label: '陰キャ',     desc: '自分の世界を大切にする。深く狭い関係が性に合っている。' },
  { max: 100, label: '真の陰キャ', desc: '一人でいることが最も落ち着く。内なる世界が豊か。' },
];

const RESULTS_KEY = 'personality_quiz_results';
const STORAGE_KEY = 'personality_quiz_state';

const FACTOR_ORDER: FactorType[] = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];


export default function ResultPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [passCopied, setPassCopied] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'done' | 'duplicate' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handleCopyPass = (results: QuizResults) => {
    const pass = encodePass(results);
    navigator.clipboard.writeText(pass).then(() => {
      setPassCopied(true);
      setTimeout(() => setPassCopied(false), 2000);
    });
  };

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

  useEffect(() => {
    const id = localStorage.getItem(RESULT_ID_KEY);
    if (id) setResultId(id);
  }, []);

  const sendFeedback = (score: number) => {
    if (!results || feedbackSent) return;
    // 即座にUI更新
    setFeedbackScore(score);
    setFeedbackSent(true);
    // 送信は裏で
    const introvertScore = calculateIntrovertScore({
      ns: results.scores.NS, ha: results.scores.HA, rd: results.scores.RD,
      sd: results.scores.SD, co: results.scores.CO, st: results.scores.ST,
    });
    supabase.from('feedback_v2').insert({
      result_id: resultId,
      type_id: results.typeId,
      introvert_score: introvertScore,
      score,
    }).then();
  };

  const handleEmailSignup = async () => {
    setEmailError('');
    if (!emailInput.trim()) {
      setEmailError('メールアドレスを入力してください');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError('正しいメールアドレスを入力してください');
      return;
    }
    setEmailStatus('loading');
    const { error } = await supabase.from('email_subscribers').insert({
      email: emailInput.trim(),
      type_id: results?.typeId,
      introvert_score: introvertScore,
    });
    if (!error) {
      setEmailStatus('done');
    } else if (error.code === '23505') {
      setEmailStatus('duplicate');
    } else {
      setEmailStatus('error');
    }
  };

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

  const introvertScore = calculateIntrovertScore({
    ns: scores.NS, ha: scores.HA, rd: scores.RD, sd: scores.SD, co: scores.CO, st: scores.ST,
  });
  const impulsivityScore = calculateImpulsivityScore({
    ns: scores.NS, ha: scores.HA, p: scores.P, sd: scores.SD,
  });

  const introvertDetail =
    INTROVERT_DETAILS.find((d) => introvertScore <= d.max) ?? INTROVERT_DETAILS[9];

  const impulsivityLabel =
    impulsivityScore <= 20 ? '慎重派' :
    impulsivityScore <= 40 ? '計画的' :
    impulsivityScore <= 60 ? '柔軟派' :
    impulsivityScore <= 80 ? '衝動的' : '本能で生きてる';

  const stLevel = getScoreLevel(scores.ST);

  const aboutEntry = aboutTexts.find(
    (a) => a.typeId === personality.id && a.sdLevel === sdLevel
  );

  const lossEntry = lossTexts.find(
    (l) => l.typeId === personality.id && l.stLevel === stLevel
  );

  const relationshipEntry = relationshipTexts.find(
    (r) => r.typeId === personality.id && r.coLevel === coLevel
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)' }}>

      {/* ① タイトルセクション */}
      <div className="py-12 px-4 text-center" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2 mb-3">
            <p className="text-teal-200 text-sm font-semibold uppercase tracking-widest">診断結果</p>
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 text-sm font-extrabold px-4 py-1.5 rounded-full shadow-md ring-2 ring-amber-300">
              <span className="text-base">⚠️</span> β版 ー 随時更新
            </span>
          </div>
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
          {lossEntry && (
            <>
              <div className="border-t border-slate-100 mt-5 pt-5">
                <p className="text-sm font-bold text-slate-500 mb-2">💡 損しやすいこと</p>
                <p className="text-slate-700 leading-relaxed text-sm">{lossEntry.text}</p>
              </div>
            </>
          )}
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

        {/* ④⑤ パーソナリティ指数（2カラム） */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 陰キャ・陽キャ */}
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4 text-center">陰キャ・陽キャ診断</p>
              <GradientScoreBar
                score={introvertScore}
                label={introvertDetail.label}
                colorFrom="#FF8C00"
                colorMid="#22C55E"
                colorTo="#6366F1"
                leftLabel="陽キャ"
                rightLabel="陰キャ"
              />
            </div>

            {/* 行動スタイル */}
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4 text-center">行動スタイル診断</p>
              <GradientScoreBar
                score={impulsivityScore}
                label={impulsivityLabel}
                colorFrom="#3B82F6"
                colorMid="#22C55E"
                colorTo="#EF4444"
                leftLabel="慎重"
                rightLabel="衝動的"
              />
            </div>

          </div>
          {impulsivityScore >= 61 && (
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
              💡 衝動性が高めの傾向があります。このパターンはADHDの方に多い傾向と似ています。日常生活で気になる場合は、専門家への相談も選択肢の一つです。
            </div>
          )}
        </section>


        {/* ⑤ 人間関係の傾向セクション */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-5">人間関係の傾向</h2>
          {relationshipEntry ? (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-bold text-teal-600 mb-2">👤 あなたが人に与える印象</p>
                <p className="text-slate-700 text-base leading-relaxed">{relationshipEntry.impression}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-600 mb-2">🤝 相性がいい人・悪い人</p>
                <p className="text-slate-700 text-base leading-relaxed">{relationshipEntry.compatibility}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-600 mb-2">⚠️ 人間関係でやりがちな失敗</p>
                <p className="text-slate-700 text-base leading-relaxed">{relationshipEntry.failurePattern}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">準備中です。</p>
          )}
        </section>

        {/* ⑥ 相性セクション */}
        <CompatibilitySection userTypeId={personality.id} userTypeName={personality.name} />

        {/* メール登録 */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8">
          <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
            <span className="text-lg">💡</span>
            さらに詳しい診断結果を知りたい方へ
          </h2>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            メールアドレスを登録すると、あなたに合わせた詳細分析をお届けします。
          </p>
          {emailStatus === 'done' ? (
            <p className="text-teal-600 font-semibold text-sm">✅ 登録が完了しました。詳細分析をお楽しみに！</p>
          ) : emailStatus === 'duplicate' ? (
            <p className="text-amber-600 text-sm">このメールアドレスはすでに登録されています。</p>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                placeholder="メールアドレスを入力"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
              {emailStatus === 'error' && <p className="text-red-500 text-xs">送信に失敗しました。もう一度お試しください。</p>}
              <button
                onClick={handleEmailSignup}
                disabled={emailStatus === 'loading'}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-700 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {emailStatus === 'loading' ? '登録中...' : '登録する'}
              </button>
            </div>
          )}
        </section>

        {/* フィードバック */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
          <h2 className="text-base font-bold text-slate-700 mb-1">この診断結果はあなたに当てはまっていましたか？</h2>
          <p className="text-xs text-slate-400 mb-5">フィードバックは診断の改善に役立てます</p>
          {feedbackSent ? (
            <p className="text-teal-600 font-semibold text-sm">ありがとうございました 🙏</p>
          ) : (
            <>
              <div className="flex justify-center gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => sendFeedback(n)}
                    disabled={feedbackSent}
                    className={`w-11 h-11 rounded-full font-bold text-base border-2 transition-all duration-150
                      ${feedbackScore === n
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 px-1 max-w-xs mx-auto">
                <span>全然違う</span>
                <span>ぴったり</span>
              </div>
            </>
          )}
        </section>

        {/* 性格パス */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
            <span className="text-slate-400 text-lg">🔑</span>
            性格パス
          </h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            このコードを保存しておくと、次回以降は質問を飛ばして結果画面を直接開けます。
          </p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm text-slate-600 font-mono break-all select-all">
              {encodePass(results)}
            </code>
            <button
              onClick={() => handleCopyPass(results)}
              className="shrink-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              {passCopied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  コピー済み
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  コピー
                </>
              )}
            </button>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-4">
          <Link
            href="/"
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
