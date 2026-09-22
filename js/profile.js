import { ensureAnonymousSession, getCurrentSession } from './auth.js';
import { getSupabase } from './supabase.js';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateUsername(value) {
  const normalized = normalizeUsername(value);
  return USERNAME_PATTERN.test(normalized)
    ? { valid: true, value: normalized }
    : { valid: false, reason: 'invalid' };
}

function profileFromRow(row) {
  return {
    username: row.username,
    createdAt: row.created_at,
  };
}

export async function getCurrentProfile() {
  const supabase = getSupabase();
  const session = await getCurrentSession();
  if (!supabase || !session?.user?.id) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, created_at')
      .eq('user_id', session.user.id)
      .maybeSingle();
    return error || !data ? null : profileFromRow(data);
  } catch {
    return null;
  }
}

export async function claimUsername(rawUsername) {
  const validation = validateUsername(rawUsername);
  if (!validation.valid) return { ok: false, reason: validation.reason };

  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unavailable' };

  const { session, reason } = await ensureAnonymousSession();
  if (!session?.user?.id) return { ok: false, reason: reason ?? 'unavailable' };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: session.user.id, username: validation.value })
      .select('username, created_at')
      .single();

    if (error) {
      return {
        ok: false,
        reason: error.code === '23505' ? 'taken' : 'unavailable',
      };
    }

    return { ok: true, profile: profileFromRow(data) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
