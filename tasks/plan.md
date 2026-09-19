# Implementation Plan: Height Wordle MVP

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
- [ ] A player can complete a win and a loss in a browser (interactive browser
  tooling is not configured in this workspace).

### Phase 3: Guardrails

- [x] Task 3: Add invalid-input and accessible outcome behavior, then manually
  verify the full keyboard and mobile flow.

### Checkpoint: Complete

- [x] Rule tests and syntax checks pass; desktop and 320px Firefox screenshots
  render the initial pixel row.
- [ ] Interactive win/loss and keyboard-only browser pass.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| A CSS font is not truly pixelated | High | Render deterministic bitmap glyphs to Canvas. |
| Invalid guesses accidentally consume attempts | High | Centralize submission logic in the tested game engine. |
| Canvas output is inaccessible | Medium | Pair it with text status in an `aria-live` region and labelled controls. |
| Long answers reveal too much | Medium | Fix glyph height and enforce the derived half-height limit. |

## Open Questions

None. The approved spec fixes the MVP decisions.
