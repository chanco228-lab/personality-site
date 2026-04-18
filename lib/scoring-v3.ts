import { FactorScores, FactorLevel, personalityTypes } from '@/data/types';

export const V3_SCORE_OPTIONS = [
  { value:  3, label: '最大同意',   position: 0 },
  { value:  2, label: '強い同意',   position: 1 },
  { value:  1, label: '弱い同意',   position: 2 },
  { value:  0, label: '中立',       position: 3 },
  { value: -1, label: '弱い不同意', position: 4 },
  { value: -2, label: '強い不同意', position: 5 },
  { value: -3, label: '最大不同意', position: 6 },
] as const;

// v2と同じ計算式（0の中立が追加されただけで互換性あり）
export function calculateScoresV3(
  answers: Record<number, number>,
  questionFactors: Record<number, string>,
  questionReversed: Record<number, boolean> = {},
): FactorScores {
  const scores: FactorScores = { NS: 0, HA: 0, RD: 0, P: 0, SD: 0, CO: 0, ST: 0 };
  for (const [questionId, answer] of Object.entries(answers)) {
    const id = Number(questionId);
    const factor = questionFactors[id] as keyof FactorScores;
    if (factor && factor in scores) {
      scores[factor] += questionReversed[id] ? -answer : answer;
    }
  }
  return scores;
}

function getLevelV3(score: number, factor: string): FactorLevel {
  if (factor === 'RD') {
    if (score >= 3)  return 'high';
    if (score <= -3) return 'low';
    return 'mid';
  }
  if (factor === 'P') return score >= 0 ? 'high' : 'low';
  if (score >= 4)  return 'high';
  if (score <= -4) return 'low';
  return 'mid';
}

export function determineTypeV3(scores: FactorScores): string {
  const ns = getLevelV3(scores.NS, 'NS');
  const ha = getLevelV3(scores.HA, 'HA');
  const rd = getLevelV3(scores.RD, 'RD');
  const p: 'high' | 'low' = scores.P >= 0 ? 'high' : 'low';
  const matched = personalityTypes.find(
    (t) => t.ns === ns && t.ha === ha && t.rd === rd && t.p === p
  );
  return matched?.id ?? 'mmm_p';
}

export function calculateIntrovertScoreV3(scores: {
  ns: number; ha: number; rd: number; sd: number; co: number; st: number;
}): number {
  const raw =
    scores.ha * 2.0 +
    scores.ns * -1.75 +
    scores.rd * -1.0 +
    scores.sd * -0.5 +
    scores.co * -0.5;
  const min = -51.75;
  const max =  51.75;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}

export function calculateImpulsivityScoreV3(scores: {
  ns: number; ha: number; p: number; sd: number;
}): number {
  const raw = scores.ns * 2.0 + scores.p * -2.0 + scores.ha * -1.0;
  const min = -45;
  const max =  45;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}
