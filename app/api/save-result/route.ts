import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('results_v3')
    .insert({
      type_id:    body.typeId,
      answers:    body.answers,
      scores:     body.scores,
      extroversion: body.extroversion,
      impulsivity:  body.impulsivity,
      sd_level:   body.sdLevel,
      co_level:   body.coLevel,
      st_score:   body.stScore,
      user_agent: req.headers.get('user-agent') ?? null,
      referrer:   body.referrer ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[save-result]', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
