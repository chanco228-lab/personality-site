import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import rawQuestions from '@/data/questions';
import { personalityTypes } from '@/data/types';

const ALLOWED_KEYS = [
  'typeId',
  'answers',
  'scores',
  'extroversion',
  'impulsivity',
  'sdLevel',
  'coLevel',
  'stScore',
  'referrer',
] as const;

const SCORE_KEYS = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'] as const;
const LEVELS = ['high', 'mid', 'low'] as const;
const MAX_REFERRER_LENGTH = 2048;
const VALID_TYPE_IDS = new Set(personalityTypes.map((type) => type.id));
const VALID_QUESTION_IDS = new Set(rawQuestions.map((question) => String(question.id)));
const MAX_ANSWERS = rawQuestions.length;

type SaveResultBody = {
  typeId: string;
  answers: Record<string, number>;
  scores: Record<(typeof SCORE_KEYS)[number], number>;
  extroversion: number;
  impulsivity: number;
  sdLevel: (typeof LEVELS)[number];
  coLevel: (typeof LEVELS)[number];
  stScore: number;
  referrer?: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(obj: Record<string, unknown>, allowedKeys: readonly string[]) {
  return Object.keys(obj).every((key) => allowedKeys.includes(key));
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function validateSaveResultBody(body: unknown): SaveResultBody | null {
  if (!isPlainObject(body) || !hasOnlyKeys(body, ALLOWED_KEYS)) return null;
  if (typeof body.typeId !== 'string' || !VALID_TYPE_IDS.has(body.typeId)) return null;
  if (!LEVELS.includes(body.sdLevel as (typeof LEVELS)[number])) return null;
  if (!LEVELS.includes(body.coLevel as (typeof LEVELS)[number])) return null;
  if (!isIntegerInRange(body.extroversion, 0, 100)) return null;
  if (!isIntegerInRange(body.impulsivity, 0, 100)) return null;
  if (!isIntegerInRange(body.stScore, -9, 9)) return null;
  if (!(body.referrer == null || (typeof body.referrer === 'string' && body.referrer.length <= MAX_REFERRER_LENGTH))) {
    return null;
  }

  if (!isPlainObject(body.answers)) return null;
  const answerEntries = Object.entries(body.answers);
  if (answerEntries.length === 0 || answerEntries.length > MAX_ANSWERS) return null;
  for (const [questionId, answer] of answerEntries) {
    if (!VALID_QUESTION_IDS.has(questionId)) return null;
    if (!isIntegerInRange(answer, -3, 3)) return null;
  }

  if (!isPlainObject(body.scores)) return null;
  const scoreKeys = Object.keys(body.scores);
  if (scoreKeys.length !== SCORE_KEYS.length) return null;
  if (!scoreKeys.every((key) => SCORE_KEYS.includes(key as (typeof SCORE_KEYS)[number]))) return null;
  for (const key of SCORE_KEYS) {
    if (!isIntegerInRange(body.scores[key], -9, 9)) return null;
  }

  return {
    typeId: body.typeId,
    answers: body.answers as SaveResultBody['answers'],
    scores: body.scores as SaveResultBody['scores'],
    extroversion: body.extroversion,
    impulsivity: body.impulsivity,
    sdLevel: body.sdLevel as SaveResultBody['sdLevel'],
    coLevel: body.coLevel as SaveResultBody['coLevel'],
    stScore: body.stScore,
    referrer: body.referrer ?? null,
  };
}

export async function POST(req: NextRequest) {
  const body = validateSaveResultBody(await req.json());

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

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
