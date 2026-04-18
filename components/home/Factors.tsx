const factors = [
  { code: 'NS', name: '新規性探求', desc: '新しいもの好き／刺激を求める傾向', badgeCls: 'bg-coral text-paper' },
  { code: 'HA', name: '損害回避',   desc: '慎重さ／不安を感じやすさ',         badgeCls: 'bg-lav text-ink' },
  { code: 'RD', name: '報酬依存',   desc: '他者からの反応を重視する傾向',     badgeCls: 'bg-hpink text-ink' },
  { code: 'P',  name: '固執',       desc: '粘り強さ／諦めにくさ',             badgeCls: 'bg-yellow text-ink' },
  { code: 'SD', name: '自己志向',   desc: '自分の目標に向かう力',             badgeCls: 'bg-turq text-paper' },
  { code: 'CO', name: '協調性',     desc: '他者と合わせる柔軟さ',             badgeCls: 'bg-hgreen text-ink' },
  { code: 'ST', name: '自己超越性', desc: '没頭・一体感を感じる力',           badgeCls: 'bg-ink text-paper border-2 border-paper' },
];

export default function Factors() {
  return (
    <section className="relative z-10 px-6 py-6">
      {/* A-7: スマホで rounded-[20px] px-5 py-[36px] */}
      <div className="relative max-w-[1200px] mx-auto bg-ink text-paper rounded-[20px] md:rounded-[32px] px-5 md:px-12 py-[36px] md:py-16 overflow-hidden">
        {/* A-8: スマホで text-[80px]、PCで text-[180px] */}
        <div
          aria-hidden="true"
          className="absolute bottom-[-40px] right-[-20px] font-mono font-bold leading-none pointer-events-none select-none text-[80px] md:text-[180px]"
          style={{ opacity: 0.08, letterSpacing: '-0.05em' }}
        >
          7 FACTORS
        </div>

        <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3 text-yellow">
          <span aria-hidden="true" className="inline-block w-6 h-[2px] bg-yellow" />
          THE SCIENCE
        </div>
        <h2
          className="font-black tracking-[-0.03em] leading-[1.05] mb-4 max-w-[700px] text-paper"
          style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
        >
          あなたを形作る、<br />7つの因子。
        </h2>
        <p className="text-[17px] max-w-[600px] mb-12 leading-[1.7]" style={{ color: '#EFEAE0' }}>
          クロニンジャーのTCIモデルを独自に再構成。気質と性格の両面から人を捉えます。
        </p>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {factors.map((f) => (
            <div
              key={f.code}
              className="bg-paper text-ink rounded-[16px] p-5 border-2 border-paper transition-transform duration-200 hover:-translate-y-1"
            >
              <span className={`font-mono font-bold text-[12px] px-2 py-[3px] rounded-[6px] inline-block mb-[10px] ${f.badgeCls}`}>
                {f.code}
              </span>
              <div className="font-black text-[17px] mb-1 tracking-tight">{f.name}</div>
              <div className="text-[12px] leading-[1.5]" style={{ color: '#2A2A2A' }}>{f.desc}</div>
            </div>
          ))}
          {/* More card */}
          <div
            className="rounded-[16px] p-5 flex items-center justify-center"
            style={{ border: '2px dashed rgba(255,255,255,0.4)', color: '#EFEAE0' }}
          >
            <div className="text-center">
              <div className="font-mono text-[11px]" style={{ opacity: 0.7 }}>+ MORE</div>
              <div className="text-[13px] font-bold mt-1">相性・陰陽診断も</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
