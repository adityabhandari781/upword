import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLeaderboard, leaderboardEmptyMessage } from '../js/leaderboard.js';

test('returns an empty leaderboard when Supabase is unavailable', async () => {
  assert.deepEqual(await getLeaderboard(), []);
});

test('keeps a message only when no leaderboard entries exist', () => {
  assert.equal(leaderboardEmptyMessage([]), 'No one has earned XP yet.');
  assert.equal(leaderboardEmptyMessage([{ username: 'player_one' }]), null);
});
