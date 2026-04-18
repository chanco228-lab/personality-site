'use client';

import { useState } from 'react';

type Choice = {
  label: string;
  text: string;
  value: number;
  bg: string;
  color: string;
};

const choices: Choice[] = [
  { label: 'A', text: 'かなりそう',           value:  3, bg: '#FF6B57', color: '#FFF' },
  { label: 'B', text: 'わりとそう',           value:  2, bg: '#FF6B57', color: '#FFF' },
  { label: 'C', text: 'どちらかといえばそう', value:  1, bg: '#FF6B57', color: '#FFF' },
  { label: 'D', text: 'どちらかといえば違う', value: -1, bg: '#F5E12B', color: '#0E0E0E' },
  { label: 'E', text: 'わりと違う',           value: -2, bg: '#F5E12B', color: '#0E0E0E' },
  { label: 'F', text: 'かなり違う',           value: -3, bg: '#F5E12B', color: '#0E0E0E' },
];

const FACTOR_BADGE: Record<string, string> = {
  NS: 'bg-coral text-paper',
  HA: 'bg-lav text-ink',
  RD: 'bg-hpink text-ink',
  P:  'bg-yellow text-ink',
  SD: 'bg-turq text-paper',
  CO: 'bg-hgreen text-ink',
  ST: 'bg-ink text-paper',
};

type QuizCardProps = {
  questionText: string;
  questionIndex: number;
  factor?: string;
  onAnswer: (value: number) => void;
};

export default function QuizCard({ questionText, questionIndex, factor, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (value: number) => {
    if (selected !== null) return;
    setSelected(value);
    setTimeout(() => {
      onAnswer(value);
      setSelected(null);
    }, 350);
  };

  const badgeCls = factor ? (FACTOR_BADGE[factor] ?? 'bg-ink text-paper') : 'bg-ink text-paper';

  return (
    <div className="w-full max-w-[640px] mx-auto">
      {/* Question card */}
      <div
        className="bg-paper border-2 border-ink rounded-[20px] px-6 py-7 mb-4"
        style={{ boxShadow: '8px 8px 0 #0E0E0E' }}
      >
        <span className={`font-mono text-[12px] font-bold px-3 py-[4px] rounded-lg inline-block mb-4 ${badgeCls}`}>
          Q{questionIndex + 1}
        </span>
        <p
          className="font-bold leading-[1.5] text-ink mb-5"
          style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}
        >
          {questionText}
        </p>
        <div className="border-t-2 border-dashed border-ink" style={{ opacity: 0.2 }} />
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-3">
        {choices.map((choice) => {
          const isSelected = selected === choice.value;
          return (
            <button
              key={choice.label}
              onClick={() => handleSelect(choice.value)}
              disabled={selected !== null}
              className={`
                w-full flex items-center gap-3 px-4 py-[14px] rounded-[12px] border-2 text-left
                transition-all duration-150
                ${isSelected
                  ? 'border-ink bg-ink text-paper'
                  : selected !== null
                  ? 'border-ink bg-paper cursor-not-allowed'
                  : 'border-ink bg-paper text-ink hover:-translate-y-[2px] cursor-pointer'
                }
              `}
              style={
                isSelected
                  ? {}
                  : selected !== null
                  ? { opacity: 0.35 }
                  : { boxShadow: '3px 3px 0 #0E0E0E' }
              }
            >
              {/* Score badge */}
              <span
                className="flex-shrink-0 w-[38px] h-[28px] flex items-center justify-center font-mono text-[12px] font-bold rounded-[6px] border-2"
                style={
                  isSelected
                    ? { background: 'rgba(255,255,255,0.15)', color: '#FFF', borderColor: 'rgba(255,255,255,0.3)' }
                    : { background: choice.bg, color: choice.color, borderColor: '#0E0E0E' }
                }
              >
                {choice.label}
              </span>
              <span className="text-[15px] font-medium">{choice.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
