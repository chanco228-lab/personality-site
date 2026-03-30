import { FactorScores, FactorLevel } from '@/data/types';
import { getScoreLevel } from '@/lib/scoring';

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

// 54タイプのうち NS/HA/RD/P のみ定義されているため
// SD/CO は比較相手を 'mid' とする（ST は相性計算から除外）
function getTypeFactors(typeId: string): {
  ns: FactorLevel; ha: FactorLevel; rd: FactorLevel;
  p: 'high' | 'low'; sd: FactorLevel; co: FactorLevel;
} {
  const ns = charToLevel(typeId[0]);
  const ha = charToLevel(typeId[1]);
  const rd = charToLevel(typeId[2]);
  const p: 'high' | 'low' = typeId[4] === 'p' ? 'high' : 'low';
  return { ns, ha, rd, p, sd: 'mid', co: 'mid' };
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

// SD: 両方高=16 / どちらか高=8 / 両方低=0  max:16
// mid が絡む場合（仕様外）: mid+mid=4 / mid+low=2
function calcSD(a: FactorLevel, b: FactorLevel): number {
  if (a === 'high' && b === 'high') return 16;
  if (a === 'high' || b === 'high') return 8;
  if (a === 'low' && b === 'low') return 0;
  return 4; // mid+mid or mid+low
}

// CO: 同じ=18 / 1段階差=9 / 2段階差=0  max:18
function calcCO(a: FactorLevel, b: FactorLevel): number {
  const d = levelDiff(a, b);
  return d === 0 ? 18 : d === 1 ? 9 : 0;
}

// 合計最高: 18+18+18+12+16+18 = 100

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
  16: '自立した者同士として、対等な関係を築きやすいでしょう。',
  8:  '自己確立の度合いに差がありますが、それが関係に安定をもたらすこともあります。',
  4:  '自己志向のバランスが異なりますが、互いに学べる部分があります。',
  0:  '自信を持ちにくい面があるため、お互いに支え合う意識が大切になります。',
};
const CO_COMMENTS: Record<number, string> = {
  18: '対人スタンスが近く、摩擦なく関わりやすい関係です。',
  9:  '協調性のスタイルに少し違いがありますが、互いに尊重できます。',
  0:  '人への関わり方の姿勢に大きな差があり、調整が必要になることがあります。',
};

export function computeCompatibility(
  userScores: FactorScores,
  otherTypeId: string
): CompatibilityResult {
  const u = {
    ns: getScoreLevel(userScores.NS),
    ha: getScoreLevel(userScores.HA),
    rd: getScoreLevel(userScores.RD),
    p:  userScores.P >= 0 ? 'high' as const : 'low' as const,
    sd: getScoreLevel(userScores.SD),
    co: getScoreLevel(userScores.CO),
  };
  const o = getTypeFactors(otherTypeId);

  const ns = calcNS(u.ns, o.ns);
  const ha = calcHA(u.ha, o.ha);
  const rd = calcRD(u.rd, o.rd);
  const p  = calcP(u.p, o.p);
  const sd = calcSD(u.sd, o.sd);
  const co = calcCO(u.co, o.co);

  // 合計最高100点、そのまま使用
  const score = ns + ha + rd + p + sd + co;

  // 注目度（midpointからの距離）が高い因子を優先してコメント3つ選ぶ
  const factors = [
    { score: ns, midpoint: 9,  comment: NS_COMMENTS[ns] },
    { score: ha, midpoint: 9,  comment: HA_COMMENTS[ha] },
    { score: rd, midpoint: 9,  comment: RD_COMMENTS[rd] },
    { score: p,  midpoint: 6,  comment: P_COMMENTS[p] },
    { score: sd, midpoint: 8,  comment: SD_COMMENTS[sd] },
    { score: co, midpoint: 9,  comment: CO_COMMENTS[co] },
  ];

  factors.sort((a, b) =>
    Math.abs(b.score - b.midpoint) - Math.abs(a.score - a.midpoint)
  );

  const comments = factors.slice(0, 3).map(f => f.comment);

  return { score, label: getLabel(score), comments };
}
