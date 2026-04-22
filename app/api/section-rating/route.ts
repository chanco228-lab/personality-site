import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { personalityTypes } from '@/data/types';

const ALLOWED_KEYS = ['sessionId', 'typeId', 'section', 'rating', 'resultId'] as const;
const ALLOWED_SECTIONS = ['insights', 'about', 'loss', 'relationships'] as const;
const ALLOWED_RATINGS = ['up', 'down'] as const;
const VALID_TYPE_IDS = new Set(personalityTypes.map((type) => type.id));
const UUID_LIKE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SectionRatingBody = {
  sessionId: string;
  typeId: string;
  section: (typeof ALLOWED_SECTIONS)[number];
  rating: (typeof ALLOWED_RATINGS)[number];
  resultId?: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(obj: Record<string, unknown>, allowedKeys: readonly string[]) {
  return Object.keys(obj).every((key) => allowedKeys.includes(key));
}

function isUuidLike(value: unknown): value is string {
  return typeof value === 'string' && UUID_LIKE_RE.test(value);
}

function validateSectionRatingBody(body: unknown): SectionRatingBody | null {
  if (!isPlainObject(body) || !hasOnlyKeys(body, ALLOWED_KEYS)) return null;
  if (!isUuidLike(body.sessionId)) return null;
  if (body.resultId != null && !isUuidLike(body.resultId)) return null;
  if (typeof body.typeId !== 'string' || !VALID_TYPE_IDS.has(body.typeId)) return null;
  if (!ALLOWED_SECTIONS.includes(body.section as (typeof ALLOWED_SECTIONS)[number])) return null;
  if (!ALLOWED_RATINGS.includes(body.rating as (typeof ALLOWED_RATINGS)[number])) return null;

  return {
    sessionId: body.sessionId,
    typeId: body.typeId,
    section: body.section as SectionRatingBody['section'],
    rating: body.rating as SectionRatingBody['rating'],
    resultId: body.resultId ?? null,
  };
}

export async function POST(req: NextRequest) {
  const body = validateSectionRatingBody(await req.json());

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

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
