'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getV4Questions } from '@/data/questionsV4';
import { Question } from '@/data/types';
import {
  calculateScoresV3,
  determineTypeV3,
  calculateIntrovertScoreV3,
  calculateImpulsivityScoreV3,
} from '@/lib/scoring-v3';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/logger';
import Link from 'next/link';
import ScaleSelector from '@/components/quiz/ScaleSelector';

const STORAGE_KEY = 'personality_quiz_state_v4';
const RESULTS_KEY = 'personality_quiz_results';
const RESULT_ID_KEY = 'personality_quiz_result_id';
const VERSION_KEY = 'personality_quiz_version';
const QUIZ_VERSION = 1;

type QuizState = {
  version: number;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>;
};

async function deleteV4LogStep(step: number) {
  const sessionId = sessionStorage.getItem('personality_session_id');
  if (!sessionId) return;
  await supabase
    .from('logs')
    .delete()
    .eq('session_id', sessionId)
    .eq('event_name', 'quiz_v4_step')
    .eq('step', step);
}

export default function QuizV4() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [questionVisible, setQuestionVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizState;
        if (parsed.version === QUIZ_VERSION) {
          setState(parsed);
          return;
        }
      } catch { /* ignore */ }
    }
    const questions = getV4Questions();
    const initialState: QuizState = { version: QUIZ_VERSION, questions, currentIndex: 0, answers: {} };
    setState(initialState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    logEvent('quiz_v4_start');
    setShowNotice(true);
  }, []);

  const handleAnswer = (value: number) => {
    if (!state || isTransitioning) return;
    setIsTransitioning(true);
    setQuestionVisible(false);

    const questionId = state.questions[state.currentIndex].id;
    const newAnswers = { ...state.answers, [questionId]: value };
    const nextIndex = state.currentIndex + 1;

    deleteV4LogStep(state.currentIndex + 1).then(() => {
      logEvent('quiz_v4_step', state.currentIndex + 1, value);
    });

    if (nextIndex >= state.questions.length) {
      const questionFactors: Record<number, string> = {};
      const questionReversed: Record<number, boolean> = {};
      state.questions.forEach((q) => {
        questionFactors[q.id] = q.factor;
        questionReversed[q.id] = q.reversed;
      });

      const scores = calculateScoresV3(newAnswers, questionFactors, questionReversed);
      const typeId = determineTypeV3(scores);
      localStorage.setItem(RESULTS_KEY, JSON.stringify({ scores, typeId }));
      localStorage.setItem(VERSION_KEY, 'v3');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESULT_ID_KEY);

      const extroversion = calculateIntrovertScoreV3({
        ns: scores.NS, ha: scores.HA, rd: scores.RD,
        sd: scores.SD, co: scores.CO, st: scores.ST,
      });
      const impulsivity = calculateImpulsivityScoreV3({
        ns: scores.NS, ha: scores.HA, p: scores.P, sd: scores.SD,
      });

      logEvent('quiz_v4_complete');

      (async () => {
        try {
          const res = await fetch('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              typeId,
              answers: newAnswers,
              scores,
              extroversion,
              impulsivity,
              sdLevel: scores.SD >= 4 ? 'high' : scores.SD <= -4 ? 'low' : 'mid',
              coLevel: scores.CO >= 4 ? 'high' : scores.CO <= -4 ? 'low' : 'mid',
              stScore: scores.ST,
              referrer: document.referrer || null,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.id) localStorage.setItem(RESULT_ID_KEY, json.id);
          } else {
            console.error('[save-result]', res.status);
          }
        } catch (e) {
          console.error('[save-result fetch failed]', e);
        }
        router.push('/result');
      })();
      return;
    }

    setTimeout(() => {
      const newState: QuizState = { ...state, currentIndex: nextIndex, answers: newAnswers };
      setState(newState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setQuestionVisible(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    if (!state || state.currentIndex === 0) return;
    deleteV4LogStep(state.currentIndex);
    const prevIndex = state.currentIndex - 1;
    const prevQuestion = state.questions[prevIndex];
    const newAnswers = { ...state.answers };
    delete newAnswers[prevQuestion.id];
    const newState: QuizState = { ...state, currentIndex: prevIndex, answers: newAnswers };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setQuestionVisible(true);
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESULTS_KEY);
    const questions = getV4Questions();
    const initialState: QuizState = { version: QUIZ_VERSION, questions, currentIndex: 0, answers: {} };
    setState(initialState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    setQuestionVisible(true);
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
          <div className="text-left space-y-3 mb-8">
            <p className="text-[16px] leading-[1.7]">
              「こうありたい自分」ではなく、<br />
              <strong>「実際の自分の行動パターン」</strong>で<br />
              答えてください。
            </p>
            <p className="text-[14px] leading-[1.7] bg-paper/60 rounded-[12px] px-4 py-3 border border-ink/10">
              真ん中の小さな円は<strong>「本当にどちらとも言えない」</strong>時だけ選んでください。
            </p>
          </div>
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

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Sticky header - progress hidden */}
      <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
        <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <span
              className="w-7 h-7 bg-yellow border-2 border-ink rounded-lg flex items-center justify-center font-mono text-[11px] font-bold"
              style={{ transform: 'rotate(-5deg)' }}
            >
              T7
            </span>
          </Link>
        </div>
      </header>

      {/* Question + ScaleSelector */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-[640px] flex flex-col items-center gap-10"
          style={{
            opacity: questionVisible ? 1 : 0,
            transform: questionVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <p
            className="font-black text-center leading-[1.5] px-2"
            style={{ fontSize: 'clamp(17px, 4vw, 22px)' }}
          >
            {currentQuestion.text}
          </p>

          <ScaleSelector
            onAnswer={handleAnswer}
            questionKey={state.currentIndex}
          />
        </div>
      </main>

      {/* Back / restart */}
      <div className="px-4 pb-8">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={state.currentIndex === 0}
            className={`flex items-center gap-1 text-[13px] font-bold transition-all ${
              state.currentIndex === 0 ? 'text-ink/20 cursor-not-allowed' : 'text-ink hover:text-coral'
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
