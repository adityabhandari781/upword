import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  claimUsername,
  getCurrentProfile,
  normalizeUsername,
  validateUsername,
} from '../js/profile.js';

test('normalizes a username for storage', () => {
  assert.equal(normalizeUsername('  Player_One  '), 'player_one');
});

test('accepts the username boundary lengths', () => {
  assert.equal(validateUsername('abc').valid, true);
  assert.equal(validateUsername('a'.repeat(20)).valid, true);
});

test('rejects empty, short, long, and unsupported usernames', () => {
  assert.equal(validateUsername('').reason, 'invalid');
  assert.equal(validateUsername('ab').reason, 'invalid');
  assert.equal(validateUsername('a'.repeat(21)).reason, 'invalid');
  assert.equal(validateUsername('player-name').reason, 'invalid');
  assert.equal(validateUsername('player name').reason, 'invalid');
});

test('normalizes uppercase input before validation', () => {
  const result = validateUsername('Player_One');

  assert.deepEqual(result, { valid: true, value: 'player_one' });
});

test('treats an unconfigured browser as signed out', async () => {
  assert.equal(await getCurrentProfile(), null);
});

test('rejects invalid usernames without trying to create a profile', async () => {
  assert.deepEqual(await claimUsername('no spaces'), {
    ok: false,
    reason: 'invalid',
  });
});
