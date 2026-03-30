import { FactorScores, FactorLevel, personalityTypes } from '@/data/types';

// NS/HA/RD: +4以上=high, -4以下=low, その間=mid
function getLevel(score: number): FactorLevel {
  if (score >= 4) return 'high';
  if (score <= -4) return 'low';
  return 'mid';
}

export function calculateScores(answers: Record<number, number>, questionFactors: Record<number, string>): FactorScores {
  const scores: FactorScores = { NS: 0, HA: 0, RD: 0, P: 0, SD: 0, CO: 0, ST: 0 };
  for (const [questionId, answer] of Object.entries(answers)) {
    const factor = questionFactors[Number(questionId)] as keyof FactorScores;
    if (factor && factor in scores) {
      scores[factor] += answer;
    }
  }
  return scores;
}

export function determineType(scores: FactorScores): string {
  const ns = getLevel(scores.NS);
  const ha = getLevel(scores.HA);
  const rd = getLevel(scores.RD);
  const p: 'high' | 'low' = scores.P >= 0 ? 'high' : 'low';

  const matched = personalityTypes.find(
    (t) => t.ns === ns && t.ha === ha && t.rd === rd && t.p === p
  );
  return matched?.id ?? 'mmm_p';
}

export function getScoreLevel(score: number): FactorLevel {
  return getLevel(score);
}

export const MAX_SCORE = 9;  // 3 questions × +3 points max
export const MIN_SCORE = -9; // 3 questions × -3 points min
