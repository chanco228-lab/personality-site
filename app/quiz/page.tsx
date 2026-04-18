'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getShuffledQuestions } from '@/data/questions';
import { Question } from '@/data/types';
import { calculateScores, determineType, calculateIntrovertScore } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import { logEvent, deleteLogStep } from '@/lib/logger';
import Link from 'next/link';
import QuizCard from '@/components/QuizCard';

const STORAGE_KEY = 'personality_quiz_state';
const RESULTS_KEY = 'personality_quiz_results';
const RESULT_ID_KEY = 'personality_quiz_result_id';
const QUIZ_VERSION = 5; // increment when questions or scoring change

type QuizState = {
  version: number;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>;
};

export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  // Initialize quiz state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizState;
        // discard stale state from old question set
        if (parsed.version === QUIZ_VERSION) {
          setState(parsed);
          return;
        }
      } catch {
        // ignore parse errors, start fresh
      }
    }
    const questions = getShuffledQuestions();
    const initialState: QuizState = {
      version: QUIZ_VERSION,
      questions,
      currentIndex: 0,
      answers: {},
    };
    setState(initialState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    logEvent('quiz_start');
    setShowNotice(true);
  }, []);

  const handleAnswer = (value: number) => {
    if (!state || isTransitioning) return;
    setIsTransitioning(true);

    const questionId = state.questions[state.currentIndex].id;
    const newAnswers = { ...state.answers, [questionId]: value };
    const nextIndex = state.currentIndex + 1;

    deleteLogStep(state.currentIndex + 1).then(() => {
      logEvent('quiz_step', state.currentIndex + 1, value);
    });

    if (nextIndex >= state.questions.length) {
      // Quiz complete - calculate results
      const questionFactors: Record<number, string> = {};
      const questionReversed: Record<number, boolean> = {};
      state.questions.forEach((q) => {
        questionFactors[q.id] = q.factor;
        questionReversed[q.id] = q.reversed;
      });

      const scores = calculateScores(newAnswers, questionFactors, questionReversed);
      const typeId = determineType(scores);
      const results = { scores, typeId };

      localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESULT_ID_KEY);

      // Supabaseに保存してから遷移
      const introvertScore = calculateIntrovertScore({
        ns: scores.NS, ha: scores.HA, rd: scores.RD,
        sd: scores.SD, co: scores.CO, st: scores.ST,
      });
      logEvent('quiz_complete');
      (async () => {
        const { data } = await supabase.from('results_v2').insert({
          type_id: typeId,
          ns_score: scores.NS,
          ha_score: scores.HA,
          rd_score: scores.RD,
          p_score: scores.P,
          sd_score: scores.SD,
          co_score: scores.CO,
          st_score: scores.ST,
          introvert_score: introvertScore,
        }).select().single();
        if (data) localStorage.setItem(RESULT_ID_KEY, data.id);
        router.push('/result');
      })();
      return;
    }

    const newState: QuizState = {
      ...state,
      currentIndex: nextIndex,
      answers: newAnswers,
    };

    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleBack = () => {
    if (!state || state.currentIndex === 0) return;

    const prevIndex = state.currentIndex - 1;
    // 戻る先のstep（prevIndex + 1 = currentIndex）のログを削除
    deleteLogStep(state.currentIndex);

    const prevQuestion = state.questions[prevIndex];
    const newAnswers = { ...state.answers };
    delete newAnswers[prevQuestion.id];

    const newState: QuizState = {
      ...state,
      currentIndex: prevIndex,
      answers: newAnswers,
    };

    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESULTS_KEY);
    const questions = getShuffledQuestions();
    const initialState: QuizState = {
      version: QUIZ_VERSION,
      questions,
      currentIndex: 0,
      answers: {},
    };
    setState(initialState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-mono text-[14px] text-ink" style={{ opacity: 0.5 }}>読み込み中...</div>
      </div>
    );
  }

  if (showNotice) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <div
          className="w-full max-w-[480px] bg-yellow border-2 border-ink rounded-[24px] px-8 py-10 text-center"
          style={{ boxShadow: '10px 10px 0 #0E0E0E' }}
        >
          <div className="text-[48px] mb-4">💡</div>
          <h2 className="font-black text-[24px] tracking-tight mb-4">診断の前に</h2>
          <p className="text-[16px] leading-[1.7] mb-8">
            「こうありたい自分」ではなく、<br />
            <strong>「実際の自分の行動パターン」</strong>で<br />
            答えてください。
          </p>
          <button
            onClick={() => setShowNotice(false)}
            className="hero-cta w-full font-display font-black bg-ink text-paper border-2 border-ink rounded-full py-[18px] text-[18px]"
          >
            診断を始める →
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentIndex];
  const total = state.questions.length;
  const current = state.currentIndex + 1;
  const percentage = Math.round(((current - 1) / total) * 100);

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Sticky header: mini logo + progress bar */}
      <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
        <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center gap-3">
          {/* Mini T7 logo */}
          <Link href="/" className="shrink-0">
            <span
              className="w-7 h-7 bg-yellow border-2 border-ink rounded-lg flex items-center justify-center font-mono text-[11px] font-bold"
              style={{ transform: 'rotate(-5deg)' }}
            >
              T7
            </span>
          </Link>
          {/* Q counter */}
          <span className="font-mono text-[12px] font-bold shrink-0">
            Q{current} / {total}
          </span>
          {/* Progress track */}
          <div className="flex-1 border-2 border-ink h-[8px] bg-paper overflow-hidden">
            <div
              className="h-full bg-yellow transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Factor label */}
          <span className="font-mono text-[12px] font-bold shrink-0 text-coral">
            {currentQuestion.factor}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div
          className={`w-full transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <QuizCard
            key={state.currentIndex}
            questionText={currentQuestion.text}
            questionIndex={state.currentIndex}
            factor={currentQuestion.factor}
            onAnswer={handleAnswer}
          />
        </div>
      </main>

      {/* Footer controls */}
      <div className="px-4 pb-8">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={state.currentIndex === 0}
            className={`flex items-center gap-1 text-[13px] font-bold transition-all ${
              state.currentIndex === 0
                ? 'text-ink/20 cursor-not-allowed'
                : 'text-ink hover:text-coral'
            }`}
          >
            ← 戻る
          </button>
          <button
            onClick={handleRestart}
            className="text-[12px] font-mono text-ink/40 hover:text-ink transition-colors"
          >
            やり直す
          </button>
        </div>
      </div>
    </div>
  );
}
