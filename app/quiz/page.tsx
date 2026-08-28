'use client';

import { FEATURES } from '@/lib/features';
import QuizV2 from '@/components/quiz/QuizV2';
import QuizV3 from '@/components/quiz/QuizV3';
import QuizV4 from '@/components/quiz/QuizV4';

export default function QuizPage() {
  if (FEATURES.USE_V4_QUIZ) return <QuizV4 />;
  return FEATURES.USE_V3_QUIZ ? <QuizV3 /> : <QuizV2 />;
}
