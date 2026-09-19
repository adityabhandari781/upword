# Height Wordle MVP Tasks

## Task 1: Create the tested game engine

**Description:** Add the fixed word lists and a pure module that creates a
round, validates a normalized guess, records valid wrong guesses, and reports
win/loss state from the bitmap height.

**Acceptance criteria:**

- [x] Only words in the allowed-guess list are accepted, and invalid input does
  not change the round.
- [x] Each valid wrong guess increases revealed rows and wrong attempts by one.
- [x] A correct guess wins; the `floor(pixelHeight / 2)`-th wrong guess loses.

**Verification:**

- [x] Tests pass: `node --test tests/game.test.js`.
- [x] Syntax check succeeds: `node --check js/game.js`.

**Dependencies:** None

**Files likely touched:**

- `package.json`
- `js/words.js`
- `js/game.js`
- `tests/game.test.js`

**Estimated scope:** Medium (3 files)

## Checkpoint: After Task 1

- [x] The rule suite passes.
- [x] Review the attempt-limit behavior before connecting the UI.

## Task 2: Build the playable pixel-reveal page

**Description:** Add a semantic responsive page, bitmap glyph definitions, and
canvas/UI wiring so a player can submit a guess and see the bottom-to-top image
reveal.

**Acceptance criteria:**

- [x] A new round shows only the bottom glyph row before a guess.
- [x] A valid wrong guess reveals exactly the next row and shows no letter
  feedback.
- [x] Correct and lost rounds expose a working new-round control.

**Verification:**

- [x] Syntax check succeeds: `node --check js/app.js`.
- [ ] Manual check: run `uv run python -m http.server 8000`, then complete one
  win and one loss at `http://localhost:8000` (interactive browser tooling is
  not configured in this workspace).

**Dependencies:** Task 1

**Files likely touched:**

- `index.html`
- `css/style.css`
- `js/glyphs.js`
- `js/app.js`

**Estimated scope:** Medium (4 files)

## Checkpoint: After Task 2

- [x] The initial round works in Firefox and the canvas remains legible at a
  narrow viewport.
- [ ] A full win/loss round is manually exercised in a browser.

## Task 3: Finish validation and accessibility states

**Description:** Make rejected guesses clear, ensure outcome feedback is
announced and keyboard-friendly, and close any behavior gaps exposed by the
manual pass.

**Acceptance criteria:**

- [x] Empty, non-alphabetic, and missing-dictionary guesses produce clear
  feedback without consuming an attempt.
- [x] Outcome and validation messages are available through an `aria-live`
  status region.
- [x] The form and new-round control use native keyboard controls and focus.

**Verification:**

- [x] Tests pass: `node --test tests/game.test.js`.
- [ ] Manual check: use only Tab, Shift+Tab, Enter, and typing to play a round
  at a narrow viewport.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `index.html`
- `css/style.css`
- `js/app.js`

**Estimated scope:** Medium (3 files)

## Checkpoint: Complete

- [x] `node --test tests/game.test.js` passes.
- [x] `node --check js/game.js` and `node --check js/app.js` pass.
- [ ] Interactive browser success criteria have been checked manually.
