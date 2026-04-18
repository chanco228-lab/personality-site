import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-bg border-b-2 border-ink">
      {/* A-2: スマホで px-4 py-3、PCで px-6 py-[14px] */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 sm:px-6 sm:py-[14px] flex items-center justify-between">
        <div className="font-mono font-bold tracking-tight flex items-center gap-[10px]">
          <span
            aria-hidden="true"
            className="w-[30px] h-[30px] bg-yellow border-2 border-ink rounded-lg inline-flex items-center justify-center text-[13px] font-bold flex-shrink-0"
            style={{ transform: 'rotate(-5deg)' }}
          >
            T7
          </span>
          {/* A-2: スマホでロゴテキスト非表示 */}
          <span className="hidden sm:inline text-lg">TC7診断</span>
        </div>
        {/* A-2: スマホでCTAを縮小 */}
        <Link
          href="/quiz"
          aria-label="診断をはじめる"
          className="font-display font-bold text-xs sm:text-sm bg-ink text-paper px-4 py-2 sm:px-[18px] sm:py-[10px] rounded-full hover:-translate-y-[2px] transition-all duration-150"
        >
          診断する →
        </Link>
      </div>
    </nav>
  );
}
