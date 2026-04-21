'use client';

import { useEffect, useState } from 'react';

const CIRCLES = [
  { value:  3, color: '#2FC6B8', sizeD: 64, sizeM: 48, label: '最大同意' },
  { value:  2, color: '#52D0C4', sizeD: 52, sizeM: 40, label: '強い同意' },
  { value:  1, color: '#7FE0D6', sizeD: 40, sizeM: 32, label: '弱い同意' },
  { value:  0, color: '#BDBDBD', sizeD: 28, sizeM: 20, label: '中立' },
  { value: -1, color: '#D4BEEB', sizeD: 40, sizeM: 32, label: '弱い不同意' },
  { value: -2, color: '#B9A7F5', sizeD: 52, sizeM: 40, label: '強い不同意' },
  { value: -3, color: '#9580D6', sizeD: 64, sizeM: 48, label: '最大不同意' },
];

type Props = {
  onAnswer: (value: number) => void;
  questionKey: number;
};

export default function ScaleSelector({ onAnswer, questionKey }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setSelected(null);
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [questionKey]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selected !== null) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 7) doSelect(CIRCLES[n - 1].value);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, questionKey]);

  const doSelect = (value: number) => {
    if (selected !== null) return;
    setSelected(value);
    setTimeout(() => onAnswer(value), 300);
  };

  const circles = CIRCLES.map((c, i) => {
    const isSelected = selected === c.value;
    const size = isMobile ? c.sizeM : c.sizeD;
    const tapSize = Math.max(44, size);

    return (
      <button
        key={c.value}
        onClick={() => doSelect(c.value)}
        aria-label={c.label}
        disabled={selected !== null}
        style={{
          width: tapSize,
          height: tapSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: selected !== null ? 'default' : 'pointer',
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? isSelected ? 'scale(1.15)' : 'scale(1)'
            : 'scale(0.4)',
          transition: isSelected
            ? 'transform 0.15s ease, opacity 0.15s ease'
            : `transform 0.28s ease ${i * 50}ms, opacity 0.28s ease ${i * 50}ms`,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `${isSelected ? 3 : 2}px solid ${c.color}`,
            background: isSelected ? c.color : 'transparent',
            boxShadow: isSelected ? `0 0 0 5px ${c.color}30` : 'none',
            transition: 'background 0.15s ease, box-shadow 0.15s ease, border-width 0.1s ease',
          }}
        />
      </button>
    );
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Mobile: labels above circles */}
      <div className="flex sm:hidden items-center justify-between w-full px-1">
        <span className="text-[12px] font-bold" style={{ color: '#2FC6B8' }}>そう思う</span>
        <span className="text-[12px] font-bold" style={{ color: '#9580D6' }}>そう思わない</span>
      </div>

      {/* Circles row (mobile: centered, desktop: with side labels) */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Desktop left label */}
        <span
          className="hidden sm:block text-[14px] font-bold shrink-0 text-right"
          style={{ color: '#2FC6B8', minWidth: 52 }}
        >
          そう思う
        </span>

        <div className="flex items-center gap-[6px] sm:gap-[10px]">
          {circles}
        </div>

        {/* Desktop right label */}
        <span
          className="hidden sm:block text-[14px] font-bold shrink-0"
          style={{ color: '#9580D6', minWidth: 60 }}
        >
          そう思わない
        </span>
      </div>

      {/* Desktop keyboard hint */}
      <p className="hidden sm:block font-mono text-[11px]" style={{ opacity: 0.3 }}>
        キー 1〜7 でも選択できます
      </p>
    </div>
  );
}
