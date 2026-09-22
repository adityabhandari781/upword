import { getSupabase } from './supabase.js';

export async function getCurrentSession() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getSession();
    return error ? null : data.session ?? null;
  } catch {
    return null;
  }
}

export async function ensureAnonymousSession() {
  const existingSession = await getCurrentSession();
  if (existingSession) return { session: existingSession, reason: null };

  const supabase = getSupabase();
  if (!supabase) return { session: null, reason: 'unavailable' };

  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    return error || !data.session
      ? { session: null, reason: 'unavailable' }
      : { session: data.session, reason: null };
  } catch {
    return { session: null, reason: 'unavailable' };
  }
}
