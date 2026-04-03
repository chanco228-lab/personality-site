import { QuizResults } from '@/data/types';

export function encodePass(results: QuizResults): string {
  const s = results.scores;
  return `${results.typeId}|${s.NS},${s.HA},${s.RD},${s.P},${s.SD},${s.CO},${s.ST}`;
}

// typeId（例: hlh_p）からデフォルトスコアを生成
function scoresFromTypeId(typeId: string): QuizResults['scores'] | null {
  const m = typeId.match(/^([hlm])([hlm])([hlm])_(p|f)$/);
  if (!m) return null;
  const lvl = (c: string) => c === 'h' ? 6 : c === 'l' ? -6 : 0;
  return {
    NS: lvl(m[1]),
    HA: lvl(m[2]),
    RD: lvl(m[3]),
    P:  m[4] === 'p' ? 3 : -3,
    SD: 0,
    CO: 0,
    ST: 0,
  };
}

export function decodePass(pass: string): QuizResults | null {
  try {
    const trimmed = pass.trim();
    const [typeId, scoresPart] = trimmed.split('|');
    if (!typeId) return null;

    // スコア部分がない場合はtypeIdから補完
    if (!scoresPart) {
      const scores = scoresFromTypeId(typeId);
      return scores ? { typeId, scores } : null;
    }

    const parts = scoresPart.split(',').map(Number);
    if (parts.length !== 7 || parts.some(isNaN)) return null;
    const [NS, HA, RD, P, SD, CO, ST] = parts;
    return { typeId, scores: { NS, HA, RD, P, SD, CO, ST } };
  } catch {
    return null;
  }
}
