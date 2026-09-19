// Original Wordle-style lists, vendored from
// https://github.com/deedy/wordle-solver/tree/main/data
async function loadWordList(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load word list: ${path}`);
  }

  return (await response.text()).trim().split('\n');
}

export const [answerWords, allowedGuesses] = await Promise.all([
  loadWordList('./data/answer-words.txt'),
  loadWordList('./data/allowed-guesses.txt'),
]);
