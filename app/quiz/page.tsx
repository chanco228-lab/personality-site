'use client';

import { FEATURES } from '@/lib/features';
import QuizV2 from '@/components/quiz/QuizV2';
import QuizV3 from '@/components/quiz/QuizV3';

export default function QuizPage() {
  return FEATURES.USE_V3_QUIZ ? <QuizV3 /> : <QuizV2 />;
}
