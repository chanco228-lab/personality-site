'use client';

import { useState } from 'react';
import { toDisplayCode, explainCode } from '@/lib/typeCode';

interface Props {
  typeId: string;
}

const LEVEL_COLORS: Record<string, string> = {
  H: '#2FC6B8', // turquoise
  M: '#B9A7F5', // lavender
  L: '#FF6B57', // coral
};

const SUFFIX_COLORS: Record<string, string> = {
  '+': '#F5E12B',
  '-': '#A0A0A0',
};

const FACTOR_NAMES = ['好奇心', '慎重さ', '共感力'];

export default function CodeAccordion({ typeId }: Props) {
  const [open, setOpen] = useState(false);
  const code = toDisplayCode(typeId);
  const explained = explainCode(code);
  const levels = [code[0], code[1], code[2]];
  const suffix = code[3];

  const rows = [
    { letter: levels[0], factor: FACTOR_NAMES[0], value: explained.ns },
    { letter: levels[1], factor: FACTOR_NAMES[1], value: explained.ha },
    { letter: levels[2], factor: FACTOR_NAMES[2], value: explained.rd },
    { letter: suffix, factor: '固執', value: explained.persistence },
  ];

  return (
    <div
      className="border-2 border-ink rounded-[14px] overflow-hidden"
      style={{ boxShadow: '4px 4px 0 #0E0E0E' }}
    >
      {/* ヘッダー（常時表示） */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-paper"
        aria-expanded={open}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span
            className="font-mono font-bold uppercase tracking-[0.08em]"
            style={{ fontSize: '11px', opacity: 0.45 }}
          >
            あなたのコード
          </span>
          <span
            className="font-mono font-black leading-none"
            style={{ fontSize: 'clamp(28px, 6vw, 44px)' }}
          >
            {levels.map((l, i) => (
              <span key={i} style={{ color: LEVEL_COLORS[l] }}>{l}</span>
            ))}
            <span style={{ color: SUFFIX_COLORS[suffix] }}>{suffix}</span>
          </span>
        </div>
        <span
          className="font-mono text-[12px] font-bold"
          style={{ opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▼
        </span>
      </button>

      {/* 展開エリア */}
      {open && (
        <div className="bg-bg border-t-2 border-ink px-4 py-3 flex flex-col gap-1">
          {rows.map(({ letter, factor, value }) => (
            <div key={factor} className="flex items-center gap-3 font-mono text-[13px]">
              <span
                className="font-black w-5 text-center shrink-0 text-[15px]"
                style={{ color: letter === '+' || letter === '-' ? SUFFIX_COLORS[letter] : LEVEL_COLORS[letter] }}
              >
                {letter}
              </span>
              <span className="flex-1" style={{ opacity: 0.7 }}>{factor}</span>
              <span className="font-bold">→ {value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
