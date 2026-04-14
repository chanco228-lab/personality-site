import { supabase } from './supabase';

const SESSION_KEY = 'personality_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function logEvent(eventName: string, step?: number) {
  supabase.from('logs').insert({
    session_id: getSessionId(),
    event_name: eventName,
    ...(step !== undefined ? { step } : {}),
  }).then();
}

export function deleteLogStep(step: number): Promise<void> {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) return Promise.resolve();
  return supabase
    .from('logs')
    .delete()
    .eq('session_id', sessionId)
    .eq('event_name', 'quiz_step')
    .eq('step', step)
    .then(() => {});
}
