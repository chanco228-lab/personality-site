'use client';

import { useId } from 'react';

type Props = {
  score: number;
  colorFrom: string;
  colorMid?: string;
  colorTo: string;
  leftLabel: string;
  rightLabel: string;
};

export default function GaugeMeter({ score, colorFrom, colorMid, colorTo, leftLabel, rightLabel }: Props) {
  const uid = useId();
  const gradId = `gauge-grad-${uid.replace(/:/g, '')}`;

  // 針の角度: score=0 → 180°(左端)、score=100 → 0°(右端)
  const angleDeg = 180 - score * 1.8;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleX = 100 + 62 * Math.cos(angleRad);
  const needleY = 100 - 62 * Math.sin(angleRad);

  return (
    // viewBox を広げてラベルがアークと被らないようにする
    <svg viewBox="0 0 200 130" className="w-full max-w-xs mx-auto" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colorFrom} />
          {colorMid && <stop offset="50%" stopColor={colorMid} />}
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>

      {/* 背景トラック */}
      <path
        d="M 25,100 A 75,75 0 0,1 175,100"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* カラートラック */}
      <path
        d="M 25,100 A 75,75 0 0,1 175,100"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="20"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 針 */}
      <line
        x1="100" y1="100"
        x2={needleX} y2={needleY}
        stroke="#333333"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* 針の根元 */}
      <circle cx="100" cy="100" r="10" fill="#333333" />

      {/* 左ラベル（アーク下方） */}
      <text x="25" y="122" textAnchor="middle" fontSize="12" fill="#64748b">{leftLabel}</text>

      {/* 右ラベル（アーク下方） */}
      <text x="175" y="122" textAnchor="middle" fontSize="12" fill="#64748b">{rightLabel}</text>
    </svg>
  );
}
