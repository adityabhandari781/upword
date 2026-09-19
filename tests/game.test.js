import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createRound,
  maxWrongGuesses,
  submitGuess,
} from '../js/game.js';

const allowedGuesses = ['cabin', 'crane', 'caper'];

test('the wrong-guess limit is half the pixel height, rounded down', () => {
  assert.equal(maxWrongGuesses(7), 3);
  assert.equal(maxWrongGuesses(8), 4);
});

test('a round starts with one visible row and no attempts used', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  assert.deepEqual(round, {
    answer: 'cabin',
    pixelHeight: 7,
    maxWrongGuesses: 3,
    wrongGuesses: 0,
    revealedRows: 1,
    status: 'playing',
  });
});

test('invalid guesses do not consume an attempt or reveal a row', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, 'not-in-list');

  assert.equal(result.outcome, 'invalid');
  assert.deepEqual(result.state, round);
});

test('empty and non-alphabetic guesses are invalid', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  assert.equal(submitGuess(round, '').outcome, 'invalid');
  assert.equal(submitGuess(round, 'crane!').outcome, 'invalid');
});

test('valid wrong guesses reveal one row and consume one attempt', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, 'crane');

  assert.equal(result.outcome, 'wrong');
  assert.equal(result.state.wrongGuesses, 1);
  assert.equal(result.state.revealedRows, 2);
  assert.equal(result.state.status, 'playing');
});

test('the correct guess wins without revealing another row', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, ' CABIN ');

  assert.equal(result.outcome, 'correct');
  assert.equal(result.state.status, 'won');
  assert.equal(result.state.wrongGuesses, 0);
  assert.equal(result.state.revealedRows, 1);
});

test('the half-height wrong guess loses without revealing more than the limit', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const first = submitGuess(round, 'crane');
  const second = submitGuess(first.state, 'caper');
  const third = submitGuess(second.state, 'crane');

  assert.equal(third.outcome, 'lost');
  assert.equal(third.state.status, 'lost');
  assert.equal(third.state.wrongGuesses, 3);
  assert.equal(third.state.revealedRows, 4);
});
