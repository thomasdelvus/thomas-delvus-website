# Battlemat3 Testing and Parity Guide

Version: v1.01  
Updated: 2026-02-11

## Testing Strategy

Use two layers:

1. Contract automation for fast regression checks.
2. Manual interaction validation for behavior and rendering parity.

## Automated Contract Checks

Scripts:

1. `src/test/battlemat3/parity_dom_contract.mjs`
2. `src/test/battlemat3/parity_runtime_contract.mjs`
3. `src/test/battlemat3/run.mjs`

Command:

1. `npm run test:battlemat3`

Validation focus:

1. DOM ID set parity
2. button label order parity
3. script wiring path
4. localStorage key usage parity
5. query parameter usage parity
6. fetch call-site parity
7. required PUT/PATCH/chat signatures

## Manual Parity Matrix

Run these on each meaningful change set:

1. load `/play3/{battle_id}`
2. verify all tools can select/create/edit/delete as expected
3. drag operations:
   1. token
   2. object
   3. opening
   4. room and roof handles
4. keyboard:
   1. undo
   2. delete/backspace in and out of inputs
   3. escape poly cancel
5. save:
   1. make changes
   2. click Save
   3. confirm persistence after reload
6. chat:
   1. send message
   2. confirm polling updates
7. fog/street/roof:
   1. toggle controls
   2. verify expected visibility behavior
8. preferences:
   1. change toggles
   2. reload
   3. confirm persistence
9. roof weathering (Phase 3):
   1. select a roof and adjust `Aging/Moss/Mottling/Streaks/Repairs/Contrast`
   2. verify deterministic look after pan/zoom
   3. verify persistence after Save + reload
   4. verify `Reset Weather` returns the roof to baseline weathering

## Micro-Batch Validation Pattern

For risky refactors:

1. apply one micro-batch
2. hard refresh
3. run fast smoke tests
4. continue only if no blackout/errors
5. rollback immediately on regression

## Required Environment

1. Node.js available for automated scripts.
2. Browser with devtools for runtime checks.
3. Backend endpoints reachable for integration tests.

If Node is unavailable, rely on manual parity checks and direct grep-based signature checks.
