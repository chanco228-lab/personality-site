import rawData from './content/types.json';

export type FactorType = 'NS' | 'HA' | 'RD' | 'P' | 'SD' | 'CO' | 'ST';
export type FactorLevel = 'high' | 'mid' | 'low';

export type Question = {
  id: number;
  text: string;
  factor: FactorType;
  reversed: boolean;
};

export type PersonalityType = {
  id: string;
  name: string;
  catchphrase: string;
  ns: FactorLevel;
  ha: FactorLevel;
  rd: FactorLevel;
  p: 'high' | 'low';
  sd_rep: FactorLevel;
  co_rep: FactorLevel;
  loss: string;
  heroLine: string;
  insights: string[];
  lossAction: string;
  previewText: string;
  noteUrl: string | null;
  noteTitle: string;
  notePrice: number;
  noteTableOfContents: string[];
};

export type FactorScores = {
  NS: number; HA: number; RD: number;
  P: number;  SD: number; CO: number; ST: number;
};

export type QuizResults = {
  scores: FactorScores;
  typeId: string;
};

export const FACTOR_LABELS: Record<FactorType, string> = {
  NS: '好奇心', HA: '慎重さ', RD: '共感力',
  P: '粘り強さ', SD: '自律性', CO: '協調性', ST: '没頭力',
};

// ID: {ns}{ha}{rd}_{p}  h=high m=mid l=low  p=persistent f=flexible
export const personalityTypes: PersonalityType[] = rawData as PersonalityType[];
