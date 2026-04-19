'use client';

import { useEffect, useState } from 'react';

type Props = {
  score: number;
  label: string;
  title: string;
  description?: string;
  colorFrom: string;
  colorMid: string;
  colorTo: string;
  leftLabel: string;
  rightLabel: string;
};

export default function GradientScoreBar({
  score, label, title, description,
  colorFrom, colorMid, colorTo,
  leftLabel, rightLabel,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const dotPct = mounted ? score : 0;

  return (
    <div>
      {/* Title + big score */}
      <div className="flex items-end justify-between mb-4">
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.08em]" style={{ opacity: 0.6 }}>{title}</span>
        <span className="font-mono font-black text-[40px] leading-none">{score}<span className="text-[20px]">%</span></span>
      </div>

      {/* Gradient track */}
      <div
        className="relative h-[10px] border-2 border-current overflow-hidden mb-2"
        style={{ background: `linear-gradient(to right, ${colorFrom}, ${colorMid}, ${colorTo})` }}
      >
        {/* Dot indicator */}
        <div
          className="absolute top-1/2 w-[14px] h-[14px] rounded-full border-2 border-current bg-paper"
          style={{
            left: `${dotPct}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.7s ease-out',
          }}
        />
      </div>

      {/* Left / right labels */}
      <div className="flex justify-between text-[11px] font-mono font-bold mb-3" style={{ opacity: 0.5 }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* Interpretation */}
      <div className="bg-paper text-ink border-2 border-current rounded-[10px] px-4 py-3">
        <p className="font-bold text-[16px] tracking-tight mb-1" style={{ opacity: 0.7 }}>「{label}」</p>
        {description && <p className="text-[13px] leading-[1.6]" style={{ opacity: 0.75 }}>{description}</p>}
      </div>
    </div>
  );
}
