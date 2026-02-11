# Battlemat3 Tools, Interactions, and Undo

Version: v1.01  
Updated: 2026-02-11

## Tool Surface

Top-level tools:

1. Select
2. Poly
3. Roof
4. Opening
5. Object
6. Token

These tools must remain capability-equivalent to `battlemat_next`.

## Input Contracts

Keyboard:

1. `Ctrl/Cmd+Z` undo
2. `Delete` / `Backspace` delete selection (except when focused in input fields)
3. `Escape` cancel in-progress poly
4. `Control` hold toggles handle-hot render state

Mouse/pointer:

1. click select/place behavior
2. drag for token/object/opening/poly/roof manipulations
3. wheel zoom in canvas wrap
4. hold-to-repeat pan and zoom buttons

## Mutation Pattern

Most editing operations follow:

1. `pushHistory()`
2. mutate selected state
3. set dirty/status as needed
4. render and refresh inspector/status

This ordering is required for predictable undo.

## Roof Inspector Weathering Controls (Phase 3)

Roof selection now exposes per-roof weathering controls in inspector:

1. `Weather Seed` (deterministic texture seed)
2. sliders in `0..1` range:
   1. `Aging`
   2. `Moss`
   3. `Mottling`
   4. `Streaks`
   5. `Repairs`
   6. `Contrast`
3. `Reset Weather` action:
   1. resets all weathering sliders to `0`
   2. preserves seed value

## Undo Architecture

Undo logic lives in `public/app/battlemat3/modules/history.js`.

Responsibilities:

1. snapshot capture (`battle`, `entities`)
2. stack management and truncation
3. restoration flow
4. undo button state
5. undo input binding

## Undo Repeat Guard

Current battlemat3 behavior includes a repeat guard:

1. `bindUndoControls(window)` handles Ctrl/Cmd+Z
2. ignores `keydown` auto-repeat (`ev.repeat`) to prevent consuming multiple snapshots from one held keypress

Intent:

1. preserve user-visible undo semantics
2. reduce accidental multi-step undo on long keypress

## Known High-Risk Interaction Areas

1. roof edge/line hidden toggles
2. poly handle dragging and insertion
3. room/opening alignment normalization after point edits
4. token drag with entity sync and status refresh

When touching these areas, always run manual parity checks before continuing.
