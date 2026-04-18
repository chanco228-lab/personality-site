export default function MarqueeBand() {
  const segment = (
    <span className="inline-flex items-center gap-[40px] pr-[40px]">
      <span className="text-yellow">●</span> 7 FACTORS{' '}
      <span className="text-yellow">●</span> 54 TYPES{' '}
      <span className="text-yellow">●</span> 21 QUESTIONS{' '}
      <span className="text-yellow">●</span> TCI BASED{' '}
      <span className="text-yellow">●</span> FREE{' '}
      <span className="text-yellow">●</span> 7 FACTORS{' '}
      <span className="text-yellow">●</span> 54 TYPES{' '}
      <span className="text-yellow">●</span> 21 QUESTIONS{' '}
      <span className="text-yellow">●</span> TCI BASED{' '}
      <span className="text-yellow">●</span> FREE{' '}
    </span>
  );

  return (
    // A-4: スマホで py-3、PCで py-[18px]
    <div className="relative z-10 bg-ink text-paper py-3 md:py-[18px] overflow-hidden border-t-2 border-b-2 border-ink">
      {/* A-4: スマホで text-[14px]、PCで text-[18px] */}
      <div
        className="flex whitespace-nowrap font-mono font-bold text-[14px] md:text-[18px] tracking-[0.05em]"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {segment}
        {segment}
      </div>
    </div>
  );
}
