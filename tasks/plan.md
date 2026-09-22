# Implementation Plan: Upword MVP

## Overview

Deliver a dependency-free static web game in three working slices: first make
the round rules provable, then attach a pixel-canvas interface, then close the
accessibility and edge-case requirements. There is no existing application or
incomplete plan in this workspace.

## Dependency Graph

```text
words + bitmap glyphs
          │
          ▼
    pure round rules + tests
          │
          ▼
  page controls + canvas rendering
          │
          ▼
     outcome/accessibility polish
```

## Architecture Decisions

- Use a built-in bitmap glyph map rather than a downloaded font: it guarantees
  a pixel image and derives the attempt limit from a known height.
- Keep round state and validation in `js/game.js`, independently testable in
  Node; `js/app.js` only translates it into the DOM and canvas.
- Select a random bundled answer once per new round. There is no server,
  persistence, daily puzzle, or meaningful client-side secrecy guarantee.

## Task List

Tasks and checkpoints are tracked in [todo.md](todo.md).

### Phase 1: Rules foundation

- [x] Task 1: Create the dictionary-backed pure game engine and its Node tests.

### Checkpoint: Rules

- [x] The focused rule suite passes and validates the half-height loss limit.

### Phase 2: Playable round

- [x] Task 2: Build the responsive page and canvas-based pixel reveal using the
  rule engine.

### Checkpoint: Playable round

- [x] A player can load the responsive page and see the initial bottom row in a browser.
- [x] A player can complete a win and a loss in a browser (interactive browser
  tooling is not configured in this workspace).

### Phase 3: Guardrails

- [x] Task 3: Add invalid-input and accessible outcome behavior, then manually
  verify the full keyboard and mobile flow.

### Checkpoint: Complete

- [x] Rule tests and syntax checks pass; desktop and 320px Firefox screenshots
  render the initial pixel row.
- [x] Interactive win/loss and keyboard-only browser pass.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| A CSS font is not truly pixelated | High | Render deterministic bitmap glyphs to Canvas. |
| Invalid guesses accidentally consume attempts | High | Centralize submission logic in the tested game engine. |
| Canvas output is inaccessible | Medium | Pair it with text status in an `aria-live` region and labelled controls. |
| Long answers reveal too much | Medium | Fix glyph height and enforce the derived half-height limit. |

## Open Questions

None. The approved spec fixes the MVP decisions.

---

# Implementation Plan: Times New Roman Font Mode

## Overview

Add selectable puzzle-font modes without changing round rules. The existing
Times New Roman is the default renderer. It and Comic Sans start at 24px and
grow by 8px after each wrong guess.

## Dependency Graph

```text
font-mode setting
       │
       ▼
canvas renderer + focused test
       │
       ▼
next-round drawing
```

## Architecture Decisions

- Reuse the existing canvas dimensions, reveal direction, and game-rule attempt
  limit. Times New Roman starts at 24px and grows by 8px per wrong guess;
  ends-to-center starts at 19.2px per edge and grows by 4px per edge.
  Pixel keeps its existing seven logical rows.
- Use the browser stack `"Times New Roman", Times, serif`; do not download a
  font or add a dependency. Browsers without Times New Roman use their normal
  Times/serif fallback.
- Add one dedicated smooth-text renderer alongside the existing pixel renderer.
  A two-mode conditional is smaller and clearer than a font registry.

## Task List

### Phase 4: Times New Roman mode

- [x] Task 4: Add Times New Roman selection and render the next puzzle with
  24px initial smooth serif text that grows by 8px per wrong guess.

### Checkpoint: Times New Roman mode

- [x] `npm test` passes.
- [x] Manual check: Pixel remains selected and unchanged by default; selecting
  Times New Roman starts a smooth serif puzzle whose initial visible band and
  subsequent reveals follow the selected direction. Chrome is unavailable in
  this environment, so this remains for a local browser pass.

### Phase 5: Comic Sans mode

- [x] Task 5: Add Comic Sans selection and render the next puzzle with the
  24px initial smooth-text reveal that grows by 8px per wrong guess.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Times New Roman is unavailable | Low | Use the native Times then generic serif fallbacks. |
| Smooth text changes the number of clues | Medium | Use the agreed 24px initial reveal and 8px increment without changing game rules. |
| A font change leaks into the current round | Medium | Apply the saved setting only when `startRound()` creates the next display. |

## Open Questions

None.

---

# Implementation Plan: Identity and Profile

Module id: `identity-profile`

## Overview

Add the smallest complete passwordless identity path to the existing static
game: a protected profile schema, a browser-persisted Supabase anonymous
session, and an accessible username-claim dialog. Unsigned gameplay remains
the fallback when configuration or the network is unavailable.

## Dependency Graph

```text
username contract + profiles migration + RLS tests
                        │
                        ▼
           Supabase client + identity service
                        │
                        ▼
         username dialog + current-profile state
```

## Architecture Decisions

- Keep the application build-free. Load the documented Supabase JavaScript v2
  browser bundle from jsDelivr and pin the exact release during implementation.
- Put the public Supabase URL and publishable key in `js/supabase.js`; never put
  a secret or service-role key in browser code.
- Create the anonymous user only when a player submits a valid username. If the
  profile insert fails, reuse that session on retry instead of creating orphan
  auth users repeatedly.
- Normalize usernames in one pure helper and repeat its constraints in
  Postgres. Let the unique database constraint resolve simultaneous claims.
- Keep `profiles` owner-only. The later leaderboard module will expose only its
  safe ranking projection instead of opening profile rows publicly.
- Do not add logout, rename, deletion, recovery, CAPTCHA, a bundler, or a new UI
  abstraction; none is required by the approved module spec.

## Implementation Slices

### Slice 1: Secure profile foundation

Add the profiles migration and focused pgTAP checks for grants, RLS ownership,
username constraints, and uniqueness. This brings the highest-risk boundary
forward before browser integration.

### Slice 2: Reusable identity client

Add the configured Supabase singleton, pure username normalization, session
lookup, current-profile lookup, and retry-safe username claiming. Cover the
pure contract with Node tests and keep expected failures in stable result
objects.

### Checkpoint: Identity foundation

- Profile policy tests and username unit tests pass.
- Missing Supabase configuration degrades to signed-out state.
- No service-role or secret credential appears in client files.

### Slice 3: Accessible claim flow

Add the username dialog and a minimal header action that opens it, restores the
current profile after refresh, reports validation/network/duplicate errors,
and leaves the game playable throughout. The later `app-navigation` module
will reuse and reposition this action in the navbar.

### Checkpoint: Identity complete

- A new browser session can claim a unique username.
- Refresh restores the same profile without another prompt.
- Duplicate and offline failures are announced without changing game state.
- Existing game, glyph, and username tests plus JavaScript parse checks pass.
- Database RLS tests pass when the local Supabase stack is available.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Anonymous session succeeds but profile insertion fails | Medium | Reuse the existing session and retry only the profile insert. |
| Two players claim the same username concurrently | Medium | Treat the database unique violation as the authoritative `taken` result. |
| Broad default grants bypass intended access | High | Revoke defaults, grant only owner operations, enable RLS, and test allow/deny cases. |
| Missing config or network failure breaks gameplay | High | Initialize identity defensively and preserve the signed-out game path. |
| CDN major changes unexpectedly | Medium | Pin an exact Supabase JavaScript v2 release during implementation. |

## Verification Checkpoints

```sh
npm test
node --check js/supabase.js
node --check js/auth.js
node --check js/profile.js
npx supabase test db
```

Manual browser verification covers claim, refresh restoration, duplicate-name
feedback, offline fallback, keyboard navigation, and screen-reader status text.

## Open Questions

None. Supabase project values are required for hosted integration verification,
but placeholder configuration can be implemented and unit-tested without them.
