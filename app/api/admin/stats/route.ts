import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '7');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: logs, error } = await supabaseAdmin
    .from('logs')
    .select('event_name, step')
    .gte('created_at', since);

  if (error || !logs) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  const starts = logs.filter((l) => l.event_name === 'quiz_start').length;
  const completes = logs.filter((l) => l.event_name === 'quiz_complete').length;
  const emails = logs.filter((l) => l.event_name === 'email_registered').length;
  const emailFormViewed = logs.filter((l) => l.event_name === 'email_form_viewed').length;
  const xShared = logs.filter((l) => l.event_name === 'x_shared').length;
  const lineShared = logs.filter((l) => l.event_name === 'line_shared').length;

  const stepCounts: Record<string, number> = {};
  logs
    .filter((l) => l.event_name === 'quiz_step' && l.step != null)
    .forEach((l) => {
      const key = String(l.step);
      stepCounts[key] = (stepCounts[key] ?? 0) + 1;
    });

  return NextResponse.json({ starts, completes, emails, emailFormViewed, xShared, lineShared, stepCounts });
}
