import { FactorScores, FactorLevel, personalityTypes } from '@/data/types';

// NS/HA: +4以上=high, -4以下=low, その間=mid
function getLevel(score: number): FactorLevel {
  if (score >= 4) return 'high';
  if (score <= -4) return 'low';
  return 'mid';
}

// RD: +3以上=high, -3以下=low, その間=mid
function getRDLevel(score: number): FactorLevel {
  if (score >= 3) return 'high';
  if (score <= -3) return 'low';
  return 'mid';
}

export function calculateScores(
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

export function determineType(scores: FactorScores): string {
  const ns = getLevel(scores.NS);
  const ha = getLevel(scores.HA);
  const rd = getRDLevel(scores.RD);
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

export function calculateIntrovertScore(scores: {
  ns: number; ha: number; rd: number; sd: number; co: number; st: number;
}): number {
  const haContrib =  scores.ha * 2.0;
  const nsContrib = -scores.ns * 1.75;
  const rdContrib = -scores.rd * 1.0;
  const sdContrib = -scores.sd * 0.5;
  const coContrib = -scores.co * 0.5;
  const raw = haContrib + nsContrib + rdContrib + sdContrib + coContrib;
  const min = -51.75;
  const max =  51.75;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}

export function calculateIntrovertScore2(scores: {
  ns: number; ha: number; rd: number; sd: number; co: number; st: number;
}): number {
  const rdContrib = -scores.rd * 1.0;
  const haContrib =  scores.ha * 1.8;
  const nsContrib = -scores.ns * 1.8;
  const sdContrib = -scores.sd * 0.8;
  const coContrib = -scores.co * 1.0;
  const stContrib =  scores.st * 0.5;
  const raw = rdContrib + haContrib + nsContrib + sdContrib + coContrib + stContrib;
  const min = -62.1;
  const max = 62.1;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}

export function calculateImpulsivityScore(scores: {
  ns: number; ha: number; p: number; sd: number;
}): number {
  const nsContrib =  scores.ns * 2.0;
  const pContrib  = -scores.p  * 2.0;
  const haContrib = -scores.ha * 1.0;
  const raw = nsContrib + pContrib + haContrib;
  const min = -45;
  const max =  45;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}
