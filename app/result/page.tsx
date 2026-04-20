'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { personalityTypes, FactorType, PersonalityType } from '@/data/types';
import { QuizResults } from '@/data/types';
import { getScoreLevel, calculateIntrovertScore, calculateImpulsivityScore } from '@/lib/scoring';
import ScoreBar from '@/components/ScoreBar';
import { aboutTexts } from '@/data/about';
import { relationshipTexts } from '@/data/relationships';
import GradientScoreBar from '@/components/GradientScoreBar';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/logger';
import { factorComments } from '@/data/factorComments';
import { getTop3Compatible, getBottom3Compatible } from '@/lib/compatibility';
import { generateShareText, ShareVariant } from '@/lib/shareText';
import StickyShareBar from '@/components/StickyShareBar';
import SectionRating from '@/components/SectionRating';
import CodeAccordion from '@/components/CodeAccordion';
import { toDisplayCode } from '@/lib/typeCode';

const RESULT_ID_KEY = 'personality_quiz_result_id';
const RESULTS_KEY = 'personality_quiz_results';
const STORAGE_KEY = 'personality_quiz_state';
const VERSION_KEY = 'personality_quiz_version';

const FACTOR_ORDER: FactorType[] = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];

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

function getFactorLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 4) return 'high';
  if (score <= -4) return 'low';
  return 'mid';
}

function renderPreview(text: string) {
  return text.split(/(\[\[BLUR\]\][\s\S]*?\[\[\/BLUR\]\])/g).map((seg, i) => {
    if (seg.startsWith('[[BLUR]]')) {
      const inner = seg.replace(/\[\[BLUR\]\]|\[\[\/BLUR\]\]/g, '');
      return <span key={i} className="blurred-text">{inner}</span>;
    }
    return <span key={i}>{seg}</span>;
  });
}

const CARD = 'bg-paper border-2 border-ink rounded-[20px] p-6 md:p-8';
const CARD_SHADOW = { boxShadow: '6px 6px 0 #0E0E0E' };
const SECTION_LABEL = 'inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3';

export default function ResultPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [variant] = useState<ShareVariant>(() => Math.random() < 0.5 ? 'A' : 'B');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'done' | 'duplicate' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  const emailSectionRef = useRef<HTMLElement>(null);
  const emailViewedRef = useRef(false);

  useEffect(() => {
    const defaultScores = { NS: 0, HA: 0, RD: 0, P: 0, SD: 0, CO: 0, ST: 0 };
    const fallback: QuizResults = { scores: defaultScores, typeId: 'mmm_f' };
    const saved = localStorage.getItem(RESULTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizResults;
        parsed.scores = { ...defaultScores, ...parsed.scores };
        setResults(parsed);
      } catch {
        setResults(fallback);
      }
    } else {
      setResults(fallback);
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
    supabase.from('feedback_v3').insert({
      result_id: resultId,
      type_id: results.typeId,
      rating: score,
    }).then(({ error }) => {
      if (error) console.error('[feedback_v3 insert failed]', JSON.stringify(error));
    });
  };

  const handleEmailSignup = async () => {
    setEmailError('');
    if (!emailInput.trim()) { setEmailError('メールアドレスを入力してください'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) { setEmailError('正しいメールアドレスを入力してください'); return; }
    setEmailStatus('loading');
    const iScore = results ? calculateIntrovertScore({
      ns: results.scores.NS, ha: results.scores.HA, rd: results.scores.RD,
      sd: results.scores.SD, co: results.scores.CO, st: results.scores.ST,
    }) : 0;
    const { error } = await supabase.from('email_subscribers').insert({
      email: emailInput.trim(),
      type_id: results?.typeId,
      introvert_score: iScore,
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

  if (!results) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-mono text-[14px]" style={{ opacity: 0.4 }}>結果を読み込み中...</div>
      </div>
    );
  }

  // ── 計算 ───────────────────────────────────────────────────────────────────

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

  const introvertDetail = INTROVERT_DETAILS.find((d) => introvertScore <= d.max) ?? INTROVERT_DETAILS[9];

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

  const aboutEntry = aboutTexts.find((a) => a.typeId === personality.id && a.sdLevel === sdLevel);
  const relationshipEntry = relationshipTexts.find((r) => r.typeId === personality.id && r.coLevel === coLevel);

  const typeColors = getTypeColors(personality);
  const typeIndex = personalityTypes.findIndex((t) => t.id === results.typeId);
  const typeNum = String(typeIndex + 1).padStart(2, '0');

  const introvertLabel = introvertScore < 50 ? `陽キャ度 ${100 - introvertScore}%` : `陰キャ度 ${introvertScore}%`;

  const top3 = getTop3Compatible(personality.id);
  const bottom3 = getBottom3Compatible(personality.id);

  const extLabel = introvertScore < 40 ? '陽キャ' : introvertScore > 60 ? '陰キャ' : '無キャ';
  const extPercent = introvertScore < 50 ? 100 - introvertScore : introvertScore;

  const displayCode = toDisplayCode(personality.id);
  const xShareText = generateShareText({ typeName: personality.name, displayCode, extLabel, extPercent, catchphrase: personality.catchphrase, variant, platform: 'x' });
  const lineShareText = generateShareText({ typeName: personality.name, displayCode, extLabel, extPercent, catchphrase: personality.catchphrase, variant, platform: 'line' });
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xShareText)}`;
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineShareText)}`;

  const hasNote = !!personality.noteUrl;

  // ── Share buttons ─────────────────────────────────────────────────────────

  const ShareButtons = ({ wiggle = false }: { wiggle?: boolean }) => (
    <div className="flex gap-3 flex-wrap">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent('x_shared')}
        className={`share-btn share-btn-x text-[13px] px-5 py-[10px]${wiggle ? ' share-btn-wiggle' : ''}`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        結果をXでシェア
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent('line_shared')}
        className="share-btn share-btn-line text-[13px] px-5 py-[10px]"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.045 2 11.077c0 4.562 3.253 8.376 7.656 9.083.334.07.79.217.905.497.104.256.068.657.033.916l-.147.864c-.044.262-.206 1.023.896.558 1.101-.466 5.942-3.5 8.107-5.992C20.917 15.149 22 13.209 22 11.077 22 6.045 17.523 2 12 2z" />
        </svg>
        友達にLINEで送る
      </a>
    </div>
  );

  // ── メイン描画 ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ① ヒーロー */}
      <div id="result-hero" style={{ background: typeColors.bg, color: typeColors.text }}>
        <div className="max-w-[720px] mx-auto px-6 pt-[56px] pb-[28px]">
          <p className="font-mono font-bold mb-1" style={{ fontSize: 'clamp(28px, 5vw, 40px)', opacity: 0.65 }}>
            {toDisplayCode(personality.id)}
          </p>
          <h1
            className="font-black tracking-[-0.04em] leading-[0.88] mb-5"
            style={{ fontSize: 'clamp(56px, 14vw, 120px)' }}
          >
            {personality.name}
          </h1>
          <p
            className="font-bold leading-[1.6] mb-7 max-w-[500px]"
            style={{ fontSize: 'clamp(16px, 3vw, 21px)', opacity: 0.9 }}
          >
            {personality.heroLine}
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
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
          <ShareButtons wiggle />
        </div>
      </div>

      {/* ── カード群 ── */}
      <main className="max-w-[720px] mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ② 図星リスト */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className={SECTION_LABEL}>
                <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
                INSIGHTS
              </div>
              <h2 className="font-black text-[20px] tracking-tight mb-3">あなたの特徴</h2>
            </div>
            <SectionRating typeId={personality.id} section="insights" resultId={resultId} />
          </div>
          <div className="flex flex-col gap-4">
            {personality.insights.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-bold text-turq text-[18px] shrink-0 mt-[2px]">✓</span>
                <p className="text-[17px] leading-[1.7]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ③ あなたについて */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <div className={SECTION_LABEL}>
                <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
                ABOUT YOU
              </div>
              <h2 className="font-black text-[22px] tracking-tight">あなたについて</h2>
            </div>
            <SectionRating typeId={personality.id} section="about" resultId={resultId} />
          </div>
          {aboutEntry ? (
            aboutEntry.strengths ? (
              <div className="flex flex-col gap-7">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block w-8 h-[2px] bg-ink/30" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink/50">STRENGTHS / あなたが持つ強み</span>
                  </div>
                  <p className="text-[16px] leading-[1.8]">{aboutEntry.strengths}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block w-8 h-[2px] bg-ink/30" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink/50">STRUGGLES / あなたが生きづらさを感じる場面</span>
                  </div>
                  <p className="text-[16px] leading-[1.8]">{aboutEntry.struggles}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block w-8 h-[2px] bg-ink/30" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink/50">DESIRES / あなたが本当に望んでいること</span>
                  </div>
                  <p className="text-[16px] leading-[1.8]">{aboutEntry.desires}</p>
                </div>
              </div>
            ) : (
              <p className="text-[16px] leading-[1.8]">{aboutEntry.text}</p>
            )
          ) : (
            <p className="text-[14px]" style={{ opacity: 0.4 }}>準備中です。</p>
          )}
        </section>

        {/* ④ 因子別スコアバー */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            FACTOR SCORES
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-6">因子別スコア</h2>
          <div className="flex flex-col gap-6">
            {FACTOR_ORDER.map((factor, i) => {
              const level = getFactorLevel(scores[factor]);
              const comment = factorComments[factor]?.[level];
              return (
                <div key={factor}>
                  <ScoreBar factor={factor} score={scores[factor]} delay={i * 80} />
                  {comment && (
                    <p className="text-[13px] leading-[1.6] mt-2 ml-[100px] md:ml-[108px]" style={{ color: '#2A2A2A', opacity: 0.65 }}>
                      {comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <CodeAccordion typeId={personality.id} />
          </div>
        </section>

        {/* ⑤ 陽キャ度・衝動性 */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            PERSONALITY INDEX
          </div>
          <h2 className="font-black text-[22px] tracking-tight mb-6">パーソナリティ指数</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GradientScoreBar
              score={introvertScore}
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
        </section>

        {/* ⑥ 損ポイント */}
        <section className="bg-yellow border-2 border-ink rounded-[20px] p-6 md:p-8" style={CARD_SHADOW}>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className={SECTION_LABEL}>
                <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
                WHAT YOU MAY LOSE
              </div>
              <h2 className="font-black text-[22px] tracking-tight">あなたが繰り返してきたパターン</h2>
            </div>
            <SectionRating typeId={personality.id} section="loss" resultId={resultId} />
          </div>
          <div className="flex gap-4 mb-6">
            <span className="text-[32px] shrink-0">⚠️</span>
            <p className="text-[16px] leading-[1.8]">{personality.loss}</p>
          </div>
          <div className="border-t-2 border-ink/20 pt-5">
            <p className="font-bold text-[14px] mb-3" style={{ opacity: 0.65 }}>次は、こう一歩だけ変えてみる</p>
            <div className="bg-paper border-2 border-ink rounded-[12px] p-4">
              <p className="text-[16px] font-bold leading-[1.7]">→ {personality.lossAction}</p>
            </div>
          </div>
        </section>

        {/* ⑦ 人間関係 */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className={SECTION_LABEL}>
                <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
                RELATIONSHIPS
              </div>
              <h2 className="font-black text-[22px] tracking-tight">人間関係の傾向</h2>
            </div>
            <SectionRating typeId={personality.id} section="relationships" resultId={resultId} />
          </div>
          {relationshipEntry ? (
            <div className="flex flex-col gap-4 mb-6">
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
            <p className="text-[14px] mb-6" style={{ opacity: 0.4 }}>準備中です。</p>
          )}

          {/* 相性TOP3 / BOTTOM3 */}
          <div className="border-t-2 border-ink/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg border-2 border-ink rounded-[16px] p-4">
              <p className="font-bold text-[14px] mb-3">💞 相性の良いタイプ TOP 3</p>
              <div className="flex flex-col gap-2">
                {top3.map((t, i) => (
                  <div key={t.typeId} className="flex items-center gap-3">
                    <span className="font-mono text-[12px] font-bold text-ink/40 w-4">{i + 1}.</span>
                    <span className="font-bold text-[14px]">{t.name}</span>
                    <span className="font-mono text-[12px] text-ink/40 ml-auto">{t.score}点</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-bg border-2 border-ink rounded-[16px] p-4">
              <p className="font-bold text-[14px] mb-3">⚡ 注意したいタイプ TOP 3</p>
              <div className="flex flex-col gap-2">
                {bottom3.map((t, i) => (
                  <div key={t.typeId} className="flex items-center gap-3">
                    <span className="font-mono text-[12px] font-bold text-ink/40 w-4">{i + 1}.</span>
                    <span className="font-bold text-[14px]">{t.name}</span>
                    <span className="font-mono text-[12px] text-ink/40 ml-auto">{t.score}点</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ⑧ ブリッジ */}
        <div className="py-8 text-center">
          <div className="border-t-2 border-dashed border-ink/20 mb-8" />
          <p className="text-[16px] font-bold mb-2" style={{ opacity: 0.6 }}>ここまでが、基本診断です。</p>
          <p className="text-[16px]" style={{ opacity: 0.6 }}>でも、これはあなたのほんの一部。</p>
          <div className="mt-6 text-[28px]" style={{ opacity: 0.4 }}>↓</div>
          <div className="border-b-2 border-dashed border-ink/20 mt-8" />
        </div>

        {/* ⑨ コンバージョン */}
        {hasNote ? (
          /* ⑨-A: note誘導 */
          <section
            className="rounded-[20px] p-6 md:p-8"
            style={{ background: '#0E0E0E', boxShadow: '6px 6px 0 #0E0E0E' }}
          >
            <div className="border-t-4 border-yellow mb-6" />
            <div className="bg-paper border-2 border-ink rounded-[16px] p-6 md:p-8" style={{ boxShadow: '10px 10px 0 #0E0E0E' }}>
              <div className="text-center mb-6">
                <div className="text-[40px] mb-3">🔒</div>
                <p className="font-black text-[20px] mb-1">さらに深く知りたい？</p>
                <p className="text-[15px]" style={{ opacity: 0.6 }}>【{displayCode} {personality.name}タイプ 完全ガイド】が読めます</p>
              </div>

              <div className="mb-6">
                <p className="font-mono text-[12px] font-bold uppercase tracking-widest mb-2" style={{ opacity: 0.4 }}>── プレビュー ──</p>
                <p className="text-[15px] leading-[1.8] bg-bg rounded-[12px] p-4 border border-ink/10">
                  {renderPreview(personality.previewText)}
                </p>
              </div>

              <div className="mb-6">
                <p className="font-mono text-[12px] font-bold uppercase tracking-widest mb-3" style={{ opacity: 0.4 }}>── このnoteで読めること ──</p>
                <div className="flex flex-col gap-2">
                  {personality.noteTableOfContents.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-turq font-bold shrink-0">✓</span>
                      <span className="text-[15px] leading-[1.6]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="font-mono font-bold text-[28px] mb-4">¥{personality.notePrice.toLocaleString()}</p>
                <a
                  href={personality.noteUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logEvent('note_clicked')}
                  className="hero-cta inline-flex items-center gap-2 font-display font-black text-paper border-2 border-ink rounded-full px-10 py-5 text-[18px]"
                  style={{ background: '#41C9B4', borderColor: '#41C9B4' }}
                >
                  noteで続きを読む →
                </a>
              </div>
              <div className="text-center text-[12px]" style={{ opacity: 0.4 }}>
                <p>※ note決済なのでカード不要で購入可能</p>
                <p>※ noteアカウントは無料で作れます</p>
              </div>
            </div>
            <div className="border-b-4 border-yellow mt-6" />
          </section>
        ) : (
          /* ⑨-B: Gmail誘導 */
          <section
            ref={emailSectionRef}
            className="bg-coral border-2 border-ink rounded-[20px] p-6 md:p-8 text-paper"
            style={CARD_SHADOW}
          >
            <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-4" style={{ opacity: 0.7 }}>
              <span className="inline-block w-5 h-[2px] bg-paper/70" />
              EARLY ACCESS
            </div>
            <div className="text-center mb-6">
              <div className="text-[40px] mb-3">📩</div>
              <h2 className="font-black text-[22px] tracking-tight mb-2">
                {personality.name} の完全ガイドを<br />いち早く受け取る
              </h2>
            </div>
            <div className="bg-paper/20 rounded-[16px] p-5 mb-6 text-[15px] leading-[1.8]">
              <p className="mb-3">現在、あなたのタイプのnoteを制作中です。完成したら真っ先にお知らせします。</p>
              <p>登録者限定で <strong>【 診断結果 深掘り解説 】</strong> も一緒にお届けします。</p>
            </div>
            {emailStatus === 'done' ? (
              <div className="text-center py-4">
                <p className="font-bold text-[17px]">✅ 登録完了！メールを楽しみにしていてください 🎉</p>
              </div>
            ) : emailStatus === 'duplicate' ? (
              <p className="font-bold text-[14px] text-center">このメールアドレスはすでに登録されています。</p>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                  placeholder="メールアドレスを入力"
                  className="w-full border-2 border-ink rounded-[12px] px-4 py-4 text-[15px] text-ink bg-paper focus:outline-none"
                  style={{ boxShadow: emailError ? 'none' : '4px 4px 0 rgba(0,0,0,0.2)' }}
                />
                {emailError && <p className="text-paper text-[12px] font-bold">{emailError}</p>}
                {emailStatus === 'error' && <p className="text-paper text-[12px] font-bold">送信に失敗しました。もう一度お試しください。</p>}
                <button
                  onClick={handleEmailSignup}
                  disabled={emailStatus === 'loading'}
                  className="hero-cta w-full bg-ink text-paper font-display font-black border-2 border-ink rounded-full py-[16px] text-[17px] disabled:opacity-60"
                >
                  {emailStatus === 'loading' ? '登録中...' : '無料で受け取る →'}
                </button>
                <p className="text-center text-[12px]" style={{ opacity: 0.7 }}>※ いつでも配信停止できます</p>
              </div>
            )}
          </section>
        )}

        {/* ⑩ フィードバック */}
        <section className={CARD} style={CARD_SHADOW}>
          <div className={SECTION_LABEL}>
            <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
            FEEDBACK
          </div>
          <h2 className="font-black text-[20px] tracking-tight mb-2">この診断はどう？</h2>
          <p className="text-[13px] mb-6" style={{ opacity: 0.5 }}>フィードバックは診断の改善に役立てます</p>
          {feedbackSent ? (
            <p className="font-bold text-[15px] text-turq">ありがとうございました 🙏</p>
          ) : (
            <>
              <div className="flex justify-center gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => sendFeedback(n)}
                    className={`w-12 h-12 rounded-full font-mono font-bold text-[16px] border-2 border-ink transition-all duration-150 ${
                      feedbackScore === n ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-yellow'
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

        {/* ⑪ シェアボタン（下部） */}
        <section id="result-share-bottom" className="rounded-[20px] border-2 border-ink p-6 md:p-8 bg-yellow" style={{ boxShadow: '8px 8px 0 #0E0E0E' }}>
          <p className="font-black text-[22px] tracking-tight mb-2 text-center">この結果、友達にも教えない？</p>
          <p className="text-[14px] text-center mb-6" style={{ opacity: 0.6 }}>3人中2人が、シェアして友達と楽しんでいます</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ShareButtons />
          </div>
        </section>

        {/* もう一度診断 */}
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

      <StickyShareBar xUrl={xUrl} lineUrl={lineUrl} />

      {/* Footer */}
      <footer className="border-t-2 border-ink py-5 px-4 text-center bg-bg">
        <p className="font-mono text-[11px] max-w-xl mx-auto leading-[1.7]" style={{ color: '#2A2A2A', opacity: 0.5 }}>
          ※ 本診断はクロニンジャーの気質・性格モデルを参考にした自己理解ツールです。医療診断・精神科的診断を行うものではありません。
        </p>
      </footer>
    </div>
  );
}
