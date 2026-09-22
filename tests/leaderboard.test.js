import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLeaderboard } from '../js/leaderboard.js';

test('returns an empty leaderboard when Supabase is unavailable', async () => {
  assert.deepEqual(await getLeaderboard(), []);
});
