'use client';

import { useState } from 'react';
import { personalityTypes } from '@/data/types';
import { toDisplayCode } from '@/lib/typeCode';

type Filter = 'すべて' | '陽キャ' | '無キャ' | '陰キャ';

function getTag(ns: string, ha: string): '陽キャ' | '無キャ' | '陰キャ' {
  if (ns === 'high' && ha !== 'high') return '陽キャ';
  if (ha === 'high' && ns !== 'high') return '陰キャ';
  return '無キャ';
}

// Key: `${ns}-${ha}-${p}` (p: 'high'=+, 'low'=-)
// The 8 preview types are matched exactly to their original colors.
const PALETTE: Record<string, { bg: string; color: string }> = {
  'high-low-high':  { bg: '#F5E12B', color: '#0E0E0E' }, // HLx+ yellow   (指揮官)
  'high-low-low':   { bg: '#FF6B57', color: '#FFFFFF' }, // HLx- coral    (革命家)
  'high-mid-high':  { bg: '#FF9B57', color: '#0E0E0E' }, // HMx+ orange
  'high-mid-low':   { bg: '#2FC6B8', color: '#FFFFFF' }, // HMx- teal     (表現者)
  'high-high-high': { bg: '#B9A7F5', color: '#0E0E0E' }, // HHx+ purple   (完璧主義者)
  'high-high-low':  { bg: '#FFB8D6', color: '#0E0E0E' }, // HHx- pink     (庇護者)
  'mid-low-high':   { bg: '#C8F07A', color: '#0E0E0E' }, // MLx+ lime
  'mid-low-low':    { bg: '#AADC5A', color: '#0E0E0E' }, // MLx- mid-green
  'mid-mid-high':   { bg: '#A8D8EA', color: '#0E0E0E' }, // MMx+ sky
  'mid-mid-low':    { bg: '#9BDC5A', color: '#0E0E0E' }, // MMx- green    (現実主義者)
  'mid-high-high':  { bg: '#F0F0F0', color: '#0E0E0E' }, // MHx+ light-gray
  'mid-high-low':   { bg: '#FFFFFF', color: '#0E0E0E' }, // MHx- white    (孤高の人)
  'low-low-high':   { bg: '#1A9E8A', color: '#FFFFFF' }, // LLx+ dark-teal
  'low-low-low':    { bg: '#57C7B8', color: '#FFFFFF' }, // LLx- mid-teal
  'low-mid-high':   { bg: '#8B7355', color: '#FFFFFF' }, // LMx+ brown
  'low-mid-low':    { bg: '#A8967E', color: '#0E0E0E' }, // LMx- tan
  'low-high-high':  { bg: '#2A2A2A', color: '#FFFFFF' }, // LHx+ dark-gray
  'low-high-low':   { bg: '#0E0E0E', color: '#FFFFFF' }, // LHx- black    (慎想家)
};

const ALL_TYPES = personalityTypes.map((t) => {
  const paletteKey = `${t.ns}-${t.ha}-${t.p}`;
  const { bg, color } = PALETTE[paletteKey] ?? { bg: '#EEEEEE', color: '#0E0E0E' };
  return {
    code: toDisplayCode(t.id),
    name: t.name,
    desc: t.catchphrase,
    tag: getTag(t.ns, t.ha),
    bg,
    color,
  };
});

const PREVIEW_CODES = new Set(['HLH+', 'HLH-', 'HMH-', 'HHH+', 'HHH-', 'MMM-', 'MHL-', 'LHL-']);
const FILTERS: Filter[] = ['すべて', '陽キャ', '無キャ', '陰キャ'];

export default function TypeGallery() {
  const [active, setActive] = useState<Filter>('すべて');
  const [showAll, setShowAll] = useState(false);

  const base = showAll ? ALL_TYPES : ALL_TYPES.filter((t) => PREVIEW_CODES.has(t.code));
  const visible = active === 'すべて' ? base : base.filter((t) => t.tag === active);

  return (
    <section id="type-gallery" className="relative z-10 max-w-[1200px] mx-auto px-6 py-[56px] md:py-[100px]">
      {/* Header */}
      <div className="flex justify-between items-end mb-12 gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3">
            <span aria-hidden="true" className="inline-block w-6 h-[2px] bg-ink" />
            THE 54 TYPES
          </div>
          <h2
            className="font-black tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            あなたは、<br />どのタイプだろう？
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`font-display font-bold text-[13px] px-4 py-2 border-2 border-ink rounded-full transition-all duration-150 ${
                active === f ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-yellow'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {visible.map((t) => {
          const isLight = t.color === '#FFFFFF';
          const descColor = isLight ? 'rgba(255,255,255,0.75)' : '#2A2A2A';
          return (
            <div
              key={t.code}
              className="relative border-2 border-ink rounded-[20px] p-5 cursor-pointer transition-all duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] min-h-[180px] flex flex-col justify-between overflow-hidden"
              style={{
                background: t.bg,
                color: t.color,
                boxShadow: '4px 4px 0 #0E0E0E',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '7px 7px 0 #0E0E0E'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 #0E0E0E'; }}
            >
              <div>
                <div
                  className="font-mono text-[11px] font-bold tracking-[0.05em] mb-2"
                  style={{ color: t.color, opacity: 0.7 }}
                >
                  {t.code}
                </div>
                <div className="font-black text-[26px] tracking-tight leading-[1.1] mb-2">{t.name}</div>
                <div className="text-[12px] leading-[1.5] mb-3" style={{ color: descColor }}>{t.desc}</div>
              </div>
              <span className="inline-block font-mono text-[10px] font-bold px-2 py-[3px] rounded bg-ink text-paper self-start">
                {t.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* More CTA */}
      {!showAll && (
        <div className="text-center mt-10">
          <button
            onClick={() => setShowAll(true)}
            aria-label="54タイプ全部を見る"
            className="hero-cta inline-flex items-center gap-[10px] font-display font-black bg-ink text-paper border-2 border-ink rounded-full px-7 py-[14px]"
            style={{ fontSize: '16px' }}
          >
            54タイプ全部を見る <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
}
