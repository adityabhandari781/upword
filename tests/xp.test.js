import assert from 'node:assert/strict';
import { test } from 'node:test';
import { awardXp } from '../js/xp.js';

test('does not award XP when Supabase is unavailable', async () => {
  assert.deepEqual(await awardXp({
    roundId: '00000000-0000-0000-0000-000000000101',
    revealDirection: 'bottom-up',
    wrongGuesses: 0,
  }), { ok: false, reason: 'unavailable' });
});
