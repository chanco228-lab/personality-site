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
