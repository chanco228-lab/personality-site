const steps = [
  {
    num: 'STEP 01',
    icon: '📝',
    title: '21問に答える',
    desc: '日常の行動について、6段階で直感的に回答。所要時間は約3分。',
    numCls: 'bg-yellow text-ink',
    iconCls: 'bg-hpink',
  },
  {
    num: 'STEP 02',
    icon: '🧬',
    title: '7因子で分析',
    desc: '新規性探求・損害回避・報酬依存など、7つの軸であなたを測定。',
    numCls: 'bg-turq text-paper',
    iconCls: 'bg-lav',
  },
  {
    num: 'STEP 03',
    icon: '✨',
    title: '54タイプから判定',
    desc: '因子の組み合わせから導かれる、あなただけのタイプを提示。',
    numCls: 'bg-coral text-paper',
    iconCls: 'bg-hgreen',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-[56px] md:py-[100px]">
      <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3">
        <span aria-hidden="true" className="inline-block w-6 h-[2px] bg-ink" />
        HOW IT WORKS
      </div>
      <h2
        className="font-black tracking-[-0.03em] leading-[1.05] mb-4 max-w-[700px]"
        style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
      >
        3ステップで<br />あなたのタイプを発見。
      </h2>
      <p className="text-[17px] max-w-[600px] mb-12 leading-[1.7]" style={{ color: '#2A2A2A' }}>
        難しい設問はありません。直感で答えるだけで、あなたの内側が見えてきます。
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div
            key={s.num}
            className="bg-paper border-2 border-ink rounded-[20px] p-8 transition-transform duration-200 hover:-translate-y-[6px]"
            style={{ boxShadow: '6px 6px 0 #0E0E0E' }}
          >
            <span className={`font-mono text-[14px] font-bold inline-block px-[10px] py-1 border-2 border-ink rounded-lg mb-5 ${s.numCls}`}>
              {s.num}
            </span>
            <div
              className={`w-16 h-16 flex items-center justify-center border-2 border-ink rounded-[16px] mb-[18px] text-[32px] ${s.iconCls}`}
              aria-hidden="true"
            >
              {s.icon}
            </div>
            <div className="text-[22px] font-black mb-2 tracking-tight">{s.title}</div>
            <div className="text-[14px] leading-[1.6]" style={{ color: '#2A2A2A' }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
