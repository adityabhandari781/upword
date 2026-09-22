import { allowedGuesses, answerWords } from './words.js';
import { createRound, submitGuess } from './game.js';
import { claimUsername, getCurrentProfile } from './profile.js';
import { getLeaderboard, leaderboardEmptyMessage } from './leaderboard.js';
import { awardXp, getMyProgress } from './xp.js';
import { levelFromXp } from './progression.js';
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
const profileAction = document.querySelector('#profile-action');
const profileDialog = document.querySelector('#profile-dialog');
const profileForm = document.querySelector('#profile-form');
const profileInput = document.querySelector('#username');
const profileStatus = document.querySelector('#profile-status');
const profileCancel = document.querySelector('#profile-cancel');
const profileSubmit = document.querySelector('#profile-submit');
const primaryNav = document.querySelector('.primary-nav');
const playView = document.querySelector('#play-view');
const leaderboardsView = document.querySelector('#leaderboards-view');
const profileView = document.querySelector('#profile-view');
const navigationLinks = document.querySelectorAll('[data-view-link]');
const leaderboardStatus = document.querySelector('#leaderboard-status');
const leaderboardList = document.querySelector('#leaderboard-list');
const profileViewStatus = document.querySelector('#profile-view-status');
const profileStats = document.querySelector('#profile-stats');
const profileUsername = document.querySelector('#profile-username');
const profileLevel = document.querySelector('#profile-level');
const profileTotalXp = document.querySelector('#profile-total-xp');

const settings = {
  revealDirection: 'bottom-up',
  letterCase: 'uppercase',
  fontMode: 'times-new-roman',
  theme: 'dark',
};

let round;
let roundId;
let displayWord;
let profile;

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

function showProfileStatus(message) {
  profileStatus.textContent = message;
}

function showProfileAction() {
  const isSignedIn = Boolean(profile);
  primaryNav.hidden = !isSignedIn;
  profileAction.textContent = isSignedIn ? 'Profile' : 'Log in to level up';
  profileAction.title = isSignedIn ? `View ${profile.username}'s profile` : '';
  if (isSignedIn) {
    profileAction.removeAttribute('aria-haspopup');
    profileAction.removeAttribute('aria-controls');
  } else {
    profileAction.setAttribute('aria-haspopup', 'dialog');
    profileAction.setAttribute('aria-controls', 'profile-dialog');
  }
}

async function restoreProfile() {
  profile = await getCurrentProfile();
  showProfileAction();
  showView();
}

function currentView() {
  const view = location.hash.slice(1);
  return ['leaderboards', 'profile'].includes(view) ? view : 'play';
}

function setNavigationState(view) {
  navigationLinks.forEach((link) => {
    if (link.dataset.viewLink === view) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  if (view === 'profile') {
    profileAction.setAttribute('aria-current', 'page');
  } else {
    profileAction.removeAttribute('aria-current');
  }
}

function renderLeaderboard(entries) {
  leaderboardList.replaceChildren();
  const emptyMessage = leaderboardEmptyMessage(entries);
  leaderboardStatus.hidden = !emptyMessage;
  leaderboardStatus.textContent = emptyMessage ?? '';
  if (emptyMessage) return;

  entries.forEach((entry) => {
    const item = document.createElement('li');
    const player = document.createElement('span');
    const rank = document.createElement('span');
    const name = document.createElement('span');
    const score = document.createElement('span');
    player.className = 'leaderboard-player';
    rank.className = 'leaderboard-rank';
    rank.textContent = `#${entry.rank}`;
    name.textContent = `${entry.username} · Level ${entry.level}`;
    score.className = 'leaderboard-xp';
    score.textContent = `${entry.total_xp} XP`;
    player.append(rank, name);
    item.append(player, score);
    leaderboardList.append(item);
  });
}

async function loadLeaderboard() {
  leaderboardStatus.textContent = 'Loading leaderboard…';
  leaderboardStatus.hidden = false;
  renderLeaderboard(await getLeaderboard());
}

async function loadProfileProgress() {
  profileStats.hidden = true;
  profileViewStatus.textContent = 'Loading profile…';
  const progress = await getMyProgress();
  if (!progress) {
    profileViewStatus.textContent = 'Your progression is unavailable right now.';
    return;
  }

  profileUsername.textContent = progress.username;
  profileLevel.textContent = progress.level;
  profileTotalXp.textContent = `${progress.total_xp} XP`;
  profileViewStatus.textContent = '';
  profileStats.hidden = false;
}

function showView() {
  const requestedView = currentView();
  const view = requestedView === 'profile' && !profile ? 'play' : requestedView;
  playView.hidden = view !== 'play';
  leaderboardsView.hidden = view !== 'leaderboards';
  profileView.hidden = view !== 'profile';
  setNavigationState(view);

  if (view === 'leaderboards') loadLeaderboard();
  if (view === 'profile') loadProfileProgress();
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
    wrongGuessLimit: settings.revealDirection === 'ends-to-center' ? 3 : undefined,
  });
  roundId = crypto.randomUUID();
  setStatus(settings.revealDirection === 'top-down'
    ? 'The top row is your first clue.'
    : settings.revealDirection === 'ends-to-center'
      ? 'The top and bottom rows are your first clues.'
      : 'The bottom row is your first clue. (Hint: it is 5 letters long)');
  input.value = '';
  showRound();
  input.focus();
}

function syncSettingsForm() {
  settingsForm.querySelector(`[name="reveal-direction"][value="${settings.revealDirection}"]`).checked = true;
  settingsForm.querySelector(`[name="letter-case"][value="${settings.letterCase}"]`).checked = true;
  settingsForm.querySelector(`[name="font-mode"][value="${settings.fontMode}"]`).checked = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const result = submitGuess(round, input.value, allowedGuesses);
  round = result.state;

  if (result.outcome === 'invalid') {
    setStatus(result.reason === 'length'
      ? 'It should be a 5-letter word.'
      : 'That is not an allowed dictionary word.');
    input.select();
    return;
  }

  if (result.outcome === 'correct') {
    setStatus('Correct! You found the hidden word!', true);
  } else if (result.outcome === 'lost') {
    setStatus('The full word is now revealed.');
  } else if (result.reason === 'length') {
    setStatus('It should be a 5-letter word.');
  } else {
    setStatus(settings.revealDirection === 'ends-to-center'
      ? 'Not quite. The next outer rows are visible.'
      : 'Not quite. One more row is visible.');
  }

  input.value = '';
  showRound();

  if (round.status !== 'playing') {
    newRoundButton.focus();
  } else {
    input.focus();
  }

  if (result.outcome !== 'correct') return;

  const completedRoundId = roundId;
  const award = await awardXp({
    roundId: completedRoundId,
    revealDirection: settings.revealDirection,
    wrongGuesses: round.wrongGuesses,
  });
  if (award.ok && roundId === completedRoundId) {
    const previousLevel = levelFromXp(
      award.progress.total_xp - award.progress.awarded_xp,
    );
    const levelMessage = award.progress.level > previousLevel
      ? ` · Level ${award.progress.level}!`
      : '';
    setStatus(
      `Correct! +${award.progress.awarded_xp} XP${levelMessage}`,
      true,
    );
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

profileAction.addEventListener('click', () => {
  if (profile) {
    location.hash = 'profile';
    return;
  }
  profileForm.reset();
  showProfileStatus('');
  profileDialog.showModal();
  profileInput.focus();
});

profileCancel.addEventListener('click', () => profileDialog.close());
profileDialog.addEventListener('close', () => profileAction.focus());

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  profileSubmit.disabled = true;
  showProfileStatus('Creating your profile…');

  const result = await claimUsername(profileInput.value);
  profileSubmit.disabled = false;

  if (!result.ok) {
    showProfileStatus(result.reason === 'invalid'
      ? 'Choose 3–20 letters, numbers, or underscores.'
      : result.reason === 'taken'
        ? 'That username is already taken.'
        : 'Profiles are unavailable. You can still play without leveling up.');
    profileInput.focus();
    profileInput.select();
    return;
  }

  profile = result.profile;
  showProfileAction();
  profileDialog.close();
  setStatus(`Welcome, ${profile.username}! Wins can now earn XP.`);
});

window.addEventListener('hashchange', showView);

applyTheme();
showProfileAction();
showView();
restoreProfile();
startRound();
