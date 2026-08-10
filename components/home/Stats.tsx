import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const getDiagnosticCount = unstable_cache(
  async () => {
    const [{ count: v2 }, { count: v3 }] = await Promise.all([
      supabaseAdmin.from('results_v2').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('results_v3').select('*', { count: 'exact', head: true }),
    ]);
    return (v2 ?? 0) + (v3 ?? 0);
  },
  ['diagnostic-count'],
  { revalidate: 3600 }
);

export default async function Stats() {
  let count = 0;
  try {
    count = await getDiagnosticCount();
  } catch {
    // Supabase unavailable — show 0
  }

  const countDisplay = count > 0 ? count.toLocaleString('ja-JP') + '+' : '--';

  const stats = [
    { num: countDisplay, label: '診断実施数' },
    { num: '4.4', sub: '/5', label: '平均満足度' },
    { num: '54', label: 'パーソナリティタイプ' },
    { num: '¥0', label: '完全無料' },
  ];

  return (
    <div className="relative z-10 bg-yellow border-t-2 border-b-2 border-ink py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => (
          <div key={s.label}>
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
