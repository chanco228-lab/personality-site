'use client';

import { useEffect, useRef, useState } from 'react';
import { FactorType, FACTOR_LABELS } from '@/data/types';

type ScoreBarProps = {
  factor: FactorType;
  score: number;
  delay?: number;
};

const FACTOR_BADGE: Record<FactorType, string> = {
  NS: 'bg-coral text-paper',
  HA: 'bg-lav text-ink',
  RD: 'bg-hpink text-ink',
  P:  'bg-yellow text-ink',
  SD: 'bg-turq text-paper',
  CO: 'bg-hgreen text-ink',
  ST: 'bg-ink text-paper',
};

const FACTOR_COLOR: Record<FactorType, string> = {
  NS: '#FF6B57',
  HA: '#B9A7F5',
  RD: '#FFB8D6',
  P:  '#F5E12B',
  SD: '#2FC6B8',
  CO: '#9BDC5A',
  ST: '#0E0E0E',
};

export default function ScoreBar({ factor, score, delay = 0 }: ScoreBarProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setAnimated(true), delay);
          observer.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const badgeCls = FACTOR_BADGE[factor];
  const fillColor = FACTOR_COLOR[factor];

  // score: -9 to +9. 0 is at 50%.
  const dotPct = animated ? ((score + 9) / 18) * 100 : 50;
  const fillLeft  = score >= 0 ? 50 : dotPct;
  const fillWidth = animated ? Math.abs(score / 18) * 100 : 0;

  return (
    <div ref={ref} className="flex items-center gap-3 w-full">
      {/* Left: badge + name */}
      <div className="flex items-center gap-2 shrink-0" style={{ width: 130 }}>
        <span className={`font-mono text-[11px] font-bold px-[6px] py-[2px] rounded-[4px] shrink-0 ${badgeCls}`}>
          {factor}
        </span>
        <span className="text-[13px] font-bold text-ink truncate">{FACTOR_LABELS[factor]}</span>
      </div>

      {/* Bar */}
      <div className="relative flex-1 h-8 flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-[6px] bg-[#EBEBEB] border border-ink/10" />

        {/* Fill */}
        <div
          className="absolute h-[6px]"
          style={{
            left: `${fillLeft}%`,
            width: `${fillWidth}%`,
            background: fillColor,
            transition: 'width 0.6s ease-out, left 0.6s ease-out',
          }}
        />

        {/* Center marker */}
        <div
          className="absolute h-4 w-[2px] bg-ink"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        {/* Dot */}
        <div
          className="absolute w-[14px] h-[14px] rounded-full border-2 border-ink bg-paper"
          style={{
            left: `${dotPct}%`,
            transform: 'translateX(-50%)',
            transition: 'left 0.6s ease-out',
            zIndex: 2,
          }}
        />
      </div>

      {/* Score */}
      <span className="font-mono text-[14px] font-bold shrink-0 w-8 text-right">
        {score > 0 ? `+${score}` : score}
      </span>
    </div>
  );
}
