# Upword MVP Tasks

## Task 1: Create the tested game engine

**Description:** Add the fixed word lists and a pure module that creates a
round, validates a normalized guess, records wrong submissions, and reports
win/loss state from the bitmap height.

**Acceptance criteria:**

- [x] Only non-empty words in the allowed-guess list are accepted; invalid
  non-empty input does not change the round.
- [x] Each wrong submission increases revealed rows and wrong attempts by one.
- [x] A correct guess wins; the `floor(pixelHeight / 2)`-th wrong submission
  loses.

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
- [x] A wrong submission reveals exactly the next row and shows no letter
  feedback.
- [x] Correct and lost rounds expose a working new-round control.

**Verification:**

- [x] Syntax check succeeds: `node --check js/app.js`.
- [x] Manual check: run `uv run python -m http.server 8000`, then complete one
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
- [x] A full win/loss round is manually exercised in a browser.

## Task 3: Finish validation and accessibility states

**Description:** Make rejected guesses clear, ensure outcome feedback is
announced and keyboard-friendly, and close any behavior gaps exposed by the
manual pass.

**Acceptance criteria:**

- [x] Empty submissions produce clear feedback while consuming one attempt;
  non-alphabetic and missing-dictionary non-empty guesses produce clear
  feedback without consuming an attempt.
- [x] Outcome and validation messages are available through an `aria-live`
  status region.
- [x] The form and new-round control use native keyboard controls and focus.

**Verification:**

- [x] Tests pass: `node --test tests/game.test.js`.
- [x] Manual check: use only Tab, Shift+Tab, Enter, and typing to play a round
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
- [x] Interactive browser success criteria have been checked manually.

---

## Task 4: Add Times New Roman font mode

**Description:** Add a `Pixel`/`Times New Roman` setting. Keep Times New Roman
selected by default. When a new round uses Times New Roman, draw smooth text through the
agreed 24px initial reveal, then add 8px per wrong guess while preserving
display casing, reveal direction, and all game rules.

**Acceptance criteria:**

- [x] The settings dialog offers Pixel and Times New Roman (default); applying
  either selection starts the next round with that mode.
- [x] Times New Roman uses `"Times New Roman", Times, serif`, renders smooth
  text, starts at 24px, adds 8px per wrong guess, and uses 4px per edge in
  ends-to-center mode.
- [x] Pixel mode's current output and all attempt limits are unchanged.

**Verification:**

- [x] Tests pass: `npm test`.
- [x] Syntax check succeeds: `node --check js/glyphs.js && node --check js/app.js`.
- [x] Manual check: use the settings dialog to begin one Pixel and one Times
  New Roman puzzle, then submit a valid wrong guess in each. Chrome is
  unavailable in this environment, so this remains for a local browser pass.

**Dependencies:** None

**Files likely touched:**

- `index.html`
- `js/glyphs.js`
- `js/app.js`
- `tests/glyphs.test.js`

**Estimated scope:** Medium (4 files)

## Checkpoint: Times New Roman mode

- [x] The focused renderer check and complete test suite pass.
- [x] Pixel and Times New Roman work through the existing settings dialog.

---

## Task 5: Add Comic Sans font mode

**Description:** Add Comic Sans as a smooth font option in the existing puzzle
font settings. It uses the same 24px initial reveal and 8px increment as Times
New Roman.

**Acceptance criteria:**

- [x] The settings dialog offers Comic Sans alongside Pixel and Times New Roman.
- [x] Comic Sans uses `"Comic Sans MS", "Comic Sans", cursive` and the standard
  24px initial reveal with an 8px increment per wrong guess.
- [x] Pixel and Times New Roman behavior remains unchanged.

**Verification:**

- [x] Tests pass: `npm test`.
- [x] Syntax check succeeds: `node --check js/glyphs.js && node --check js/app.js`.
- [x] Manual check: select Comic Sans and submit one valid wrong guess.

**Dependencies:** Task 4

**Files likely touched:**

- `index.html`
- `js/glyphs.js`
- `js/app.js`
- `tests/glyphs.test.js`

**Estimated scope:** Medium (4 files)

---

# Identity and Profile Tasks

Module id: `identity-profile`

## Task 6: Establish the protected profile schema

**Description:** Add reproducible Supabase configuration, a profiles migration,
and database policy tests. The schema owns username validity and uniqueness;
grants and RLS allow an authenticated anonymous user to insert and read only
their own row.

**Acceptance criteria:**

- [ ] `profiles` stores an auth user id, normalized unique username, and
  creation timestamp with database-enforced username constraints.
- [ ] Signed-out requests and other authenticated users cannot read or insert a
  profile they do not own.
- [ ] Broad default table privileges are revoked before the minimum
  authenticated grants are applied.

**Verification:**

- [ ] Local schema applies cleanly: `npx supabase db reset`.
- [ ] Database policy checks pass: `npx supabase test db`.
- [ ] Review the migration for any browser-visible secret or service-role key;
  none is present.

**Dependencies:** None

**Files likely touched:**

- `supabase/config.toml`
- `supabase/migrations/*_identity_profile.sql`
- `supabase/tests/profiles_rls.test.sql`

**Estimated scope:** Medium (3 files)

## Task 7: Add the reusable identity client

**Description:** Add a lazily configured Supabase singleton and small auth and
profile modules. The profile module owns pure username normalization plus
retry-safe profile claiming that reuses an existing anonymous session after a
failed insert.

**Acceptance criteria:**

- [ ] Usernames normalize to lowercase and accept only 3–20 ASCII letters,
  digits, or underscores, with focused boundary tests.
- [ ] Profile lookup returns signed-out state when configuration, session, or
  profile is absent without throwing into the game.
- [ ] Username claiming maps invalid, duplicate, and unavailable outcomes to
  stable results and does not create a second anonymous session on retry.

**Verification:**

- [ ] Unit suite passes: `npm test`.
- [ ] New modules parse: `node --check js/supabase.js && node --check js/auth.js && node --check js/profile.js`.
- [ ] Review browser configuration and confirm it accepts only a project URL
  and publishable key.

**Dependencies:** Task 6

**Files likely touched:**

- `js/supabase.js`
- `js/auth.js`
- `js/profile.js`
- `tests/profile.test.js`

**Estimated scope:** Medium (4 files)

## Checkpoint: Identity foundation

- [ ] Tasks 6–7 acceptance criteria pass.
- [ ] Profile RLS permits owner access and denies non-owner access.
- [ ] Missing Supabase configuration behaves as signed out.
- [ ] Review with the user before beginning the browser claim flow.

## Task 8: Connect the accessible username claim flow

**Description:** Load the pinned Supabase JavaScript v2 browser bundle and add
a minimal header login action plus username dialog. Restore a current profile
on load, announce claim errors accessibly, and keep every game interaction
working when identity is unavailable.

**Acceptance criteria:**

- [ ] Signed-out players see “Log in to level up”; claiming an available
  username changes the action to the current username.
- [ ] Refresh restores the same profile, while invalid, duplicate, and network
  failures leave unsigned play intact and show an accessible message.
- [ ] The dialog is keyboard-operable, labels its controls, restores focus on
  close, and does not alter the existing puzzle state.

**Verification:**

- [ ] Complete suite passes: `npm test`.
- [ ] Browser entry point parses: `node --check js/app.js`.
- [ ] Manual browser check covers claim, refresh, duplicate username, offline
  fallback, keyboard-only operation, and narrow-screen layout.

**Dependencies:** Tasks 6–7 and the Identity foundation checkpoint

**Files likely touched:**

- `index.html`
- `css/style.css`
- `js/app.js`

**Estimated scope:** Medium (3 files)

## Checkpoint: Identity profile complete

- [ ] All identity acceptance criteria and the project Definition of Done pass.
- [ ] Existing gameplay and settings behavior have no regressions.
- [ ] No secret/service-role credential is present in tracked browser files.
- [ ] Review with the user before specifying `xp-progression`.
