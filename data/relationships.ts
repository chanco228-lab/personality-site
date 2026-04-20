import rawData from './content/relationships.json';

export type RelationshipText = {
  typeId: string;
  coLevel: 'high' | 'mid' | 'low';
  impression: string;
  compatibility: string;
  failurePattern: string;
};

export const relationshipTexts: RelationshipText[] = rawData as RelationshipText[];
