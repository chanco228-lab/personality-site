'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getShuffledQuestions } from '@/data/questions';
import { Question } from '@/data/types';
import { calculateScores, determineType, calculateIntrovertScore } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import { logEvent, deleteLogStep } from '@/lib/logger';
import QuizCard from '@/components/QuizCard';
import ProgressBar from '@/components/ProgressBar';

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
      logEvent('quiz_step', state.currentIndex + 1);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="text-white text-lg">読み込み中...</div>
      </div>
    );
  }

  if (showNotice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #2d9596 100%)' }}>
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-3xl mb-4">💡</div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">より正確な診断のために</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            「こうありたい自分」ではなく、<br />
            「実際の自分の行動パターン」で<br />
            答えてください。
          </p>
          <button
            onClick={() => setShowNotice(false)}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            診断を始める
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentIndex];
  const total = state.questions.length;
  const current = state.currentIndex + 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ProgressBar current={current} total={total} />
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
            onAnswer={handleAnswer}
          />
        </div>
      </main>

      {/* Footer controls */}
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={state.currentIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              state.currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>

          <button
            onClick={handleRestart}
            className="text-slate-400 hover:text-red-500 text-xs px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
          >
            最初からやり直す
          </button>
        </div>
      </footer>
    </div>
  );
}
