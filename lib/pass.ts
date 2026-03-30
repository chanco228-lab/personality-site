import { QuizResults } from '@/data/types';

export function encodePass(results: QuizResults): string {
  const s = results.scores;
  return `${results.typeId}|${s.NS},${s.HA},${s.RD},${s.P},${s.SD},${s.CO},${s.ST}`;
}

export function decodePass(pass: string): QuizResults | null {
  try {
    const [typeId, scoresPart] = pass.trim().split('|');
    if (!typeId || !scoresPart) return null;
    const parts = scoresPart.split(',').map(Number);
    if (parts.length !== 7 || parts.some(isNaN)) return null;
    const [NS, HA, RD, P, SD, CO, ST] = parts;
    return { typeId, scores: { NS, HA, RD, P, SD, CO, ST } };
  } catch {
    return null;
  }
}
