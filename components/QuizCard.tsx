'use client';

import { useState } from 'react';

type Choice = {
  label: string;
  text: string;
  value: number;
};

const choices: Choice[] = [
  { label: 'A', text: 'かなりそう', value: 3 },
  { label: 'B', text: 'わりとそう', value: 2 },
  { label: 'C', text: 'どちらかといえばそう', value: 1 },
  { label: 'D', text: 'どちらかといえば違う', value: -1 },
  { label: 'E', text: 'わりと違う', value: -2 },
  { label: 'F', text: 'かなり違う', value: -3 },
];

type QuizCardProps = {
  questionText: string;
  questionIndex: number;
  onAnswer: (value: number) => void;
};

export default function QuizCard({ questionText, questionIndex, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (value: number) => {
    if (selected !== null) return;
    setSelected(value);
    setTimeout(() => {
      onAnswer(value);
      setSelected(null);
    }, 400);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
        <div className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-3">
          Q{questionIndex + 1}
        </div>
        <p className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed">
          {questionText}
        </p>
      </div>

      <div className="space-y-3">
        {choices.map((choice) => {
          const isSelected = selected === choice.value;
          return (
            <button
              key={choice.label}
              onClick={() => handleSelect(choice.value)}
              disabled={selected !== null}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left
                transition-all duration-200 font-medium
                ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 text-teal-700 scale-[1.02] shadow-md'
                    : selected !== null
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:scale-[1.01] hover:shadow-sm cursor-pointer'
                }
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    isSelected
                      ? 'bg-teal-500 text-white'
                      : selected !== null
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100'
                  }
                `}
              >
                {choice.label}
              </span>
              <span>{choice.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
