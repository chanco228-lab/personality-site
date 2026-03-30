import { FactorLevel } from '@/data/types';

export type CompatibilityResult = {
  score: number;
  label: string;
  comments: string[];
};

function charToLevel(c: string): FactorLevel {
  if (c === 'h') return 'high';
  if (c === 'l') return 'low';
  return 'mid';
}

function levelToNum(l: FactorLevel): number {
  if (l === 'high') return 2;
  if (l === 'mid') return 1;
  return 0;
}

function levelDiff(a: FactorLevel, b: FactorLevel): number {
  return Math.abs(levelToNum(a) - levelToNum(b));
}

// typeId から NS/HA/RD/P を取得（SD/CO は型定義に存在しないため除外）
function getTypeFactors(typeId: string): {
  ns: FactorLevel; ha: FactorLevel; rd: FactorLevel; p: 'high' | 'low';
} {
  return {
    ns: charToLevel(typeId[0]),
    ha: charToLevel(typeId[1]),
    rd: charToLevel(typeId[2]),
    p:  typeId[4] === 'p' ? 'high' : 'low',
  };
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

// 合計最高: 18+18+18+12 = 66 → 100点換算
const MAX_RAW = 66;

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

// userTypeId と otherTypeId を比較（両者ともタイプ定義の4因子のみ使用）
export function computeCompatibility(
  userTypeId: string,
  otherTypeId: string
): CompatibilityResult {
  const u = getTypeFactors(userTypeId);
  const o = getTypeFactors(otherTypeId);

  const ns = calcNS(u.ns, o.ns);
  const ha = calcHA(u.ha, o.ha);
  const rd = calcRD(u.rd, o.rd);
  const p  = calcP(u.p, o.p);

  const raw = ns + ha + rd + p;
  const score = Math.floor(raw * 100 / MAX_RAW);

  // 注目度（midpointからの距離）が高い因子を優先してコメント3つ選ぶ
  const factors = [
    { score: ns, midpoint: 9, comment: NS_COMMENTS[ns] },
    { score: ha, midpoint: 9, comment: HA_COMMENTS[ha] },
    { score: rd, midpoint: 9, comment: RD_COMMENTS[rd] },
    { score: p,  midpoint: 6, comment: P_COMMENTS[p]  },
  ];

  factors.sort((a, b) =>
    Math.abs(b.score - b.midpoint) - Math.abs(a.score - a.midpoint)
  );

  const comments = factors.slice(0, 3).map(f => f.comment);

  return { score, label: getLabel(score), comments };
}
