import Link from 'next/link';

export default function Hero() {
  return (
    <header className="relative z-10 max-w-[1200px] mx-auto px-6 pt-[60px] pb-[80px]">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-[60px] items-center">
        {/* Left */}
        <div>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-paper border-2 border-ink rounded-full px-[14px] py-[6px] text-xs font-bold mb-5"
            style={{ boxShadow: '3px 3px 0 #0E0E0E' }}
          >
            <span
              aria-hidden="true"
              className="w-2 h-2 bg-coral rounded-full flex-shrink-0"
              style={{ animation: 'pulse-dot 1.5s infinite' }}
            />
            <span className="font-mono">v2.0 · 人生の道しるべ</span>
          </div>

          <h1
            className="font-black tracking-[-0.03em] mb-6"
            style={{ fontSize: 'clamp(26px, 8vw, 72px)', lineHeight: 1.1 }}
          >
            <span className="block">21問で分かる、</span>
            <span className="block">
              <span
                className="inline-block bg-yellow border-2 border-ink rounded-lg px-2 mb-1"
                style={{ transform: 'rotate(-2deg)', boxShadow: '4px 4px 0 #0E0E0E' }}
              >
                本当の
              </span>
              あなたの
            </span>
            <span className="block"><span className="text-coral">54タイプ</span>。</span>
          </h1>

          {/* Sub */}
          <p className="text-[15px] sm:text-[17px] font-medium max-w-[480px] mb-8 leading-[1.7]" style={{ color: '#2A2A2A' }}>
            7つの因子が作り出す、あなただけの性格パターン。クロニンジャーのTCIモデルをベースに、シンプルな21問で判定します。
          </p>

          {/* CTA */}
          <Link
            href="/quiz"
            aria-label="無料で診断をはじめる"
            className="hero-cta inline-flex items-center gap-[10px] font-display font-black bg-ink text-paper border-2 border-ink rounded-full px-6 py-[14px] sm:px-9 sm:py-[18px] text-[17px] sm:text-[20px]"
          >
            無料で診断をはじめる <span>→</span>
          </Link>

          {/* Meta — A-3: flex-wrap + スマホ用gap */}
          <div
            className="flex flex-wrap gap-x-[14px] gap-y-[10px] mt-[22px] text-[13px] font-bold"
            style={{ color: '#2A2A2A' }}
          >
            {['約3分', '登録不要', '完全無料'].map((item) => (
              <span key={item} className="inline-flex items-center gap-[6px]">
                <span className="text-turq font-black">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right — A-3: スマホでは非表示（900px未満） */}
        <div
          className="hidden min-[900px]:block relative w-full mx-auto mt-5 md:mt-0"
          style={{ aspectRatio: '1/1', maxWidth: 480 }}
        >
          <div
            className="absolute border-2 border-ink rounded-[20px] p-[18px] w-[200px] bg-yellow"
            style={{ top: '5%', left: 0, transform: 'rotate(-6deg)', zIndex: 2, boxShadow: '10px 10px 0 #0E0E0E' }}
          >
            <div className="font-mono text-[11px] font-bold mb-[6px]" style={{ opacity: 0.7 }}>hhh_f / TYPE 14</div>
            <div className="font-black text-[24px] tracking-tight mb-1">庇護者</div>
            <div className="text-[12px] font-medium leading-[1.4]">心配しながらも、それでも人のために動く</div>
          </div>
          <div
            className="absolute border-2 border-ink rounded-[20px] p-[18px] w-[200px] bg-turq text-paper"
            style={{ top: '30%', right: '-5%', transform: 'rotate(4deg)', zIndex: 3, boxShadow: '10px 10px 0 #0E0E0E' }}
          >
            <div className="font-mono text-[11px] font-bold mb-[6px]" style={{ opacity: 0.7 }}>hlh_p / TYPE 01</div>
            <div className="font-black text-[24px] tracking-tight mb-1">指揮官</div>
            <div className="text-[12px] font-medium leading-[1.4]">人を率いて最後まで突き進む</div>
          </div>
          <div
            className="absolute border-2 border-ink rounded-[20px] p-[18px] w-[200px] bg-coral text-paper"
            style={{ bottom: '5%', left: '15%', transform: 'rotate(-3deg)', zIndex: 1, boxShadow: '10px 10px 0 #0E0E0E' }}
          >
            <div className="font-mono text-[11px] font-bold mb-[6px]" style={{ opacity: 0.7 }}>lhl_f / TYPE 42</div>
            <div className="font-black text-[24px] tracking-tight mb-1">慎想家</div>
            <div className="text-[12px] font-medium leading-[1.4]">心配と疑念を抱えたまま深く思考する</div>
          </div>
        </div>
      </div>
    </header>
  );
}
