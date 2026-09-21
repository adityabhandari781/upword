import { allowedGuesses, answerWords } from './words.js';
import { createRound, submitGuess } from './game.js';
import {
  GLYPH_HEIGHT,
  createDisplayWord,
  drawComicSansWord,
  drawPixelWord,
  drawTimesNewRomanWord,
  wordDimensions,
} from './glyphs.js';

const canvas = document.querySelector('#word-canvas');
const context = canvas.getContext('2d');
const form = document.querySelector('#guess-form');
const input = document.querySelector('#guess');
const status = document.querySelector('#status');
const attempts = document.querySelector('#attempts');
const newRoundButton = document.querySelector('#new-round');
const settingsButton = document.querySelector('#settings-button');
const settingsDialog = document.querySelector('#settings-dialog');
const settingsForm = document.querySelector('#settings-form');
const settingsCancel = document.querySelector('#settings-cancel');
const themeToggle = document.querySelector('#theme-toggle');

const settings = {
  revealDirection: 'bottom-up',
  letterCase: 'uppercase',
  fontMode: 'times-new-roman',
  theme: 'dark',
};

let round;
let displayWord;

function setStatus(message, isCorrect = false) {
  status.textContent = message;
  status.classList.toggle('is-correct', isCorrect);
}

function applyTheme() {
  const isDark = settings.theme === 'dark';
  document.documentElement.dataset.theme = settings.theme;
  themeToggle.setAttribute('aria-label', isDark ? 'Enable light mode' : 'Enable dark mode');
  themeToggle.title = isDark ? 'Enable light mode' : 'Enable dark mode';
}

function chooseAnswer() {
  return answerWords[Math.floor(Math.random() * answerWords.length)];
}

function drawRound() {
  const dimensions = wordDimensions(round.answer);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const drawWord = settings.fontMode === 'times-new-roman'
    ? drawTimesNewRomanWord
    : settings.fontMode === 'comic-sans'
      ? drawComicSansWord
      : drawPixelWord;
  drawWord(context, displayWord, round.revealedRows, {
    revealDirection: settings.revealDirection,
  });
}

function showRound() {
  drawRound();
  attempts.textContent = `Wrong guesses: ${round.wrongGuesses} / ${round.maxWrongGuesses}`;
  input.disabled = round.status !== 'playing';
  form.hidden = round.status !== 'playing';
  newRoundButton.hidden = round.status === 'playing';
}

function startRound() {
  const answer = chooseAnswer();
  displayWord = createDisplayWord(answer, settings.letterCase);
  round = createRound({
    answer,
    pixelHeight: GLYPH_HEIGHT,
    wrongGuessLimit: settings.revealDirection === 'ends-to-center' ? 2 : undefined,
  });
  setStatus(settings.revealDirection === 'top-down'
    ? 'The top row is your first clue.'
    : settings.revealDirection === 'ends-to-center'
      ? 'The top and bottom rows are your first clues.'
      : 'The bottom row is your first clue.');
  input.value = '';
  showRound();
  input.focus();
}

function syncSettingsForm() {
  settingsForm.querySelector(`[name="reveal-direction"][value="${settings.revealDirection}"]`).checked = true;
  settingsForm.querySelector(`[name="letter-case"][value="${settings.letterCase}"]`).checked = true;
  settingsForm.querySelector(`[name="font-mode"][value="${settings.fontMode}"]`).checked = true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = submitGuess(round, input.value, allowedGuesses);
  round = result.state;

  if (result.outcome === 'invalid') {
    setStatus(input.value.trim()
      ? 'That is not an allowed dictionary word.'
      : 'Enter a dictionary word to reveal a row.');
    input.select();
    return;
  }

  if (result.outcome === 'correct') {
    setStatus('Correct! You found the hidden word!', true);
  } else if (result.outcome === 'lost') {
    setStatus('The full word is now revealed.');
  } else {
    setStatus(settings.revealDirection === 'ends-to-center'
      ? 'Not quite. The next outer rows are visible.'
      : 'Not quite. One more row is visible.');
  }

  input.value = '';
  showRound();

  if (round.status !== 'playing') {
    newRoundButton.focus();
  }
});

newRoundButton.addEventListener('click', startRound);
themeToggle.addEventListener('click', () => {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});
settingsButton.addEventListener('click', () => {
  syncSettingsForm();
  settingsDialog.showModal();
});

settingsCancel.addEventListener('click', () => settingsDialog.close());

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  settings.revealDirection = settingsForm.elements['reveal-direction'].value;
  settings.letterCase = settingsForm.elements['letter-case'].value;
  settings.fontMode = settingsForm.elements['font-mode'].value;
  settingsDialog.close();
  startRound();
});

applyTheme();
startRound();
