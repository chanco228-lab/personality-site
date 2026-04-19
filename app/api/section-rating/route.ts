import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { error } = await supabaseAdmin
    .from('section_ratings')
    .insert({
      session_id: body.sessionId,
      type_id:    body.typeId,
      section:    body.section,
      rating:     body.rating,
      result_id:  body.resultId ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
    });

  // unique制約違反（重複投票）は無視
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
