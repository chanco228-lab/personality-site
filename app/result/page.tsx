'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { personalityTypes, FactorType, PersonalityType } from '@/data/types';
import { QuizResults } from '@/data/types';
import { getScoreLevel, calculateIntrovertScore, calculateImpulsivityScore } from '@/lib/scoring';
import ScoreBar from '@/components/ScoreBar';
import { aboutTexts } from '@/data/about';
import { relationshipTexts } from '@/data/relationships';
import CompatibilitySection from '@/components/CompatibilitySection';
import GradientScoreBar from '@/components/GradientScoreBar';
import { encodePass } from '@/lib/pass';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/logger';

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

// タイプカラーマッピング (ns × ha)
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  high_low:  { bg: '#F5E12B', text: '#0E0E0E' },
  high_mid:  { bg: '#FF6B57', text: '#FFFFFF' },
  high_high: { bg: '#FFB8D6', text: '#0E0E0E' },
  mid_low:   { bg: '#2FC6B8', text: '#FFFFFF' },
  mid_mid:   { bg: '#FFFFFF', text: '#0E0E0E' },
  mid_high:  { bg: '#B9A7F5', text: '#0E0E0E' },
  low_low:   { bg: '#9BDC5A', text: '#0E0E0E' },
  low_mid:   { bg: '#B9A7F5', text: '#0E0E0E' },
  low_high:  { bg: '#0E0E0E', text: '#FFFFFF' },
};

function getTypeColors(p: PersonalityType) {
  return TYPE_COLORS[`${p.ns}_${p.ha}`] ?? { bg: '#FFFFFF', text: '#0E0E0E' };
}

function getKeywords(p: PersonalityType): { text: string; cls: string }[] {
  return [
    p.ns === 'high' ? { text: '好奇心旺盛', cls: 'bg-coral text-paper' }
    : p.ns === 'low' ? { text: '安定志向', cls: 'bg-lav text-ink' }
    : { text: 'バランス型', cls: 'bg-turq text-paper' },

    p.ha === 'high' ? { text: '繊細', cls: 'bg-hpink text-ink' }
    : p.ha === 'low' ? { text: '大胆', cls: 'bg-yellow text-ink' }
    : { text: '慎重派', cls: 'bg-hgreen text-ink' },

    p.sd_rep === 'high' ? { text: '自己主導型', cls: 'bg-ink text-paper' }
    : p.sd_rep === 'low' ? { text: '柔軟思考', cls: 'bg-lav text-ink' }
    : { text: '実直型', cls: 'bg-yellow text-ink' },
  ];
}

// セクションカードの共通スタイル
const CARD = 'bg-paper border-2 border-ink rounded-[20px] p-6 md:p-8';
const CARD_SHADOW = { boxShadow: '6px 6px 0 #0E0E0E' };
const SECTION_LABEL = 'inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3';

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
  const emailSectionRef = useRef<HTMLElement>(null);
  const emailViewedRef = useRef(false);

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

  useEffect(() => {
    if (!results) return;
    const el = emailSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !emailViewedRef.current) {
          emailViewedRef.current = true;
          logEvent('email_form_viewed');
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [results]);

  const sendFeedback = (score: number) => {
    if (!results || feedbackSent) return;
    setFeedbackScore(score);
    setFeedbackSent(true);
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
      logEvent('email_registered');
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

  // ── ローディング / エラー状態 ──────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <div
          className="bg-paper border-2 border-ink rounded-[20px] p-8 text-center max-w-sm w-full"
          style={{ boxShadow: '8px 8px 0 #0E0E0E' }}
        >
          <p className="font-bold text-[17px] mb-6">診断結果が見つかりませんでした。</p>
          <Link
            href="/quiz"
            className="hero-cta inline-flex items-center gap-2 bg-ink text-paper font-display font-black border-2 border-ink rounded-full px-8 py-4"
          >
            診断を受ける →
          </Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-mono text-[14px]" style={{ opacity: 0.4 }}>結果を読み込み中...</div>
      </div>
    );
  }

  // ── 計算 ──────────────────────────────────────────────────────────────────

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

  const impulsivityDesc =
    impulsivityScore <= 20 ? 'リスクを最小化してから動くタイプ。慎重さが強みです。' :
    impulsivityScore <= 40 ? '計画を立てて着実に進む。感情より論理で動く傾向。' :
    impulsivityScore <= 60 ? '状況に応じて柔軟に判断できる。バランス型です。' :
    impulsivityScore <= 80 ? '直感で動くことが多い。スピード感が持ち味。' :
    '衝動性が強め。エネルギッシュだが、後先考えずに動きがち。';

  const aboutEntry = aboutTexts.find(
    (a) => a.typeId === personality.id && a.sdLevel === sdLevel
  );

  const relationshipEntry = relationshipTexts.find(
    (r) => r.typeId === personality.id && r.coLevel === coLevel
  );

  const typeColors = getTypeColors(personality);
  const keywords = getKeywords(personality);
  const typeIndex = personalityTypes.findIndex((t) => t.id === results.typeId);
  const typeNum = String(typeIndex + 1).padStart(2, '0');

  const introvertPct = introvertScore;
  const introvertLabel = introvertScore < 50 ? `陽キャ度 ${100 - introvertScore}%` : `陰キャ度 ${introvertScore}%`;

  const xShareText = `TC7診断したら【${personality.name}】だった\n${introvertLabel}\nみんなも診断してみて、タイプ教えて👇\n#TC7診断\npersonality-site.vercel.app`;
  const lineShareText = `TC7診断したら陰キャ度${introvertScore}%、【${personality.name}】って出た\nhttps://personality-site.vercel.app`;

  // ── メイン描画 ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ① タイトルセクション */}
      <div style={{ background: typeColors.bg, color: typeColors.text }}>
        <div className="max-w-[720px] mx-auto px-6 pt-[56px] pb-[52px]">
          {/* Type code */}
          <p className="font-mono text-[13px] font-bold mb-4" style={{ opacity: 0.65 }}>
            {personality.id.toUpperCase()} · TYPE {typeNum}
          </p>

          {/* Type name — 圧倒的サイズ */}
          <h1
            className="font-black tracking-[-0.04em] leading-[0.88] mb-5"
            style={{ fontSize: 'clamp(56px, 14vw, 120px)' }}
          >
            {personality.name}
          </h1>

          {/* Catchphrase */}
          <p
            className="font-bold leading-[1.5] mb-7 max-w-[480px]"
            style={{ fontSize: 'clamp(17px, 3vw, 22px)', opacity: 0.9 }}
          >
            {personality.catchphrase}
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span
              className="font-mono font-bold text-[13px] px-4 py-[8px] rounded-full border-2"
              style={{ borderColor: typeColors.text }}
            >
              {introvertLabel}
            </span>
            <span
              className="font-mono font-bold text-[13px] px-4 py-[8px] rounded-full border-2"
              style={{ borderColor: typeColors.text }}
            >
              衝動性 {impulsivityScore}%
            </span>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(xShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logEvent('x_shared')}
              className="inline-flex items-center gap-2 bg-ink text-paper border-2 border-ink font-bold text-[13px] px-5 py-[10px] rounded-full"
              style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xでシェア
            </a>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent(lineShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logEvent('line_shared')}
              className="inline-flex items-center gap-2 text-paper border-2 font-bold text-[13px] px-5 py-[10px] rounded-full"
              style={{ background: '#06C755', borderColor: '#06C755', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.045 2 11.077c0 4.562 3.253 8.376 7.656 9.083.334.07.79.217.905.497.104.256.068.657.033.916l-.147.864c-.044.262-.206 1.023.896.558 1.101-.466 5.942-3.5 8.107-5.992C20.917 15.149 22 13.209 22 11.077 22 6.045 17.523 2 12 2z" />
              </svg>
              LINEでシェア
            </a>
          </div>
        </div>
      </div>

      {/* ── カード群 ── */}
      <main className="max-w-[720px] mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ② ABOUT YOU */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            ABOUT YOU
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-5">あなたについて</h2>

          {/* Keyword chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {keywords.map((k) => (
              <span key={k.text} className={`font-bold text-[13px] px-4 py-[6px] rounded-full border-2 border-ink ${k.cls}`}>
                {k.text}
              </span>
            ))}
          </div>

          <p className="text-[16px] leading-[1.8]" style={{ color: '#1A1A1A' }}>
            {aboutEntry ? aboutEntry.text : '準備中です。'}
          </p>
        </section>

        {/* ③ 因子別スコアバー */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            FACTOR SCORES
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-6">因子別スコア</h2>
          <div className="flex flex-col gap-5">
            {FACTOR_ORDER.map((factor, i) => (
              <ScoreBar key={factor} factor={factor} score={scores[factor]} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* ④ パーソナリティ指数 */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            PERSONALITY INDEX
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-6">パーソナリティ指数</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GradientScoreBar
              score={introvertPct}
              title="陰キャ度"
              label={introvertDetail.label}
              description={introvertDetail.desc}
              colorFrom="#FFB8D6"
              colorMid="#FFFFFF"
              colorTo="#2FC6B8"
              leftLabel="陽キャ"
              rightLabel="陰キャ"
            />
            <GradientScoreBar
              score={impulsivityScore}
              title="衝動性"
              label={impulsivityLabel}
              description={impulsivityDesc}
              colorFrom="#2FC6B8"
              colorMid="#FFFFFF"
              colorTo="#FF6B57"
              leftLabel="慎重"
              rightLabel="衝動的"
            />
          </div>

          {impulsivityScore >= 71 && (
            <div className="mt-6 bg-yellow border-2 border-ink rounded-[12px] p-4 text-[13px] leading-[1.7]">
              💡 衝動性が高めの傾向があります。このパターンはADHDの方に多い傾向と似ています。日常生活で気になる場合は、専門家への相談も選択肢の一つです。
            </div>
          )}
        </section>

        {/* ⑤ 損しやすいこと */}
        <section className="bg-yellow border-2 border-ink rounded-[20px] p-6 md:p-8" style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            WHAT YOU MAY LOSE
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-5">あなたが損しやすいこと</h2>
          <div className="flex gap-4">
            <span className="text-[36px] shrink-0">⚠️</span>
            <p className="text-[15px] leading-[1.8]">{personality.loss}</p>
          </div>
        </section>

        {/* ⑥ 人間関係の傾向 */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            RELATIONSHIPS
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-5">人間関係の傾向</h2>
          {relationshipEntry ? (
            <div className="flex flex-col gap-4">
              <div className="bg-bg border-2 border-ink rounded-[12px] p-4">
                <p className="font-bold text-[13px] text-turq mb-2">👤 あなたが人に与える印象</p>
                <p className="text-[15px] leading-[1.7]">{relationshipEntry.impression}</p>
              </div>
              <div className="bg-bg border-2 border-ink rounded-[12px] p-4">
                <p className="font-bold text-[13px] text-coral mb-2">🤝 相性がいい人・悪い人</p>
                <p className="text-[15px] leading-[1.7]">{relationshipEntry.compatibility}</p>
              </div>
              <div className="bg-bg border-2 border-ink rounded-[12px] p-4">
                <p className="font-bold text-[13px] mb-2" style={{ color: '#C8A800' }}>⚠️ 人間関係でやりがちな失敗</p>
                <p className="text-[15px] leading-[1.7]">{relationshipEntry.failurePattern}</p>
              </div>
            </div>
          ) : (
            <p className="text-[14px]" style={{ opacity: 0.4 }}>準備中です。</p>
          )}
        </section>

        {/* 相性 */}
        <CompatibilitySection userTypeId={personality.id} userTypeName={personality.name} />

        {/* ⑦ メール登録 */}
        <section
          ref={emailSectionRef}
          className="bg-coral border-2 border-ink rounded-[20px] p-6 md:p-8 text-paper"
          style={CARD_SHADOW}
        >
          <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3 text-paper/70">
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-paper/70" />
            EMAIL
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-2">続きを受け取る</h2>
          <p className="text-[14px] mb-6 leading-[1.7]" style={{ opacity: 0.9 }}>
            メールアドレスを登録すると、あなたに合わせた詳細分析をお届けします。
          </p>
          {emailStatus === 'done' ? (
            <p className="font-bold text-[15px]">✅ 登録が完了しました。詳細分析をお楽しみに！</p>
          ) : emailStatus === 'duplicate' ? (
            <p className="font-bold text-[14px]">このメールアドレスはすでに登録されています。</p>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                placeholder="メールアドレスを入力"
                className="w-full border-2 border-ink rounded-[12px] px-4 py-3 text-[14px] text-ink bg-paper focus:outline-none"
              />
              {emailError && <p className="text-paper text-[12px] font-bold">{emailError}</p>}
              {emailStatus === 'error' && <p className="text-paper text-[12px] font-bold">送信に失敗しました。もう一度お試しください。</p>}
              <button
                onClick={handleEmailSignup}
                disabled={emailStatus === 'loading'}
                className="hero-cta w-full bg-paper text-ink font-display font-black border-2 border-ink rounded-full py-[14px] text-[16px] disabled:opacity-60"
              >
                {emailStatus === 'loading' ? '登録中...' : '登録する →'}
              </button>
            </div>
          )}
        </section>

        {/* ⑧ フィードバック */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            FEEDBACK
          </div>
          <h2 className="font-black text-[20px] tracking-tight mb-2">この診断はどうだった？</h2>
          <p className="text-[13px] mb-6" style={{ color: '#2A2A2A', opacity: 0.6 }}>フィードバックは診断の改善に役立てます</p>
          {feedbackSent ? (
            <p className="font-bold text-[15px] text-turq">ありがとうございました 🙏</p>
          ) : (
            <>
              <div className="flex justify-center gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => sendFeedback(n)}
                    disabled={feedbackSent}
                    className={`w-12 h-12 rounded-full font-mono font-bold text-[16px] border-2 border-ink transition-all duration-150 ${
                      feedbackScore === n
                        ? 'bg-ink text-paper'
                        : 'bg-paper text-ink hover:bg-yellow'
                    }`}
                    style={{ boxShadow: feedbackScore === n ? 'none' : '3px 3px 0 #0E0E0E' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-mono px-1 max-w-xs mx-auto" style={{ opacity: 0.5 }}>
                <span>全然違う</span>
                <span>ぴったり</span>
              </div>
            </>
          )}
        </section>

        {/* 性格パス */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            YOUR PASS
          </div>
          <h2 className="font-black text-[20px] tracking-tight mb-2">性格パス</h2>
          <p className="text-[13px] mb-5 leading-[1.6]" style={{ color: '#2A2A2A', opacity: 0.6 }}>
            このコードを保存しておくと、次回以降は質問を飛ばして結果画面を直接開けます。
          </p>
          <div className="flex items-center gap-3 bg-bg border-2 border-ink rounded-[12px] px-4 py-3">
            <code className="flex-1 text-[13px] font-mono break-all select-all">{encodePass(results)}</code>
            <button
              onClick={() => handleCopyPass(results)}
              className="shrink-0 flex items-center gap-1.5 bg-ink text-paper font-bold text-[12px] px-3 py-2 rounded-[8px] border-2 border-ink transition-opacity hover:opacity-80"
            >
              {passCopied ? '✓ 済' : 'コピー'}
            </button>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-4">
          <Link
            href="/"
            onClick={handleRestart}
            className="hero-cta inline-flex items-center gap-3 bg-ink text-paper font-display font-black border-2 border-ink rounded-full px-9 py-[18px]"
            style={{ fontSize: '18px' }}
          >
            もう一度診断する →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink py-5 px-4 text-center bg-bg">
        <p className="font-mono text-[11px] max-w-xl mx-auto leading-[1.7]" style={{ color: '#2A2A2A', opacity: 0.5 }}>
          ※ 本診断はクロニンジャーの気質・性格モデルを参考にした自己理解ツールです。医療診断・精神科的診断を行うものではありません。
        </p>
      </footer>
    </div>
  );
}
