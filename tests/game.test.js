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

test('a round can use a game-mode-specific wrong-guess limit', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 8,
    wrongGuessLimit: 2,
  });

  const first = submitGuess(round, 'crane', allowedGuesses);
  const second = submitGuess(first.state, 'caper', allowedGuesses);

  assert.equal(round.maxWrongGuesses, 2);
  assert.equal(first.outcome, 'wrong');
  assert.equal(second.outcome, 'lost');
  assert.equal(second.state.revealedRows, 8);
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

  const result = submitGuess(round, 'not-in-list', allowedGuesses);

  assert.equal(result.outcome, 'invalid');
  assert.deepEqual(result.state, round);
});

test('validates guesses against the supplied dictionary', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
  });

  const result = submitGuess(round, 'crane', ['cabin']);

  assert.equal(result.outcome, 'invalid');
});

test('empty guesses reveal one row and consume one attempt', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, '   ', allowedGuesses);

  assert.equal(result.outcome, 'wrong');
  assert.equal(result.reason, 'length');
  assert.equal(result.state.wrongGuesses, 1);
  assert.equal(result.state.revealedRows, 2);
  assert.equal(result.state.status, 'playing');
});

test('non-five-letter guesses are rejected without consuming an attempt', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, 'four', allowedGuesses);

  assert.equal(result.outcome, 'invalid');
  assert.equal(result.reason, 'length');
  assert.deepEqual(result.state, round);
});

test('an empty guess at the final attempt loses and reveals the full word', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    wrongGuessLimit: 1,
  });

  const result = submitGuess(round, '', allowedGuesses);

  assert.equal(result.outcome, 'lost');
  assert.equal(result.state.wrongGuesses, 1);
  assert.equal(result.state.revealedRows, 7);
  assert.equal(result.state.status, 'lost');
});

test('non-alphabetic guesses remain invalid', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  assert.equal(submitGuess(round, 'crane!', allowedGuesses).outcome, 'invalid');
});

test('valid wrong guesses reveal one row and consume one attempt', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, 'crane', allowedGuesses);

  assert.equal(result.outcome, 'wrong');
  assert.equal(result.state.wrongGuesses, 1);
  assert.equal(result.state.revealedRows, 2);
  assert.equal(result.state.status, 'playing');
});

test('the correct guess wins and reveals the full pixel word', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const result = submitGuess(round, ' CABIN ', allowedGuesses);

  assert.equal(result.outcome, 'correct');
  assert.equal(result.state.status, 'won');
  assert.equal(result.state.wrongGuesses, 0);
  assert.equal(result.state.revealedRows, 7);
});

test('the half-height wrong guess loses and reveals the full pixel word', () => {
  const round = createRound({
    answer: 'cabin',
    pixelHeight: 7,
    allowedGuesses,
  });

  const first = submitGuess(round, 'crane', allowedGuesses);
  const second = submitGuess(first.state, 'caper', allowedGuesses);
  const third = submitGuess(second.state, 'crane', allowedGuesses);

  assert.equal(third.outcome, 'lost');
  assert.equal(third.state.status, 'lost');
  assert.equal(third.state.wrongGuesses, 3);
  assert.equal(third.state.revealedRows, 7);
});
