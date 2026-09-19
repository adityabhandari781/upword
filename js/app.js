import { answerWords } from './words.js';
import { createRound, submitGuess } from './game.js';
import { drawPixelWord, wordDimensions } from './glyphs.js';

const canvas = document.querySelector('#word-canvas');
const context = canvas.getContext('2d');
const form = document.querySelector('#guess-form');
const input = document.querySelector('#guess');
const status = document.querySelector('#status');
const attempts = document.querySelector('#attempts');
const newRoundButton = document.querySelector('#new-round');

let round;

function chooseAnswer() {
  return answerWords[Math.floor(Math.random() * answerWords.length)];
}

function drawRound() {
  const dimensions = wordDimensions(round.answer);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  drawPixelWord(context, round.answer, round.revealedRows);
}

function showRound() {
  drawRound();
  attempts.textContent = `Wrong guesses: ${round.wrongGuesses} / ${round.maxWrongGuesses}`;
  input.disabled = round.status !== 'playing';
  form.hidden = round.status !== 'playing';
  newRoundButton.hidden = round.status === 'playing';
}

function startRound() {
  round = createRound({ answer: chooseAnswer(), pixelHeight: 7 });
  status.textContent = 'The bottom row is your first clue.';
  input.value = '';
  showRound();
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = submitGuess(round, input.value);
  round = result.state;

  if (result.outcome === 'invalid') {
    status.textContent = input.value.trim()
      ? 'That is not an allowed dictionary word.'
      : 'Enter a dictionary word to reveal a row.';
    input.select();
    return;
  }

  if (result.outcome === 'correct') {
    status.textContent = 'Correct — you found the hidden word.';
  } else if (result.outcome === 'lost') {
    status.textContent = 'The full word is now revealed.';
  } else {
    status.textContent = 'Not quite. One more row is visible.';
  }

  input.value = '';
  showRound();

  if (round.status !== 'playing') {
    newRoundButton.focus();
  }
});

newRoundButton.addEventListener('click', startRound);
startRound();
