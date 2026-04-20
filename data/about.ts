import rawData from './content/about.json';

export type AboutText = {
  typeId: string;
  sdLevel: 'high' | 'mid' | 'low';
  text: string;
  strengths?: string;
  struggles?: string;
  desires?: string;
};

export const aboutTexts: AboutText[] = rawData as AboutText[];
