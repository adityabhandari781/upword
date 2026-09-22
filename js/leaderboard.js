import { getSupabase } from './supabase.js';

export function leaderboardEmptyMessage(entries) {
  return entries.length === 0 ? 'No one has earned XP yet.' : null;
}

export async function getLeaderboard() {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: 50 });
    return error || !data ? [] : data;
  } catch {
    return [];
  }
}
