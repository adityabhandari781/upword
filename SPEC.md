# Spec: Upword MVP

## Objective

Build a responsive, browser-only word-guessing game. A hidden word is selected
from a bundled dictionary and rendered in a pixel font. The player begins with
only the word image's bottom row visible. Each incorrect submission, including
an empty one, reveals the next row upward; no Wordle-style letter feedback is
shown.

The player wins by guessing the word. They lose after `floor(pixelHeight / 2)`
wrong submissions. During play, the image stays partially hidden; when a
round ends, its full word is revealed. Success is a player being able to start,
play, win or lose, and immediately start a new random round on modern desktop
and mobile browsers. A settings control provides bottom-up (default), top-down,
or ends-to-center reveal direction; uppercase (default), lowercase, or mixed
display casing; and a puzzle font mode for the next puzzle. The default
`Times New Roman` is the default mode and renders ordinary smooth serif text
using `"Times New Roman", Times, serif`. `Pixel` mode retains the bitmap glyph
rendering. `Comic Sans`
uses `"Comic Sans MS", "Comic Sans", cursive`. Both smooth modes initially
reveal 24px and reveal an additional 8px after each wrong guess. In
ends-to-center mode, each edge starts at 12px and grows by 4px. A completed
round reveals the full word. Ends-to-center rounds allow three wrong guesses;
other modes allow `floor(pixelHeight / 2)`.
A dedicated button in the page header provides a Dark (default) or Light
appearance for the current browser session.

## Tech Stack

- Static HTML, CSS, and ES modules; no application framework or runtime
  dependencies.
- Canvas 2D for the word image. Pixel mode uses built-in uppercase and
  lowercase bitmap glyph maps; smooth modes use browser-provided font stacks.
  No font file or dependency is loaded.
- Bundled text files containing a curated answer list and a larger allowed-guess
  list, loaded by a small JavaScript module.
- `uv` only supplies a local static-file server; it is not part of the app.
- Node's built-in test runner for pure game-rule tests.

## Commands

```sh
# Serve the app locally at http://localhost:8000
uv run python -m http.server 8000

# Run the game-rule checks
node --test tests/game.test.js

# Parse-check JavaScript modules
node --check js/game.js
node --check js/app.js
```

## Project Structure

```text
index.html          # Accessible game page and semantic controls
css/style.css       # Responsive layout and visual states
package.json        # ES module metadata and test script
js/app.js           # DOM wiring, canvas drawing, and round rendering
js/game.js          # Pure round state and validation rules
data/                # Fixed answer and allowed-guess word lists
js/words.js         # Loads the bundled word lists
js/glyphs.js        # Pixel glyph definitions plus canvas word renderers
tests/game.test.js  # Node tests for round rules
tests/glyphs.test.js # Node tests for bitmap and canvas renderers
SPEC.md             # This agreed MVP contract
```

## Code Style

Use small ES modules, `const` by default, lower-camel-case identifiers, and
pure functions for game rules. Keep rendering and DOM access in `app.js`; do
not duplicate rule checks in the UI. User-entered guesses are normalized with
`trim().toLowerCase()` before validation. Use a string mode value rather than a
font registry until another font is requested.

```js
export function maxWrongGuesses(pixelHeight) {
  return Math.floor(pixelHeight / 2);
}
```

## Testing Strategy

- Put deterministic game-rule tests in `tests/game.test.js`, using
  `node:test` and `node:assert/strict`; no test dependency is needed.
- Test acceptance/rejection of guesses, correct-guess wins, wrong guesses
  increment the revealed-row count by one, and a loss at the half-height limit.
- Test all reveal directions and stable mixed-case display words.
- Add a small renderer-selection test proving that `Pixel` remains the default
  and `Times New Roman` starts at 24px, expands by 8px after a wrong guess, and
  uses the smooth-text renderer.
- Manually verify the canvas reveal moves bottom-to-top and that keyboard-only
  and narrow-screen play work, including the settings dialog.

## Boundaries

- Always: validate every non-empty submitted guess against the bundled
  allowed-guess list; preserve accessible labels, focus behavior, and live
  win/loss feedback;
  run the rule tests before a change is considered complete; keep Pixel mode's
  seven logical reveal bands and all attempt limits unchanged.
- Ask first: add a dependency or framework; add persistence, a backend,
  accounts, analytics, or a daily/shared puzzle.
- Never: show green/yellow/gray letter feedback; reveal more than half of the
  image rows during a normal round; put secrets or external API keys in the
  client.

## Success Criteria

1. A new round randomly selects a word from the fixed answer list and displays
   its bottommost pixel row before any guess.
2. Empty or whitespace-only submissions consume one wrong-guess attempt and
   reveal one row; non-alphabetic and dictionary-missing non-empty guesses are
   rejected with an understandable message and do not consume an attempt.
3. A valid non-empty wrong guess reveals exactly one next pixel row and consumes
   one wrong-guess attempt; it gives no per-letter result.
4. A correct valid guess ends the round as a win without revealing another row.
5. The loss limit is `floor(pixelHeight / 2)` wrong submissions; when a round
   ends, its pixel canvas is fully revealed, with a new-round control available.
6. The game works with keyboard input and at narrow mobile widths, with visible
   controls and outcome messages available to assistive technologies.
7. Settings can select reveal direction, display casing, and a puzzle font;
   those choices apply to the next puzzle without changing answer-validation,
   reveal direction, or attempt-limit rules.
8. `Times New Roman` is selected by default and displays the puzzle word as
   smooth serif text in `"Times New Roman", Times, serif`.
9. Times New Roman puzzles start clipped to 24px and expand by 8px for each
   wrong guess; in ends-to-center mode, each edge starts at 12px and expands by
   4px per wrong guess.
   They use the normal browser fallback when Times New Roman is not installed.
10. Selecting `Comic Sans` displays the puzzle word as smooth text in
    `"Comic Sans MS", "Comic Sans", cursive`, initially clipped to 24px and
    expanded by 8px for each wrong guess; in ends-to-center mode, each edge
    starts at 12px and expands by 4px per wrong guess. It uses the normal
    browser fallback when Comic Sans is not installed.
11. `npm test` passes.
12. A labelled header button can apply the light or dark color scheme without
    changing puzzle rules, answer validation, or font selection.

## Open Questions

None. The selector intentionally contains only Pixel, Times New Roman, and
Comic Sans; additional fonts can be added later if needed.
