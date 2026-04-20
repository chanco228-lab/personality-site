'use client';

import { useState } from 'react';
import Link from 'next/link';

type Filter = 'すべて' | '陽キャ' | '無キャ' | '陰キャ';

const TYPES = [
  {
    code: 'HLH+', name: '指揮官', tag: '陽キャ',
    desc: '人を率いて、最後まで突き進む',
    bg: '#F5E12B', color: '#0E0E0E', codeOpacity: '0.6',
  },
  {
    code: 'HLH-', name: '革命家', tag: '陽キャ',
    desc: '情熱の炎で世界を変えようとする',
    bg: '#FF6B57', color: '#FFFFFF', codeOpacity: '0.8',
  },
  {
    code: 'HMH-', name: '表現者', tag: '陽キャ',
    desc: '感情をそのまま表現する天性の演者',
    bg: '#2FC6B8', color: '#FFFFFF', codeOpacity: '0.8',
  },
  {
    code: 'HHH+', name: '完璧主義者', tag: '無キャ',
    desc: '理想の形を追い求め、妥協しない',
    bg: '#B9A7F5', color: '#0E0E0E', codeOpacity: '0.6',
  },
  {
    code: 'HHH-', name: '庇護者', tag: '無キャ',
    desc: '心配しながら、それでも人のために動く',
    bg: '#FFB8D6', color: '#0E0E0E', codeOpacity: '0.6',
  },
  {
    code: 'MMM-', name: '現実主義者', tag: '無キャ',
    desc: 'できることとできないことを冷静に見極める',
    bg: '#9BDC5A', color: '#0E0E0E', codeOpacity: '0.6',
  },
  {
    code: 'MHL-', name: '孤高の人', tag: '陰キャ',
    desc: '群れず、自分の価値観だけを信じて生きる',
    bg: '#FFFFFF', color: '#0E0E0E', codeOpacity: '0.6',
  },
  {
    code: 'LHL-', name: '慎想家', tag: '陰キャ',
    desc: '心配と疑念を抱えたまま、動けずにいる',
    bg: '#0E0E0E', color: '#FFFFFF', codeOpacity: '1', codeColor: '#F5E12B',
    descColor: '#E8E8E8',
  },
] as const;

const FILTERS: Filter[] = ['すべて', '陽キャ', '無キャ', '陰キャ'];

export default function TypeGallery() {
  const [active, setActive] = useState<Filter>('すべて');
  const visible = active === 'すべて' ? TYPES : TYPES.filter((t) => t.tag === active);

  return (
    <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-[56px] md:py-[100px]">
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
          const descColor = 'descColor' in t ? t.descColor : (isLight ? '#E8E8E8' : '#2A2A2A');
          const codeColor = 'codeColor' in t ? t.codeColor : t.color;
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
                  style={{ color: codeColor, opacity: parseFloat(t.codeOpacity) }}
                >
                  {t.code}
                </div>
                <div className="font-black text-[26px] tracking-tight leading-[1.1] mb-2">{t.name}</div>
                <div className="text-[12px] leading-[1.5] mb-3" style={{ color: descColor }}>{t.desc}</div>
              </div>
              <span
                className="inline-block font-mono text-[10px] font-bold px-2 py-[3px] rounded bg-ink text-paper self-start"
              >
                {t.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* More CTA */}
      <div className="text-center mt-10">
        <Link
          href="#"
          aria-label="54タイプ全部を見る"
          className="hero-cta inline-flex items-center gap-[10px] font-display font-black bg-ink text-paper border-2 border-ink rounded-full px-7 py-[14px]"
          style={{ fontSize: '16px' }}
        >
          54タイプ全部を見る <span>→</span>
        </Link>
      </div>
    </section>
  );
}
