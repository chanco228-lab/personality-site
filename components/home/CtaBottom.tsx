import Link from 'next/link';

export default function CtaBottom() {
  return (
    // A-7: スマホで py-[56px]
    <section className="relative z-10 max-w-[1000px] mx-auto px-6 py-[56px] md:py-[100px] text-center">
      {/* A-7: スマホで rounded-[24px] px-6 py-[44px] */}
      <div
        className="relative bg-coral border-2 border-ink rounded-[24px] md:rounded-[32px] px-6 md:px-12 py-[44px] md:py-[72px] text-paper overflow-hidden"
        style={{ boxShadow: '10px 10px 0 #0E0E0E' }}
      >
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="absolute bg-yellow border-2 border-ink rounded-full"
          style={{ width: 160, height: 160, top: -30, left: -30, opacity: 0.9 }}
        />
        <div
          aria-hidden="true"
          className="absolute bg-turq border-2 border-ink rounded-full"
          style={{ width: 200, height: 200, bottom: -40, right: -40, opacity: 0.85 }}
        />

        <div className="relative z-10">
          <h2
            className="font-black tracking-[-0.03em] leading-[1.05] mb-4 text-paper"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
          >
            準備はいい？<br />3分で、自分を知ろう。
          </h2>
          <p className="text-[16px] mb-8 text-paper" style={{ opacity: 0.95 }}>
            登録不要・完全無料。すぐに結果が届きます。
          </p>
          <Link
            href="/quiz"
            aria-label="今すぐ診断する"
            className="hero-cta inline-flex items-center gap-[10px] font-display font-black bg-paper text-ink border-2 border-ink rounded-full px-9 py-[18px]"
            style={{ fontSize: '20px' }}
          >
            今すぐ診断する <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
