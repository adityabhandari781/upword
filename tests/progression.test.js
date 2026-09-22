import assert from 'node:assert/strict';
import { test } from 'node:test';
import { levelFromXp, xpForWin } from '../js/progression.js';

test('awards more XP for more difficult reveal directions', () => {
  assert.equal(xpForWin('bottom-up', 0), 100);
  assert.equal(xpForWin('top-down', 0), 75);
  assert.equal(xpForWin('ends-to-center', 0), 50);
});

test('reduces win XP by 20 for each wrong guess without going below zero', () => {
  assert.equal(xpForWin('bottom-up', 2), 60);
  assert.equal(xpForWin('ends-to-center', 3), 0);
  assert.equal(xpForWin('bottom-up', 99), 0);
});

test('derives levels from each completed 500 XP', () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(499), 1);
  assert.equal(levelFromXp(500), 2);
  assert.equal(levelFromXp(1_000), 3);
});
