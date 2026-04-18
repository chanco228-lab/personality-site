import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '7');
  const version = req.nextUrl.searchParams.get('version') ?? 'v2';
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  if (version === 'v3') {
    return getV3Stats(since, days);
  }
  return getV2Stats(since, days);
}

async function getV2Stats(since: string, days: number) {
  const { data: logs, error } = await supabaseAdmin
    .from('logs')
    .select('event_name, step, value, created_at')
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
  const step1Count = logs.filter((l) => l.event_name === 'quiz_step' && l.step === 1).length;

  const stepCounts: Record<string, number> = {};
  const stepValueMap: Record<string, number[]> = {};
  logs
    .filter((l) => l.event_name === 'quiz_step' && l.step != null)
    .forEach((l) => {
      const key = String(l.step);
      stepCounts[key] = (stepCounts[key] ?? 0) + 1;
      if (l.value != null) {
        if (!stepValueMap[key]) stepValueMap[key] = [];
        stepValueMap[key].push(l.value);
      }
    });

  const stepAvgScores: Record<string, number> = {};
  Object.entries(stepValueMap).forEach(([step, values]) => {
    stepAvgScores[step] =
      Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
  });

  const { data: feedbackRows } = await supabaseAdmin
    .from('feedback_v2')
    .select('score')
    .gte('created_at', since);

  const feedbackCount = feedbackRows?.length ?? 0;
  const feedbackAvg =
    feedbackCount > 0
      ? Math.round(
          (feedbackRows!.reduce((sum, r) => sum + (r.score ?? 0), 0) / feedbackCount) * 10
        ) / 10
      : 0;
  const feedbackDist: Record<string, number> = {};
  feedbackRows?.forEach((r) => {
    const key = String(r.score);
    feedbackDist[key] = (feedbackDist[key] ?? 0) + 1;
  });

  const { data: resultRows } = await supabaseAdmin
    .from('results_v2')
    .select('type_id, ns_score, ha_score, rd_score, p_score, sd_score, co_score, st_score, introvert_score')
    .gte('created_at', since);

  const typeCounts: Record<string, number> = {};
  resultRows?.forEach((r) => {
    typeCounts[r.type_id] = (typeCounts[r.type_id] ?? 0) + 1;
  });
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([typeId, count]) => ({ typeId, count }));

  const factorAvgScores: Record<string, number> = {};
  if (resultRows && resultRows.length > 0) {
    const factorKeys = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'] as const;
    const colMap: Record<string, string> = {
      NS: 'ns_score', HA: 'ha_score', RD: 'rd_score', P: 'p_score',
      SD: 'sd_score', CO: 'co_score', ST: 'st_score',
    };
    for (const f of factorKeys) {
      const col = colMap[f];
      const vals = resultRows.map((r) => (r as Record<string, unknown>)[col]).filter((v) => v != null) as number[];
      factorAvgScores[f] = vals.length > 0
        ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
        : 0;
    }
  }

  const introvertVals = resultRows?.map((r) => r.introvert_score).filter((v) => v != null) as number[] ?? [];
  const introvertAvg = introvertVals.length > 0
    ? Math.round(introvertVals.reduce((s, v) => s + v, 0) / introvertVals.length)
    : 0;

  const JST = 9 * 60 * 60 * 1000;
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000 + JST);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  logs
    .filter((l) => l.event_name === 'quiz_start')
    .forEach((l) => {
      const key = new Date(new Date(l.created_at as string).getTime() + JST)
        .toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key]++;
    });
  const dailyStarts = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    starts, completes, emails, emailFormViewed, xShared, lineShared,
    step1Count, stepCounts, stepAvgScores,
    feedbackCount, feedbackAvg, feedbackDist,
    topTypes, factorAvgScores, introvertAvg,
    dailyStarts,
  });
}

async function getV3Stats(since: string, days: number) {
  const { data: logs, error } = await supabaseAdmin
    .from('logs')
    .select('event_name, step, value, created_at')
    .gte('created_at', since);

  if (error || !logs) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  const starts = logs.filter((l) => l.event_name === 'quiz_v3_start').length;
  const completes = logs.filter((l) => l.event_name === 'quiz_v3_complete').length;
  const emails = logs.filter((l) => l.event_name === 'email_registered').length;
  const noteClicked = logs.filter((l) => l.event_name === 'note_clicked').length;
  const xShared = logs.filter((l) => l.event_name === 'x_shared').length;
  const lineShared = logs.filter((l) => l.event_name === 'line_shared').length;
  const step1Count = logs.filter((l) => l.event_name === 'quiz_v3_step' && l.step === 1).length;

  const v3Steps = logs.filter((l) => l.event_name === 'quiz_v3_step' && l.step != null);
  const neutralSteps = v3Steps.filter((l) => l.value === 0).length;
  const neutralRate = v3Steps.length > 0
    ? Math.round((neutralSteps / v3Steps.length) * 1000) / 10
    : 0;

  const stepCounts: Record<string, number> = {};
  const stepValueMap: Record<string, number[]> = {};
  v3Steps.forEach((l) => {
    const key = String(l.step);
    stepCounts[key] = (stepCounts[key] ?? 0) + 1;
    if (l.value != null) {
      if (!stepValueMap[key]) stepValueMap[key] = [];
      stepValueMap[key].push(l.value);
    }
  });

  const stepAvgScores: Record<string, number> = {};
  Object.entries(stepValueMap).forEach(([step, values]) => {
    stepAvgScores[step] =
      Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
  });

  const { data: feedbackRows } = await supabaseAdmin
    .from('feedback_v3')
    .select('rating')
    .gte('created_at', since);

  const feedbackCount = feedbackRows?.length ?? 0;
  const feedbackAvg =
    feedbackCount > 0
      ? Math.round(
          (feedbackRows!.reduce((sum, r) => sum + (r.rating ?? 0), 0) / feedbackCount) * 10
        ) / 10
      : 0;
  const feedbackDist: Record<string, number> = {};
  feedbackRows?.forEach((r) => {
    const key = String(r.rating);
    feedbackDist[key] = (feedbackDist[key] ?? 0) + 1;
  });

  const { data: resultRows } = await supabaseAdmin
    .from('results_v3')
    .select('type_id, scores, extroversion, impulsivity')
    .gte('created_at', since);

  const typeCounts: Record<string, number> = {};
  resultRows?.forEach((r) => {
    typeCounts[r.type_id] = (typeCounts[r.type_id] ?? 0) + 1;
  });
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([typeId, count]) => ({ typeId, count }));

  const factorAvgScores: Record<string, number> = {};
  if (resultRows && resultRows.length > 0) {
    const factorKeys = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'] as const;
    for (const f of factorKeys) {
      const vals = resultRows
        .map((r) => (r.scores as Record<string, number>)?.[f])
        .filter((v) => v != null) as number[];
      factorAvgScores[f] = vals.length > 0
        ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
        : 0;
    }
  }

  const extroversionVals = resultRows?.map((r) => r.extroversion).filter((v) => v != null) as number[] ?? [];
  const introvertAvg = extroversionVals.length > 0
    ? Math.round(extroversionVals.reduce((s, v) => s + v, 0) / extroversionVals.length)
    : 0;

  const impulsivityVals = resultRows?.map((r) => r.impulsivity).filter((v) => v != null) as number[] ?? [];
  const impulsivityAvg = impulsivityVals.length > 0
    ? Math.round(impulsivityVals.reduce((s, v) => s + v, 0) / impulsivityVals.length)
    : 0;

  const JST = 9 * 60 * 60 * 1000;
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000 + JST);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  logs
    .filter((l) => l.event_name === 'quiz_v3_start')
    .forEach((l) => {
      const key = new Date(new Date(l.created_at as string).getTime() + JST)
        .toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key]++;
    });
  const dailyStarts = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // emailFormViewed is v2-only; use noteClicked as the v3 equivalent conversion metric
  return NextResponse.json({
    starts, completes, emails, emailFormViewed: 0, xShared, lineShared,
    step1Count, stepCounts, stepAvgScores,
    feedbackCount, feedbackAvg, feedbackDist,
    topTypes, factorAvgScores, introvertAvg,
    dailyStarts,
    // v3-only fields
    neutralRate, noteClicked, impulsivityAvg,
  });
}
