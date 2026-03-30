'use client';

import { FactorType, FACTOR_LABELS } from '@/data/types';

type ScoreBarProps = {
  factor: FactorType;
  score: number;
};

const FACTOR_ENDPOINTS: Record<FactorType, { low: string; high: string }> = {
  NS: { low: '保守的',   high: '衝動的' },
  HA: { low: '楽観的',   high: '不安強い' },
  RD: { low: '孤立的',   high: '共感的' },
  P:  { low: '飽きっぽい', high: '完璧主義' },
  SD: { low: '自信薄い', high: '自立的' },
  CO: { low: '利己的',   high: '寛容' },
  ST: { low: '合理的',   high: '直感的' },
};

export default function ScoreBar({ factor, score }: ScoreBarProps) {
  const { low, high } = FACTOR_ENDPOINTS[factor];
  const pct = ((score + 9) / 18) * 100;
  return (
    <div className="flex items-center gap-2 w-full">
      {/* Factor name */}
      <span className="flex-shrink-0 w-20 text-sm font-bold text-slate-700 text-right">
        {FACTOR_LABELS[factor]}
      </span>

      {/* Low label */}
      <span className="flex-shrink-0 w-14 text-xs text-slate-400 text-right leading-tight whitespace-nowrap">
        {low}
      </span>

      {/* Track bar */}
      <div className="relative flex-1 h-6 flex items-center">
        {/* Gray track */}
        <div className="absolute inset-x-0 h-1.5 bg-slate-200 rounded-full" />

        {/* Center dotted line */}
        <div
          className="absolute left-1/2 top-0 h-full w-px"
          style={{ borderLeft: '1.5px dashed #94a3b8' }}
        />

        {/* Score dot */}
        <div
          className="absolute w-4 h-4 rounded-full shadow border-2 border-white transition-all duration-700 ease-out -translate-x-1/2"
          style={{
            left: `${pct}%`,
            background: 'linear-gradient(135deg, #2d9596, #0f4c81)',
          }}
        />
      </div>

      {/* High label */}
      <span className="flex-shrink-0 w-14 text-xs text-slate-400 leading-tight">
        {high}
      </span>
    </div>
  );
}
