import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('section_ratings')
    .select('type_id, section, rating');

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  // type_id × section ごとに集計
  const map: Record<string, { up: number; down: number }> = {};
  for (const row of data) {
    const key = `${row.type_id}::${row.section}`;
    if (!map[key]) map[key] = { up: 0, down: 0 };
    if (row.rating === 'up') map[key].up++;
    else map[key].down++;
  }

  const rows = Object.entries(map).map(([key, { up, down }]) => {
    const [type_id, section] = key.split('::');
    const total = up + down;
    const upRate = total > 0 ? Math.round((up / total) * 100) : null;
    return { type_id, section, up, down, total, upRate };
  });

  // セクション全体スコア
  const sections = ['insights', 'about', 'loss'] as const;
  const sectionTotals: Record<string, { up: number; down: number }> = {};
  for (const s of sections) sectionTotals[s] = { up: 0, down: 0 };
  for (const row of data) {
    if (sectionTotals[row.section]) {
      if (row.rating === 'up') sectionTotals[row.section].up++;
      else sectionTotals[row.section].down++;
    }
  }
  const sectionScores = sections.map((s) => {
    const { up, down } = sectionTotals[s];
    const total = up + down;
    return { section: s, up, down, total, upRate: total > 0 ? Math.round((up / total) * 100) : null };
  });

  // 低評価ランキング TOP20（👎数順）
  const lowRanking = [...rows]
    .sort((a, b) => b.down - a.down)
    .slice(0, 20);

  return NextResponse.json({ rows, sectionScores, lowRanking });
}
