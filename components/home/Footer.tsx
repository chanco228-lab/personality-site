export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-ink bg-bg px-6 py-10">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-4 text-[12px]">
        <div className="font-mono font-bold text-lg tracking-tight flex items-center gap-[10px]">
          <span
            aria-hidden="true"
            className="w-[30px] h-[30px] bg-yellow border-2 border-ink rounded-lg inline-flex items-center justify-center text-[13px] font-bold flex-shrink-0"
            style={{ transform: 'rotate(-5deg)' }}
          >
            T7
          </span>
          <span>TC7診断</span>
        </div>
        <div className="font-mono" style={{ opacity: 0.7 }}>
          © 2026 · 本診断は娯楽・自己理解を目的としたものです
        </div>
      </div>
    </footer>
  );
}
