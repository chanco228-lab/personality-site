const stats = [
  { num: '800+', label: '診断実施数' },
  { num: '3.9', sub: '/5', label: '平均満足度' },
  { num: '54', label: 'パーソナリティタイプ' },
  { num: '¥0', label: '完全無料' },
];

export default function Stats() {
  return (
    // A-6: スマホで py-8 px-4、PCで py-12 px-6
    <div className="relative z-10 bg-yellow border-t-2 border-b-2 border-ink py-8 md:py-12 px-4 md:px-6">
      {/* A-6: スマホで gap-4 */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => (
          <div key={s.label}>
            {/* A-6: clamp下限を28pxに下げて窮屈感解消 */}
            <div
              className="font-mono font-bold tracking-[-0.03em] leading-none text-ink"
              style={{ fontSize: 'clamp(28px, 7vw, 56px)' }}
            >
              {s.num}
              {s.sub && <span style={{ fontSize: '0.5em', opacity: 0.7 }}>{s.sub}</span>}
            </div>
            <div className="text-[13px] font-bold mt-2 text-ink">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
