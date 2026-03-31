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

export function calculateIntrovertScore(scores: {
  ns: number; ha: number; rd: number; sd: number; co: number; st: number;
}): number {
  const haContrib =  scores.ha * 1.8;
  const nsContrib = -scores.ns * 1.8;
  const rdContrib = -scores.rd * 1.0;
  const coContrib = -scores.co * 1.0;
  const sdContrib = -scores.sd * 0.8;
  const stContrib =  scores.st * 0.5;
  const raw = haContrib + nsContrib + rdContrib + coContrib + sdContrib + stContrib;
  const min = -62.1;
  const max = 62.1;
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
  const pContrib  = -scores.p  * 1.5;
  const sdContrib = -scores.sd * 1.0;
  const haContrib = -scores.ha * 1.0;
  const raw = nsContrib + pContrib + sdContrib + haContrib;
  const min = -31.5;
  const max = 49.5;
  return Math.min(100, Math.max(0, Math.round((raw - min) / (max - min) * 100)));
}
