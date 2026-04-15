import Link from 'next/link';
import { personalityTypes } from '@/data/types';

const MAIN_COLOR = '#1D9E75';
const CARD_W = 210;
const CARD_GAP = 12;
const CARD_UNIT = CARD_W + CARD_GAP;
function getIntrovertLabel(ns: string, ha: string, rd: string) {
  const v = (l: string) => (l === 'high' ? 6 : l === 'low' ? -6 : 0);
  const raw = v(ha) * 2.0 + v(ns) * -1.75 + v(rd) * -1.0;
  const score = ((raw + 28.5) / 57) * 100;
  if (score < 40) return { label: '陽キャ', color: '#D97706', bg: '#FEF3C7' };
  if (score <= 60) return { label: '無キャ',  color: '#6B7280', bg: '#F3F4F6' };
  return              { label: '陰キャ', color: '#4F46E5', bg: '#EEF2FF' };
}

const ROWS = [
  { types: personalityTypes.filter((t) => t.p === 'high'), duration: 189, delay: -63 },
  { types: personalityTypes.filter((t) => t.p === 'low'),  duration: 210, delay: -90 },
].map((row, i) => ({
  ...row,
  oneSetPx: row.types.length * CARD_UNIT,
  trackPx:  row.types.length * CARD_UNIT * 2,
  animName: `scroll-row-${i}`,
}));

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">

      <style>{`
        ${ROWS.map((row) => `
          @keyframes ${row.animName} {
            from { transform: translateX(0); }
            to   { transform: translateX(-${row.oneSetPx}px); }
          }
        `).join('')}
        .carousel-wrap:hover .carousel-row {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-5 pt-20 pb-10">
        <span
          className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border mb-8"
          style={{ color: MAIN_COLOR, borderColor: MAIN_COLOR, backgroundColor: '#f0fdf8' }}
        >
          TC7診断 · 54 TYPES
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
          あなたはどの<br />
          <span style={{ color: MAIN_COLOR }}>パーソナリティ</span>タイプ？
        </h1>

        <p className="text-slate-500 text-base mb-10">
          21問に答えるだけ。7因子から54タイプを判定。
        </p>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-95 mb-3"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          無料で診断する
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <p className="text-slate-400 text-xs">約3分 · 無料 · 登録不要</p>
      </section>

      {/* ── 3列カルーセル ── */}
      <section className="w-full overflow-hidden py-4 flex flex-col gap-3 carousel-wrap">
        {ROWS.map((row, ri) => {
          const doubled = [...row.types, ...row.types];
          return (
            <div
              key={ri}
              className="flex carousel-row"
              style={{
                width: `${row.trackPx}px`,
                animation: `${row.animName} ${row.duration}s linear infinite`,
                animationDelay: `${row.delay}s`,
              }}
            >
              {doubled.map((t, i) => {
                const intro = getIntrovertLabel(t.ns, t.ha, t.rd);
                return (
                  <div
                    key={`${t.id}-${i}`}
                    className="flex-shrink-0 rounded-2xl p-4 flex flex-col"
                    style={{ width: `${CARD_W}px`, height: '200px', marginRight: `${CARD_GAP}px`, background: `linear-gradient(135deg, ${intro.bg}, white)`, border: `1px solid ${intro.color}30` }}
                  >
                    <span
                      className="inline-block self-start text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                      style={{ color: intro.color, backgroundColor: intro.bg }}
                    >
                      {intro.label}
                    </span>
                    <p className="text-base font-extrabold text-slate-800 leading-snug mb-2">
                      {t.name}
                    </p>
                    <p
                      className="text-sm text-slate-500 leading-snug mt-auto overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {t.catchphrase}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto py-8 text-center border-t border-slate-100">
        <p className="text-slate-400 text-xs max-w-md mx-auto px-4 leading-relaxed">
          ※ 本診断は娯楽・自己理解を目的としたものです。医療診断や専門的カウンセリングの代替ではありません。
        </p>
      </footer>
    </main>
  );
}
