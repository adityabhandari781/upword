import { getSupabase } from './supabase.js';
import { getCurrentSession } from './auth.js';

export async function awardXp({ roundId, revealDirection, wrongGuesses }) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unavailable' };

  if (!await getCurrentSession()) return { ok: false, reason: 'unavailable' };

  try {
    const { data, error } = await supabase
      .rpc('award_xp', {
        p_round_id: roundId,
        p_reveal_direction: revealDirection,
        p_wrong_guesses: wrongGuesses,
      })
      .single();
    return error || !data ? { ok: false, reason: 'unavailable' } : { ok: true, progress: data };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function getMyProgress() {
  const supabase = getSupabase();
  if (!supabase || !await getCurrentSession()) return null;

  try {
    const { data, error } = await supabase.rpc('get_my_progress').single();
    return error || !data ? null : data;
  } catch {
    return null;
  }
}
