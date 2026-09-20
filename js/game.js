export function maxWrongGuesses(pixelHeight) {
  return Math.floor(pixelHeight / 2);
}

export function createRound({ answer, pixelHeight, wrongGuessLimit = maxWrongGuesses(pixelHeight) }) {
  return {
    answer,
    pixelHeight,
    maxWrongGuesses: wrongGuessLimit,
    wrongGuesses: 0,
    revealedRows: 1,
    status: 'playing',
  };
}

export function normalizeGuess(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function submitGuess(round, rawGuess, allowedGuesses) {
  if (round.status !== 'playing') {
    return { outcome: 'finished', state: round };
  }

  const guess = normalizeGuess(rawGuess);
  if (!/^[a-z]+$/.test(guess) || !allowedGuesses.includes(guess)) {
    return { outcome: 'invalid', state: round };
  }

  if (guess === round.answer) {
    return {
      outcome: 'correct',
      state: { ...round, revealedRows: round.pixelHeight, status: 'won' },
    };
  }

  const wrongGuesses = round.wrongGuesses + 1;
  const isLost = wrongGuesses >= round.maxWrongGuesses;
  return {
    outcome: isLost ? 'lost' : 'wrong',
    state: {
      ...round,
      wrongGuesses,
      revealedRows: isLost
        ? round.pixelHeight
        : Math.min(round.revealedRows + 1, round.maxWrongGuesses + 1),
      status: isLost ? 'lost' : 'playing',
    },
  };
}
