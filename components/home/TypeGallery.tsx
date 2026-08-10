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

// Linear interpolation between two hex colors
function lerpHex(a: string, b: string, t: number): string {
  const ch = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16);
  const r = Math.round(ch(a, 1) + (ch(b, 1) - ch(a, 1)) * t).toString(16).padStart(2, '0');
  const g = Math.round(ch(a, 3) + (ch(b, 3) - ch(a, 3)) * t).toString(16).padStart(2, '0');
  const bl = Math.round(ch(a, 5) + (ch(b, 5) - ch(a, 5)) * t).toString(16).padStart(2, '0');
  return `#${r}${g}${bl}`;
}

// Multi-stop gradient: stops = ['#xxx', '#yyy', ...], t in [0, 1]
function gradient(stops: string[], t: number): string {
  if (t <= 0) return stops[0];
  if (t >= 1) return stops[stops.length - 1];
  const seg = t * (stops.length - 1);
  const i = Math.floor(seg);
  return lerpHex(stops[i], stops[i + 1], seg - i);
}

// Pick white or dark text based on background luminance
function textColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6 ? '#FFFFFF' : '#0E0E0E';
}

// ── Gradient stops per category ──────────────────────────────────────────────
// 陽キャ: yellow → orange → coral → pink (warm spectrum)
const YOIKYA_STOPS = ['#F5E12B', '#FFB800', '#FF7940', '#FF5068', '#FF66AA'];
// 無キャ: lime → teal → sky → violet (cool spectrum)
const MUIKYA_STOPS = ['#9BDC5A', '#2FC6B8', '#70AAEE', '#B9A7F5'];
// 陰キャ: ns=mid → white bg, ns=low → black bg (2-tone)

// ── Preview: original hand-picked colors (8 cards) ───────────────────────────
const PREVIEW_PALETTE: Record<string, { bg: string; color: string }> = {
  'high-low-high':  { bg: '#F5E12B', color: '#0E0E0E' }, // HLH+ 指揮官
  'high-low-low':   { bg: '#FF6B57', color: '#FFFFFF' }, // HLH- 革命家
  'high-mid-low':   { bg: '#2FC6B8', color: '#FFFFFF' }, // HMH- 表現者
  'high-high-high': { bg: '#B9A7F5', color: '#0E0E0E' }, // HHH+ 完璧主義者
  'high-high-low':  { bg: '#FFB8D6', color: '#0E0E0E' }, // HHH- 庇護者
  'mid-mid-low':    { bg: '#9BDC5A', color: '#0E0E0E' }, // MMM- 現実主義者
  'mid-high-low':   { bg: '#FFFFFF', color: '#0E0E0E' }, // MHL- 孤高の人
  'low-high-low':   { bg: '#0E0E0E', color: '#FFFFFF' }, // LHL- 慎想家
};

type TypeCard = {
  code: string; name: string; desc: string;
  tag: '陽キャ' | '無キャ' | '陰キャ'; bg: string; color: string;
};

const PREVIEW_ORDER = ['HLH+', 'HLH-', 'HMH-', 'HHH+', 'HHH-', 'MMM-', 'MHL-', 'LHL-'];

// ── Build card data at module level (no re-computation on render) ─────────────
const { previewCards, allCards } = (() => {
  const make = (t: typeof personalityTypes[0], bg: string, color: string): TypeCard => ({
    code: toDisplayCode(t.id),
    name: t.name,
    desc: t.catchphrase,
    tag: getTag(t.ns, t.ha),
    bg,
    color,
  });

  // Preview: 8 hand-picked cards in specified order
  const byCode = new Map<string, TypeCard>();
  for (const t of personalityTypes) {
    const code = toDisplayCode(t.id);
    if (!PREVIEW_ORDER.includes(code)) continue;
    const key = `${t.ns}-${t.ha}-${t.p}`;
    const { bg, color } = PREVIEW_PALETTE[key] ?? { bg: '#EEEEEE', color: '#0E0E0E' };
    byCode.set(code, make(t, bg, color));
  }
  const previewCards = PREVIEW_ORDER.map(c => byCode.get(c)!).filter(Boolean);

  // Full view: sorted 陽キャ → 無キャ → 陰キャ, gradient colors within each group
  const youki  = personalityTypes.filter(t => getTag(t.ns, t.ha) === '陽キャ');
  const muki   = personalityTypes.filter(t => getTag(t.ns, t.ha) === '無キャ');
  const iinkya = personalityTypes.filter(t => getTag(t.ns, t.ha) === '陰キャ');

  const allCards: TypeCard[] = [
    ...youki.map((t, i) => {
      const bg = gradient(YOIKYA_STOPS, i / Math.max(youki.length - 1, 1));
      return make(t, bg, textColor(bg));
    }),
    ...muki.map((t, i) => {
      const bg = gradient(MUIKYA_STOPS, i / Math.max(muki.length - 1, 1));
      return make(t, bg, textColor(bg));
    }),
    ...iinkya.map(t => {
      const bg = t.ns === 'mid' ? '#FFFFFF' : '#0E0E0E';
      return make(t, bg, t.ns === 'mid' ? '#0E0E0E' : '#FFFFFF');
    }),
  ];

  return { previewCards, allCards };
})();

const FILTERS: Filter[] = ['すべて', '陽キャ', '無キャ', '陰キャ'];

export default function TypeGallery() {
  const [active, setActive] = useState<Filter>('すべて');
  const [showAll, setShowAll] = useState(false);

  const base = showAll ? allCards : previewCards;
  const visible = active === 'すべて' ? base : base.filter(t => t.tag === active);

  // 閉じる: 先に状態を折りたたんでからスクロール（layout変化前にscrollIntoViewするとページ底部に飛ぶバグを防ぐ）
  function handleClose() {
    setShowAll(false);
    setTimeout(() => {
      document.getElementById('type-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // 陽キャ/陰キャ → 自動展開。無キャ/すべて → プレビューに戻す
  function handleFilter(f: Filter) {
    setActive(f);
    if (f === '陽キャ' || f === '陰キャ') {
      setShowAll(true);
    } else {
      setShowAll(false);
    }
  }

  // すべて・無キャのみ CTA/閉じるボタンを表示（陽キャ・陰キャは自動展開なので不要）
  const showCta = active === 'すべて' || active === '無キャ';

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
              onClick={() => handleFilter(f)}
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
          const descColor = isLight ? 'rgba(255,255,255,0.7)' : '#2A2A2A';
          return (
            <div
              key={t.code}
              className="relative border-2 border-ink rounded-[20px] p-5 cursor-pointer transition-all duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] min-h-[180px] flex flex-col justify-between overflow-hidden"
              style={{ background: t.bg, color: t.color, boxShadow: '4px 4px 0 #0E0E0E' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '7px 7px 0 #0E0E0E'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 #0E0E0E'; }}
            >
              <div>
                <div className="font-mono text-[11px] font-bold tracking-[0.05em] mb-2" style={{ color: t.color, opacity: 0.7 }}>
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

      {/* CTA / Close（すべて・無キャのみ） */}
      {showCta && (
        <div className="text-center mt-10">
          {showAll ? (
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 font-display font-bold text-[15px] px-7 py-[14px] border-2 border-ink rounded-full bg-paper text-ink hover:bg-yellow transition-colors duration-150"
            >
              ↑ 閉じる
            </button>
          ) : (
            <button
              onClick={() => setShowAll(true)}
              className="hero-cta inline-flex items-center gap-[10px] font-display font-black bg-ink text-paper border-2 border-ink rounded-full px-7 py-[14px]"
              style={{ fontSize: '16px' }}
            >
              54タイプ全部を見る <span>→</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
