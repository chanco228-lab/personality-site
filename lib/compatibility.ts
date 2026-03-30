import { FactorLevel } from '@/data/types';
import { personalityTypes } from '@/data/types';

export type CompatibilityResult = {
  score: number;
  label: string;
  comments: string[];
};

function levelToNum(l: FactorLevel): number {
  if (l === 'high') return 2;
  if (l === 'mid') return 1;
  return 0;
}

function levelDiff(a: FactorLevel, b: FactorLevel): number {
  return Math.abs(levelToNum(a) - levelToNum(b));
}

// NS: 同じ=18 / 1段階差=9 / 2段階差=0  max:18
function calcNS(a: FactorLevel, b: FactorLevel): number {
  const d = levelDiff(a, b);
  return d === 0 ? 18 : d === 1 ? 9 : 0;
}

// HA: 逆段階=18 / 1段階差=9 / 同じ=0  max:18
function calcHA(a: FactorLevel, b: FactorLevel): number {
  const d = levelDiff(a, b);
  return d === 2 ? 18 : d === 1 ? 9 : 0;
}

// RD: 同じ=18 / 1段階差=9 / 2段階差=0  max:18
function calcRD(a: FactorLevel, b: FactorLevel): number {
  const d = levelDiff(a, b);
  return d === 0 ? 18 : d === 1 ? 9 : 0;
}

// P: 同じ=12 / 異なる=0  max:12
function calcP(a: 'high' | 'low', b: 'high' | 'low'): number {
  return a === b ? 12 : 0;
}

// SD: 両方high=16 / どちらかhigh=8 / 両方それ以外=0  max:16
function calcSD(a: FactorLevel, b: FactorLevel): number {
  if (a === 'high' && b === 'high') return 16;
  if (a === 'high' || b === 'high') return 8;
  return 0;
}

// CO: 同じ=16 / 1段階差=8 / 2段階差=0  max:16
function calcCO(a: FactorLevel, b: FactorLevel): number {
  const d = levelDiff(a, b);
  return d === 0 ? 16 : d === 1 ? 8 : 0;
}

// 合計最高: 18+18+18+12+16+16 = 98 → 100点換算
const MAX_RAW = 98;

function getRelationshipCoefficient(rd: FactorLevel, p: 'high' | 'low', co: FactorLevel, sd: FactorLevel): number {
  // コミュ力特別高いケース（SD高が上乗せ）
  if (sd === 'high' && rd === 'high' && p === 'high' && co === 'high') return 1.10;
  if (sd === 'high' && rd === 'high' && p === 'high' && co === 'mid')  return 1.05;
  if (sd === 'high' && rd === 'high' && p === 'low'  && co === 'high') return 1.03;
  // 既存テーブル
  if (rd === 'high' && p === 'high' && co === 'high') return 1.00;
  if (rd === 'high' && p === 'high' && co === 'mid')  return 0.97;
  if (rd === 'high' && p === 'low'  && co === 'high') return 0.95;
  if (rd === 'high' && p === 'low'  && co === 'mid')  return 0.90;
  if (rd === 'mid'  && p === 'high' && co === 'high') return 0.95;
  if (rd === 'mid'  && p === 'high' && co === 'mid')  return 0.90;
  if (rd === 'mid'  && p === 'low'  && co === 'high') return 0.87;
  if (rd === 'mid'  && p === 'low'  && co === 'mid')  return 0.83;
  if (rd === 'low'  && p === 'high' && co === 'mid')  return 0.85;
  if (rd === 'low'  && p === 'high' && co === 'low')  return 0.80;
  if (rd === 'low'  && p === 'low'  && co === 'mid')  return 0.78;
  if (rd === 'low'  && p === 'low'  && co === 'low')  return 0.75;
  return 0.85;
}

function getLabel(score: number): string {
  if (score <= 20) return '水と油';
  if (score <= 40) return '平行線';
  if (score <= 60) return '刺激し合う仲';
  if (score <= 80) return '良き理解者';
  return '親友';
}

const NS_COMMENTS: Record<number, string> = {
  18: '行動ペースが自然と合いやすい相手です。',
  9:  '行動のリズムに少し違いがありますが、刺激し合える部分もあります。',
  0:  '行動スタイルに大きな差があるため、お互いのペースへの理解が大切になります。',
};
const HA_COMMENTS: Record<number, string> = {
  18: '不安傾向が逆なので、お互いを補い合える関係になれます。',
  9:  '慎重さのバランスが違う部分があり、補い合える面があります。',
  0:  '不安への感じ方が似ているため、共感しやすい一方で不安が重なりやすい面もあります。',
};
const RD_COMMENTS: Record<number, string> = {
  18: '人との関わり方の温度感が近く、自然と居心地のよさを感じられます。',
  9:  '対人関係への関心に少し差がありますが、理解し合える余地があります。',
  0:  '人との関わりへの温度感に大きな差があり、すれ違いが生まれやすい部分です。',
};
const P_COMMENTS: Record<number, string> = {
  12: '物事への粘り強さが似ているので、共同作業でペースが合いやすいです。',
  0:  '粘り強さのスタンスに違いがあり、補い合える場面も摩擦になる場面もあります。',
};
const SD_COMMENTS: Record<number, string> = {
  16: '自己成長への意欲が近いので、お互いに高め合える関係になりやすいです。',
  8:  '自己成長への関心に差がありますが、互いの強みを活かし合える部分があります。',
  0:  '自己成長への向き合い方が異なるため、価値観のすり合わせが必要な場面があります。',
};
const CO_COMMENTS: Record<number, string> = {
  16: '人との協調スタンスが近く、一緒にいると安心感を覚えやすい相手です。',
  8:  '協調性のバランスに差がありますが、お互いを尊重することで良好な関係を築けます。',
  0:  '対人スタンスに大きな差があり、関係を深めるには歩み寄りが必要です。',
};

export function computeCompatibility(
  userTypeId: string,
  otherTypeId: string
): CompatibilityResult {
  const u = personalityTypes.find((t) => t.id === userTypeId);
  const o = personalityTypes.find((t) => t.id === otherTypeId);

  if (!u || !o) {
    return { score: 0, label: '不明', comments: [] };
  }

  const ns = calcNS(u.ns, o.ns);
  const ha = calcHA(u.ha, o.ha);
  const rd = calcRD(u.rd, o.rd);
  const p  = calcP(u.p, o.p);
  const sd = calcSD(u.sd_rep, o.sd_rep);
  const co = calcCO(u.co_rep, o.co_rep);

  const raw = ns + ha + rd + p + sd + co;
  const coeffU = getRelationshipCoefficient(u.rd, u.p, u.co_rep, u.sd_rep);
  const coeffO = getRelationshipCoefficient(o.rd, o.p, o.co_rep, o.sd_rep);
  const score = Math.floor(raw * coeffU * coeffO * 100 / MAX_RAW);

  // 注目度（midpointからの距離）が高い因子を優先してコメント3つ選ぶ
  const factors = [
    { score: ns, midpoint: 9,  comment: NS_COMMENTS[ns] },
    { score: ha, midpoint: 9,  comment: HA_COMMENTS[ha] },
    { score: rd, midpoint: 9,  comment: RD_COMMENTS[rd] },
    { score: p,  midpoint: 6,  comment: P_COMMENTS[p]  },
    { score: sd, midpoint: 8,  comment: SD_COMMENTS[sd] },
    { score: co, midpoint: 8,  comment: CO_COMMENTS[co] },
  ];

  factors.sort((a, b) =>
    Math.abs(b.score - b.midpoint) - Math.abs(a.score - a.midpoint)
  );

  const comments = factors.slice(0, 3).map(f => f.comment);

  return { score, label: getLabel(score), comments };
}
